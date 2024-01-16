package auth

import (
	"encoding/json"
	"net/http"
	"social-network/internal/logger"
	"social-network/internal/sessions"
	"social-network/internal/sqlQueries"
	"social-network/internal/structs"

	"golang.org/x/crypto/bcrypt"
)

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	// For preflight requests
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	Identifier, Password, ok := r.BasicAuth()
	// fmt.Println(Identifier, Password, ok)
	if !ok {
		logger.ErrorLogger.Println("Error getting basic auth in LoginHandler")
		http.Error(w, "Error getting basic auth.", http.StatusBadRequest)
		return
	}

	user := sqlQueries.GetUserFromLogin(r, Identifier)
	if user.ID == 0 {
		logger.InfoLogger.Println("Login attempt with invalid username/email: ", Identifier)
		http.Error(w, "Invalid login credentials", http.StatusBadRequest)
		return
	}

	//Check password matching
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(Password)); err != nil {
		logger.InfoLogger.Println("Passwords not matching on login for: ", Identifier)
		http.Error(w, "Invalid password", http.StatusUnauthorized)
		return
	}

	sessions.DeleteSession(w, user.ID) // delete previous session if exists

	sessionCookie := sessions.SetSession(w, user.ID, "session_token")
	if sessionCookie == nil {
		logger.ErrorLogger.Println("Failed to create session for user: ", Identifier)
		http.Error(w, "Failed to create session.", http.StatusInternalServerError)
		return
	}
	logger.InfoLogger.Println("Session cookie set :", sessionCookie.Value, " for user: ", Identifier)

	user.Password = "" // remove password from response

	var response structs.LoginResponse
	response.Resp = user

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
