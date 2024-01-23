import React from 'react';

const UserEvent = () => {
  return (
    <div
      className="upcomingEvents"
      style={{
        padding: 5,
        boxShadow: '3px 3px 5px 5px var(--bs-body-color)',
        marginTop: 20,
        marginBottom: 20,
      }}
    >
      <h5>Upcoming Events:</h5>
      {/* Start: YourEventsDescDiv */}
      <div className="YourEventsDesc" style={{ margin: 5 }}>
        <span>Best event ever</span>
      </div>
      {/* End: YourEventsDescDiv */}
    </div>
  );
};

export default UserEvent;
