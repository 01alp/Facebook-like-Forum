package sqlQueries

import (
	"database/sql"
	"fmt"
	"social-network/internal/database"
	"social-network/internal/logger"
	"social-network/internal/structs"
)

func AddFollower(followerID int, followingID int, status int) error { //Status: 0-pending, 1-accepted, 2-declined
	isFollowing, err := CheckIfFollowing(followerID, followingID)
	if err != nil {
		fmt.Println("error herer 1", err)
		logger.ErrorLogger.Printf("Error adding user %d to follow %d:%v", followerID, followingID, err)
		return err
	}

	if isFollowing {
		fmt.Println("error herer 2", err)
		logger.ErrorLogger.Printf("Error adding follower: user %d is already following %d:%v", followerID, followingID, err)
		return fmt.Errorf("user %d is already following user %d", followerID, followingID)
	}

	query := `INSERT INTO user_followers (follower_id, following_id, status) VALUES (?, ?, ?)`
	_, err = database.DB.Exec(query, followerID, followingID, status)
	if err != nil {
		fmt.Println("error herer 3", err)
		return err
	}

	return nil
}

func RemoveFollower(followerID int, followingID int) error {
	query := `DELETE FROM user_followers WHERE follower_id = ? AND following_id = ?`

	res, err := database.DB.Exec(query, followerID, followingID)
	if err != nil {
		logger.ErrorLogger.Printf("Error removing follow relationship %d->%d", followerID, followingID)
		return err
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		logger.ErrorLogger.Println("Error checking rows affected in sqlQueries.Unfollow")
		return err
	}

	if rowsAffected == 0 { //To check if the user was actually following the target
		logger.ErrorLogger.Printf("Error unfollowing: user %d is not following user %d", followerID, followingID)
		return fmt.Errorf("user %d is not following user %d", followerID, followingID)
	}

	return nil
}

func CheckIfFollowing(followerID int, followingID int) (bool, error) {
	var isFollowing bool
	query := "SELECT EXISTS(SELECT 1 FROM user_followers WHERE follower_id = ? AND following_id = ?)"
	err := database.DB.QueryRow(query, followerID, followingID).Scan(&isFollowing)
	if err != nil {
		logger.ErrorLogger.Printf("Error checking if user %d is following %d:%v", followerID, followingID, err)
		return false, err
	}

	return isFollowing, nil
}

// returns userids of users that are followed by the user with the given id
// made this func so dont have to make a request to db for each post (more efficient I think)
func GetFollowedUsers(userID int) ([]int, error) {
	var followers []int

	query := "SELECT following_id FROM user_followers WHERE follower_id = ? AND status = 1"
	rows, err := database.DB.Query(query, userID)
	if err != nil {
		logger.ErrorLogger.Printf("Error getting followers for user %d: %v", userID, err)
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var followerID int
		err := rows.Scan(&followerID)
		if err != nil {
			logger.ErrorLogger.Printf("Error scanning follower ID for user %d: %v", userID, err)
			continue
		}
		followers = append(followers, followerID)
	}
	return followers, nil
}

func CheckCloseFriends(sourceID int, targetID int) (bool, error) {
	var isCloseFriend bool

	query := "SELECT EXISTS(SELECT 1 FROM close_friends WHERE source_id = ? AND friend_id = ?)"
	err := database.DB.QueryRow(query, sourceID, targetID).Scan(&isCloseFriend)
	if err != nil {
		logger.ErrorLogger.Printf("Error checking if user %d is following %d:%v", sourceID, targetID, err)
		return false, err
	}
	return isCloseFriend, nil
}

// get all users that sourceID has added as close friends
// made this func so dont have to make a request to db for each post
func GetCloseFriends(userID int, option int) ([]int, error) {
	var closeFriends []int
	var query string

	if option == 0 {
		// query for all users that userID has added as a close friend
		query = "SELECT friend_id FROM close_friends WHERE source_id = ?"
	} else if option == 1 {
		// query for all users that have userID as a close friend
		query = "SELECT source_id FROM close_friends WHERE friend_id = ?"
	} else {
		return nil, fmt.Errorf("invalid option")
	}

	rows, err := database.DB.Query(query, userID)
	if err != nil {
		logger.ErrorLogger.Printf("Error getting close friends for user %d: %v", userID, err)
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var friendID int
		err := rows.Scan(&friendID)
		if err != nil {
			logger.ErrorLogger.Printf("Error scanning close friends list for user %d: %v", userID, err)
			continue
		}
		closeFriends = append(closeFriends, friendID)
	}
	return closeFriends, nil
}

