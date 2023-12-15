package sessions

import (
	"net/http"
	"social-network/internal/logger"
	"time"

	"github.com/gofrs/uuid"
)

func GetCookie(r *http.Request, cookieName string) *http.Cookie {
	cookie, err := r.Cookie(cookieName)
	if err != nil {
		logger.ErrorLogger.Println("getCookie error:", err)
		return nil
	}
	return cookie
}

func SetCookie(r *http.Request, cookieName string) *http.Cookie {
	cookie := CreateCookie(cookieName)
	if cookie == nil {
		return nil
	}

	r.AddCookie(cookie)
	return cookie
}

func CreateCookie(cookieName string) *http.Cookie {
	uuid, err := uuid.NewV4()
	if err != nil {
		logger.ErrorLogger.Println("UUID creation error:", err)
		return nil
	}
	expiresAt := time.Now().Add(time.Hour * 10) // 10 hour cookies can adjust this later

	cookie := &http.Cookie{ // struct creates new session for 1 hour with unique UUID
		Name:     cookieName,
		Value:    uuid.String(),
		Expires:  expiresAt,
		Secure:   false, //TODO: Set to true when HTTPS is working
		HttpOnly: true,
	}

	return cookie
}
