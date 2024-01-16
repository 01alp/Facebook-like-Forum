package sqlQueries

import (
	"database/sql"
	"encoding/base64"
	"fmt"
	"log"
	"net/http"
	"os"
	"social-network/internal/database"
	"social-network/internal/images"
	"social-network/internal/logger"
	"social-network/internal/structs"
	"strconv"
	"strings"
)

// Add SQL

func AddNewUser(user structs.User) error {
	stmt, err := database.DB.Prepare("INSERT INTO users(username, first_name, last_name, email, password, about_me, birth_date, avatar) VALUES(?, ?, ?, ?, ?, ?, ?, ?)")
	if err != nil {
		logger.ErrorLogger.Println("Stmt prepare error while adding user to db:", err)
		return err
	}
	defer stmt.Close()

	var sqlUsername sql.NullString
	if user.Username != "" {
		sqlUsername = sql.NullString{String: user.Username, Valid: true}
	} else {
		sqlUsername = sql.NullString{Valid: false} // Will insert NULL into the database
	}

	res, err := stmt.Exec(sqlUsername, user.FirstName, user.LastName, strings.ToLower(user.Email), user.Password, user.AboutMe, user.BirthDate, 0)
	if err != nil {
		logger.ErrorLogger.Println("Exec error while adding user to db:", err)
		return err
	}

	// user is created, not returning errors after this point (following is all for updating the avatar)
	userID, err := res.LastInsertId()
	if err != nil {
		logger.ErrorLogger.Println("error getting last id: ", err)
		return nil
	}
	if b64data := user.Avatar[strings.IndexByte(user.Avatar, ',')+1:]; b64data == "" || !images.SaveImage(b64data, userID) { // if there are errors with the image then use default instead
		logger.ErrorLogger.Println("Using default avatar on user")
		return nil
	}
	_, err = database.DB.Exec(`UPDATE users SET avatar = $1 WHERE id = $1`, userID)
	if err != nil {
		logger.ErrorLogger.Println("failed updating user avatar: ", err)
		return nil
	}

	return nil
}

// Get SQL
func GetUserFromSession(r *http.Request) structs.User {
	var user structs.User
	var sqlUsername sql.NullString

	session, err := r.Cookie("session_token")
	if err != nil {
		logger.ErrorLogger.Println("GetSession error:", err)
		return user
	}

	row := database.DB.QueryRow("SELECT u.* from users u LEFT JOIN sessions s ON s.user_id = u.id WHERE s.session_token = ?", session.Value)
	err = row.Scan(&user.ID, &sqlUsername, &user.FirstName, &user.LastName, &user.Email, &user.Password, &user.AboutMe, &user.BirthDate, &user.RegisterDate, &user.Avatar, &user.Public)
	if err != nil {
		logger.ErrorLogger.Println("GetSessionScan error:", err)
		return user
	}

	if sqlUsername.Valid {
		user.Username = sqlUsername.String
	} else {
		user.Username = ""
	}

	SetAvatar(&user)
	return user
}

// Get user data by userID
// Password omitted for security
func GetUserFromID(userID int) structs.User {
	var user structs.User
	var sqlUsername sql.NullString

	row := database.DB.QueryRow("SELECT id, username, first_name, last_name, email, about_me, birth_date, register_date, avatar, public from users WHERE id = ?", userID)
	err := row.Scan(&user.ID, &sqlUsername, &user.FirstName, &user.LastName, &user.Email, &user.AboutMe, &user.BirthDate, &user.RegisterDate, &user.Avatar, &user.Public)
	if err != nil {
		logger.ErrorLogger.Println("GetUserScan error:", err)
		return user
	}

	if sqlUsername.Valid {
		user.Username = sqlUsername.String
	} else {
		user.Username = ""
	}

	SetAvatar(&user)
	return user
}

