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

func GetGroupEvents(groupID int) (structs.GroupEventPayload, error) {
	var payload structs.GroupEventPayload
	stmt, err := database.DB.Prepare(`SELECT * FROM group_events WHERE group_id = ?`)
	if err != nil {
		logger.ErrorLogger.Println("DB prepare error when geting group events", err)
		return payload, err
	}
	defer stmt.Close()

	rows, err := stmt.Query(groupID)
	if err != nil {
		logger.ErrorLogger.Println("DB query error when geting group events", err)
		return payload, err
	}
	defer rows.Close()

	for rows.Next() {
		var event structs.GroupEvent
		err := rows.Scan(
			&event.Id,
			&event.GroupId,
			&event.CreatorId,
			&event.Title,
			&event.Description,
			&event.StartTime,
			&event.CreatedAt,
		)
		if err != nil {
			return payload, err
		}
		payload.Data = append(payload.Data, event)
	}
	return payload, nil
}

func UpdateAttendee(request structs.UpdateAttendeeRequest) error {
	tx, err := database.DB.Begin()
	if err != nil {
		logger.ErrorLogger.Println("DB transaction error when updating attendee", err)
		return err
	}
	defer tx.Rollback()

	result, err := tx.Exec(`
        UPDATE group_event_members
        SET status = ?
        WHERE user_id = ? AND event_id = ? AND group_id = ?
    `, request.Status, request.UserID, request.EventID, request.GroupID)
	if err != nil {
		logger.ErrorLogger.Println("DB execute error when updating attendee", err)
		return err
	}

	affectedRows, err := result.RowsAffected()
	if err != nil {
		logger.ErrorLogger.Println("RowsAffected check error when updating attendee", err)
		return err
	}

	if affectedRows == 0 { //when user hasnt pressed going/not before
		_, err := tx.Exec(`
            INSERT INTO group_event_members (user_id, group_id, event_id, status)
            VALUES (?, ?, ?, ?)
        `, request.UserID, request.GroupID, request.EventID, request.Status)

		if err != nil {
			logger.ErrorLogger.Println("DB execute error when adding new attendee", err)
			return err
		}
	}

	if err := tx.Commit(); err != nil {
		logger.ErrorLogger.Println("DB commit error when updating attendee", err)
		return err
	}

	return nil
}

func AddEventReceipts(eventID int, recipientIDs []int) error {
	if len(recipientIDs) == 0 {
		return nil
	}

	var placeholders []string
	var args []interface{}
	for _, recipientID := range recipientIDs {
		placeholders = append(placeholders, "(?, ?)")
		args = append(args, eventID, recipientID)
	}
	values := strings.Join(placeholders, ",")

	stmt, err := database.DB.Prepare(fmt.Sprintf("INSERT INTO event_receipts (event_id, recipient_id) VALUES %s", values))
	if err != nil {
		logger.ErrorLogger.Println("DB prepare error for batch insert into event receipts", err)
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(args...)
	if err != nil {
		logger.ErrorLogger.Println("DB exec error for batch insert into event receipts", err)
		return err
	}

	return nil
}

func GetEventAttendees(groupID int) (map[int][]structs.GroupEventAttendees, error) {
	payload := make(map[int][]structs.GroupEventAttendees)
	stmt, err := database.DB.Prepare(`SELECT event_id, user_id, status FROM group_event_members WHERE group_id = ?`)
	if err != nil {
		logger.ErrorLogger.Println("DB prepare error when getting group event attendees", err)
		return payload, err
	}
	defer stmt.Close()

	rows, err := stmt.Query(groupID)
	if err != nil {
		logger.ErrorLogger.Println("DB query error when getting group event attendees", err)
		return payload, err
	}
	defer rows.Close()

	for rows.Next() {
		var eventID int
		var attendee structs.GroupEventAttendees
		err := rows.Scan(
			&eventID,
			// &event.GroupID, // currently not needed only used as a selector
			&attendee.UserID,
			&attendee.Status,
		)
		if err != nil {
			return payload, err
		}
		payload[eventID] = append(payload[eventID], attendee)
	}
	return payload, nil
}
