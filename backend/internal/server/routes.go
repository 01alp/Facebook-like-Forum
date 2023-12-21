package server

import (
	"context"
	"net/http"
	"social-network/internal/auth"
	"social-network/internal/chat"
	"social-network/internal/cors"
	"social-network/internal/groups"
	"social-network/internal/logger"
	"social-network/internal/posts"
	"social-network/internal/sqlQueries"
	"social-network/internal/users"
	"social-network/internal/websocket"
	"strconv"
)

type AuthMiddlewareHandler struct {
	Handler      http.HandlerFunc
	RequiresAuth bool
}

func Middleware(next AuthMiddlewareHandler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cors.EnableCors(&w)
		if r.Method == "OPTIONS" { // handle CORS preflight
			w.WriteHeader(http.StatusOK)
			return
		}

		if next.RequiresAuth {
			cookie, err := r.Cookie("session_token")
			if err != nil {
				logger.ErrorLogger.Printf("Error retrieving session token: %v\n", err)
				http.Error(w, "Access denied: session token is required", http.StatusUnauthorized)
				return
			}
			userID, err := sqlQueries.ValidateSession(cookie.Value)
			if err != nil || userID == 0 {
				logger.ErrorLogger.Printf("Error validating session token: %v\n", err)
				http.Error(w, "Access denied: invalid session token", http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), "userID", userID) // Using type string atm, as not expecting to have collisions
			r = r.WithContext(ctx)                                  // Store userID in HTTP request
		}

		next.Handler(w, r) // Call the next handler in the chain
	}
}

func (s *Server) RegisterRoutes() {
	mux := s.router

	// file server:
	// TODO: add middleware somehow
	mux.Handle("/images/", http.StripPrefix("/images/", http.FileServer(http.Dir("./internal/database/images"))))

	//Auth:
	mux.HandleFunc("/auth", Middleware(AuthMiddlewareHandler{Handler: TestHandlerx, RequiresAuth: false}))

	//Initial session:
	mux.HandleFunc("/register", Middleware(AuthMiddlewareHandler{Handler: auth.RegisterHandler, RequiresAuth: false}))
	mux.HandleFunc("/login", Middleware(AuthMiddlewareHandler{Handler: auth.LoginHandler, RequiresAuth: false}))
	mux.HandleFunc("/logout", Middleware(AuthMiddlewareHandler{Handler: auth.LogoutHandler, RequiresAuth: false}))

	//Chat:
	mux.HandleFunc("/getChatHistory", Middleware(AuthMiddlewareHandler{Handler: chat.HandleGetChatHistory, RequiresAuth: true}))
	mux.HandleFunc("/chatMessage", Middleware(AuthMiddlewareHandler{Handler: chat.HandleNewMessage, RequiresAuth: true}))

	// posts:
	mux.HandleFunc("/newPost", Middleware(AuthMiddlewareHandler{Handler: posts.NewPostHandler, RequiresAuth: false}))
	mux.HandleFunc("/newComment", Middleware(AuthMiddlewareHandler{Handler: posts.NewCommentHandler, RequiresAuth: false}))
	mux.HandleFunc("/getPostsAndComments", Middleware(AuthMiddlewareHandler{Handler: posts.GetPostsAndCommentsHandler, RequiresAuth: false}))

	//Groups:
	mux.HandleFunc("/createGroup", Middleware(AuthMiddlewareHandler{Handler: groups.CreateGroup, RequiresAuth: true}))
	mux.HandleFunc("/sendGroupRequest", Middleware(AuthMiddlewareHandler{Handler: groups.SendGroupRequest, RequiresAuth: true}))
	mux.HandleFunc("/acceptGroup", Middleware(AuthMiddlewareHandler{Handler: groups.AcceptGroupRequest, RequiresAuth: true}))
	mux.HandleFunc("/declineGroup", Middleware(AuthMiddlewareHandler{Handler: groups.DeclineGroupRequest, RequiresAuth: true}))
	mux.HandleFunc("/getAllGroups", Middleware(AuthMiddlewareHandler{Handler: groups.GetAllGroups, RequiresAuth: false}))
	mux.HandleFunc("/getGroups", Middleware(AuthMiddlewareHandler{Handler: groups.GetGroups, RequiresAuth: false}))
	mux.HandleFunc("/getGroupMembers", Middleware(AuthMiddlewareHandler{Handler: groups.GetGroupMembers, RequiresAuth: false}))
	mux.HandleFunc("/cancelGroupRequest", Middleware(AuthMiddlewareHandler{Handler: groups.CancelGroupRequest, RequiresAuth: true}))
	mux.HandleFunc("/getGroupCount", Middleware(AuthMiddlewareHandler{Handler: groups.GetTotalGroupCount, RequiresAuth: false}))
	mux.HandleFunc("/leaveGroup", Middleware(AuthMiddlewareHandler{Handler: groups.LeaveGroup, RequiresAuth: true}))

	// websocket:
	mux.HandleFunc("/ws", websocket.UpgradeHandler) //TODO: Move through middleware?

	// users, profile visibility, followers:
	mux.HandleFunc("/users", Middleware(AuthMiddlewareHandler{Handler: users.GetUsersHandler, RequiresAuth: false}))
	mux.HandleFunc("/changeProfileVisibility", Middleware(AuthMiddlewareHandler{Handler: users.HandleProfileVisibilityChange, RequiresAuth: true}))
	mux.HandleFunc("/followOrUnfollowRequest", Middleware(AuthMiddlewareHandler{Handler: users.HandleFollowOrUnfollowRequest, RequiresAuth: true}))
	mux.HandleFunc("/getFollowers", Middleware(AuthMiddlewareHandler{Handler: users.HandleGetFollowers, RequiresAuth: true}))
	mux.HandleFunc("/getFollowing", Middleware(AuthMiddlewareHandler{Handler: users.HandleGetFollowing, RequiresAuth: true}))
	mux.HandleFunc("/getFollowStatus", Middleware(AuthMiddlewareHandler{Handler: users.HandleGetFollowStatus, RequiresAuth: true}))
	mux.HandleFunc("/closeFriend", Middleware((AuthMiddlewareHandler{Handler: users.HandleCloseFriendRequest, RequiresAuth: true})))
	mux.HandleFunc("/closeFriendStatus", Middleware((AuthMiddlewareHandler{Handler: users.HandleCloseFriendStatus, RequiresAuth: true})))


	mux.HandleFunc("/", Middleware(AuthMiddlewareHandler{Handler: handleNotFound, RequiresAuth: false}))
}

func handleNotFound(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNotFound)
	w.Write([]byte("404 - Not Found"))
}

func TestHandlerx(w http.ResponseWriter, r *http.Request) {
	user := sqlQueries.GetUserFromSession(r)
	w.Write([]byte(strconv.Itoa(user.ID))) // writes 0 if logged out.
}
