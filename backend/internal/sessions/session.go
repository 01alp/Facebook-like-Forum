package sessions

import (
	"net/http"
	"social-network/internal/logger"
	"social-network/internal/sqlQueries"
	"time"
)

func SessionMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "OPTIONS" { // handle CORS preflight
			w.WriteHeader(http.StatusOK)
			return
		}

		// Check if there is a valid session cookie.
		sessionCookie := GetSession(r)
		if sessionCookie == nil {
			logger.ErrorLogger.Println("Unauthorized access attempt")
			http.Error(w, "Unauthorized - No valid session", http.StatusUnauthorized)
			return
		}

		next(w, r) // Call the next handler in the chain
	}
}

func GetSession(r *http.Request) *http.Cookie {
	session := GetCookie(r, "session_token")
	if session == nil {
		logger.ErrorLogger.Println("Session cookie not found")
		return nil
	}
	return session
}

func SetSession(w http.ResponseWriter, userID int, cookieName string) *http.Cookie {
	cookie := CreateCookie(cookieName)
	if cookie == nil {
		logger.ErrorLogger.Println("Failed to create session cookie for user:", userID)
		return nil
	}

	//Add session to database
	err := sqlQueries.InsertNewSession(userID, cookie.Value, cookie.Expires)
	if err != nil {
		logger.ErrorLogger.Println("Failed to insert session into DB:", err)
		return nil
	}

	http.SetCookie(w, cookie)
	return cookie
}

func DeleteSession(w http.ResponseWriter, userid int) {
	sqlQueries.RemoveSession(userid)
	expire := time.Now().Add(-7 * 24 * time.Hour)
	cookie := http.Cookie{
		Name:    "session_token",
		Value:   "",
		Expires: expire,
	}
	http.SetCookie(w, &cookie)
}
