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
		logger.ErrorLogger.Println("Error handling follow/unfollow request:", err)
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
	//Get requesting userID from the context
	val := r.Context().Value("userID")
	requestingUserID, ok := val.(int)
	if !ok || requestingUserID == 0 {
		logger.ErrorLogger.Println("Error getting followers: invalid requester user ID in context")
		http.Error(w, "Error getting followers: Invalid requester user ID in context", http.StatusInternalServerError)
		return
	}

	// Get requested userID from the query parameters
	requestedUserIDStr := r.URL.Query().Get("userID")
	requestedUserID, err := strconv.Atoi(requestedUserIDStr)
	if err != nil {
		logger.ErrorLogger.Println("Invalid userID in the request:", err)
		http.Error(w, "Invalid userID", http.StatusBadRequest)
		return
	}

	isAccess, err := sqlQueries.CheckProfileAccess(requestingUserID, requestedUserID)
	if err != nil {
		logger.ErrorLogger.Println("Error checking profile access to get followers:", err)
		http.Error(w, "Error checking profile access to get followers", http.StatusInternalServerError)
		return
	}
	if !isAccess {
		logger.InfoLogger.Printf("Unauthorized request to get followers user %v -> %v", requestingUserID, requestingUserID)
		http.Error(w, "Unauthorized request to get followers", http.StatusBadRequest)
		return
	}

	followers, err := sqlQueries.GetUserFollowers(requestedUserID)
	if err != nil {
		logger.ErrorLogger.Println("Error getting followers for userID", requestedUserID, err)
		http.Error(w, "Error getting followers", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{"status": "success", "data": followers})
}

func HandleGetFollowing(w http.ResponseWriter, r *http.Request) {
	//Get requesting userID from the context
	val := r.Context().Value("userID")
	requestingUserID, ok := val.(int)
	if !ok || requestingUserID == 0 {
		logger.ErrorLogger.Println("Error getting following: invalid requester user ID in context")
		http.Error(w, "Error getting following: Invalid requester user ID in context", http.StatusInternalServerError)
		return
	}

	// Get requested userID from the query parameters
	requestedUserIDStr := r.URL.Query().Get("userID")
	requestedUserID, err := strconv.Atoi(requestedUserIDStr)
	if err != nil {
		logger.ErrorLogger.Println("Invalid userID in the request:", err)
		http.Error(w, "Invalid userID", http.StatusBadRequest)
		return
	}
	isAccess, err := sqlQueries.CheckProfileAccess(requestingUserID, requestedUserID)
	if err != nil {
		logger.ErrorLogger.Println("Error checking profile access to get followers:", err)
		http.Error(w, "Error checking profile access to get followers", http.StatusInternalServerError)
		return
	}
	if !isAccess {
		logger.InfoLogger.Printf("Unauthorized request to get followers user %v -> %v", requestingUserID, requestingUserID)
		http.Error(w, "Unauthorized request to get followers", http.StatusBadRequest)
		return
	}

	followingUsers, err := sqlQueries.GetUserFollowing(requestedUserID)
	if err != nil {
		logger.ErrorLogger.Println("Error getting following users for userID", requestedUserID, err)
		http.Error(w, "Error getting following users", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{"status": "success", "data": followingUsers})
}

func HandleGetFollowStatus(w http.ResponseWriter, r *http.Request) {
	// Get source user ID
	sourceID, err := getUserIDFromContext(r)
	if err != nil {
		logger.ErrorLogger.Println("Error handling getFollowStatus request:", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get target user ID
	targetIDStr := r.URL.Query().Get("targetID")
	targetID, err := strconv.Atoi(targetIDStr)
	if err != nil {
		logger.ErrorLogger.Println("Invalid target userID in getFollowStatus request:", err)
		http.Error(w, "Invalid target userID", http.StatusBadRequest)
		return
	}

	followStatus, err := sqlQueries.GetFollowStatus(sourceID, targetID) //0-pending, 1-accepted, 2-declined, 3-not following
	if err != nil {
		logger.ErrorLogger.Printf("Error getting follow status %d->%d, %v", sourceID, targetID, err)
		http.Error(w, "Error getting follow status", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{"status": "success", "data": followStatus})
}

// ------------------------- FOLLOW/UNFOLLOW REQUESTS -------------------------

func handleFollowRequest(w http.ResponseWriter, r *http.Request, sourceID int, targetID int) {
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
	json.NewEncoder(w).Encode(map[string]string{"status": "success", "data": successResponseMsg})
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
	json.NewEncoder(w).Encode(map[string]string{"status": "success", "data": "Unfollow successful"})
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
			fmt.Println("sent failed")
			logger.ErrorLogger.Printf("Error sending followRequest msg to user %d: %v\n", targetID, err)
		} else {
			fmt.Println("successfully sent")
		}
	}
}

// for handling ws accept/decline decision for follow request from user
func (s *Service) HandleFollowRequestReply(followReqSenderID int, followReqReceiverID int, accepted bool) error {
	decisionInt := 1 // 1: accepted in db
	if !accepted {
		decisionInt = 2 // 2: declined in db
	}

	err := sqlQueries.ChangeFollowStatus(followReqSenderID, followReqReceiverID, decisionInt)
	if err != nil {
		logger.ErrorLogger.Printf("Error handling follow request reply for %d->%d", followReqSenderID, followReqReceiverID)
		return err
	}

	// If accepted, get full user data
	var userData structs.User
	if accepted {
		userData = sqlQueries.GetUserFromID(followReqReceiverID)
		if userData.ID == 0 {
			logger.ErrorLogger.Printf("Error getting full user data for follow req reply for %d->%d", followReqSenderID, followReqReceiverID)
			return errors.New("error getting full user data to send to requester")
		}
	}

	// Send result to request sender if they are online
	if websocket.IsClientOnline(followReqSenderID) {
		var payload structs.FollowRequestResult

		payload.RequestedID = followReqReceiverID
		payload.Decision = accepted
		if accepted {
			payload.UserData = userData
		}

		envelopeBytes, err := websocket.ComposeWSEnvelopeMsg(config.WsMsgTypes.FOLLOW_REQ_RESULT, payload)
		if err != nil {
			logger.ErrorLogger.Printf("Error composing followRequestResult msg for user %d: %v\n", followReqSenderID, err)
			return err
		}

		// Send the envelope to the recipient using WebSocket
		err = websocket.SendMessageToUser(followReqSenderID, envelopeBytes)
		if err != nil {
			logger.ErrorLogger.Printf("Error sending followRequestReply msg to user %d: %v\n", followReqSenderID, err)
			return err
		}
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
	userID, ok := val.(int)
	if !ok || userID == 0 {
		return 0, errors.New("invalid user ID in context")
	}
	return userID, nil
}
