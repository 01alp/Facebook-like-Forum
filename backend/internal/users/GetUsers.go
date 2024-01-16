package users

import (
	"encoding/json"
	"net/http"
	"social-network/internal/logger"
	"social-network/internal/sqlQueries"
	"time"
)

func GetUsersHandler(w http.ResponseWriter, r *http.Request) {
	//Get requesting userID from the context
	val := r.Context().Value("userID")
	requestingUserID, ok := val.(int)
	if !ok || requestingUserID == 0 {
		logger.ErrorLogger.Println("Error getting following: invalid requester user ID in context")
		http.Error(w, "Error getting following: Invalid requester user ID in context", http.StatusInternalServerError)
		return
	}

	users, err := sqlQueries.GetAllUsers()
	if err != nil {
		http.Error(w, "Error getting users", http.StatusInternalServerError)
		return
	}

	for i, user := range users {
		accessible, err := sqlQueries.CheckProfileAccess(requestingUserID, user.ID)
		if err != nil {
			logger.ErrorLogger.Println("Error checking profile access when getting all users", err)
			http.Error(w, "Error checking profile access when getting all users", http.StatusInternalServerError)
			return
		}
		if !accessible {
			users[i].AboutMe = ""
			users[i].BirthDate = time.Time{}
			users[i].Email = ""
			users[i].RegisterDate = time.Time{}
			users[i].Username = ""
		}
	}

	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(users); err != nil {
		logger.ErrorLogger.Println("Error encoding users:", err)
		http.Error(w, "Error encoding users", http.StatusInternalServerError)
		return
	}
}
