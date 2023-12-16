package users

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"social-network/internal/config"
	"social-network/internal/logger"
	"social-network/internal/sqlQueries"
	"social-network/internal/structs"
	"social-network/internal/websocket"
	"strconv"
	"strings"
)

type Service struct {
}

// -------------------------- HTTP ENDPOINT HANDLERS --------------------------

func HandleFollowOrUnfollowRequest(w http.ResponseWriter, r *http.Request) {
	sourceID, err := getUserIDFromContext(r)
	if err != nil {
		logger.ErrorLogger.Println("Error handlingfollow/unfollow request:", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var followRequest structs.FollowRequest
	if err := json.NewDecoder(r.Body).Decode(&followRequest); err != nil {
		logger.ErrorLogger.Println("Error decoding follow/unfollow request:", err)
		http.Error(w, "Error decoding message", http.StatusBadRequest)
		return
	}

	if followRequest.Follow {
		handleFollowRequest(w, r, sourceID, followRequest.TargetID)
	} else {
		handleUnfollowRequest(w, r, sourceID, followRequest.TargetID)
	}
}

func HandleGetFollowers(w http.ResponseWriter, r *http.Request) {
	// Get userID from the query parameters
	userIDStr := r.URL.Query().Get("userID")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		logger.ErrorLogger.Println("Invalid userID in the request:", err)
		http.Error(w, "Invalid userID", http.StatusBadRequest)
		return
	}

	fmt.Printf("\n**********followers function called for userID %d ************\n", userID)

	followers, err := sqlQueries.GetUserFollowers(userID)
	if err != nil {
		logger.ErrorLogger.Println("Error getting followers for userID", userID, err)
		http.Error(w, "Error getting followers", http.StatusInternalServerError)
		return
	}

	fmt.Printf("Followers count for userID %d is %v", userID, len(followers))

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{"status": "success", "data": followers})
}

func HandleGetFollowing(w http.ResponseWriter, r *http.Request) {
	// Get userID from the query parameters
	userIDStr := r.URL.Query().Get("userID")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		logger.ErrorLogger.Println("Invalid userID in the request:", err)
		http.Error(w, "Invalid userID", http.StatusBadRequest)
		return
	}

	fmt.Printf("\n**********following function called for userID %d ************\n", userID)

	followingUsers, err := sqlQueries.GetUserFollowing(userID)
	if err != nil {
		logger.ErrorLogger.Println("Error getting following users for userID", userID, err)
		http.Error(w, "Error getting following users", http.StatusInternalServerError)
		return
	}

	fmt.Printf("Following count for userID %d is %v", userID, len(followingUsers))

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{"status": "success", "data": followingUsers})
}

// ------------------------- FOLLOW/UNFOLLOW REQUESTS -------------------------

func handleFollowRequest(w http.ResponseWriter, r *http.Request, sourceID int, targetID int) {
	fmt.Println("handleFollowRequest called")
	publicProfile, err := sqlQueries.GetProfileVisibility(targetID) // 1-public, 0-private
	if err != nil {
		logger.ErrorLogger.Printf("Error with user %d trying to follow %d: %v", sourceID, targetID, err)
		http.Error(w, "Error with follow request", http.StatusInternalServerError)
		return
	}

	var status int //Status in db: 0-pending, 1-accepted, 2-declined
	var successResponseMsg string
	if publicProfile == 1 {
		status = 1
		successResponseMsg = "Following successful"
	} else {
		status = 0
		successResponseMsg = "Follow request received"
	}

	//Add following connection to db with according status
	err = sqlQueries.AddFollower(sourceID, targetID, status)
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

	//In case of private profile, attempt to send request as ws message
	if publicProfile == 0 {
		go attemptToSendFollowRequest(targetID, sourceID)
	}

	//Send http response with according response message
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": successResponseMsg})
}

func handleUnfollowRequest(w http.ResponseWriter, r *http.Request, followerID int, followingID int) {
	err := sqlQueries.RemoveFollower(followerID, followingID)
	if err != nil {
		logger.ErrorLogger.Printf("Error with user %d unfollowing %d: %v", followerID, followingID, err)
		if strings.Contains(err.Error(), "is not following") {
			errMsg := fmt.Sprintf("Error: User %d is not following %d", followerID, followingID)
			http.Error(w, errMsg, http.StatusBadRequest)
			return
		}
		http.Error(w, "Error unfollowing", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "Unfollow successful"})
}

// ------------ FOLLOW REQUEST WS MESSAGES HANDLING ------------

func attemptToSendFollowRequest(targetID int, sourceID int) {
	// Safety net to recover from any panic within the goroutine
	defer func() {
		if r := recover(); r != nil {
			logger.ErrorLogger.Printf("Recovered in attemptToSendMessage: %v\n", r)
		}
	}()

	followerData := sqlQueries.GetUserFromID(sourceID)
	if (followerData == structs.User{}) {
		logger.ErrorLogger.Printf("Error getting user %d data to send follow request to %d", sourceID, targetID)
		return
	}

	if websocket.IsClientOnline(targetID) {
		envelopeBytes, err := websocket.ComposeWSEnvelopeMsg(config.WsMsgTypes.FOLLOW_REQ, followerData)
		if err != nil {
			logger.ErrorLogger.Printf("Error composing followRequest msg for user %d: %v\n", targetID, err)
			return
		}

		// Send the envelope to the recipient using WebSocket
		err = websocket.SendMessageToUser(targetID, envelopeBytes)
		if err != nil {
			logger.ErrorLogger.Printf("Error sending followRequest msg to user %d: %v\n", targetID, err)
		}
	}
}

// for handling ws accept/decline decision for follow request from user
func (s *Service) HandleFollowRequestReply(followReqSenderID int, followReqReceiverID int, decision bool) error {
	decisionInt := 0
	if decision {
		decisionInt = 1
	}

	err := sqlQueries.ChangeFollowStatus(followReqSenderID, followReqReceiverID, decisionInt)
	if err != nil {
		logger.ErrorLogger.Printf("Error handling follow request reply for %d->%d", followReqSenderID, followReqReceiverID)
		return err
	}
	return nil
}

// send all pending follow request for user
func (s *Service) SendPendingFollowRequests(targetID int) {
	pendingRequestsUserID, err := sqlQueries.GetPendingFollowRequesterIDs(targetID)
	if err != nil {
		logger.ErrorLogger.Println("Error getting pending follow requests for user ", targetID, err)
		websocket.SendErrorMessage(targetID, "Error getting pending follow requests")
		return
	}

	for _, userID := range pendingRequestsUserID {
		attemptToSendFollowRequest(targetID, userID)
	}
}

// -------------------------------- UTIL FUNCS --------------------------------

func getUserIDFromContext(r *http.Request) (int, error) {

	val := r.Context().Value("userID")
	fmt.Println("this is the id of the user ", val)
	userID, ok := val.(int)
	if !ok || userID == 0 {
		return 0, errors.New("invalid user ID in context")
	}
	return userID, nil
}
