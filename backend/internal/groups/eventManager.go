package groups

import (
	"encoding/json"
	"fmt"
	"net/http"
	"social-network/internal/logger"
	"social-network/internal/structs"
)

func CreateEvent(w http.ResponseWriter, r *http.Request) {
	var Event structs.GroupEvent

	val := r.Context().Value("userID")
	userID, ok := val.(int)
	if !ok || userID == 0 {
		logger.ErrorLogger.Println("Error creating new event: invalid user ID in context")
		http.Error(w, "Invalid user ID in context", http.StatusInternalServerError)
		return
	}

	if err := json.NewDecoder(r.Body).Decode(&Event); err != nil {
		http.Error(w, "error decoding: "+err.Error(), http.StatusBadRequest)
		return
	}

	fmt.Println("New event received: ", Event)
	// 	if CreateGroupStruct.Title == "" || CreateGroupStruct.Description == "" {
	// 		http.Error(w, "missing title or description.", http.StatusBadRequest)
	// 		return
	// 	}
	// 	fmt.Println(CreateGroupStruct)
	// 	if err := sqlQueries.CreateGroup(UserID, CreateGroupStruct.Title, CreateGroupStruct.Description); err != nil { // currently users can create infinite groups. if we dont want this then add UNIQUE tag to creator_id column
	// 		http.Error(w, "Failed to create new group.", http.StatusBadRequest)
	// 		return
	// 	}

	// responseStruct.Success = true
	// w.WriteHeader(http.StatusCreated)
	// json.NewEncoder(w).Encode(responseStruct)
}
