import { FollowingContext } from '../store/following-context';
import { useContext, useEffect, useState } from 'react';
import UserItem from './UserItem';

function UserList() {
    const { getFollowing, getFollowers, followers, following } = useContext(FollowingContext);

    const [chatableUsers, setChatableUsers] = useState([]);

    useEffect(() => {
        getFollowing();
        getFollowers();
    }, [getFollowing, getFollowers]);

    useEffect(() => {
      const chatableUsers = [...new Set([...following, ...followers])];
      setChatableUsers(chatableUsers);
    }, [following, followers]);

    return (
        <div className="col-12 col-sm-12 col-md-12 col-lg-5 col-xl-4 col-xxl-3">
          {/* Start: usersfollowing */}
          <div
            style={{
              boxShadow: '3px 3px 5px 5px',
              margin: 5,
              padding: 5,
              color: 'var(--bs-body-bg)',
              background: 'var(--bs-primary)',
              width: 250,
            }}
          >
            <h5>Chat with:</h5>
          </div>
          {/* End: usersfollowing */}
          {/* Start: UsersListContainer */}
          <div>
            {/* Start: userchatLine */}
            {chatableUsers.map(user => (
              <UserItem 
                key={user.id}
                user={user}
              />
            ))}
            {/* End: userchatLine */}
          </div>
          {/* End: UsersListContainer */}
        </div>
    );
}

export default UserList;