package users

import (
	"encoding/json"
	"fmt"
	"net/http"
	"social-network/internal/logger"
	"social-network/internal/sqlQueries"
	"social-network/internal/structs"
	"strings"
)

// -------------------------- HTTP ENDPOINT HANDLERS --------------------------
func HandleCloseFriendRequest(w http.ResponseWriter, r *http.Request) {

	sourceID, err := getUserIDFromContext(r)
	if err != nil {
		logger.ErrorLogger.Println("Error handling follow/unfollow request:", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	var CloseFriendStr structs.CloseFriendStr
	if err := json.NewDecoder(r.Body).Decode(&CloseFriendStr); err != nil {
		logger.ErrorLogger.Println("Error decoding follow/unfollow request:", err)
		http.Error(w, "Error decoding message", http.StatusBadRequest)
		return
	}

	// frontend already checks if the user is already a close friend but we check again here just in case
	isCloseFriend, err := sqlQueries.CheckCloseFriends(sourceID, CloseFriendStr.TargetID)
	if err != nil {
		logger.ErrorLogger.Printf("Error checking close friends for userID: %d. %v", sourceID, err.Error())
		http.Error(w, "Error checking if user is already a close friend", http.StatusInternalServerError)
		return
	}
	// if user is already a close friend and the user is trying to add them again, we return an error
	if isCloseFriend && CloseFriendStr.CloseFriend {
		logger.ErrorLogger.Printf("Error adding close friend: user %d already has %d set as close friend: %v", sourceID, CloseFriendStr.TargetID, err)
		http.Error(w, fmt.Sprintf("Error: User %d already has %d set as close friend", sourceID, CloseFriendStr.TargetID), http.StatusBadRequest)
	}

	if CloseFriendStr.CloseFriend {
		makeCloseFriend(w, r, sourceID, CloseFriendStr.TargetID)
	} else {
		breakCloseFriend(w, r, sourceID, CloseFriendStr.TargetID)
	}
}

func HandleCloseFriendList(w http.ResponseWriter, r *http.Request) {

	sourceID, err := getUserIDFromContext(r)
	if err != nil {
		logger.ErrorLogger.Println("Error handling follow/unfollow request:", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	type CloseFriendList struct {
		CloseFriends []int `json:"close_friends"`
	}
	var closeFriendList CloseFriendList

	closeFriendList.CloseFriends, err = sqlQueries.GetCloseFriends(sourceID, 0)
	if err != nil {
		logger.ErrorLogger.Println("Error getting close friends for userID: ", sourceID, err)
		http.Error(w, "Error getting close friends", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(closeFriendList)
	if err != nil {
		logger.ErrorLogger.Println("Error encoding close friends list:", err)
		http.Error(w, "Error encoding close friends list", http.StatusInternalServerError)
		return
	}
}

// -------------------------- HELPER FUNCTIONS --------------------------
func makeCloseFriend(w http.ResponseWriter, r *http.Request, sourceID int, targetID int) {

	_, err := sqlQueries.MakeCloseFriend(sourceID, targetID) //sourceID, targetID, status
	if err != nil {
		logger.ErrorLogger.Printf("Error handling follow request for user %d to follow %d: %v", sourceID, targetID, err)
		if strings.Contains(err.Error(), "is already following") {
			errMsg := fmt.Sprintf("Error: User %d is already following %d", sourceID, targetID)
			http.Error(w, errMsg, http.StatusBadRequest)
			return
		}
		http.Error(w, "Error with follow request", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}

func breakCloseFriend(w http.ResponseWriter, r *http.Request, sourceID int, targetID int) {

	_, err := sqlQueries.BreakCloseFriend(sourceID, targetID) //sourceID, targetID, status
	if err != nil {
		logger.ErrorLogger.Printf("Error handling follow request for user %d to follow %d: %v", sourceID, targetID, err)
		if strings.Contains(err.Error(), "is already following") {
			errMsg := fmt.Sprintf("Error: User %d is already following %d", sourceID, targetID)
			http.Error(w, errMsg, http.StatusBadRequest)
			return
		}
		http.Error(w, "Error with follow request", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}
