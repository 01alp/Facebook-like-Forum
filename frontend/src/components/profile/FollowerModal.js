import { Link, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import Avatar from '../modules/Avatar';

function FollowerModal(props) {
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

  return (
    <div>
      <Link
        className="btn btn-primary"
        style={{ marginRight: 50 }}
        data-bs-toggle="collapse"
        aria-expanded="false"
        aria-controls="collapse-1"
        to="#collapse-1"
        role="button"
      >
        <span className="followerCount" style={{ fontWeight: 'bold', marginRight: 5 }}>
          {props.followers ? props.followers.length : 0}
        </span>
        {''}
        <span>Followers</span>
      </Link>
      <div id="collapse-1" className="collapse">
        {props.isOwnProfile && props.followers && (
          <span>
            Add / remove close friend <br /> &zwnj; &zwnj; ↓
          </span>
        )}
        {props.followers && props.followers.length > 0 ? (
          props.followers.map((follower) => (
            <div style={{ margin: '5px' }} className="d-flex align-items-lg-center" key={follower.id} id={follower.id}>
              {/* Start: Add close friend checkbox*/}
              {props.isOwnProfile ? (
                <input
                  className="form-check-input"
                  type="checkbox"
                  style={{ fontSize: 24, marginRight: 5 }}
                  id={follower.id}
                  checked={props.closeFriendList.length ? props.closeFriendList.includes(follower.id) : false}
                  isclosefriend={props.closeFriendList.length ? props.closeFriendList.includes(follower.id).toString() : 'false'}
                  onChange={props.closeFriendHandler}
                />
              ) : (
                ''
              )}
              {/* End: Add close friend checkbox */}
              <div className="d-flex align-items-lg-center cursorPointer" onClick={handleClick} key={follower.id} data-id={follower.id}>
                <Avatar id={follower.id} width={52} src={follower.avatar} />
                <span style={{ marginLeft: '10px' }} id={follower.id}>
                  {follower.fname}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div style={{ margin: '5px' }}>No Followers</div>
        )}
      </div>
    </div>
  );
}

export default FollowerModal;
