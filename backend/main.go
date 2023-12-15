package main

import (
	"fmt"
	"os"
	"social-network/internal/logger"
	"social-network/internal/server"
	"social-network/internal/userChat"
	"social-network/internal/users"
	"social-network/internal/websocket"
)

func initServices() {
	userChatService := &userChat.Service{}
	userService := &users.Service{}
	websocket.Initialize(userChatService, userService)
}

func main() {

	initServices()

	if err := server.ServerInit(); err != nil {
		logger.ErrorLogger.Println("Server Initialization error:", err)
		fmt.Println("Server Initialization error:", err)
		os.Exit(1)
	}
}
