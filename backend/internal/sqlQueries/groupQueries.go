package sqlQueries

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"social-network/internal/database"
	"social-network/internal/logger"
	"social-network/internal/structs"
)

func GroupMember(userid, groupid int) bool {
	var exists bool
	if err := database.DB.QueryRow(`SELECT EXISTS(SELECT 1 FROM group_members WHERE user_id = ? AND group_id = ?)`, userid, groupid).Scan(&exists); err != nil {
		return false
	}

	return exists
}

func GroupExist(groupid int) bool {
	var exists bool
	if err := database.DB.QueryRow(`SELECT EXISTS(SELECT 1 FROM groups WHERE id = ?)`, groupid).Scan(&exists); err != nil {
		return false
	}

	return exists
}

func RequestExists(userid, groupid int) bool {
	var exists bool

	if err := database.DB.QueryRow(`SELECT EXISTS(SELECT 1 FROM group_requests WHERE user_id = ? AND group_id = ? AND request_status != 2)`, userid, groupid).Scan(&exists); err != nil && err != sql.ErrNoRows {
		logger.ErrorLogger.Println(err)
		return false
	}
	fmt.Println("CHECK:", exists)

	return exists // probably need to change this part once we decide how to handle denied requests.
}

func AddGroupMember(userid, groupid int) error {
	if GroupMember(userid, groupid) {
		return errors.New("user is already a member of the group")
	}
	_, err := database.DB.Exec(`INSERT INTO group_members(user_id, group_id, invite_status) VALUES(?, ?, 0)`, userid, groupid) // dont think invite_status is necessary
	if err != nil {
		logger.ErrorLogger.Println(err)
		fmt.Println(err)
		return err
	}

	return nil
}

func CreateGroup(creatorid int, title string, description string) error { // maybe use BeginTx  here
	result, err := database.DB.Exec(`INSERT INTO groups(creator_id, title, description) VALUES(?, ?, ?)`, creatorid, title, description)
	if err != nil {
		logger.ErrorLogger.Println(err)
		fmt.Println(err)
		return err
	}

	groupid, err := result.LastInsertId()
	if err != nil {
		logger.ErrorLogger.Println(err)
		fmt.Println(err)
		return err
	}

	err = AddGroupMember(creatorid, int(groupid))
	if err != nil {
		logger.ErrorLogger.Println(err)
		fmt.Println(err)
		return err
	}

	return nil
}

func SendGroupRequest(userid, groupid int) error {
	if !GroupExist(groupid) {
		return errors.New("group with this id does not exist")
	}
	if GroupMember(userid, groupid) {
		return errors.New("user is already a group member")
	}
	if RequestExists(userid, groupid) {
		return errors.New("user has already made a request to this group")
	}

	_, err := database.DB.Exec(`INSERT INTO group_requests(user_id, group_id) 
	 VALUES(?, ?)
	 `, userid, groupid)
	if err != nil {
		logger.ErrorLogger.Println(err)
		fmt.Println(err)
		return err
	}

	return nil
}

func AcceptGroupRequest(userid, otheruserid, groupid int) error {
	if !GroupExist(groupid) {
		return errors.New("group with this id does not exist")
	}
	if !GroupMember(userid, groupid) {
		return errors.New("you do not have permissions to accept this request")
	}
	if !RequestExists(otheruserid, groupid) {
		return errors.New("request to this group does not exist")
	}
	_, err := database.DB.Exec(`UPDATE group_requests SET request_status = 1 WHERE user_id = ? AND group_id = ? AND request_status = 0`, otheruserid, groupid)
	if err != nil {
		logger.ErrorLogger.Println(err.Error())
		return err
	}
	err = AddGroupMember(otheruserid, groupid)
	if err != nil {
		logger.ErrorLogger.Println(err)
		return err
	}
	return nil
}

func DeclineGroupRequest(userid, otheruserid, groupid int) error {
	if !GroupExist(groupid) {
		return errors.New("group with this id does not exist")
	}
	if !GroupMember(userid, groupid) {
		return errors.New("you do not have permissions to decline this request")
	}
	if !RequestExists(otheruserid, groupid) {
		return errors.New("request to this group does not exist")
	}
	_, err := database.DB.Exec(`UPDATE group_requests SET request_status = 2 WHERE user_id = ? AND group_id = ?`, otheruserid, groupid)
	if err != nil {
		logger.ErrorLogger.Println(err.Error())
		return err
	}
	return nil
}

