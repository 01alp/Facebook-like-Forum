package auth

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/mail"

	"golang.org/x/crypto/bcrypt"

	"social-network/internal/logger"
	"social-network/internal/sqlQueries"
	"social-network/internal/structs"
)

func valid(email string) bool {
	_, err := mail.ParseAddress(email)
	return err == nil
}

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	// For preflight requests
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}
	var newUser structs.User

	//Decode register data
	err := json.NewDecoder(r.Body).Decode(&newUser)
	if err != nil {
		logger.ErrorLogger.Println("Error decoding registration request:", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	fmt.Println(newUser)

	if newUser.Email == "" || newUser.Password == "" {
		logger.InfoLogger.Println("Register attempt with missing email or username")
		http.Error(w, "Email and password are required", http.StatusBadRequest)
		return
	}

	if user := sqlQueries.GetUserFromEmail(r, newUser.Email); user.ID != 0 {
		logger.InfoLogger.Println("Register attempt with already taken email")
		http.Error(w, "Email is already taken.", http.StatusBadRequest)
		return
	}

	if newUser.Username != "" {
		if user := sqlQueries.GetUserFromUsername(r, newUser.Username); user.ID != 0 {
			logger.InfoLogger.Println("Register attempt with already taken username")
			http.Error(w, "Username is already taken.", http.StatusBadRequest)
			return
		}
	}

	if val := valid(newUser.Email); !val {
		logger.InfoLogger.Println("Register attempt with invalid email")
		http.Error(w, "Invalid email", http.StatusBadRequest)
		return
	}

	if val := valid(newUser.Username); val { // prevent users from having email format usernames to prevent account hijacking.
		http.Error(w, "This username not allowed. Try another", http.StatusBadRequest)
		return
	}

	//Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newUser.Password), bcrypt.DefaultCost)
	if err != nil {
		logger.ErrorLogger.Println("Error hashing password:", err)
		http.Error(w, "Error while hashing password", http.StatusInternalServerError)
		return
	}
	newUser.Password = string(hashedPassword)

	//Save user to database
	err = sqlQueries.AddNewUser(newUser)
	if err != nil {
		logger.ErrorLogger.Println("Error adding new user to the database:", err)
		http.Error(w, "Failed to add new user", http.StatusInternalServerError)
		return
	}

	logger.InfoLogger.Println("Registered new user with email: ", newUser.Email)

	//Send response to client
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("User registered successfully"))
}
