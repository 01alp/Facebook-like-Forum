package sqlQueries

import (
	"errors"
	"social-network/internal/database"
	"social-network/internal/logger"
	"time"
)

func InsertNewSession(userID int, sessionToken string, expiresAt time.Time) error {
	_, err := database.DB.Exec(`
        INSERT INTO sessions (session_token, user_id, expires_at) VALUES (?, ?, ?)
    `, sessionToken, userID, expiresAt)
	if err != nil {
		logger.ErrorLogger.Println("Failed to insert session into DB:", err)
		return err
	}
	return nil
}

func ValidateSession(sessionToken string) (int, error) {
	var userID int
	var expiresAt time.Time

	err := database.DB.QueryRow(`
        SELECT user_id, expires_at FROM sessions WHERE session_token = ?
    `, sessionToken).Scan(&userID, &expiresAt)
	if err != nil {
		return 0, err
	}

	// Check if the session has expired
	if time.Now().After(expiresAt) {
		return 0, errors.New("session expired")
	}

	return userID, nil
}

func RemoveSession(userID int) error {
	_, err := database.DB.Exec(`DELETE FROM sessions WHERE user_id = ?`, userID)
	if err != nil {
		return err
	}
	return nil
}
