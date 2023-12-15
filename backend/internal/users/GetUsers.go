package users

import (
	"encoding/json"
	"net/http"
	"social-network/internal/logger"
	"social-network/internal/sqlQueries"
)

func GetUsersHandler(w http.ResponseWriter, r *http.Request) {
	users, err := sqlQueries.GetAllUsers()
	if err != nil {
		http.Error(w, "Error getting users", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(users); err != nil {
		logger.ErrorLogger.Println("Error encoding users:", err)
		http.Error(w, "Error encoding users", http.StatusInternalServerError)
		return
	}
}
