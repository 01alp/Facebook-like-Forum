package sqlQueries

import (
	"social-network/internal/database"
	"social-network/internal/structs"
)

func GetPosts(userId int) ([]structs.PostStruct, error) {
	query := "SELECT * FROM posts"
	rows, err := database.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Iterate through the result set and populate the posts slice
	var posts []structs.PostStruct
	for rows.Next() {
		var post structs.PostStruct
		err := rows.Scan(&post.Id, &post.Author, &post.Message, &post.Image, &post.CreatedAt, &post.Privacy)
		if err != nil {
			return nil, err
		}
		posts = append(posts, post)
	}

	// Check for errors during row iteration
	if err = rows.Err(); err != nil {
		return nil, err
	}

	return posts, nil
}

func GetComments(postId int) ([]structs.CommentStruct, error) {
	// Prepare the SQL query
	query := "SELECT id, post_id, user_id, message, created_at, image FROM post_comments WHERE post_id = ?"
	rows, err := database.DB.Query(query, postId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Iterate through the result set and populate the comments slice
	var comments []structs.CommentStruct
	for rows.Next() {
		var comment structs.CommentStruct
		err := rows.Scan(&comment.Id, &comment.PostId, &comment.UserId, &comment.Message, &comment.CreatedAt, &comment.Image)
		if err != nil {
			return nil, err
		}
		comments = append(comments, comment)
	}

	// Check for errors during row iteration
	if err = rows.Err(); err != nil {
		return nil, err
	}

	return comments, nil
}

func InsertNewPost(post structs.PostStruct) error {
	// Prepare the SQL query
	query := "INSERT INTO posts (author_id, message, image, privacy) VALUES (?, ?, ?, ?)"
	stmt, err := database.DB.Prepare(query)
	if err != nil {
		return err
	}
	defer stmt.Close()

	// Execute the query
	_, err = stmt.Exec(post.Author, post.Message, post.Image, post.Privacy)
	if err != nil {
		return err
	}

	return nil
}

func InsertNewComment(comment structs.CommentStruct) error {
	// Prepare the SQL query
	query := "INSERT INTO post_comments (post_id, user_id, message, image) VALUES (?, ?, ?, ?)"
	stmt, err := database.DB.Prepare(query)
	if err != nil {
		return err
	}
	defer stmt.Close()

	// Execute the query
	_, err = stmt.Exec(comment.PostId, comment.UserId, comment.Message, comment.Image)
	if err != nil {
		return err
	}

	return nil
}
