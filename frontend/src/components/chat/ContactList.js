import { FollowingContext } from '../store/following-context';
import { useContext, useEffect, useState } from 'react';
import ContactItem from './ContactItem';

function ContactList() {
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
          {/* Start: Users header */}
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
            <h5>Users:</h5>
          </div>
          {/* End: Users header */}
          <div>
            {/* Start: User items */}
            {chatableUsers.map(user => (
              <ContactItem 
                key={user.id}
                user={user}
              />
            ))}
            {/* End: User items*/}
          </div>
          {/* Start: Groups header */}
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
            <h5>Groups:</h5>
          </div>
          {/* End: Groups header */}
          {/* Start: GroupsListContainer */}
          <div
            className="d-flex d-lg-flex align-items-lg-center"
            style={{
              padding: 5,
              margin: 5,
              boxShadow: '3px 3px 5px 5px var(--bs-body-color)',
              marginBottom: 10,
              width: 250,
              cursor: 'pointer',
            }}
          >
          {/* Start: Online */}
          <div>
            <span style={{ marginRight: 5 }}>🟢</span>
            {/* {isCurrentChat && (
              <span className="flash animated" style={{ marginRight: 3 }}>
                💬
              </span>
            )} */}
          </div>
          {/* End: Online */}
          {/* Start: Avatar */}
          <div>
            <img className="rounded-circle" alt="" src={'../assets/avatar1.jpeg'} style={{ width: 32, marginRight: 5 }} />
          </div>
          {/* End: Avatar */}
          <div>
            <span>Group name</span>
          </div>
          </div>
          {/* End: GroupsListContainer */}
        </div>
    );
}

export default ContactList;