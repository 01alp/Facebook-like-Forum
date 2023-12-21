package chat

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

func HandleGetChatHistory(w http.ResponseWriter, r *http.Request) {
	//Retrieve userID from the context
	val := r.Context().Value("userID")
	userID, ok := val.(int)
	if !ok || userID == 0 {
		logger.ErrorLogger.Println("Error getting chat messages history: invalid user ID in context")
		http.Error(w, "Invalid user ID in context", http.StatusInternalServerError)
		return
	}

	var request structs.ChatHistoryRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		logger.ErrorLogger.Println("Error decoding chat history request:", err)
		http.Error(w, "Error decoding chat history request: "+err.Error(), http.StatusBadRequest)
		return
	}

	messages, err := sqlQueries.GetChatHistory(userID, request.RecipientID)
	if err != nil {
		logger.ErrorLogger.Println("Error getting chat history:", err)
		http.Error(w, "Error getting chat history", http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(structs.ChatHistoryReply{Messages: messages}); err != nil {
		logger.ErrorLogger.Println("Error encoding chat history reply:", err)
		http.Error(w, "Error encoding chat history reply", http.StatusInternalServerError)
	}
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

	var message structs.ChatMessage
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

	go attemptToSendMessages([]structs.ChatMessage{message})

	response := structs.ChatMessageResponse{
		Status:  "success",
		Message: message,
	}

	// Set the header and encode the response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func validateChatMessage(message structs.ChatMessage, senderID int) error {
	//Errors are logged in HandleNewMessage

	//If 1-to-1 chat, check if recipient user ID is valid
	if !message.GroupChat {
		if message.UserRecipientID == 0 {
			return errors.New("invalid target id")
		}
		targetExists, err := sqlQueries.UserExists(message.UserRecipientID)
		if err != nil {
			//Error logged in sqlQueries.UserExists
			return errors.New("server error with validating target id")
		}
		if !targetExists {
			return errors.New("user with target id does not exist")
		}
	} else {
		//TODO: Logic for validating group ID in groupChat
	}

	//Check if sender ID is valid and matches with the one in session
	if message.SenderID == 0 || senderID != message.SenderID {
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

func storeMessageAndUpdateID(message *structs.ChatMessage) error {
	messageID, err := sqlQueries.AddChatMessage(*message)
	if err != nil {
		return err
	}
	if !message.GroupChat {
		err := sqlQueries.AddChatReceipt(messageID, message.UserRecipientID)
		if err != nil {
			return err
		}
	} else {
		//TODO: For group chat add receipt for each recipient
		return errors.New("groupChat not implemented")
	}

	message.ID = int(messageID)
	return nil
}

func attemptToSendMessages(messages []structs.ChatMessage) {
	// Safety net to recover from any panic within the goroutine
	defer func() {
		if r := recover(); r != nil {
			logger.ErrorLogger.Printf("Recovered in attemptToSendMessage: %v\n", r)
		}
	}()

	for _, message := range messages {
		if message.GroupChat {
			//TODO: Implement group message sending logic
			continue
		}
		targetID := message.UserRecipientID
		if !websocket.IsClientOnline(targetID) {
			return
		}

		envelopeBytes, err := websocket.ComposeWSEnvelopeMsg(config.WsMsgTypes.CHAT_MSGS, messages)
		if err != nil {
			websocket.SendErrorMessage(targetID, "Error marshaling chat messages")
			logger.ErrorLogger.Printf("Error composing chat messages for user %d: %v\n", targetID, err)
			return
		}

		// Send the envelope to the recipient using WebSocket
		err = websocket.SendMessageToUser(targetID, envelopeBytes)
		if err != nil {
			logger.ErrorLogger.Printf("Error sending message to user %d: %v\n", targetID, err)
		}
	}
}

func (s *Service) ConfirmMessagesDelivery(userID int, messageIDs []int) error {
	err := sqlQueries.RemoveChatReceipts(userID, messageIDs)
	if err != nil {
		logger.ErrorLogger.Printf("Error removing chat receipts for user %d for messages: %v, err: %v", userID, messageIDs, err)
	}
	return err
}

func (s *Service) SendPendingChatMessages(userID int) {
	messages, err := sqlQueries.GetPendingChatMessages(userID)
	if err != nil {
		logger.ErrorLogger.Println("Error getting pending chat messages for user ", userID, err)
		websocket.SendErrorMessage(userID, "Error getting pending chat messages")
		return
	}

	if len(messages) > 0 {
		attemptToSendMessages(messages)
	}
}