func ChangeFollowStatus(followerID int, followingID int, status int) error {
	isFollowing, err := CheckIfFollowing(followerID, followingID)
	if err != nil {
		logger.ErrorLogger.Printf("Error changing status of user %d following %d:%v", followerID, followingID, err)
		return err
	}

	if !isFollowing {
		logger.ErrorLogger.Printf("Error changing following status: user %d has no following connection with %d:%v", followerID, followingID, err)
		return fmt.Errorf("user %d has no following connection with user %d", followerID, followingID)
	}

	query := `UPDATE user_followers SET status = ? WHERE follower_id = ? AND following_id = ?`
	res, err := database.DB.Exec(query, status, followerID, followingID)
	if err != nil {
		logger.ErrorLogger.Printf("Error updating follow status %d->%d: %v", followerID, followingID, err)
		return err
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		logger.ErrorLogger.Println("Error checking rows affected in ChangeFollowStatus")
		return err
	}

	if rowsAffected == 0 {
		logger.ErrorLogger.Printf("Error changing follow status: status was already %d for %d->%d", status, followerID, followingID)
		return fmt.Errorf("error changing follow status: status was already %d for %d->%d", status, followerID, followingID)
	}

	return nil
}

func GetPendingFollowRequesterIDs(targetID int) ([]int, error) {
	var userIDs []int

	query := `SELECT follower_id FROM user_followers WHERE following_id = ? AND status = 0`
	rows, err := database.DB.Query(query, targetID)
	if err != nil {
		logger.ErrorLogger.Printf("Error getting pending follow requests for user %d: %v", targetID, err)
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var followerID int
		err := rows.Scan(&followerID)
		if err != nil {
			logger.ErrorLogger.Printf("Error scanning follower ID for user %d: %v", targetID, err)
			continue
		}

		userIDs = append(userIDs, followerID)
	}

	return userIDs, nil
}

func GetUserFollowers(userID int) ([]structs.User, error) {
	var followers []structs.User

	query := `
	SELECT u.id, u.username, u.first_name, u.last_name, u.email, 
		u.about_me, u.birth_date, u.register_date, u.avatar, u.public 
	FROM user_followers uf 
	JOIN users u ON uf.follower_id = u.id 
	WHERE uf.following_id = ? AND uf.status = 1;

	`

	rows, err := database.DB.Query(query, userID)
	if err != nil {
		logger.ErrorLogger.Printf("Error getting followers for user %d: %v", userID, err)
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var user structs.User
		if err := rows.Scan(&user.ID, &user.Username, &user.FirstName, &user.LastName, &user.Email, &user.AboutMe, &user.BirthDate, &user.RegisterDate, &user.Avatar, &user.Public); err != nil {
			logger.ErrorLogger.Printf("Error scanning follower data for user %d: %v", userID, err)
			continue
		}
		SetAvatar(&user)
		followers = append(followers, user)
	}

	if err := rows.Err(); err != nil {
		logger.ErrorLogger.Printf("Error scanning followers data for user %d: %v", userID, err)
		return nil, err
	}

	return followers, nil
}

func GetUserFollowing(userID int) ([]structs.User, error) {
	var followingUsers []structs.User

	query := `
	SELECT u.id, u.username, u.first_name, u.last_name, u.email, 
		u.about_me, u.birth_date, u.register_date, u.avatar, u.public 
	FROM user_followers uf 
	JOIN users u ON uf.following_id = u.id 
	WHERE uf.follower_id = ? AND uf.status = 1;

	`

	rows, err := database.DB.Query(query, userID)
	if err != nil {
		logger.ErrorLogger.Printf("Error getting following users for user %d: %v", userID, err)
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var user structs.User
		if err := rows.Scan(&user.ID, &user.Username, &user.FirstName, &user.LastName, &user.Email, &user.AboutMe, &user.BirthDate, &user.RegisterDate, &user.Avatar, &user.Public); err != nil {
			logger.ErrorLogger.Printf("Error scanning following user data for user %d: %v", userID, err)
			continue
		}
		SetAvatar(&user)
		followingUsers = append(followingUsers, user)
	}

	if err := rows.Err(); err != nil {
		logger.ErrorLogger.Printf("Error scanning following users data for user %d: %v", userID, err)
		return nil, err
	}

	return followingUsers, nil
}

func GetFollowStatus(sourceID int, targetID int) (int, error) { //0-pending, 1-accepted, 2-declined, 3-not following
	var followStatus int

	query := `SELECT status FROM user_followers WHERE follower_id = ? AND following_id = ?`
	err := database.DB.QueryRow(query, sourceID, targetID).Scan(&followStatus)
	if err != nil {
		if err == sql.ErrNoRows {
			followStatus = 3
			return followStatus, nil
		}
		logger.ErrorLogger.Printf("Error getting follow status for user %d -> %d:%v", sourceID, targetID, err)
		return 0, err
	}

	return followStatus, nil
}
