package sqlQueries

import (
	"errors"
	"fmt"
	"social-network/internal/database"
	"social-network/internal/structs"
	"strings"
	"time"
)

// Insert new chat message and return it's ID or error
func InsertMessage(msg structs.UserMessageStruct) (int64, error) {

	createdAt, err := time.Parse(time.RFC3339, msg.CreatedAt)
	if err != nil {
		return 0, errors.New("invalid timestamp format for created at")
	}

	stmt, err := database.DB.Prepare(`INSERT INTO user_messages (sender_id, recipient_id, message, created_at, status) VALUES (?, ?, ?, ?, 0)`)
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	result, err := stmt.Exec(msg.SourceId, msg.TargetId, msg.Message, createdAt)
	if err != nil {
		return 0, err
	}

	messageID, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	return messageID, nil
}

func UpdateMessagesStatusToDelivered(messageIDs []int) error {
	if len(messageIDs) == 0 {
		return errors.New("no message IDs for UpdateMessagesStatusToDelivered")
	}

	// Create a query from array of messageIDs
	placeholder := strings.Repeat(",?", len(messageIDs)-1)
	query := fmt.Sprintf("UPDATE user_messages SET status = 1 WHERE id IN (?%s)", placeholder)

	// Convert messageIDs to []interface{} for Exec
	args := make([]interface{}, len(messageIDs))
	for i, id := range messageIDs {
		args[i] = id
	}

	// Execute the query
	_, err := database.DB.Exec(query, args...)
	return err
}

// To get the unreceived messages when user comes online
func GetPendingMessages(userID int) ([]structs.UserMessageStruct, error) {
	var messages []structs.UserMessageStruct

	query := `
		SELECT id, sender_id, recipient_id, message, created_at
		FROM user_messages
		WHERE recipient_id = ? AND status = 0
	`

	stmt, err := database.DB.Prepare(query)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	rows, err := stmt.Query(userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var msg structs.UserMessageStruct
		if err := rows.Scan(&msg.Id, &msg.SourceId, &msg.TargetId, &msg.Message, &msg.CreatedAt); err != nil {
			return nil, err
		}

		messages = append(messages, msg)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return messages, nil
}
