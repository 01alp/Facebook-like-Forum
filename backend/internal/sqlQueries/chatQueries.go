package sqlQueries

import (
	"errors"
	"social-network/internal/database"
	"social-network/internal/logger"
	"social-network/internal/structs"
	"time"
)

func GetPrivateChatHistory(userOneID int, userTwoID int) ([]structs.ChatMessage, error) {
	const query = `
		SELECT cm.id, cm.group_chat, cm.sender_id, u.first_name, cm.user_recipient_id, cm.message, cm.created_at 
		FROM chat_messages cm
		JOIN users u ON cm.sender_id = u.id 
		WHERE  
		((cm.sender_id = $1 AND cm.user_recipient_id = $2)
		OR
		(cm.sender_id = $2 AND cm.user_recipient_id = $1))
		AND cm.group_chat = 0
		ORDER BY cm.created_at`

	rows, err := database.DB.Query(query, userOneID, userTwoID)
	if err != nil {
		logger.ErrorLogger.Println("Error quering db for private chat history", err)
		return nil, err
	}
	defer rows.Close()

	var messages []structs.ChatMessage
	for rows.Next() {
		var msg structs.ChatMessage
		if err := rows.Scan(&msg.ID, &msg.GroupChat, &msg.SenderID, &msg.SenderFirstName, &msg.UserRecipientID, &msg.Message, &msg.CreatedAt); err != nil {
			logger.ErrorLogger.Println("Error scanning rows for private chat history", err)
			return nil, err
		}
		messages = append(messages, msg)
	}
	return messages, nil
}

// Insert new chat message and return it's ID or error
func AddPrivateChatMessage(msg structs.ChatMessage) (int64, error) {

	createdAt, err := time.Parse(time.RFC3339, msg.CreatedAt)
	if err != nil {
		logger.ErrorLogger.Println("invalid timestamp format for created at", err)
		return 0, errors.New("invalid timestamp format for created at")
	}

	stmt, err := database.DB.Prepare(`INSERT INTO chat_messages (group_chat, sender_id, user_recipient_id, message, created_at) VALUES (0, ?, ?, ?, ?)`)
	if err != nil {
		logger.ErrorLogger.Println("DB prepare error when adding new private message", err)
		return 0, err
	}
	defer stmt.Close()

	result, err := stmt.Exec(msg.SenderID, msg.UserRecipientID, msg.Message, createdAt)
	if err != nil {
		logger.ErrorLogger.Println("DB exec error when adding new private message", err)
		return 0, err
	}

	messageID, err := result.LastInsertId()
	if err != nil {
		logger.ErrorLogger.Println("Get last insert id error when adding new private message", err)
		return 0, err
	}

	return messageID, nil
}

func AddChatReceipt(groupChat bool, msgID int, recipientID int) error {
	stmt, err := database.DB.Prepare(`INSERT INTO chat_receipts (group_chat, message_id, recipient_id) VALUES (?, ?, ?)`)
	if err != nil {
		logger.ErrorLogger.Println("DB prepare error when adding new chat receipt", err)
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(groupChat, msgID, recipientID)
	if err != nil {
		logger.ErrorLogger.Println("DB exec error when adding new chat receipt", err)
		return err
	}

	return nil
}
