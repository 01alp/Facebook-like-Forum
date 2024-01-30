import React from 'react';
import useGet from '../fetch/useGet';
import Avatar from '../modules/Avatar';
import { addGroupMember } from '../modules/Group';

const NotGroupMembers = ({ groupid, excludeUsers = [] }) => {
  const { error, isLoaded, data } = useGet(`/users`, 'GET');
  const users = data;
  console.log(users);

  if (!isLoaded) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Filter out the excluded users
  const currUserId = localStorage.getItem('user_id');
  const filteredUsers = users.filter((user) => !excludeUsers.includes(user.id) && user.id !== +currUserId);
  console.log('filtereduser', filteredUsers);

  //-------Add Group Members---------
  function handleAddMemberClick(userId) {
    addGroupMember(userId, groupid).then(() => {
      console.log(`User ${userId} added to group ${groupid}`);
      // Optionally update UI or state to reflect the change
    });
  }
  return (
    <div
      className="usersList"
      style={{
        marginTop: 20,
        padding: 5,
        boxShadow: '3px 3px 5px 5px var(--bs-body-color)',
      }}
    >
      <h5>Other Users:</h5>
      <div>
        {filteredUsers &&
          filteredUsers.map((user) => (
            <div
              className="d-flex align-items-xl-center userListContainer cursorPointer"
              style={{ margin: 5 }}
              key={user.id}
              data-id={user.id}
              // id={user.id}
            >
              <div className="avatarDiv">
                <Avatar id={user.id} src={user.avatar} showStatus={true} alt="" width={'32px'} />
              </div>
              <div>
                <span className="cursor-pointer">{user.fname}</span>{' '}
                <span style={{ marginLeft: 10 }} onClick={() => handleAddMemberClick(user.id)}>
                  Invite ✅
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default NotGroupMembers;
