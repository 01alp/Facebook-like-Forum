package userChat

import (
	"context"
	"database/sql"
	"io"
	"log"
	"net/http"
	"net/http/httptest"
	"os"
	"social-network/internal/database"
	"strings"
	"testing"
)

var testDB *sql.DB

// For using mock db for testing
func setTestDB(db *sql.DB) {
	database.SetTestDB(db)
}

func TestMain(m *testing.M) {
	var err error

	// Open the test database
	testDB, err = sql.Open("sqlite3", "test_database.db")
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}

	setTestDB(testDB)

	// Run the tests
	code := m.Run()

	// Close the test database
	if err := testDB.Close(); err != nil {
		log.Fatalf("Failed to close database: %v", err)
	}

	os.Exit(code)
}

func TestHandleNewMessage(t *testing.T) {
	tests := []struct {
		name           string
		body           io.Reader
		userID         int
		expectedStatus int
	}{
		{
			name: "Valid Input",
			body: strings.NewReader(`{
                    "label":"Label",
                    "id":29,
                    "targetid":2,
                    "sourceid":1,
                    "message":"Hello world 😃",
                    "createdat":"2023-12-05T19:34:55.111Z",
                    "onlineuserids":[1]
                }`),
			userID:         1,
			expectedStatus: http.StatusOK,
		},
		{
			name: "Missing label",
			body: strings.NewReader(`{
                    "id":29,
                    "targetid":2,
                    "sourceid":1,
                    "message":"Tere maailm",
                    "createdat":"2023-12-05T19:34:55.111Z",
                    "onlineuserids":[1]
                }`),
			userID:         1,
			expectedStatus: http.StatusOK,
		},
		{
			name: "Missing id",
			body: strings.NewReader(`{
                    "label":"Label",
                    "targetid":2,
                    "sourceid":1,
                    "message":"Tere maailm",
                    "createdat":"2023-12-05T19:34:55.111Z",
                    "onlineuserids":[1]
                }`),
			userID:         1,
			expectedStatus: http.StatusOK,
		},
		{
			name: "Missing targetID",
			body: strings.NewReader(`{
                    "label":"Label",
                    "id":29,
                    "sourceid":1,
                    "message":"Tere maailm",
                    "createdat":"2023-12-05T19:34:55.111Z",
                    "onlineuserids":[1]
                }`),
			userID:         1,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "Missing sourceID",
			body: strings.NewReader(`{
                    "label":"Label",
                    "id":29,
                    "targetid":2,
                    "message":"Tere maailm",
                    "createdat":"2023-12-05T19:34:55.111Z",
                    "onlineuserids":[1]
                }`),
			userID:         1,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "Missing message",
			body: strings.NewReader(`{
                    "label":"Label",
                    "id":29,
                    "targetid":2,
                    "sourceid":1,
                    "createdat":"2023-12-05T19:34:55.111Z",
                    "onlineuserids":[1]
                }`),
			userID:         1,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "Missing createdat",
			body: strings.NewReader(`{
                    "label":"Label",
                    "id":29,
                    "targetid":2,
                    "sourceid":1,
                    "message":"Tere maailm",
                    "onlineuserids":[1]
                }`),
			userID:         1,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "Missing onlineuserids",
			body: strings.NewReader(`{
                    "label":"Label",
                    "id":29,
                    "targetid":2,
                    "sourceid":1,
                    "message":"Tere maailm",
                    "createdat":"2023-12-05T19:34:55.111Z"
                }`),
			userID:         1,
			expectedStatus: http.StatusOK,
		},
		{
			name: "SourceID and userID don't match",
			body: strings.NewReader(`{
                    "label":"Label",
                    "id":29,
                    "targetid":2,
                    "sourceid":1,
                    "message":"Tere maailm",
                    "createdat":"2023-12-05T19:34:55.111Z",
                    "onlineuserids":[1]
                }`),
			userID:         2,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "TargetID don't exist",
			body: strings.NewReader(`{
                    "label":"Label",
                    "id":29,
                    "targetid":50,
                    "sourceid":1,
                    "message":"Tere maailm",
                    "createdat":"2023-12-05T19:34:55.111Z",
                    "onlineuserids":[1]
                }`),
			userID:         1,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "Empty message",
			body: strings.NewReader(`{
                    "label":"Label",
                    "id":29,
                    "targetid":2,
                    "sourceid":1,
                    "message":"",
                    "createdat":"2023-12-05T19:34:55.111Z",
                    "onlineuserids":[1]
                }`),
			userID:         1,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "Only space char in message",
			body: strings.NewReader(`{
                    "label":"Label",
                    "id":29,
                    "targetid":2,
                    "sourceid":1,
                    "message":" ",
                    "createdat":"2023-12-05T19:34:55.111Z",
                    "onlineuserids":[1]
                }`),
			userID:         1,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "Timestamp format wrong",
			body: strings.NewReader(`{
                    "label":"Label",
                    "id":29,
                    "targetid":2,
                    "sourceid":1,
                    "message":"Tere maailm",
                    "createdat":"1670270095",
                    "onlineuserids":[1]
                }`),
			userID:         1,
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest("POST", "/userChatMessage", tc.body)
			req.Header.Set("Content-Type", "application/json")

			if tc.userID != 0 {
				ctx := context.WithValue(req.Context(), "userID", tc.userID)
				req = req.WithContext(ctx)
			}

			w := httptest.NewRecorder()
			HandleNewMessage(w, req)

			res := w.Result()
			defer res.Body.Close()

			if res.StatusCode != tc.expectedStatus {
				t.Errorf("%s: expected status %v; got %v", tc.name, tc.expectedStatus, res.Status)
			}
		})
	}
}
