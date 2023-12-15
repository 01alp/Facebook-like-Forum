package websocket

import (
	"fmt"
	"net/http"
	"social-network/internal/logger"
	"social-network/internal/sqlQueries"
	"time"

	"github.com/gorilla/websocket"
)

var (
	pongWait          = 10 * time.Second
	pingInterval      = (pongWait * 9) / 10
	writeWait         = 5 * time.Second
	egressBufferSize  = 10
	websocketUpgrader = websocket.Upgrader{
		// Apply the Origin Checker
		CheckOrigin:     checkOrigin,
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}
	manager = NewManager()
)

func checkOrigin(r *http.Request) bool {
	origin := r.Header.Get("Origin")
	allowedOrigins := []string{"http://localhost:8080", "https://localhost:8080", "http://localhost:3000"} // TODO: Remove http once Caddy is working // TODO: Only accept from proxy at localhost:80 once caddy working

	for _, allowedOrigin := range allowedOrigins {
		if origin == allowedOrigin {
			return true
		}
	}
	return false
}

func UpgradeHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("got requst")
	// Check if session cookie exists
	sessionCookie, err := r.Cookie("session_token")
	if err != nil {
		logger.ErrorLogger.Println("WS upgrade attempt with no session token:", err)
		http.Error(w, "Unauthorized ws conn request - No session token", http.StatusUnauthorized)
		return
	}

	// Check if session cookie is valid and to which user it belongs
	userID, err := sqlQueries.ValidateSession(sessionCookie.Value)
	if err != nil {
		logger.ErrorLogger.Println("WS upgrade attempt with invalid session token:", err)
		http.Error(w, "Unauthorized ws conn request - Invalid session token", http.StatusUnauthorized)
		return
	}

	conn, err := websocketUpgrader.Upgrade(w, r, nil)
	if err != nil {
		logger.ErrorLogger.Println("WebSocket upgrade error:", err)
		return
	}

	broadcastUserComingOnline(userID)

	client := NewClient(userID, conn, manager)
	fmt.Println("new client started")
	manager.addClient(userID, client)

	syncClientState(userID)

	logger.InfoLogger.Println("User with id ", userID, "upgraded to ws connection")
}

func syncClientState(userID int) {
	sendOnlineUsersList(userID)
	userChatService.SendPendingChatMessages(userID) // Send 1-1 chat messages which user has received while offline
	userService.SendPendingFollowRequests(userID)
}
