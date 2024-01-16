package groups

import (
	"encoding/json"
	"fmt"
	"net/http"
	"social-network/internal/config"
	"social-network/internal/logger"
	"social-network/internal/sqlQueries"
	"social-network/internal/structs"
	"social-network/internal/websocket"
)

func SendGroupRequest(w http.ResponseWriter, r *http.Request) {
	var GroupRequest structs.GroupRequestStruct
	var GroupRequestNotif structs.GroupRequestNotifStruct

	UserID := r.Context().Value("userID").(int)

	User := sqlQueries.GetUserFromID(UserID)
	if User.ID == 0 {
		http.Error(w, "ERROR: USER DOES NOT EXIST.", http.StatusBadRequest)
	}

	if err := json.NewDecoder(r.Body).Decode(&GroupRequest); err != nil {
		http.Error(w, "ERROR: "+err.Error(), http.StatusBadRequest)
		return
	}
	if GroupRequest.GroupId == 0 {
		http.Error(w, "Group id empty", http.StatusBadRequest)
		return
	}

	if err := sqlQueries.SendGroupRequest(UserID, GroupRequest.GroupId); err != nil {
		http.Error(w, "Error sending group request: "+err.Error(), http.StatusBadRequest)
		return
	}

	group := sqlQueries.GetGroup(GroupRequest.GroupId)
	GroupRequestNotif.UserId = User.ID
	GroupRequestNotif.Username = User.Username
	GroupRequestNotif.GroupName = group.Title
	GroupRequestNotif.GroupId = GroupRequest.GroupId
	GroupRequestNotif.CreatorId = group.Creator
	// ^ can do this in a better way

	envelopeBytes, err := websocket.ComposeWSEnvelopeMsg(config.WsMsgTypes.NEW_GROUP_REQUEST, GroupRequestNotif)
	if err != nil {
		websocket.SendErrorMessage(UserID, "Error marshaling chat messages")
		logger.ErrorLogger.Printf("Error composing chat messages for user %d: %v\n", UserID, err)
		return
	}

	err = websocket.SendMessageToUser(group.Creator, envelopeBytes)
	if err != nil {
		logger.ErrorLogger.Printf("Error sending message to user %d: %v\n", group.Creator, err)
	}

	fmt.Println(GroupRequest)
	var GroupResponse structs.GroupRequestResponse
	GroupResponse.Result = "Successfully sent the request."
	json.NewEncoder(w).Encode(GroupResponse)
}
