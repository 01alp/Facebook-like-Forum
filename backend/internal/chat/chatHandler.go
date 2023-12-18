package chat

import (
	"encoding/json"
	"errors"
	"net/http"
	"social-network/internal/logger"
	"social-network/internal/sqlQueries"
	"social-network/internal/structs"
	"strings"
	"time"
)

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

	if request.GroupChat {
		return
	} else {
		messages, err := sqlQueries.GetPrivateChatHistory(userID, request.RecipientID)
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

	// go attemptToSendMessages([]structs.UserMessageStruct{message})

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
	var messageID int64
	if !message.GroupChat {
		var err error
		messageID, err = sqlQueries.AddPrivateChatMessage(*message)
		if err != nil {
			return err
		}
		err = sqlQueries.AddChatReceipt(false, message.SenderID, message.UserRecipientID)
		if err != nil {
			return err
		}
	} else {
		//TODO:
		return errors.New("groupChat not implemented")
	}

	message.ID = int(messageID)
	return nil
}
