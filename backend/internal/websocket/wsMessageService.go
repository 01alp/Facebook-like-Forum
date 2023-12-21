package websocket

import (
	"encoding/json"
	"errors"
	"social-network/internal/config"
	"social-network/internal/logger"
	"social-network/internal/sqlQueries"
	"social-network/internal/structs"
)

// ---------------------------- INITALIZE SERVICES ----------------------------

type ChatService interface {
	ConfirmMessagesDelivery(userID int, messageIDs []int) error
	SendPendingChatMessages(userID int)
}

type UserService interface {
	HandleFollowRequestReply(followReqSenderID int, followReqReceiver int, decision bool) error
	SendPendingFollowRequests(targetID int)
}

var chatService ChatService
var userService UserService

func Initialize(us UserService, cs ChatService) {
	chatService = cs
	userService = us
}

// --------------------------- ANNOUNCMENTS TO CLIENT -------------------------

func sendClientSyncMessages(c *Client, readyMsg []byte) {
	sendOnlineUsersList(c.ID)
	userService.SendPendingFollowRequests(c.ID)
	chatService.SendPendingChatMessages(c.ID)
}

func sendOnlineUsersList(targetID int) {
	var onlineUsersIDs []int
	for _, client := range manager.clients {
		if client.ID != targetID {
			onlineUsersIDs = append(onlineUsersIDs, client.ID)
		}
	}

	onlineUsers, err := sqlQueries.GetUsersFromIDs(onlineUsersIDs)
	if err != nil {
		SendErrorMessage(targetID, "Error getting online users list")
		logger.ErrorLogger.Println("Error sending online users list to user:", targetID)
		return
	}

	envelopeBytes, err := ComposeWSEnvelopeMsg(config.WsMsgTypes.ONLINE_USERS_LIST, onlineUsers)
	if err != nil {
		SendErrorMessage(targetID, "Error marshaling online users list")
		logger.ErrorLogger.Printf("Error marshaling envelope for user %d: %v\n", targetID, err)
		return
	}

	// Send the envelope to the recipient using WebSocket
	err = SendMessageToUser(targetID, envelopeBytes)
	if err != nil {
		logger.ErrorLogger.Printf("Error sending message to user %d: %v\n", targetID, err)
	}
}

func broadcastUserComingOnline(userID int) {
	userData := sqlQueries.GetUserFromID(userID)

	if (userData == structs.User{}) {
		logger.ErrorLogger.Printf("Error getting user data for user %d\n", userID)
		return
	}

	envelopeBytes, err := ComposeWSEnvelopeMsg(config.WsMsgTypes.USER_ONLINE, userData)
	if err != nil {
		logger.ErrorLogger.Println("Error marshaling envelope for user coming online msg", err)
		return
	}

	BroadcastMessage(envelopeBytes)
}

func broadcastUserGoingOffline(userID int) {
	userData := sqlQueries.GetUserFromID(userID)

	if (userData == structs.User{}) {
		logger.ErrorLogger.Printf("Error getting user data for user %d\n", userID)
		return
	}

	envelopeBytes, err := ComposeWSEnvelopeMsg(config.WsMsgTypes.USER_OFFLINE, userData)
	if err != nil {
		logger.ErrorLogger.Println("Error marshaling envelope for user going offline msg", err)
		return
	}

	BroadcastMessage(envelopeBytes)
}

// ----------------------------- SENDING MESSAGES -----------------------------

func ComposeWSEnvelopeMsg(msgType string, payload interface{}) ([]byte, error) {
	envelope := structs.WSMessageEnvelope{
		Type:    msgType,
		Payload: payload,
	}

	// Serialize the envelope to JSON
	envelopeBytes, err := json.Marshal(envelope)
	if err != nil {
		logger.ErrorLogger.Printf("Error marshaling ws envelope: %v\n", err)
		return nil, err
	}

	return envelopeBytes, nil
}

func SendMessageToUser(userID int, message []byte) error {
	manager.RLock()
	client, ok := manager.clients[userID]
	manager.RUnlock()

	if !ok {
		logger.ErrorLogger.Println("Failed ws message send attempt. User", userID, "does not have ws connection")
		return errors.New("no connection for this user")
	}

	select {
	case client.egress <- message:
		return nil
	default:
		logger.ErrorLogger.Println("Failed ws message send attempt. User", userID, "egress channel not ready for new message")
		return errors.New("user's egress channel is not ready to send the message")
	}
}

