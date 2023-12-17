package websocket

import (
	"encoding/json"
	"social-network/internal/logger"
	"social-network/internal/structs"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type ClientList map[int]*Client
type Client struct {
	ID      int
	conn    *websocket.Conn
	manager *Manager
	egress  chan []byte
}

func NewClient(userID int, connection *websocket.Conn, manager *Manager) *Client {
	return &Client{
		ID:      userID,
		conn:    connection,
		manager: manager,
		egress:  make(chan []byte, egressBufferSize),
	}
}

type Manager struct {
	clients ClientList

	// Using a syncMutex here to be able to lock state before editing clients
	sync.RWMutex
}

func NewManager() *Manager {
	return &Manager{
		clients: make(ClientList),
	}
}

func (m *Manager) addClient(userID int, client *Client) {
	m.Lock()
	defer m.Unlock()

	m.clients[userID] = client
	go client.WritePump()
	go client.ReadPump()
}

func (m *Manager) removeClient(userID int) {
	m.Lock()
	defer func() {
		m.Unlock()
		broadcastUserGoingOffline(userID)
	}()

	if client, ok := m.clients[userID]; ok {
		close(client.egress)
		err := client.conn.Close()
		if err != nil {
			logger.ErrorLogger.Printf("Error closing websocket connection for user %d: %v\n", client.ID, err)
		} else {
			logger.InfoLogger.Printf("Closed websocket connection for user %d\n", client.ID)
		}
		delete(m.clients, userID)
	}
}

func IsClientOnline(userID int) bool {
	manager.RLock()
	defer manager.RUnlock()

	_, online := manager.clients[userID]
	return online
}

func (c *Client) ReadPump() {
	// Close client ws conn in case of ReadPump error
	defer func() {
		c.manager.removeClient(c.ID)
	}()

	// Set maximum message size (TODO: Will see with posts images later, probably not efficient to send them over ws?)
	const maxMessageSize = 8192 // 8KB
	c.conn.SetReadLimit(maxMessageSize)

	// Reset the countdown for considering connection alive/dead
	c.conn.SetReadDeadline(time.Now().Add(pongWait))

	// Set pong handler
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				logger.ErrorLogger.Println("Unexpected ws close error with user", c.ID, ":", err)
			}
			break
		}

		// Unmarshal message to get type
		var envelope structs.WSMessageEnvelope
		if err := json.Unmarshal(message, &envelope); err != nil {
			logger.ErrorLogger.Println("Error unmarshaling ws envelope from user:", c.ID, ":", err)
			respondToClient(c, "unmarshaling_error_reply", "error", map[string]string{"error": "Failed to unmarshal message", "details": err.Error()})
			continue
		}

		// Handle message
		handleIncomingMessage(c, envelope.Type, envelope)
	}
}

func (c *Client) WritePump() {
	ticker := time.NewTicker(pingInterval)
	defer func() {
		ticker.Stop()
	}()

	for {
		select {
		case message, ok := <-c.egress:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			var messages []json.RawMessage
			messages = append(messages, message)

			// Include all queued messages to ws message
			n := len(c.egress)
			for i := 0; i < n; i++ {
				messages = append(messages, <-c.egress)
			}

			// Create json for combined messages
			combinedMessage, err := json.Marshal(map[string][]json.RawMessage{"messages": messages})
			if err != nil {
				logger.ErrorLogger.Println("Error marshaling combined message in WritePump:", err)
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}

			w.Write(combinedMessage)

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
