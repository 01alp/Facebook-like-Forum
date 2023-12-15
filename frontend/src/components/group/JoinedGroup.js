import React from 'react';

const JoinedGroup = () => {
  return (
    <div
      className="joinedGroups"
      style={{
        padding: 5,
        boxShadow: '3px 3px 5px 5px var(--bs-body-color)',
        marginTop: 20,
      }}
    >
      <h5>Your Groups:</h5>
      {/* Start: joinedGroupContainerDiv */}
      <div className="d-flex align-items-lg-center joinedGroupContainer" style={{ margin: 5 }}>
        <img className="rounded-circle" style={{ width: 32, marginRight: 10 }} src="assets/img/dogs/image3.jpeg" />
        {/* Start: joineGroupNameDiv */}
        <div className="joineGroupName">
          <a href="groupProfile.html">
            <span>My Group</span>
          </a>
        </div>
        {/* End: joineGroupNameDiv */}
      </div>
      {/* End: joinedGroupContainerDiv */}
    </div>
  );
};

export default JoinedGroup;
