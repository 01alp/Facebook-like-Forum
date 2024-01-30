package groups

import (
	"encoding/json"
	"net/http"
	"social-network/internal/sqlQueries"
	"social-network/internal/structs"
)

func UpdateAttendees(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var request structs.UpdateAttendeeRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	err := sqlQueries.UpdateAttendee(request)
	if err != nil {
		http.Error(w, "SQL query error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	response := structs.UpdateAttendeeResponse{
		Success: true,
		Message: "Status updated successfully",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