func GetAllGroups() ([]structs.GroupStruct, error) {
	var Groups []structs.GroupStruct

	rows, err := database.DB.Query(`SELECT * from groups`)
	if err != nil {
		logger.ErrorLogger.Println(err.Error())
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var Group structs.GroupStruct
		if err := rows.Scan(&Group.Id, &Group.Creator, &Group.Title, &Group.Description, &Group.CreatedAt); err != nil {
			logger.ErrorLogger.Println(err.Error())
			return nil, err
		}

		Group.MemberCount = GetGroupMemberCount(Group.Id)
		Groups = append(Groups, Group)
	}

	return Groups, nil
}

func GetGroups(amount, offset int) ([]structs.GroupStruct, error) { // allows to get x amount of groups
	var Groups []structs.GroupStruct

	rows, err := database.DB.Query(`SELECT * from groups LIMIT ? OFFSET ?`, amount, offset)
	if err != nil {
		logger.ErrorLogger.Println(err.Error())
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var Group structs.GroupStruct
		if err := rows.Scan(&Group.Id, &Group.Creator, &Group.Title, &Group.Description, &Group.CreatedAt); err != nil {
			logger.ErrorLogger.Println(err.Error())
			return nil, err
		}

		Group.MemberCount = GetGroupMemberCount(Group.Id)
		Groups = append(Groups, Group)
	}

	return Groups, nil
}

func GetGroupMembers(groupid int) (structs.GroupMembersStruct, error) {
	var Members structs.GroupMembersStruct
	rows, err := database.DB.Query(`
	SELECT u.id, u.username, r.request_status, gr.creator_id 
        FROM users u 
        LEFT JOIN group_members g 
        ON g.user_id = u.id 
        LEFT JOIN group_requests r
        ON r.user_id = u.id AND r.request_status != 2
		LEFT JOIN groups gr 
		ON gr.creator_id = u.id AND gr.id = $1 
        WHERE g.group_id = $1 or r.group_id = $1
		ORDER BY gr.creator_id DESC, r.request_status DESC
	`, groupid) // this query could be optimized a lot probably
	if err != nil {
		logger.ErrorLogger.Println(err.Error())
		return Members, err
	}
	defer rows.Close()

	for rows.Next() {
		var statusInt sql.NullInt16
		var creatorId sql.NullInt16
		var Member structs.GroupMemberStruct
		if err := rows.Scan(&Member.UserId, &Member.Username, &statusInt, &creatorId); err != nil {
			logger.ErrorLogger.Println(err.Error())
			return Members, err
		}
		var alreadyExists bool
		for _, member := range Members.Members {
			if member.UserId == Member.UserId {
				alreadyExists = true
				break
			}
		}
		if alreadyExists {
			continue
		}

		if statusInt.Valid {
			Member.Status = int(statusInt.Int16)
		} else if creatorId.Valid {
			Member.Status = 3 // means that the member is the creator of the group.
		} else {
			continue // skips to next member
		}

		Members.GroupId = groupid
		Members.Members = append(Members.Members, Member)
	}

	return Members, nil
}

func GetGroupMemberCount(groupid int) int {
	var count int
	rows, err := database.DB.Query(`SELECT COUNT(group_id)
	FROM group_members
	WHERE group_id = ?;
	 `, groupid)
	if err != nil {
		logger.ErrorLogger.Println(err.Error())
		return 0
	}
	defer rows.Close()
	rows.Next()
	err = rows.Scan(&count)
	if err != nil {
		logger.ErrorLogger.Println(err.Error())
		return 0
	}

	return count

}

func GetTotalGroupCount() int {
	var count int
	err := database.DB.QueryRow(`SELECT COUNT(id) FROM groups`).Scan(&count)
	if err != nil {
		logger.ErrorLogger.Println(err)
	}
	return count
}

func CancelGroupRequest(userid, groupid int) error {
	if !GroupExist(groupid) {
		return errors.New("group with this id does not exist")
	}
	if GroupMember(userid, groupid) {
		return errors.New("user is already a member of this group")
	}
	if !RequestExists(userid, groupid) {
		return errors.New("request to this group does not exist")
	}
	_, err := database.DB.Exec(`DELETE from group_requests WHERE user_id = ? AND group_id = ? AND request_status = 0`, userid, groupid)
	return err
}

func RemoveUserFromGroup(userid, groupid int) error { // currently also removes requests aswell (might want to change that later on)
	ctx := context.Background()
	tx, err := database.DB.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.ExecContext(ctx, `DELETE from group_members WHERE user_id = $1 AND group_id = $2`, userid, groupid)
	if err != nil {
		logger.ErrorLogger.Println(err)
		return err
	}

	_, err = tx.ExecContext(ctx, `DELETE from group_requests WHERE user_id = $1 AND group_id = $2 AND request_status != 2`, userid, groupid)
	if err != nil {
		logger.ErrorLogger.Println(err)
		return err
	}

	if err = tx.Commit(); err != nil {
		logger.ErrorLogger.Println(err)
		return err
	}

	return err
}
