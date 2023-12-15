package userChat

import (
	"encoding/json"
	"errors"
	"net/http"
	"social-network/internal/config"
	"social-network/internal/logger"
	"social-network/internal/sqlQueries"
	"social-network/internal/structs"
	"social-network/internal/websocket"
	"strings"
	"time"
)

type Service struct {
}

func HandleNewMessage(w http.ResponseWriter, r *http.Request) {
	//Retrieve userID from the context
	val := r.Context().Value("userID")
	userID, ok := val.(int)
	if !ok || userID == 0 {
		logger.ErrorLogger.Println("Error handling new chat message: invalid user ID in context")
		http.Error(w, "Invalid user ID in context", http.StatusInternalServerError)
		return
	}

	var message structs.UserMessageStruct
	if err := json.NewDecoder(r.Body).Decode(&message); err != nil {
		logger.ErrorLogger.Println("Error decoding chat message:", err)
		http.Error(w, "Error decoding message: "+err.Error(), http.StatusBadRequest)
		return
	}

	if err := validateChatMessage(message, userID); err != nil {
		logger.ErrorLogger.Println("Error validating chat message:", err)
		http.Error(w, "Message validation failed: "+err.Error(), http.StatusBadRequest)
		return
	}

	if err := storeMessageAndUpdateID(&message); err != nil {
		logger.ErrorLogger.Println("Error processing chat message:", err)
		http.Error(w, "Failed to process message: "+err.Error(), http.StatusInternalServerError)
		return
	}

	go attemptToSendMessages([]structs.UserMessageStruct{message})

	//Send success response after message is validated and stored
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "success"}) //TODO: Does client need chat message ID or any additional info here?
}

func validateChatMessage(message structs.UserMessageStruct, senderID int) error {
	//Errors are logged in HandleNewMessage

	//Check if targeId is valid and given user exists
	if message.TargetId == 0 {
		return errors.New("invalid target id")
	}
	targetExists, err := sqlQueries.UserExists(message.TargetId)
	if err != nil {
		//Error logged in sqlQueries.UserExists
		return errors.New("server error with validating target id")
	}
	if !targetExists {
		return errors.New("user with target id does not exist")
	}

	//Check if sourceId is valid and same as sender id
	if message.SourceId == 0 || senderID != message.SourceId {
		return errors.New("invalid source id")
	}

	//Check if message is not empty
	if strings.TrimSpace(message.Message) == "" {
		return errors.New("message content empty")
	}

	//Check if created at timestamp is valid
	if _, err := time.Parse(time.RFC3339, message.CreatedAt); err != nil {
		return errors.New("invalid timestamp format for created at")
	}

	return nil
}

func storeMessageAndUpdateID(message *structs.UserMessageStruct) error {
	messageID, err := sqlQueries.InsertMessage(*message)
	if err != nil {
		return err
	}

	message.Id = int(messageID)
	return nil
}

func attemptToSendMessages(messages []structs.UserMessageStruct) {
	// Safety net to recover from any panic within the goroutine
	defer func() {
		if r := recover(); r != nil {
			logger.ErrorLogger.Printf("Recovered in attemptToSendMessage: %v\n", r)
		}
	}()

	targetID := messages[0].TargetId
	if websocket.IsClientOnline(targetID) {
		envelopeBytes, err := websocket.ComposeWSEnvelopeMsg(config.WsMsgTypes.USERCHAT_MSGS, messages)
		if err != nil {
			websocket.SendErrorMessage(targetID, "Error marshaling user chat messages")
			logger.ErrorLogger.Printf("Error composing userChat messages for user %d: %v\n", targetID, err)
			return
		}

		// Send the envelope to the recipient using WebSocket
		err = websocket.SendMessageToUser(targetID, envelopeBytes)
		if err != nil {
			logger.ErrorLogger.Printf("Error sending message to user %d: %v\n", targetID, err)
		}
	}
}

func (s *Service) ConfirmMessagesDelivery(messageIDs []int) error {
	err := sqlQueries.UpdateMessagesStatusToDelivered(messageIDs)
	if err != nil {
		logger.ErrorLogger.Println("Error changing messages ", messageIDs, " status to delivered in db.", err)
	} else {
		logger.InfoLogger.Println("Succesfully delivered chat messages: ", messageIDs)
	}
	return err
}

func (s *Service) SendPendingChatMessages(userID int) {
	messages, err := sqlQueries.GetPendingMessages(userID)
	if err != nil {
		logger.ErrorLogger.Println("Error getting pending user chat messages for user ", userID, err)
		websocket.SendErrorMessage(userID, "Error getting pending user chat messages")
		return
	}

	if len(messages) > 0 {
		attemptToSendMessages(messages)
	}
}
