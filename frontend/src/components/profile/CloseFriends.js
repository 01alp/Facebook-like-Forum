import React, { useEffect, useState } from 'react';
import Avatar from '../modules/Avatar';
import { useNavigate } from 'react-router-dom';

function CloseFriends(props) {
  const [closeFriendData, setCloseFriendData] = useState([]);

  const navigate = useNavigate();

  function handleClick(e) {
    let targetElement = e.target.closest('[data-id]');

    if (targetElement) {
      let id = targetElement.getAttribute('data-id');
      console.log(`Navigating to profile with ID: ${id}`);
      navigate(`/profile/${id}`);
    } else {
      console.log('No valid target found for navigation.');
    }
  }

  useEffect(() => {
    if (props.isOwnProfile && props.followers) {
      setCloseFriendData(props.followers.filter((follower) => props.closeFriendList.includes(follower.id)));
    }
  }, [props.followers, props.closeFriendList]);

  if (!props.isOwnProfile) {
    return <></>;
  }

  return (
    <>
      {/* Start: CloseFriends */}
      <div className="card shadow" style={{ marginTop: 15 }}>
        <div className="card-header py-3">
          <p className="text-primary m-0 fw-bold" data-toggle="tooltip" data-placement="top">
            OnlyFans:
          </p>
        </div>
        <div className="card-body">
          {/* Start: Onlyfans Container */}
          <div className="d-flex flex-wrap onlyfansContainer">
            {/* Start: Friends */}
            {closeFriendData && closeFriendData.length > 0 ? (
              closeFriendData.map((friend) => (
                <div className="d-flex align-items-lg-center" key={friend.id} id={friend.id}>
                  <div className="p-1 d-flex align-items-lg-center cursorPointer" onClick={handleClick} key={friend.id} data-id={friend.id}>
                    <Avatar id={friend.id} width={52} src={friend.avatar} />
                    <span style={{ marginLeft: '5px' }} id={friend.id}>
                      {friend.fname}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ margin: '5px' }}>
                No close friends. <br />
                You can add close friends by clicking on "followers" button and checking the box next to a name
              </div>
            )}
            {/* End: Friends */}
          </div>
          {/* End: Onlyfans Container */}
        </div>
      </div>
      {/* End: CloseFriends */}
    </>
  );
}

export default CloseFriends;
