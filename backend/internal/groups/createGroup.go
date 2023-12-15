package groups

import (
	"encoding/json"
	"fmt"
	"net/http"
	"social-network/internal/sqlQueries"
	"social-network/internal/structs"
)

func CreateGroup(w http.ResponseWriter, r *http.Request) {
	var CreateGroupStruct structs.GroupStruct
	var responseStruct structs.GroupResponse
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

	if err := json.NewDecoder(r.Body).Decode(&CreateGroupStruct); err != nil {
		http.Error(w, "error decoding: "+err.Error(), http.StatusBadRequest)
		return
	}
	if CreateGroupStruct.Title == "" || CreateGroupStruct.Description == "" {
		http.Error(w, "missing title or description.", http.StatusBadRequest)
		return
	}
	fmt.Println(CreateGroupStruct)
	if err := sqlQueries.CreateGroup(UserID, CreateGroupStruct.Title, CreateGroupStruct.Description); err != nil { // currently users can create infinite groups. if we dont want this then add UNIQUE tag to creator_id column
		http.Error(w, "Failed to create new group.", http.StatusBadRequest)
		return
	}

	responseStruct.Success = true
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(responseStruct)
}
