package groups

import (
	"encoding/json"
	"net/http"
	"social-network/internal/logger"
	"social-network/internal/sqlQueries"
	"social-network/internal/structs"
)

func GetGroupPostsHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int)

	var posts []structs.PostStruct
	var comments []structs.CommentStruct

	posts, err := sqlQueries.GetGroupPosts(userID)
	if err != nil {
		logger.ErrorLogger.Printf("Error retrieving group posts: %v\n", err)
		http.Error(w, "Error retrieving group posts", http.StatusInternalServerError)
		return
	}

	for i := 0; i < len(posts); i++ {
		// get comments
		comments, err = sqlQueries.GetGroupComments(posts[i].Id)
		if err != nil {
			logger.ErrorLogger.Println(err)
			http.Error(w, "Error getting comments", http.StatusInternalServerError)
			return
		}
		posts[i].Comments = comments
	}

	var payload structs.PostsAndCommentsPayload
	payload.Posts = posts

	err = json.NewEncoder(w).Encode(payload)
	if err != nil {
		logger.ErrorLogger.Printf("Error encoding group posts: %v\n", err)
		http.Error(w, "Error encoding group posts", http.StatusInternalServerError)
		return
	}
}
