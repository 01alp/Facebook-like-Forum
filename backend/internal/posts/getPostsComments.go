package posts

import (
	"encoding/json"
	"fmt"
	"net/http"
	"slices"
	"social-network/internal/logger"
	"social-network/internal/sqlQueries"
	"social-network/internal/structs"
	"strconv"
)

func GetPostsAndCommentsHandler(w http.ResponseWriter, r *http.Request) {
	userIdStr := r.URL.Query().Get("userID")
	if userIdStr == "" {
		logger.ErrorLogger.Println("Error: userId is empty")
		http.Error(w, "Error: userId is empty", http.StatusBadRequest)
		return
	}
	userId, err := strconv.Atoi(userIdStr)
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
	posts, err = sqlQueries.GetPosts()
	if err != nil {
		logger.ErrorLogger.Println(err)
		http.Error(w, "Error getting posts", http.StatusInternalServerError)
		return
	}

	var filteredPosts []structs.PostStruct

	// get []int of followers ids
	followers, err := sqlQueries.GetFollowedUsers(userId)
	if err != nil {
		http.Error(w, "Error getting followers", http.StatusInternalServerError)
		return
	}
	fmt.Println("userID=("+userIdStr+") is following users: ", followers)
	// get []int of closest friends ids
	closestFriends, err := sqlQueries.GetCloseFriends(userId)
	if err != nil {
		http.Error(w, "Error getting close friends", http.StatusInternalServerError)
		return
	}
	fmt.Println("Users that have userID=("+userIdStr+") added as friend", closestFriends)

	for i := 0; i < len(posts); i++ {

		// add post to filteredPosts if author is request user
		if posts[i].Author == userId {
			filteredPosts = append(filteredPosts, posts[i])
			continue
		}

		switch posts[i].Privacy {
		case 0:
			// public post
			filteredPosts = append(filteredPosts, posts[i])
			continue
		case 1:
			// private post
			// check if user is following author
			if slices.Contains(followers, posts[i].Author) {
				filteredPosts = append(filteredPosts, posts[i])
				continue
			}
		case 2:
			// close friends post
			if slices.Contains(closestFriends, posts[i].Author) {
				filteredPosts = append(filteredPosts, posts[i])
				continue
			}
		default:
			logger.ErrorLogger.Println("Error: invalid privacy value")
			http.Error(w, "Error: invalid privacy value", http.StatusInternalServerError)
			return
		}
	}

	// add comments to each post
	for i := 0; i < len(filteredPosts); i++ {
		// get comments
		comments, err = sqlQueries.GetComments(filteredPosts[i].Id)
		if err != nil {
			logger.ErrorLogger.Println(err)
			http.Error(w, "Error getting comments", http.StatusInternalServerError)
			return
		}
		filteredPosts[i].Comments = comments
	}

	payload.Posts = filteredPosts

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(payload)
}
