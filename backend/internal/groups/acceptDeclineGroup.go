package groups

// need better filename
import (
	"encoding/json"
	"net/http"
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
