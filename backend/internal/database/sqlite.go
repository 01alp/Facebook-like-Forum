package database

// make sure you're in /backend and then you can run the following to create a new migration:
// migrate create -ext sql -dir internal/database/migrations/sqlite -seq create_users_table
//
// migrate -database sqlite3://database.db -path internal/database/migrations/sqlite force 2
// migrate -database sqlite3://database.db -path internal/database/migrations/sqlite down

import (
	"database/sql"
	"fmt"
	"social-network/internal/logger"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database"
	"github.com/golang-migrate/migrate/v4/database/sqlite3"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/mattn/go-sqlite3"
)

var (
	DB *sql.DB
)

func SetTestDB(db *sql.DB) {
	DB = db
}

func OpenDB() (*sql.DB, error) {
	//Initalize database connection
	initDB, err := sql.Open("sqlite3", "database.db")
	if err != nil {
		logger.ErrorLogger.Println("Open database error:", err)
		return nil, err
	}

	//Test the database connection
	if err = initDB.Ping(); err != nil {
		logger.ErrorLogger.Println("Database connection test failed:", err)
		return nil, err
	}

	driver, err := sqlite3.WithInstance(initDB, &sqlite3.Config{})
	if err != nil {
		logger.ErrorLogger.Println("Database driver creation error:", err)
	}
	fmt.Println("1: ", err) //TODO: Delete later

	m, err := migrate.NewWithDatabaseInstance(
		"file://internal/database/migrations/sqlite",
		"sqlite3", driver)
	if err != nil {
		logger.ErrorLogger.Println("Error with new database migration instance creation:", err)
	}
	fmt.Println("2: ", err) //TODO: Delete later

	err = m.Up()
	if err != nil {
		logger.ErrorLogger.Println("Migrating up error:", err)
	}
	fmt.Println("3: ", err) //TODO: Delete later

	DB = initDB
	return DB, nil
}
