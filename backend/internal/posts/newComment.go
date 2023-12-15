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

	fmt.Println(filename)
	newComment.Image = filename
	fmt.Println(newComment)

	// Insert new comment into database
	if err := sqlQueries.InsertNewComment(newComment); err != nil {
		logger.ErrorLogger.Println("Error creating new comment:", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	w.WriteHeader(http.StatusCreated)
}
