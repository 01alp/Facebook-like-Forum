package groups

// need better filename
import (
	"encoding/json"
	"fmt"
	"net/http"
	"social-network/internal/logger"
	"social-network/internal/sqlQueries"
	"social-network/internal/structs"
	"strconv"
)

func GetAllGroups(w http.ResponseWriter, r *http.Request) { // TODO: move this to other file later
	Groups, err := sqlQueries.GetAllGroups()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(Groups)
}

func GetGroups(w http.ResponseWriter, r *http.Request) { // TODO: move this to other file later
	var GroupRequestLimitStruct structs.GroupRequestLimit
	if err := json.NewDecoder(r.Body).Decode(&GroupRequestLimitStruct); err != nil {
		http.Error(w, "ERROR: "+err.Error(), http.StatusBadRequest)
	}

	Groups, err := sqlQueries.GetGroups(GroupRequestLimitStruct.Amount, GroupRequestLimitStruct.Offset)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(Groups)
}

func GetJoinedGroups(w http.ResponseWriter, r *http.Request) {
	//Retrieve requesting userID from the context
	val := r.Context().Value("userID")
	requestingUserID, ok := val.(int)
	if !ok || requestingUserID == 0 {
		logger.ErrorLogger.Println("Error getting joined groups: invalid requester user ID in context")
		http.Error(w, "Error getting joined groups: Invalid requester user ID in context", http.StatusInternalServerError)
		return
	}

	requestedUserIDStr := r.URL.Query().Get("userID")
	if requestedUserIDStr == "" {
		logger.ErrorLogger.Println("Error handling get joined groups request: no user ID in query")
		http.Error(w, "No user ID in query", http.StatusBadRequest)
		return
	}

	requestedUserID, err := strconv.Atoi(requestedUserIDStr)
	if err != nil {
		logger.ErrorLogger.Println("Error handling get joined groups request: invalid user ID in query")
		http.Error(w, "Invalid user ID in query", http.StatusBadRequest)
		return
	}

	isAccess, err := sqlQueries.CheckProfileAccess(requestingUserID, requestedUserID)
	if err != nil {
		logger.ErrorLogger.Println("Error checking profile access to get joined groups:", err)
		http.Error(w, "Error checking profile access to get joined groups", http.StatusInternalServerError)
		return
	}
	if !isAccess {
		logger.InfoLogger.Printf("Unauthorized request to get joined groups user %v -> %v", requestingUserID, requestingUserID)
		http.Error(w, "Unauthorized request to get joined groups", http.StatusBadRequest)
		return
	}

	joinedGroups, err := sqlQueries.GetJoinedGroups(requestedUserID)
	if err != nil {
		http.Error(w, "Error getting joined groups", http.StatusInternalServerError)
		logger.ErrorLogger.Println("Error getting joined groups for user ", requestedUserID, err)
		return
	}

	json.NewEncoder(w).Encode(joinedGroups)
}

func GetGroupMembers(w http.ResponseWriter, r *http.Request) { // TODO: move this to other file later
	var GroupRequest []structs.GroupStruct
	var GroupList []structs.GroupMembersStruct
	if err := json.NewDecoder(r.Body).Decode(&GroupRequest); err != nil {
		http.Error(w, "ERROR: "+err.Error(), http.StatusBadRequest)
		logger.ErrorLogger.Println(err.Error())
		return
	}

	for _, group := range GroupRequest {
		if group.Id == 0 {
			http.Error(w, "Group id empty", http.StatusBadRequest)
			return
		}
		GroupMembers, err := sqlQueries.GetGroupMembers(group.Id)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		GroupList = append(GroupList, GroupMembers)
	}

	json.NewEncoder(w).Encode(GroupList)
}

func CancelGroupRequest(w http.ResponseWriter, r *http.Request) { // TODO: move this to other file later
	UserID := r.Context().Value("userID").(int)

	var Payload structs.GroupRequestStruct
	if err := json.NewDecoder(r.Body).Decode(&Payload); err != nil {
		http.Error(w, "ERROR: "+err.Error(), http.StatusBadRequest)
		logger.ErrorLogger.Println(err.Error())
		return
	}

	err := sqlQueries.CancelGroupRequest(UserID, Payload.GroupId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(`{result: "Successfully cancelled the request."}`)
}

func GetTotalGroupCount(w http.ResponseWriter, r *http.Request) {
	countJSON := fmt.Sprintf(`{"count": %d}`, sqlQueries.GetTotalGroupCount())

	w.Write([]byte(countJSON))
}

func LeaveGroup(w http.ResponseWriter, r *http.Request) {
	UserID := r.Context().Value("userID").(int)
	var group structs.GroupRequestStruct
	if err := json.NewDecoder(r.Body).Decode(&group); err != nil || group.GroupId == 0 {
		logger.ErrorLogger.Println(err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := sqlQueries.RemoveUserFromGroup(UserID, group.GroupId); err != nil {
		logger.ErrorLogger.Println(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Write([]byte(`{result: "Success"}`))
}

func KickFromGroup(w http.ResponseWriter, r *http.Request) {
	UserID := r.Context().Value("userID").(int)
	var group structs.GroupRequestStruct
	if err := json.NewDecoder(r.Body).Decode(&group); err != nil || group.GroupId == 0 || group.UserId == 0 {
		logger.ErrorLogger.Println(err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	sqlQueries.KickFromGroup(group.GroupId, UserID, group.UserId)

	w.Write([]byte(`{result: "Success??"}`))
}
