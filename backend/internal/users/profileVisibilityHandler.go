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

func HandleProfileVisibilityChange(w http.ResponseWriter, r *http.Request) {
	//Retrieve userID from the context
	val := r.Context().Value("userID")
	userID, ok := val.(int)
	if !ok || userID == 0 {
		logger.ErrorLogger.Println("Error handling profile visibility change: invalid user ID in context")
		http.Error(w, "Invalid user ID in context", http.StatusInternalServerError)
		return
	}

	var request structs.ProfileVisibilityChangeRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		logger.ErrorLogger.Println("Error decoding profile visibility change req:", err)
		http.Error(w, "Error decoding message", http.StatusBadRequest)
		return
	}

	err := sqlQueries.ChangeProfileVisibility(userID, request.Public)
	if err != nil {
		logger.ErrorLogger.Println("Error changing profile visibility:", err)
		if strings.Contains(err.Error(), "already has profile visibility set") {
			errorMsg := fmt.Sprintf("Error: User already has visibility set to %v", request.Public)
			http.Error(w, errorMsg, http.StatusBadRequest)
			return
		}
		http.Error(w, "Error changing profile visibility", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "Profile visibility changed"})
}
