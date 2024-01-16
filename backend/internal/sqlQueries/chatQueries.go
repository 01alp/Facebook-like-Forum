package sqlQueries

import (
	"errors"
	"fmt"
	"social-network/internal/database"
	"social-network/internal/logger"
	"social-network/internal/structs"
	"strings"
	"time"
)

func GetUserChatHistory(userOneID int, userTwoID int) ([]structs.ChatMessage, error) {
	const query = `
		SELECT cm.id, cm.group_chat, cm.sender_id, u.first_name, cm.user_recipient_id, cm.group_id, cm.message, cm.created_at 
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
		if err := rows.Scan(&msg.ID, &msg.GroupChat, &msg.SenderID, &msg.SenderFirstName, &msg.UserRecipientID, &msg.GroupID, &msg.Message, &msg.CreatedAt); err != nil {
			logger.ErrorLogger.Println("Error scanning rows for private chat history", err)
			return nil, err
		}
		messages = append(messages, msg)
	}
	return messages, nil
}

func GetGroupChatHistory(groupID int) ([]structs.ChatMessage, error) {
	const query = `SELECT cm.id, cm.group_chat, cm.sender_id, u.first_name, cm.user_recipient_id, cm.group_id, g.title, cm.message, cm.created_at 
                   FROM chat_messages cm
                   JOIN users u ON cm.sender_id = u.id
				   JOIN groups g ON cm.group_id = g.id 
                   WHERE cm.group_id = $1
                   ORDER BY cm.created_at`

	rows, err := database.DB.Query(query, groupID)
	if err != nil {
		logger.ErrorLogger.Println("Error querying db for group chat history", err)
		return nil, err
	}
	defer rows.Close()

	var messages []structs.ChatMessage
	for rows.Next() {
		var msg structs.ChatMessage
		if err := rows.Scan(&msg.ID, &msg.GroupChat, &msg.SenderID, &msg.SenderFirstName, &msg.UserRecipientID, &msg.GroupID, &msg.GroupName, &msg.Message, &msg.CreatedAt); err != nil {
			logger.ErrorLogger.Println("Error scanning rows for group chat history", err)
			return nil, err
		}
		messages = append(messages, msg)
	}
	return messages, nil
}

// Insert new chat message and return it's ID or error
func AddChatMessage(msg structs.ChatMessage) (int, error) {
	createdAt, err := time.Parse(time.RFC3339, msg.CreatedAt)
	if err != nil {
		logger.ErrorLogger.Println("invalid timestamp format for created at", err)
		return 0, errors.New("invalid timestamp format for created at")
	}

	stmt, err := database.DB.Prepare(`INSERT INTO chat_messages (group_chat, sender_id, user_recipient_id, group_id, message, created_at) VALUES (?, ?, ?, ?, ?, ?)`)
	if err != nil {
		logger.ErrorLogger.Println("DB prepare error when adding new chat message", err)
		return 0, err
	}
	defer stmt.Close()

	result, err := stmt.Exec(msg.GroupChat, msg.SenderID, msg.UserRecipientID, msg.GroupID, msg.Message, createdAt)
	if err != nil {
		logger.ErrorLogger.Println("DB exec error when adding new chat message", err)
		return 0, err
	}

	messageIDint64, err := result.LastInsertId()
	if err != nil {
		logger.ErrorLogger.Println("Get last insert id error when adding new chat message", err)
		return 0, err
	}

	messageID := int(messageIDint64)

	return messageID, nil
}

func AddChatReceipts(msgID int, recipientIDs []int) error {
	if len(recipientIDs) == 0 {
		return nil
	}

	var placeholders []string
	var args []interface{}
	for _, recipientID := range recipientIDs {
		placeholders = append(placeholders, "(?, ?)")
		args = append(args, msgID, recipientID)
	}
	values := strings.Join(placeholders, ",")

	stmt, err := database.DB.Prepare(fmt.Sprintf("INSERT INTO chat_receipts (message_id, recipient_id) VALUES %s", values))
	if err != nil {
		logger.ErrorLogger.Println("DB prepare error for batch insert into chat receipts", err)
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(args...)
	if err != nil {
		logger.ErrorLogger.Println("DB exec error for batch insert into chat receipts", err)
		return err
	}

	return nil
}

func RemoveChatReceipts(userID int, messageIDs []int) error {
	placeholders := make([]string, len(messageIDs))
	for i := range messageIDs {
		placeholders[i] = "?"
	}
	placeholderStr := strings.Join(placeholders, ", ")

	query := `DELETE FROM chat_receipts WHERE message_id IN (` + placeholderStr + `) AND recipient_id = ?`

	args := make([]interface{}, len(messageIDs)+1)
	for i, id := range messageIDs {
		args[i] = id
	}
	args[len(messageIDs)] = userID

	_, err := database.DB.Exec(query, args...)
	return err
}

func GetPendingChatMessages(userID int) ([]structs.ChatMessage, error) {
	query := `SELECT cm.id, cm.group_chat, cm.sender_id, u.first_name, cm.user_recipient_id, cm.group_id, cm.message, cm.created_at  
			FROM chat_messages cm
			JOIN chat_receipts cr ON cm.id = cr.message_id
			JOIN users u ON cm.sender_id = u.id 
			WHERE cr.recipient_id = ?
			ORDER BY cm.created_at`

	rows, err := database.DB.Query(query, userID)
	if err != nil {
		logger.ErrorLogger.Println("Error quering db for pending chat messages", err)
		return nil, err
	}
	defer rows.Close()

	var messages []structs.ChatMessage
	for rows.Next() {
		var msg structs.ChatMessage
		if err := rows.Scan(&msg.ID, &msg.GroupChat, &msg.SenderID, &msg.SenderFirstName, &msg.UserRecipientID, &msg.GroupID, &msg.Message, &msg.CreatedAt); err != nil {
			logger.ErrorLogger.Println("Error scanning rows for pending chat messages", err)
			return nil, err
		}
		messages = append(messages, msg)
	}
	return messages, nil
}
