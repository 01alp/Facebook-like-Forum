package groups

// need better filename
import (
	"encoding/json"
	"fmt"
	"net/http"
	"social-network/internal/logger"
	"social-network/internal/sqlQueries"
	"social-network/internal/structs"
)

func AcceptGroupRequest(w http.ResponseWriter, r *http.Request) {
	var GroupRequest structs.GroupRequestStruct
	UserID := r.Context().Value("userID").(int)

	if err := json.NewDecoder(r.Body).Decode(&GroupRequest); err != nil {
		http.Error(w, "ERROR: "+err.Error(), http.StatusBadRequest)
	}
	if GroupRequest.GroupId == 0 {
		http.Error(w, "Group id empty", http.StatusBadRequest)
		return
	}
	if GroupRequest.UserId == 0 {
		http.Error(w, "user id empty", http.StatusBadRequest)
		return
	}
	if err := sqlQueries.AcceptGroupRequest(UserID, GroupRequest.UserId, GroupRequest.GroupId); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode("Successfully accepted the group request!")
}

func DeclineGroupRequest(w http.ResponseWriter, r *http.Request) {
	var GroupRequest structs.GroupRequestStruct
	UserID := r.Context().Value("userID").(int)

	if err := json.NewDecoder(r.Body).Decode(&GroupRequest); err != nil {
		http.Error(w, "ERROR: "+err.Error(), http.StatusBadRequest)
	}
	if GroupRequest.GroupId == 0 {
		http.Error(w, "Group id empty", http.StatusBadRequest)
		return
	}
	if GroupRequest.UserId == 0 {
		http.Error(w, "user id empty", http.StatusBadRequest)
		return
	}
	if err := sqlQueries.DeclineGroupRequest(UserID, GroupRequest.UserId, GroupRequest.GroupId); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	json.NewEncoder(w).Encode("Successfully declined the group request!")
}

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
