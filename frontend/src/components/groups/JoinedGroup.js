import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { JoinedGroupContext } from '../store/joined-group-context';

const JoinedGroup = ({ currentUser }) => {
  const { joinedGroups } = useContext(JoinedGroupContext);

  return (
    <div
      className="joinedGroups"
      style={{
        padding: 5,
        boxShadow: '3px 3px 5px 5px var(--bs-body-color)',
        marginTop: 20,
      }}
    >
      <h5>{currentUser ? 'Your Groups:' : 'Joined Groups:'}</h5>
      {/* Start: joinedGroupContainerDiv */}
      {joinedGroups.length === 0 ? (
        <p>No groups joined</p>
      ) : (
        joinedGroups.map((group) => (
          <div key={group.id} className="d-flex align-items-lg-center joinedGroupContainer" style={{ margin: 5 }}>
            <div className="joinedGroupName">
              <Link to={`/groupprofile/${group.id}`}>
                <span>{group.title}</span>
              </Link>
            </div>
          </div>
        ))
      )}
      {/* End: joinedGroupContainerDiv */}
    </div>
  );
};

export default JoinedGroup;
