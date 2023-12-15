package auth

import (
	"encoding/json"
	"fmt"
	"net/http"
	"social-network/internal/logger"
	"social-network/internal/sessions"
	"social-network/internal/sqlQueries"
)

func LogoutHandler(w http.ResponseWriter, r *http.Request) {
	session := sessions.GetSession(r)
	if session == nil {
		logger.ErrorLogger.Println("Error logging out - no session")
		http.Error(w, "User is not logged in. Logout failed.", http.StatusUnauthorized)
		return
	}

	userid, _ := sqlQueries.ValidateSession(session.Value)
	fmt.Println(userid)
	if userid == 0 {
		logger.ErrorLogger.Println("Error logging out - session not valid")
		http.Error(w, "Could not find the session. Logout failed.", http.StatusNotFound)
		return
	}

	sessions.DeleteSession(w, userid)

	logger.InfoLogger.Println("User with id ", userid, " logged out")

	response := map[string]string{"message": "Successfully logged out"}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
