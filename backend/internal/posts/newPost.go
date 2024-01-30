package posts

import (
	"encoding/json"
	"net/http"
	"social-network/internal/images"
	"social-network/internal/logger"
	"social-network/internal/sqlQueries"
	"social-network/internal/structs"
)

func NewPostHandler(w http.ResponseWriter, r *http.Request) {

	// err := r.ParseMultipartForm(10 << 20) // 10 MB limit
	// if err != nil {
	// 	logger.ErrorLogger.Println("Size limit exceeded", err)
	// 	http.Error(w, "Size limit exceeded", http.StatusBadRequest)
	// 	return
	// }

	var newPost structs.PostStruct

	jsonData := r.FormValue("json")
	// //Decode new post data
	if err := json.Unmarshal([]byte(jsonData), &newPost); err != nil {
		logger.ErrorLogger.Println("Error decoding registration request:", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	filename, err := images.ImageHandler(r, "post_images")
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	newPost.Image = filename

	if newPost.GroupID == 0 {
		// Insert new post into database
		if err := sqlQueries.InsertNewPost(newPost); err != nil {
			logger.ErrorLogger.Println("Error creating new group post:", err)
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
	} else {
		// Insert new group post into database
		if err := sqlQueries.InsertNewGroupPost(newPost); err != nil {
			logger.ErrorLogger.Println("Error creating new post:", err)
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
	}

	w.WriteHeader(http.StatusCreated)
}
