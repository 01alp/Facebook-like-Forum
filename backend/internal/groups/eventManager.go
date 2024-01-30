package groups

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

func CreateEvent(w http.ResponseWriter, r *http.Request) {
	var Event structs.GroupEvent

	if err := json.NewDecoder(r.Body).Decode(&Event); err != nil {
		logger.ErrorLogger.Println("Error decoding new event request: ", err)
		http.Error(w, "error decoding: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Get creator ID from context and add to Event struct
	val := r.Context().Value("userID")
	creatorId, ok := val.(int)
	if !ok || creatorId == 0 {
		logger.ErrorLogger.Println("Error creating new event: invalid user ID in context")
		http.Error(w, "Invalid user ID in context", http.StatusInternalServerError)
		return
	}
	Event.CreatorId = creatorId

	if err := validateEvent(Event); err != nil {
		logger.ErrorLogger.Println("Error validating new event request", err)
		http.Error(w, "error validating new event request: "+err.Error(), http.StatusBadRequest)
		return
	}

	eventID, err := sqlQueries.AddNewEvent(Event)
	if err != nil {
		logger.ErrorLogger.Println("Error adding new event to db: ", err)
		http.Error(w, "Error adding new event to db", http.StatusInternalServerError)
		return
	}
	//--------------------add to event_receipt table-------------------- //TODO decide if using elswhere is better
	allGroupMembers, err := sqlQueries.GetGroupMembers(Event.GroupId)
	if err != nil {
		logger.ErrorLogger.Println("Error geting group members from db: ", err)
		return
	}

	var recipientMembers []int

	for _, member := range allGroupMembers.Members {
		if member.UserId == Event.CreatorId {
			continue
		}
		recipientMembers = append(recipientMembers, member.UserId)
	}
	err = sqlQueries.AddEventReceipts(Event.Id, recipientMembers)
	if err != nil {
		logger.ErrorLogger.Println("Error adding event_receipts to db: ", err)
		return
	}
	//--------------------add to event_receipt table--------------------
	Event.Id = eventID

	response := structs.GroupEventResponse{
		Status: "success",
		Event:  Event,
	}

	// Set the header and encode the response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

func validateEvent(Event structs.GroupEvent) error {
	// Check if title or description is not empty
	if strings.TrimSpace(Event.Title) == "" || strings.TrimSpace(Event.Description) == "" {
		return errors.New("error creating new event: missing title or description")
	}

	// Check if event start time is valid and in the future
	eventStartTime, err := time.Parse(time.RFC3339, Event.StartTime)
	if err != nil {
		return errors.New("error creating new event: invalid starttime timestamp")
	}
	if !eventStartTime.After(time.Now()) {
		return errors.New("error creating new event: start time is not in the future")
	}

	// Check if created at timestamp is valid
	if _, err := time.Parse(time.RFC3339, Event.CreatedAt); err != nil {
		return errors.New("error creating new event: invalid created at timestamp")
	}

	// Confirm creator is member of the group
	creatorIsMember := sqlQueries.GroupMember(Event.CreatorId, Event.GroupId)
	if !creatorIsMember {
		return errors.New("error creating new event: event creator is not member of the group")
	}

	return nil
}
