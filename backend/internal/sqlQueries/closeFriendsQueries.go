package sqlQueries

import (
	"log"
	"social-network/internal/database"
)

// Function to make close friends
func MakeCloseFriend(sourceID, friendID int) (bool, error) {
	var friendshipExists bool

	// Check if the friendship already exists
	query := `
		SELECT EXISTS(
			SELECT 1 FROM close_friends
			WHERE (source_id = $1 AND friend_id = $2)
		)
	`
	err := database.DB.QueryRow(query, sourceID, friendID).Scan(&friendshipExists)
	if err != nil {
		log.Printf("Error checking if user %d is already friends with %d: %v\n", sourceID, friendID, err)
		return false, err
	}

	if friendshipExists {
		return false, nil // Friendship already exists
	}

	// Insert the new friendship
	_, err = database.DB.Exec("INSERT INTO close_friends (source_id, friend_id) VALUES ($1, $2)", sourceID, friendID)
	if err != nil {
		log.Printf("Error making friends between %d and %d: %v\n", sourceID, friendID, err)
		return false, err
	}

	return true, nil // Friendship created successfully
}

// Function to break close friends
func BreakCloseFriend(sourceID, friendID int) (bool, error) {
	var friendshipExists bool

	// Check if the friendship exists
	query := `
		SELECT EXISTS(
			SELECT 1 FROM close_friends
			WHERE (source_id = $1 AND friend_id = $2)
		)
	`
	err := database.DB.QueryRow(query, sourceID, friendID).Scan(&friendshipExists)
	if err != nil {
		log.Printf("Error checking if user %d is friends with %d: %v\n", sourceID, friendID, err)
		return false, err
	}

	if !friendshipExists {
		return false, nil // Friendship does not exist
	}

	// Delete the existing friendship
	_, err = database.DB.Exec(`
		DELETE FROM close_friends
		WHERE (source_id = $1 AND friend_id = $2)
	`, sourceID, friendID)
	if err != nil {
		log.Printf("Error breaking friends between %d and %d: %v\n", sourceID, friendID, err)
		return false, err
	}

	return true, nil // Friendship broken successfully
}

// Function to check if two individuals are close friends
func CheckIfCloseFriend(sourceID, friendID int) (bool, error) {
	var friendshipExists bool

	// Check if the friendship exists
	query := `
		SELECT EXISTS(
			SELECT 1 FROM close_friends
			WHERE (source_id = $1 AND friend_id = $2)
		)
	`
	err := database.DB.QueryRow(query, sourceID, friendID).Scan(&friendshipExists)
	if err != nil {
		log.Printf("Error checking if user %d is friends with %d: %v\n", sourceID, friendID, err)
		return false, err
	}

	return friendshipExists, nil
}
