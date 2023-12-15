package server

import (
	"database/sql"
	"net/http"
	"social-network/internal/database"
)

type Server struct {
	db     *sql.DB
	router *http.ServeMux
}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.router.ServeHTTP(w, r)
}

func (s *Server) GetDB() *sql.DB {
	return s.db
}

func newServer() *Server {
	s := &Server{}
	return s
}

func ServerInit() error {
	Server := newServer()
	mux := http.NewServeMux()

	db, err := database.OpenDB()
	if err != nil {
		return err
	}
	Server.router = mux
	Server.db = db

	Server.RegisterRoutes()

	ServerErr := http.ListenAndServe(":8080", Server)
	return ServerErr
}
