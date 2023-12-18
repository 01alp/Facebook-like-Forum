package structs

import "time"

type User struct {
	ID           int       `json:"id"`
	Email        string    `json:"email"`
	Password     string    `json:"password,omitempty"` //TODO: Check that not sending pwd back to client later
	FirstName    string    `json:"fname"`
	LastName     string    `json:"lname"`
	BirthDate    time.Time `json:"dob"`
	Avatar       string    `json:"avatar,omitempty"`
	Username     string    `json:"nname,omitempty"`
	AboutMe      string    `json:"about,omitempty"`
	RegisterDate time.Time `json:"registerdate"`
	Public       int       `json:"public"` //1-public, 0-private
}

type LoginPayload struct {
	Email string `json:"email"`
	Pw    string `json:"pw"`
}

type LoginResponse struct {
	Resp  User          `json:"resp"`
	Notif []NotifStruct `json:"notif"`
}

type WSMessageEnvelope struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

type ResponseEnvelope struct { //Erik: Standard envelope for all short ws msg replys with success or failed (for 1-1 chat msg, group chat msg, perhaps more?). Can refactor later if this standard approach wont work
	Type    string      `json:"type"`
	Status  string      `json:"status"`
	Payload interface{} `json:"payload,omitempty"`
}

type UserPayload struct {
	Data []User `json:"data"`
}

type UserPayloadWithStatus struct {
	Data   User `json:"data"`
	Status int  `json:"status"`
}

type ProfileVisibilityChangeRequest struct {
	Public int `json:"public"` // True-public, false-private
}

type UserId struct {
	TargetId int `json:"targetid"`
	Public   int `json:"public"` //1-public, 0-private
}

type FollowRequest struct { //For http request client->server
	TargetID int  `json:"targetid"`
	Follow   bool `json:"follow"` //True to follow, false to unfollow
}

type FollowRequestReply struct { //For client->server response to ws msg follow request
	RequesterID int  `json:"requesterid"`
	Decision    bool `json:"accepted"` //False to decline, true to accept
}

type UserFollowerStruct struct {
	Id        int    `json:"id"`
	Action    string `json:"action"`
	SourceId  int    `json:"sourceid"`
	TargetId  int    `json:"targetid"`
	Status    int    `json:"status"`
	ChatNoti  int    `json:"chat_noti"`
	LastMsgAt string `json:"last_msg_at"`
}

type UserMessageStruct struct {
	Label         string `json:"label"`
	Id            int    `json:"id"`
	TargetId      int    `json:"targetid"`
	SourceId      int    `json:"sourceid"`
	Message       string `json:"message"`
	CreatedAt     string `json:"createdat"`
	OnlineUserIds []int  `json:"onlineuserids"`
}

type UserMessagePayload struct {
	Data []UserMessageStruct `json:"data"`
}

type AuthResponse struct {
	UserId  int    `json:"user_id"`
	Fname   string `json:"fname"`
	Lname   string `json:"lname"`
	Nname   string `json:"nname"`
	Avatar  string `json:"avatar"`
	About   string `json:"about"`
	Email   string `json:"email"`
	Dob     string `json:"dob"`
	Success bool   `json:"success"`
	Public  int    `json:"public"` //1-public, 0-private
}

// ----------------------------------- CHAT -----------------------------------
type ChatHistoryRequest struct {
	RecipientID int  `json:"recipient_id"`
	GroupChat   bool `json:"group_chat"`
	//TODO: Receive msgs by bunch? Then last msg ID
}

type ChatHistoryReply struct {
	Messages []ChatMessage `json:"messages"`
}

type ChatMessage struct {
	ID              int    `json:"id"`
	GroupChat       bool   `json:"group_chat"`
	SenderID        int    `json:"sender_id"`
	SenderFirstName string `json:"sender_fname,omitempty"`
	UserRecipientID int    `json:"user_recipient_id,omitempty"`
	GroupID         int    `json:"group_id,omitempty"`
	Message         string `json:"message"`
	CreatedAt       string `json:"createdat"`
}

type ChatMessageResponse struct {
	Status  string      `json:"status"`
	Message ChatMessage `json:"message"`
}

// ---------------------------- POSTS AND COMMENTS ----------------------------
type PostStruct struct {
	Id        int             `json:"id"`
	Author    int             `json:"author"` // author uid
	Message   string          `json:"message"`
	Image     string          `json:"image"`
	CreatedAt string          `json:"createdat"`
	Privacy   int             `json:"privacy"`
	Comments  []CommentStruct `json:"comments"`
}
type CommentStruct struct {
	Id        int       `json:"id"`
	PostId    int       `json:"postid"`
	UserId    int       `json:"userid"`
	CreatedAt time.Time `json:"createdat"`
	Message   string    `json:"message"`
	Image     string    `json:"image"`
}
type PostsAndCommentsPayload struct {
	Posts []PostStruct `json:"posts"`
}
type PostMemberStruct struct {
	Id         int `json:"id"`
	UserId     int `json:"userid"`
	UserPostId int `json:"userpostid"`
}

type GroupStruct struct {
	Id          int    `json:"id"`
	Title       string `json:"title"`
	Creator     int    `json:"creator"`
	Description string `json:"description"`
	CreatedAt   string `json:"createdat"`
	MemberCount int    `json:"membercount"`
}

