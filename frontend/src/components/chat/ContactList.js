import { FollowingContext } from "../store/following-context";
import { JoinedGroupContext } from "../store/joined-group-context";
import { useContext, useEffect, useState } from "react";
import UserContactItem from "./UserContactItem";
import GroupContactItem from "./GroupContactItem";

function ContactList() {
  const { getFollowing, getFollowers, followers, following } =
    useContext(FollowingContext);
  const { joinedGroups } = useContext(JoinedGroupContext);

  const [chatableUsers, setChatableUsers] = useState([]);

  useEffect(() => {
    getFollowing();
    getFollowers();
  }, [getFollowing, getFollowers]);

  useEffect(() => {
    const mergedUsersMap = new Map(); //Map to merge followed and following users, excluding duplicates

    followers.forEach((user) => {
      mergedUsersMap.set(user.id, user);
    });

    following.forEach((user) => {
      mergedUsersMap.set(user.id, user);
    });

    const chatableUsers = Array.from(mergedUsersMap.values());

    chatableUsers.sort((a, b) => {
      return a.fname.localeCompare(b.fname);
    });

    setChatableUsers(chatableUsers);
  }, [following, followers]);

  return (
    <div className='col-12 col-sm-12 col-md-12 col-lg-5 col-xl-4 col-xxl-3'>
      {/* Start: Users header */}
      <div
        style={{
          boxShadow: "3px 3px 5px 5px",
          margin: 5,
          padding: 5,
          color: "var(--bs-body-bg)",
          background: "var(--bs-primary)",
          width: 250,
        }}
      >
        <h5>Users:</h5>
      </div>
      {/* End: Users header */}
      <div>
        {/* Start: User items */}
        {chatableUsers.length === 0 ? (
          <p style={{ marginLeft: 10 }}>No users to chat with</p>
        ) : (
          chatableUsers.map((user) => (
            <UserContactItem key={user.id} user={user} />
          ))
        )}
        {/* End: User items*/}
      </div>
      {/* Start: Groups header */}
      <div
        style={{
          boxShadow: "3px 3px 5px 5px",
          margin: 5,
          padding: 5,
          color: "var(--bs-body-bg)",
          background: "var(--bs-primary)",
          width: 250,
        }}
      >
        <h5>Groups:</h5>
      </div>
      {/* End: Groups header */}
      {/* Start: GroupsListContainer */}
      {joinedGroups.length === 0 ? (
        <p style={{ marginLeft: 10 }}>No groups joined</p>
      ) : (
        joinedGroups.map((group) => (
          <GroupContactItem key={group.id} group={group} />
        ))
      )}
      {/* End: GroupsListContainer */}
    </div>
  );
}

export default ContactList;