// Get multiple users from slice of IDs
// Password omitted for security
func GetUsersFromIDs(userIDs []int) ([]structs.User, error) {
	if len(userIDs) == 0 {
		return nil, nil
	}

	placeholder := strings.Repeat(",?", len(userIDs)-1)
	query := fmt.Sprintf("SELECT id, username, first_name, last_name, email, about_me, birth_date, register_date, avatar, public FROM users WHERE id IN (?%s)", placeholder)

	// Convert userIDs to interface
	args := make([]interface{}, len(userIDs))
	for i, id := range userIDs {
		args[i] = id
	}

	rows, err := database.DB.Query(query, args...)
	if err != nil {
		logger.ErrorLogger.Println("GetUsersFromIDs query error:", err)
		return nil, err
	}
	defer rows.Close()

	var users []structs.User
	for rows.Next() {
		var user structs.User
		var sqlUsername sql.NullString

		if err := rows.Scan(&user.ID, &sqlUsername, &user.FirstName, &user.LastName, &user.Email, &user.AboutMe, &user.BirthDate, &user.RegisterDate, &user.Avatar, &user.Public); err != nil {
			logger.ErrorLogger.Println("GetUsersFromIDs scan error:", err)
			continue
		}

		if sqlUsername.Valid {
			user.Username = sqlUsername.String
		} else {
			user.Username = ""
		}

		SetAvatar(&user)
		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		logger.ErrorLogger.Println("GetUsersFromIDs rows iteration error:", err)
		return nil, err
	}

	return users, nil
}

func GetUserFromUsername(r *http.Request, username string) structs.User { // case insensitive
	var user structs.User
	var sqlUsername sql.NullString

	row := database.DB.QueryRow("SELECT * from users WHERE LOWER(username) = ?", strings.ToLower(username))
	err := row.Scan(&user.ID, &sqlUsername, &user.FirstName, &user.LastName, &user.Email, &user.Password, &user.AboutMe, &user.BirthDate, &user.RegisterDate, &user.Avatar, &user.Public)
	if err != nil {
		logger.ErrorLogger.Println("GetUserScan error:", err)
		return user
	}

	if sqlUsername.Valid {
		user.Username = sqlUsername.String
	} else {
		user.Username = ""
	}

	SetAvatar(&user)
	return user
}

func GetUserFromEmail(r *http.Request, email string) structs.User {
	var user structs.User
	var sqlUsername sql.NullString

	row := database.DB.QueryRow("SELECT * from users WHERE email = ?", email)
	err := row.Scan(&user.ID, &sqlUsername, &user.FirstName, &user.LastName, &user.Email, &user.Password, &user.AboutMe, &user.BirthDate, &user.RegisterDate, &user.Avatar, &user.Public)
	if err != nil {
		logger.ErrorLogger.Println("GetUserScan error:", err)
		return user
	}

	if sqlUsername.Valid {
		user.Username = sqlUsername.String
	} else {
		user.Username = ""
	}

	SetAvatar(&user)
	return user
}

func GetUserFromLogin(r *http.Request, identifier string) structs.User { // identifier can be username or email, email case insensitive.
	var user structs.User
	var sqlUsername sql.NullString
	var lowerEmail, Username = strings.ToLower(identifier), identifier
	row := database.DB.QueryRow("SELECT * from users WHERE LOWER(email) = ? OR username = ?", lowerEmail, Username)
	err := row.Scan(&user.ID, &sqlUsername, &user.FirstName, &user.LastName, &user.Email, &user.Password, &user.AboutMe, &user.BirthDate, &user.RegisterDate, &user.Avatar, &user.Public)
	if err != nil {
		logger.ErrorLogger.Println("GetUserFromLoginScan error:", err)
		return structs.User{}
	}

	if sqlUsername.Valid {
		user.Username = sqlUsername.String
	} else {
		user.Username = ""
	}

	SetAvatar(&user)
	return user
}

// To check if user with given ID exists in users table
func UserExists(userID int) (bool, error) {
	var exists bool

	query := "SELECT EXISTS(SELECT 1 FROM users WHERE id = ?)"
	err := database.DB.QueryRow(query, userID).Scan(&exists)
	if err != nil && err != sql.ErrNoRows {
		logger.ErrorLogger.Println("UserExists query error:", err)
		return false, err
	}

	return exists, nil
}