func BroadcastMessage(message []byte) {
	manager.RLock()
	defer manager.RUnlock()

	for _, client := range manager.clients {
		select {
		case client.egress <- message:

		default:
			logger.ErrorLogger.Printf("Egress channel for user %d is full. Message not sent.\n", client.ID)
		}
	}
}

func SendErrorMessage(userID int, errMsg string) {
	errorMessage := map[string]string{"error": errMsg}
	errMsgBytes, err := json.Marshal(errorMessage)
	if err != nil {
		logger.ErrorLogger.Printf("Failed to marshal ws error message to user %d: %v", userID, err)
		return
	}
	SendMessageToUser(userID, errMsgBytes)
}

// ---------------------------- RECEIVING MESSAGES ----------------------------

var messageHandlers = map[string]func(*Client, []byte){
	config.WsMsgTypes.CLIENT_WS_READY:  sendClientSyncMessages,
	config.WsMsgTypes.CHAT_MSGS_REPLY:  handleChatMessagesDelivered,
	config.WsMsgTypes.FOLLOW_REQ_REPLY: handleFollowRequestReply,
}

func handleIncomingMessage(c *Client, messageType string, envelope structs.WSMessageEnvelope) {
	if handler, ok := messageHandlers[messageType]; ok {
		payloadBytes, err := json.Marshal(envelope.Payload) //TODO: Could avoid remarshaling here, with changing the envelope struct payload type?
		if err != nil {
			logger.ErrorLogger.Println("Error re-marshaling payload for user:", c.ID, ":", err)
			return
		}
		handler(c, payloadBytes)
	} else {
		handleUnknownMessageType(c, messageType)
	}
}

func handleUnknownMessageType(c *Client, messageType string) {
	logger.ErrorLogger.Printf("Received unknown message type '%s' from user %d\n", messageType, c.ID)
	responsePayload := map[string]string{
		"message": "Unknown message type received",
		"type":    messageType,
	}
	respondToClient(c, config.WsMsgTypes.MSG_HANDLING_ERROR, "error", responsePayload)
}

func handleChatMessagesDelivered(c *Client, payload []byte) {
	var messages []structs.ChatMessage
	err := json.Unmarshal(payload, &messages)
	if err != nil {
		logger.ErrorLogger.Printf("Error unmarshaling chat messages: %v\n", err)
		respondToClient(c, config.WsMsgTypes.MSG_HANDLING_ERROR, "error", map[string]string{"error": "Failed to unmarshal payload for chat messages delivery confirmation"})
		return
	}

	// Extract message IDs from the messages
	var messageIDs []int
	for _, msg := range messages {
		messageIDs = append(messageIDs, msg.ID)
	}

	err = chatService.ConfirmMessagesDelivery(c.ID, messageIDs)
	if err != nil {
		logger.ErrorLogger.Printf("Error in confirming chat messages delivery: %v\n", err)
		respondToClient(c, config.WsMsgTypes.MSG_HANDLING_ERROR, "error", map[string]string{"error": "Failed to confirm chat message delivery"})
		return
	}
}

func handleFollowRequestReply(c *Client, payload []byte) {
	var reqReply structs.FollowRequestReply
	err := json.Unmarshal(payload, &reqReply)
	if err != nil {
		logger.ErrorLogger.Printf("Error unmarshaling follow request reply: %v\n", err)
		respondToClient(c, config.WsMsgTypes.MSG_HANDLING_ERROR, "error", map[string]string{"error": "Failed to unmarshal payload for follow request reply"})
		return
	}

	err = userService.HandleFollowRequestReply(reqReply.RequesterID, c.ID, reqReply.Decision)
	if err != nil {
		logger.ErrorLogger.Printf("Error handling follow request reply: %v\n", err)
		respondToClient(c, config.WsMsgTypes.MSG_HANDLING_ERROR, "error", map[string]string{"error": "Failed to handle follow request reply"})
		return
	}
}

func respondToClient(c *Client, responseType, status string, payload interface{}) {
	response := structs.ResponseEnvelope{
		Type:    responseType,
		Status:  status,
		Payload: payload,
	}

	responseJSON, err := json.Marshal(response)
	if err != nil {
		logger.ErrorLogger.Printf("Error marshaling response: %v\n", err)
		return
	}

	SendMessageToUser(c.ID, responseJSON)
}
