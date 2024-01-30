package posts

import (
	"encoding/json"
	"fmt"
	"net/http"
	"social-network/internal/images"
	"social-network/internal/logger"
	"social-network/internal/sqlQueries"
	"social-network/internal/structs"
)

func NewCommentHandler(w http.ResponseWriter, r *http.Request) {

	var newComment structs.CommentStruct

	jsonData := r.FormValue("json")
	// //Decode new post data
	if err := json.Unmarshal([]byte(jsonData), &newComment); err != nil {
		logger.ErrorLogger.Println("Error decoding registration request:", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	filename, err := images.ImageHandler(r, "comment_images")
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	newComment.Image = filename
	fmt.Println(newComment.GroupID)

	// Insert new comment into database
	if newComment.GroupID == 0 {
		if err := sqlQueries.InsertNewComment(newComment); err != nil {
			logger.ErrorLogger.Println("Error creating new comment:", err)
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
	} else {
		// Insert new group comment into database
		if err := sqlQueries.InsertNewGroupComment(newComment); err != nil {
			logger.ErrorLogger.Println("Error creating new comment:", err)
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
	}
	w.WriteHeader(http.StatusCreated)
}