type GroupResponse struct {
	Creator        int    `json:"creator"`
	CreatedAt      string `json:"createdat"`
	Success        bool   `json:"success"`
	CreatedGroupId int    `json:"createdid"`
}

type GroupPayload struct {
	Data []GroupStruct `json:"data"`
}

type GroupRequestStruct struct {
	Id        int    `json:"id"`
	UserId    int    `json:"userid"`
	GroupId   int    `json:"groupid"`
	Status    string `json:"status"`
	CreatedAt string `json:"createdat"`
}

type GroupRequestLimit struct {
	Offset int `json:"offset"`
	Amount int `json:"amount"`
}

// type GroupRequestStructMultiple struct { // allows for multiple groups to be provided with json
// 	Id        int    `json:"id"`
// 	UserId    int    `json:"userid"`
// 	GroupId   []int  `json:"groupid"`
// 	Status    string `json:"status"`
// 	CreatedAt string `json:"createdat"`
// }

type GroupRequestPayload struct {
	Data []GroupRequestStruct `json:"data"`
}

type GroupRequestResponse struct {
	Result string `json:"result"`
}

type GroupMemberStruct struct {
	Id       int    `json:"id"`
	UserId   int    `json:"userid"`
	GroupId  int    `json:"groupid"`
	Status   int    `json:"status"`
	ChatNoti int    `json:"chatnoti"`
	Username string `json:"nickname"`
}

type GroupMembersStruct struct {
	Members []GroupMemberStruct `json:"members"`
	Count   int                 `json:"count"`
	GroupId int                 `json:"groupid"`
}

type GroupEventStruct struct {
	Id          int    `json:"id"`
	GroupId     int    `json:"groupid"`
	Author      int    `json:"author"`
	Title       string `json:"title"`
	Description string `json:"description"`
	CreatedAt   string `json:"createdat"`
	Date        string `json:"date"`
}

type GroupEventPayload struct {
	Data []GroupEventStruct `json:"data"`
}

type GroupEventMemberStruct struct {
	Id      int `json:"id"`
	Status  int `json:"status"`
	UserId  int `json:"userid"`
	EventId int `json:"eventid"`
}

type GroupEventMemberPayload struct {
	Data []GroupEventMemberStruct `json:"data"`
}

type GroupPostStruct struct {
	Id        int    `json:"id"`
	Fname     string `json:"fname"`
	Lname     string `json:"lname"`
	Nickname  string `json:"nname"`
	Author    int    `json:"author"`
	GroupId   int    `json:"groupid"`
	Message   string `json:"message"`
	Image     string `json:"image"`
	CreatedAt string `json:"createdat"`
}

type GroupPostPayload struct {
	Data []GroupPostStruct `json:"data"`
}

type GroupPostCommentStruct struct {
	Id           int    `json:"id"`
	Fname        string `json:"fname"`
	Lname        string `json:"lname"`
	Nickname     string `json:"nname"`
	GroupPostId  int    `json:"postid"`
	Author       int    `json:"userid"`
	CreatedAt    string `json:"createdat"`
	Message      string `json:"message"`
	AuthorAvatar string `json:"avatar"`
}

type GroupPostCommentPayload struct {
	Data []GroupPostCommentStruct `json:"data"`
}

type GroupMessageStruct struct {
	Label     string `json:"label"`
	Id        int    `json:"id"`
	Message   string `json:"message"`
	SourceId  int    `json:"sourceid"`
	GroupId   int    `json:"groupid"`
	CreatedAt string `json:"createdat"`
}

type GroupMessagePayload struct {
	Data []GroupMessageStruct `json:"data"`
}

type SessionStruct struct {
	SessionToken string `json:"sessiontoken"`
	UserId       int    `json:"userid"`
}

type NotifStruct struct {
	Label     string `json:"label"`
	Id        int    `json:"id"`
	Type      string `json:"type"`
	SourceId  int    `json:"sourceid"`
	TargetId  int    `json:"targetid"`
	Accepted  bool   `json:"accepted"`
	CreatedAt string `json:"createdat"`
	GroupId   int    `json:"groupid"`
}

type NotiMessageStruct struct {
	Label      string `json:"label"`
	Id         int    `json:"id"`
	SourceId   int    `json:"sourceid"`
	TargetId   int    `json:"targetid"`
	Message    string `json:"message"`
	GroupId    int    `json:"groupid"`
	CreatedAt  string `json:"createdat"`
	Type       string `json:"type"`
	Accepted   bool   `json:"accepted"`
	GroupTitle string `json:"grouptitle"`
}

type PrivateChatItemStruct struct {
	Id        int    `json:"id"`
	SourceId  int    `json:"sourceid"`
	TargetId  int    `json:"targetid"`
	ChatNoti  int    `json:"chat_noti"`
	LastMsgAt string `json:"last_msg_at"`
}

type PrivateChatItemPayload struct {
	Data []PrivateChatItemStruct `json:"data"`
}

type GroupChatItemStruct struct {
	Id        int    `json:"id"`
	GroupId   int    `json:"groupid"`
	UserId    int    `json:"userid"`
	ChatNoti  int    `json:"chat_noti"`
	LastMsgAt string `json:"last_msg_at"`
}

type GroupChatItemPayload struct {
	Data   []GroupChatItemStruct `json:"data"`
	Public bool                  `json:"public"`
}