func SetAvatar(user *structs.User) { // struct by default has the ID of the image, this converts it into base64
	fileName := strconv.Itoa(user.ID) + ".png"
	if user.ID == 0 || user.Avatar == "0" {
		fileName = "0.png"
	}
	bytes, err := os.ReadFile("./internal/database/images/avatars/" + fileName)
	if err != nil {
		log.Fatal(err)
	}

	base64Encoding := `data:image/png;base64,`

	// Append the base64 encoded output
	//base64Encoding += base64.StdEncoding.EncodeToString(bytes)
	base64Encoding += base64.StdEncoding.EncodeToString(bytes)
	user.Avatar = base64Encoding
}

func GetUserFromId(userId int) (structs.User, error) {
	var user structs.User
	var sqlUsername sql.NullString

	query := "SELECT * FROM users WHERE id = ?"
	err := database.DB.QueryRow(query, userId).Scan(&user.ID, &sqlUsername, &user.FirstName, &user.LastName, &user.Email, &user.Password, &user.AboutMe, &user.BirthDate, &user.RegisterDate, &user.Avatar, &user.Public)
	if err != nil {
		logger.ErrorLogger.Println("GetUserFromId query error:", err)
		return user, err
	}

	if sqlUsername.Valid {
		user.Username = sqlUsername.String
	} else {
		user.Username = ""
	}

	SetAvatar(&user)
	return user, nil
}

func GetAllUsers() ([]structs.User, error) {
	query := "SELECT * FROM users"
	rows, err := database.DB.Query(query)
	if err != nil {
		logger.ErrorLogger.Println("GetAllUsers query error:", err)
		return nil, err
	}
	defer rows.Close()

	var users []structs.User
	for rows.Next() {
		var user structs.User
		var sqlUsername sql.NullString
		err := rows.Scan(&user.ID, &sqlUsername, &user.FirstName, &user.LastName, &user.Email, &user.Password, &user.AboutMe, &user.BirthDate, &user.RegisterDate, &user.Avatar, &user.Public)
		if err != nil {
			logger.ErrorLogger.Println("GetAllUsers scan error:", err)
			return nil, err
		}

		if sqlUsername.Valid {
			user.Username = sqlUsername.String
		} else {
			user.Username = ""
		}

		SetAvatar(&user)
		user.Password = "" // not sending password to client
		users = append(users, user)
	}

	return users, nil
}

func GetProfileVisibility(userID int) (int, error) {
	var visibility int // 1-public, 0-private
	err := database.DB.QueryRow("SELECT public FROM users WHERE ID = ?", userID).Scan(&visibility)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, fmt.Errorf("user with ID %d does not exist", userID)
		}
		logger.ErrorLogger.Println("Error getting current visibility from db:", err)
		return 0, err
	}

	return visibility, nil
}

func ChangeProfileVisibility(userID int, newVisibility int) error {
	currentVisibility, err := GetProfileVisibility(userID)
	if err != nil {
		return err
	}

	if currentVisibility == newVisibility {
		return fmt.Errorf("user %d already has profile visibility set to %v", userID, newVisibility)
	}

	_, err = database.DB.Exec("UPDATE users SET public = ? WHERE id = ?", newVisibility, userID)
	if err != nil {
		logger.ErrorLogger.Println("Error updating visibility status:", err)
		return err
	}

	return nil
}

func CheckProfileAccess(requestingUserID int, requestedUserID int) (bool, error) {
	if requestingUserID == requestedUserID {
		return true, nil
	}

	publicProfile, err := GetProfileVisibility(requestedUserID)
	if err != nil {
		return false, err
	}
	if publicProfile == 1 { // If profile is public, access is given
		return true, nil
	}

	followStatus, err := GetFollowStatus(requestingUserID, requestedUserID)
	if err != nil {
		return false, err
	}
	if followStatus == 1 { // If profile is private, but following, access is given
		return true, nil
	}
	return false, nil
}
