package sqlQueries

import (
	"errors"
	"social-network/internal/database"
	"social-network/internal/logger"
	"social-network/internal/structs"
	"time"
)

func AddNewEvent(event structs.GroupEvent) (int, error) { //Return event id or error
	startTime, err := time.Parse(time.RFC3339, event.StartTime)
	if err != nil {
		logger.ErrorLogger.Println("invalid timestamp format for event start time", err)
		return 0, errors.New("invalid timestamp format for event start time")
	}

	createdAt, err := time.Parse(time.RFC3339, event.CreatedAt)
	if err != nil {
		logger.ErrorLogger.Println("invalid timestamp format for created at", err)
		return 0, errors.New("invalid timestamp format for created at")
	}

	stmt, err := database.DB.Prepare(`INSERT INTO group_events (group_id, creator_id, title, description, event_date, created_at) VALUES (?, ?, ?, ?, ?, ?)`)
	if err != nil {
		logger.ErrorLogger.Println("DB prepare error when adding new group event", err)
		return 0, err
	}
	defer stmt.Close()

	result, err := stmt.Exec(event.GroupId, event.CreatorId, event.Title, event.Description, startTime, createdAt)
	if err != nil {
		logger.ErrorLogger.Println("DB exec error when adding new group event", err)
		return 0, err
	}

	eventIDint64, err := result.LastInsertId()
	if err != nil {
		logger.ErrorLogger.Println("Get last insert id error when adding new group event", err)
		return 0, err
	}

	eventID := int(eventIDint64)

	return eventID, nil
}
