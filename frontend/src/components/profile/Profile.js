import { useEffect, useState, useContext } from 'react';
import { FollowingContext } from '../store/following-context';
import { UsersContext } from '../store/users-context';
import { WebSocketContext } from '../store/websocket-context';
import FollowerModal from './FollowerModal';
import FollowingModal from './FollowingModal';
import Avatar from '../modules/Avatar';
import { Link } from 'react-router-dom';
import JoinedGroup from '../group/JoinedGroup';
import UserEvent from '../posts/UserEvent';

function Profile({ userId }) {
  console.log('***************   userId ', userId);
  const [followerData, setFollowerData] = useState([]);
  const [followingData, setFollowingData] = useState([]);
  const [isFollower, setIsFollower] = useState(false);

  const [targetUser, setTargetUser] = useState(null);

  const [publicity, setPublicity] = useState(true); // 1 true is public, 0 false is private
  const selfPublicNum = +localStorage.getItem('public');
  const [pubCheck, setPubCheck] = useState(false);
  // friend
  const followingCtx = useContext(FollowingContext);
  const usersCtx = useContext(UsersContext);
  const wsCtx = useContext(WebSocketContext);

  const currUserId = localStorage.getItem('user_id');

  const [followStatus, setFollowStatus] = useState(null); //0-pending, 1-accepted, 2-declined, 3-not following
  const [isCloseFriend, setCloseFriend] = useState(false);

  const getFollowerHandler = () => {
    console.log('apis getting called');
    fetch(`http://localhost:8080/getFollowers?userID=${userId}`, {
      credentials: 'include',
    })
      .then((resp) => {
        if (!resp.ok) {
          throw new Error(`HTTP error - status: ${resp.status}`);
        }
        return resp.json();
      })
      .then((data) => {
        console.log('followersArr (context): ', data);
        setFollowerData(data.data);
      })
      .catch((err) => console.log('Error fetching followers:', err));
  };

  const getFollowingHandler = () => {
    fetch(`http://localhost:8080/getFollowing?userID=${userId}`, {
      credentials: 'include',
    })
      .then((resp) => {
        if (!resp.ok) {
          throw new Error(`HTTP error - status: ${resp.status}`);
        }
        return resp.json();
      })
      .then((data) => {
        console.log('followingArr (context): ', data);
        setFollowingData(data.data);
      })
      .catch((err) => console.log('Error fetching following:', err));
  };

  const getCurrentFollowStatus = () => {
    fetch(`http://localhost:8080/getFollowStatus?targetID=${userId}`, {
      credentials: 'include',
    })
      .then((resp) => {
        if (!resp.ok) {
          throw new Error(`HTTP error - status: ${resp.status}`);
        }
        return resp.json();
      })
      .then((data) => { //0-pending, 1-accepted, 2-declined, 3-not following
        const receivedFollowStatus = data.data
        if (receivedFollowStatus >= 0 && receivedFollowStatus < 4) {
          setFollowStatus(receivedFollowStatus)
        } else {
          console.log(`Unexpected follow status: ${receivedFollowStatus}`);
        }
      })
      .catch((err) => console.log('Error fetching follow status:', err));
  }

  useEffect(() => {
    getFollowerHandler();
    getFollowingHandler();
    getCurrentFollowStatus();

    const foundUser = usersCtx.usersList.find((user) => user.id === +userId);

    if (foundUser) {
      setTargetUser(foundUser); // Set targetUser state
      if (foundUser.public != 0) {
        setPubCheck(true);
      }
    }
  }, [userId, usersCtx.usersList]);

  // console.log('stored publicity (profile)', selfPublicNum);
  // console.log('checkingTargetUser', targetUser);
  useEffect(() => {
    selfPublicNum ? setPublicity(true) : setPublicity(false);
  }, [selfPublicNum]);

  //Toggle Private
  const [isChecked, setIsChecked] = useState(localStorage.getItem('isChecked') === 'true');

  useEffect(() => {
    localStorage.setItem('isChecked', isChecked);
  }, [isChecked]);

  const followHandler = async () => {
    console.log('got the message  ');
    const response = await followingCtx.requestToFollowOrUnfollow(targetUser, true);
    if (response !== null) {
      switch (response) {
        case "Following successful":
          setFollowStatus(1)
          getFollowerHandler(); //NOTE: Could update followers list without fetching from API
          break;
        case "Follow request received":
          setFollowStatus(0)
          break;
        default:
          console.log("Unexpected response for follow request", response)
      }
    }
  };

  const unfollowHandler = async () => {
    console.log('got the message  ');
    const response = await followingCtx.requestToFollowOrUnfollow(targetUser, false);
    if (response && response === "Unfollow successful") {
      getFollowerHandler(); //NOTE: Could update followers list without fetching from API
      setFollowStatus(3)
    };
  };

  const setPublicityHandler = (e) => {
    const isPublic = !e.target.checked; // Determine the publicity based on the checkbox
    const publicityNum = isPublic ? 1 : 0; // Convert boolean to 1 (public) or 0 (private)

    // Prepare the data to send in the request body
    const data = {
      public: publicityNum,
    };

    // Post to store publicity to db
    fetch('http://localhost:8080/changeProfileVisibility', {
      method: 'POST',
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((msg) => {
            throw new Error(msg || 'Server response not OK');
          });
        }
        return response.json();
      })
      .then(() => {
        console.log('privacy changed');
        setPublicity(isPublic); // Update the publicity state
        setPubCheck(isPublic); // Update the pubCheck state for re-rendering
        localStorage.setItem('public', publicityNum); // Update local storage
      })
      .catch((error) => {
        console.error('Error changing privacy:', error.message);
      });
  };

  useEffect(() => {
    //console.log('target user : ', targetUser);
    if (targetUser) {
      // console.log('usersList', foundUser);
      // setFollowerData(followingCtx.followers);
      //console.log('target user : ', targetUser);
      // setFollowingData(followingCtx.following)
      if (targetUser.public == 0) {
        localStorage.setItem('isChecked', true);
      } else {
        localStorage.setItem('isChecked', false);
      }
    }
  }, [targetUser]);

  if (!targetUser) return <div>Loading...</div>;

  let followButton;
  let messageButton;
  let closeFriend;
  let closeFriendText;

  if (currUserId !== userId) {
    switch(followStatus) {
      case 0: //Pending request
        followButton = (
          <div>
            <button onClick={unfollowHandler} className="btn btn-primary btn-sm" type="button" style={{ marginRight: 5 }} id={userId} title="Cancel request">
              Requested
            </button>
          </div>
        );
      break;
      case 1: //Accepted, following
        followButton = (
          <div>
            <button onClick={unfollowHandler} className="btn btn-primary btn-sm" type="button" style={{ marginRight: 5 }} id={userId}>
              Unfollow
            </button>
          </div>
        );
        break;
      case 2: //Declined
       followButton = (
          <div>
            <button className="btn btn-primary btn-sm" type="button" style={{ marginRight: 5 }} id={userId}>
              Declined
            </button>
          </div>
        );
        break;
      case 3: //Not following nor requested
        followButton = (
          <div>
            <button onClick={followHandler} className="btn btn-primary btn-sm" type="button" style={{ marginRight: 5 }} id={userId}>
              Follow
            </button>
          </div>
        );
        break;
      default:
        console.log("Unexptected follow status:", followStatus)
    }

    messageButton = (
      <div>
        <Link className="btn btn-primary btn-sm" role="button" style={{ marginRight: 5 }} to="/chat">
          Message
        </Link>
      </div>
    );
    closeFriend = (
      <input className="form-check-input" type="checkbox" style={{ fontSize: 24, marginRight: 5 }} id={userId} checked={isCloseFriend} />
      // onChange={closeFriendHandler}
    );
    closeFriendText = <span style={{ marginLeft: 5 }}>Ad to OnlyFans</span>;
  }

  return (
    <div className="container-fluid">
      <h3 className="text-dark mb-4">Profile</h3>
      <div className="row mb-3">
        <div className="col-lg-4">
          {/* Start: Avatarimage */}
          <div className="card mb-3">
            <div className="card-body text-center shadow">
              <div className="d-flex justify-content-center align-items-center">
                <Avatar src={targetUser.avatar} showStatus={false} width={150} />
              </div>
              <div className="mb-3">
                <button className="btn btn-primary btn-sm" type="button">
                  Change Photo
                </button>
              </div>
            </div>
          </div>
          {/* End: Avatarimage */}
          {/* Start: Aboutme */}
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="text-primary fw-bold m-0">About:</h6>
            </div>
            <div className="card-body">
              {/* Start: Profile About Container */}
              <div>
                <div>
                  <span>{targetUser.about}</span>
                </div>
              </div>
              {/* End: Profile About Container */}
            </div>
          </div>
          {/* End: Aboutme */}
          {/* Start: joinedGroupsDiv */}
          <div className="joinedGroups" style={{ padding: 5, marginTop: 20 }}>
            <h5>Your Groups:</h5>
            {/* Start: joinedGroupContainerDiv */}
            <div className=" joinedGroupContainer" style={{ margin: 5 }}>
              <JoinedGroup />
            </div>
          </div>
          {/* Start: upcomingEventsDiv */}
          <div className="upcomingEvents" style={{ padding: 5, marginTop: 20 }}>
            <h5>Upcoming Events:</h5>
            <UserEvent />
          </div>
          {/* End: upcomingEventsDiv */}
        </div>
        <div className="col-lg-8">
          <div className="row">
            <div className="col">
              {/* Start: User profile info */}
              <div className="card shadow mb-3">
                <div className="card-header d-flex justify-content-between flex-wrap py-3">
                  <div>
                    <p className="text-primary m-0 fw-bold">User Settings</p>
                  </div>
                  {/* Start: toggle private */}
                  <div className="mb-3">
                    <div className="form-check form-switch" style={{ fontSize: 24 }}>
                      {currUserId === userId && targetUser && (
                        <>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="formCheck-1"
                            value={'Private'}
                            onClick={setPublicityHandler}
                            checked={isChecked}
                            onChange={() => setIsChecked(!isChecked)}
                          />
                          <label className="form-check-label" htmlFor="formCheck-1">
                            Private
                          </label>
                        </>
                      )}
                    </div>
                  </div>
                  <div> {pubCheck ? <span>🔓Pub.</span> : <span>🔐Prv.</span>}</div>
                  {/* End: toggle private */}
                  <div className="d-flex justify-content-center">
                    <div>{followButton}</div>
                    <div>{messageButton}</div>
                  </div>
                </div>
                <div className="card-body">
                  <div>
                    <div className="row">
                      <div className="col">
                        {/* Start: Profile row */}
                        <div className="mb-3">
                          <label className="form-label" htmlFor="username">
                            <strong>User info:</strong>
                          </label>
                          {/* Start: Username and image */}
                          <div className="d-flex align-items-lg-center">
                            <div className="profilename">
                              <span>
                                {targetUser.fname} {targetUser.lname}
                              </span>
                            </div>
                            <div />
                          </div>
                        </div>
                      </div>
                      <div className="col">
                        <div className="mb-3">
                          <label className="form-label" htmlFor="email">
                            <strong>Email Address:</strong>
                          </label>
                          <div className="profileEmail">
                            <span>{targetUser.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col">
                        {/* Start: ProfileUserName */}
                        <div className="mb-3">
                          <label className="form-label" htmlFor="first_name">
                            <strong>User Name:</strong>
                          </label>
                          {/* Start: profileusernameDiv */}
                          <div className="profileUserName">
                            <span>{targetUser.nname}</span>
                          </div>
                          {/* End: profileusernameDiv */}
                        </div>
                        {/* End: ProfileUserName */}
                      </div>
                      <div className="col">
                        {/* Start: Birthday container */}
                        <div className="mb-3">
                          <label className="form-label" htmlFor="last_name">
                            <strong>Date of Birth:</strong>
                          </label>
                          {/* Start: dateofBirth */}
                          <div className="profileDateofBirth">
                            <span>{targetUser.dob.split('-').slice(0, 2).join('-')}</span>
                          </div>
                          {/* End: dateofBirth */}
                        </div>
                        {/* End: Birthday container */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* End: User profile info */}
              {/* Start: followers following */}
              <div className="card shadow">
                <div className="card-header py-3">
                  <p className="text-primary m-0 fw-bold">Followers:</p>
                </div>
                <div className="card-body">
                  {/* Start: profile followers container */}
                  <div className="d-flex profileFollowers">
                    {/* Start: profile followers */}
                    <FollowerModal followers={followerData} />
                    {/* End: profile followers */}

                    {/* Start: profiles following */}
                    <FollowingModal following={followingData} />
                    {/* End: profiles following */}
                  </div>
                  {/* End: profile followers container */}
                </div>
              </div>
              {/* End: followers following */}
              {/* Start: CloseFriends */}
              <div className="card shadow" style={{ marginTop: 15 }}>
                <div className="card-header py-3">
                  <p className="text-primary m-0 fw-bold">OnlyFans:</p>
                </div>
                <div className="card-body">
                  {/* Start: Onlyfans Container */}
                  <div className="d-flex onlyfansContainer">
                    {/* Start: OnlyFansDiv */}
                    <div className="onlyFansDiv" style={{ marginRight: 10 }}>
                      {isFollower && (
                        <div className="form-check d-lg-flex align-items-lg-center" style={{ margin: 5 }}>
                          {closeFriend}
                          {closeFriendText}
                        </div>
                      )}
                    </div>

                    {/* End: OnlyFansDiv */}
                  </div>
                  {/* End: Onlyfans Container */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
