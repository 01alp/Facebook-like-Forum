package config

type wsMessageTypes struct {
	ONLINE_USERS_LIST   string
	USER_ONLINE         string
	USER_OFFLINE        string
	USERCHAT_MSGS       string
	USERCHAT_MSGS_REPLY string
	FOLLOW_REQ          string
	FOLLOW_REQ_REPLY    string
	MSG_HANDLING_ERROR  string
}

var WsMsgTypes = wsMessageTypes{
	ONLINE_USERS_LIST:   "onlineUsersList",
	USER_ONLINE:         "userOnline",
	USER_OFFLINE:        "userOffline",
	USERCHAT_MSGS:       "userChatMessages",
	USERCHAT_MSGS_REPLY: "userChatMessagesReply",
	FOLLOW_REQ:          "followRequest",
	FOLLOW_REQ_REPLY:    "followRequestReply",
	MSG_HANDLING_ERROR:  "messageHandlingError",
}
