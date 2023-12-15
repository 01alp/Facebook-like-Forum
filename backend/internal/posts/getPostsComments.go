package posts

import (
	"encoding/json"
	"net/http"
	"social-network/internal/logger"
	"social-network/internal/sqlQueries"
	"social-network/internal/structs"
	"strconv"
)

func GetPostsAndCommentsHandler(w http.ResponseWriter, r *http.Request) {
	userIdStr := r.URL.Query().Get("id")
	if userIdStr == "" {
		logger.ErrorLogger.Println("Error: userId is empty")
		http.Error(w, "Error: userId is empty", http.StatusBadRequest)
		return
	}
	userId, err := strconv.Atoi(r.URL.Query().Get("id"))
	if err != nil {
		logger.ErrorLogger.Println(err)
		http.Error(w, "Error converting userId string to int", http.StatusInternalServerError)
		return
	}

	// fmt.Println("Loading posts for user id: ", userId)

	var payload structs.PostsAndCommentsPayload
	var posts []structs.PostStruct
	var comments []structs.CommentStruct

	// TODO: Add privacy filter

	// get posts
	posts, err = sqlQueries.GetPosts(userId)
	if err != nil {
		logger.ErrorLogger.Println(err)
		http.Error(w, "Error getting posts", http.StatusInternalServerError)
		return
	}
	// add comments to each post
	for i := 0; i < len(posts); i++ {
		// get comments
		comments, err = sqlQueries.GetComments(posts[i].Id)
		if err != nil {
			logger.ErrorLogger.Println(err)
			http.Error(w, "Error getting comments", http.StatusInternalServerError)
			return
		}
		posts[i].Comments = comments
	}

	payload.Posts = posts

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(payload)
}
