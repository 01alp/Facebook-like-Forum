package groups

import (
	"encoding/json"
	"fmt"
	"net/http"
	"social-network/internal/sqlQueries"
	"social-network/internal/structs"
)

func SendGroupRequest(w http.ResponseWriter, r *http.Request) {
	var GroupRequest structs.GroupRequestStruct
	cookie, err := r.Cookie("session_token")
	if err != nil {
		http.Error(w, "User not logged in. (session_token not found)", http.StatusUnauthorized)
		return
	}
	UserID, err := sqlQueries.ValidateSession(cookie.Value)
	if err != nil || UserID == 0 {
		http.Error(w, "User not logged in."+err.Error(), http.StatusUnauthorized)
		return
	}
	if err := json.NewDecoder(r.Body).Decode(&GroupRequest); err != nil {
		http.Error(w, "ERROR: "+err.Error(), http.StatusBadRequest)
		return
	}
	if GroupRequest.GroupId == 0 {
		http.Error(w, "Group id empty", http.StatusBadRequest)
		return
	}
	if err := sqlQueries.SendGroupRequest(UserID, GroupRequest.GroupId); err != nil {
		http.Error(w, "Error sending group request: "+err.Error(), http.StatusBadRequest)
		return
	}

	fmt.Println(GroupRequest)
	var GroupResponse structs.GroupRequestResponse
	GroupResponse.Result = "Successfully sent the request."
	json.NewEncoder(w).Encode(GroupResponse)
}
