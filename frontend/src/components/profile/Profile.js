import { useEffect, useState, useContext } from 'react';
import { FollowingContext } from '../store/following-context';
import { UsersContext } from '../store/users-context';
import { WebSocketContext } from '../store/websocket-context';
import { GroupContextProvider } from '../store/group-context';
import { PostsContext } from '../store/posts-context.js';
import FollowerModal from './FollowerModal';
import FollowingModal from './FollowingModal';
import Avatar from '../modules/Avatar';
import { Link } from 'react-router-dom';
import JoinedGroup from '../groups/JoinedGroup';
import UserEvent from '../posts/UserEvent';
import ErrorPage from '../pages/ErrorPage';
import CloseFriends from './CloseFriends';

function Profile({ userId }) {
  // console.log('***************   userId ', userId);
  const [followerData, setFollowerData] = useState([]);
  const [followingData, setFollowingData] = useState([]);
  const [isFollower, setIsFollower] = useState(false);

  const [targetUser, setTargetUser] = useState(null);

  const [publicity, setPublicity] = useState(null); // true is public, false is private
  const selfPublicNum = +localStorage.getItem('public');
  const [pubCheck, setPubCheck] = useState(false);
  // friend
  const followingCtx = useContext(FollowingContext);
  const usersCtx = useContext(UsersContext);
  const { followRequestResult, setFollowRequestResult } = useContext(WebSocketContext);
  const { refreshPosts }= useContext(PostsContext);

  const currUserId = localStorage.getItem('user_id');

  const [followStatus, setFollowStatus] = useState(null); //0-pending, 1-accepted, 2-declined, 3-not following
  const [closeFriendList, setCloseFriendList] = useState([]);
  const [isChatable, setIsChatable] = useState(false);
  const [profileAccessibility, setProfileAccessibility] = useState(false); //Public profile or private followed profile is accesible

  const getFollowerHandler = () => {
    console.log("Getting followers for user: ", targetUser.fname)
    // console.log('apis getting called');
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
        // console.log('followersArr (context): ', data);
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
        // console.log('followingArr (context): ', data);
        setFollowingData(data.data);
      })
      .catch((err) => console.log('Error fetching following:', err));
  };

  useEffect(() => {
    followingData && setIsFollower(followingData.some((follower) => follower.id == currUserId));
  }, [followingData]);

  // Check if can chat with user. To chat, current user must follow or be followed by them.
  useEffect(() => {
    const checkChatable = () => {
      return (
        (followingData && followingData.some((follower) => follower.id == currUserId)) ||
        (followerData && followerData.some((follower) => follower.id == currUserId))
      );
    };

    const chatableStatus = checkChatable();
    setIsChatable(chatableStatus);
  }, [followingData, followerData, currUserId]);

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
      .then((data) => {
        //0-pending, 1-accepted, 2-declined, 3-not following
        const receivedFollowStatus = data.data;
        if (receivedFollowStatus >= 0 && receivedFollowStatus < 4) {
          setFollowStatus(receivedFollowStatus);
        } else {
          console.log(`Unexpected follow status: ${receivedFollowStatus}`);
        }
      })
      .catch((err) => console.log('Error fetching follow status:', err));
  };

  useEffect(() => { // Set profile accessibility after knowing publicity and followStatus
    if (pubCheck || followStatus === 1 || userId === currUserId) {
      setProfileAccessibility(true);
    } else {
      setProfileAccessibility(false);
    };
  }, [pubCheck, followStatus])

  useEffect(() => { // After knowing profileAccesibility & profile is accesible, get followers and following
    if (profileAccessibility) {
      getFollowerHandler();
      getFollowingHandler();
    }
  }, [userId, profileAccessibility])

  useEffect(() => { //To get the result of follow request from ws and update profile accordingly
    if (followRequestResult && followRequestResult.userId == userId) {
      setFollowStatus(followRequestResult.status ? 1 : 2);
      setFollowRequestResult(null);
      if (followRequestResult.status === true) {
        refreshPosts();
      }
    }
  }, [followRequestResult, setFollowRequestResult, userId]);

  useEffect(() => {
    getCurrentFollowStatus();

    const foundUser = usersCtx.usersList.find((user) => user.id === +userId);

    if (foundUser) {
      document.title = foundUser.fname + " " + foundUser.lname;
      setTargetUser(foundUser); // Set targetUser state
      if (foundUser.public != 0) {
        setPubCheck(true);
      }
    } else {
      setTargetUser('not found');
    }
  }, [userId, usersCtx.usersList]);


  useEffect(() => {
    selfPublicNum ? setPublicity(true) : setPublicity(false);
  }, [selfPublicNum]);

  //Toggle Private
  const [isChecked, setIsChecked] = useState(localStorage.getItem('isChecked') === 'true');

  useEffect(() => {
    localStorage.setItem('isChecked', isChecked);
  }, [isChecked]);

  const followHandler = async () => {
    const response = await followingCtx.requestToFollowOrUnfollow(targetUser, true);
    if (response !== null) {
      switch (response) {
        case 'Following successful':
          setFollowStatus(1);
          getFollowerHandler(); //NOTE: Could update followers list without fetching from API
          break;
        case 'Follow request received':
          setFollowStatus(0);
          break;
        default:
          console.log('Unexpected response for follow request', response);
      }
    }
  };

  const unfollowHandler = async () => {
    const response = await followingCtx.requestToFollowOrUnfollow(targetUser, false);
    if (response && response === 'Unfollow successful') {
      getFollowerHandler(); //NOTE: Could update followers list without fetching from API
      setFollowStatus(3);
      refreshPosts();
    }
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
        setPublicity(isPublic); // Update the publicity state
        setPubCheck(isPublic); // Update the pubCheck state for re-rendering
        localStorage.setItem('public', publicityNum); // Update local storage
      })
      .catch((error) => {
        console.error('Error changing privacy:', error.message);
      });
  };

  useEffect(() => {
    if (targetUser) {
      if (targetUser.public == 0) {
        localStorage.setItem('isChecked', true);
      } else {
        localStorage.setItem('isChecked', false);
      }
    }
  }, [targetUser]);

  function closeFriendHandler(e) {
    // Toggle the isCloseFriend state
    console.log(e.target.id, e.target.getAttribute('isclosefriend'));

    if (e.target.getAttribute('isclosefriend') === 'true') {
      // IS CLOSE FRIEND
      // REMOVE FROM CLOSE FRIEND LIST
      const data = {
        targetid: parseInt(e.target.id),
        close_friend: false,
      };
      console.log(data);

      const cfOptions = {
        method: 'POST',
        credentials: 'include',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      };

      console.log('removing close friend...');
      fetch('http://localhost:8080/closeFriend', cfOptions)
        .then((resp) => resp.json())
        .then((data) => {
          console.log('closefriend event: ', data);
          if (data.status) {
            console.log('User ', currUserId, ' is no longer a close friend with user ', e.target.id);
            setCloseFriendList(closeFriendList.filter((id) => id !== parseInt(e.target.id)));
          } else {
            console.log('could not process closeFriend handler, failer');
          }
        })
        .catch((err) => {
          console.log('closefriend event: ', err);
        });
    } else {
      // IS NOT CLOSE FRIEND
      // ADD TO CLOSE FRIEND LIST
      const data = {
        targetid: parseInt(e.target.id),
        close_friend: true,
      };

      const cfOptions = {
        method: 'POST',
        credentials: 'include',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      };

      console.log('adding close friend...');
      fetch('http://localhost:8080/closeFriend', cfOptions)
        .then((resp) => resp.json())
        .then((data) => {
          console.log('closefriend event: ', data);
          if (data.status) {
            console.log('User', currUserId, 'added', e.target.id, 'as a close friend');
            if (!closeFriendList.length) {
              setCloseFriendList([parseInt(e.target.id)]);
            } else {
              setCloseFriendList([...closeFriendList, parseInt(e.target.id)]);
            }
          } else {
            console.log('could not process closeFriend handler, failer');
          }
        })
        .catch((err) => {
          console.log('closefriend event: ', err);
        });
    }
  }

  useEffect(() => {
    const cfOptions = {
      method: 'POST',
      credentials: 'include',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    fetch('http://localhost:8080/closeFriendList', cfOptions)
      // TODO: return list of close friends ids here
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        setCloseFriendList(data.close_friends || []);
      })
      .catch((error) => {
        console.log({ error });
      });
  }, [userId]);

  let followButton;
  let messageButton;

  if (currUserId !== userId) {
    // IF NOT OWN PROFILE
    switch (followStatus) {
      case 0: //Pending request
        followButton = (
          <div>
            <button
              onClick={unfollowHandler}
              className="btn btn-primary btn-sm"
              type="button"
              style={{ marginRight: 5 }}
              id={userId}
              title="Cancel request"
            >
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
      case null: {
        break;
      }
      default:
        console.log('Unexpected follow status:', followStatus);
    }

    messageButton = (
      <div>
        {isChatable ? (
          <Link className="btn btn-primary btn-sm" role="button" style={{ marginRight: 5 }} to="/chat">
            Message
          </Link>
        ) : (
          <div className="btn btn-secondary btn-sm" style={{ marginRight: 5, pointerEvents: 'none' }}>
            Message
          </div>
        )}
      </div>
    );
  }

  if (targetUser === null) {
    return <div>Loading...</div>;
  }

  if (targetUser === 'not found') {
    return <ErrorPage errorMessage="User not found" errorCode=" " />;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  return (
    <div className="container-fluid">
      <h3 className="text-dark mb-4">{targetUser.fname} {targetUser.lname}</h3>
      <div className="row mb-3">
        <div className="col-lg-4">
          {/* Start: Avatarimage */}
          <div className="card mb-3">
            <div className="card-body text-center shadow">
              <div className="d-flex justify-content-center align-items-center">
                <Avatar src={targetUser.avatar} showStatus={false} width={150} />
              </div>
            </div>
          </div>
          {/* End: Avatarimage */}
          {/* Start: Aboutme */}
          { profileAccessibility && (
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
            </div> )}
          {/* End: Aboutme */}
          {/* Start: joinedGroupsDiv */}
          { profileAccessibility && (
            <div className="joinedGroups" style={{ padding: 5, marginTop: -20 }}>
              <div className=" joinedGroupContainer" style={{ margin: 5 }}>
                <GroupContextProvider userId={userId}>
                  <JoinedGroup currentUser={userId === currUserId} />
                </GroupContextProvider>
              </div>
            </div> )}
          {/* End: joinedGroupsDiv */}
          {/* Start: upcomingEventsDiv */}
          { profileAccessibility && (
          <div className="upcomingEvents" style={{ padding: 5, marginTop: 20 }}>
            <h5>Upcoming Events:</h5>
            <UserEvent />
          </div> )}
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
                { profileAccessibility && (
                  <div className="card-body">
                    <div>
                      <div className="row">
                        <div className="col">
                          {/* Start: Profile row */}
                          <div className="mb-3">
                            <label className="form-label" htmlFor="username">
                              <strong>Name:</strong>
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
                              <strong>Email:</strong>
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
                              <strong>Username:</strong>
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
                              <span>{formatDate(targetUser.dob)}</span>
                            </div>
                            {/* End: dateofBirth */}
                          </div>
                          {/* End: Birthday container */}
                        </div>
                      </div>
                    </div>
                  </div> )}
              </div>
              {/* End: User profile info */}
              {/* Start: followers following */}
              { profileAccessibility && (
                <div className="card shadow">
                  <div className="card-header py-3">
                    <p className="text-primary m-0 fw-bold">Followers:</p>
                  </div>
                  <div className="card-body">
                    {/* Start: profile followers container */}
                    <div className="d-flex profileFollowers">
                      {/* Start: profile followers */}
                      <FollowerModal
                        followers={followerData}
                        closeFriendList={closeFriendList}
                        isOwnProfile={userId === currUserId}
                        closeFriendHandler={closeFriendHandler}
                      />
                      {/* End: profile followers */}

                      {/* Start: profiles following */}
                      <FollowingModal following={followingData} />
                      {/* End: profiles following */}
                    </div>
                    {/* End: profile followers container */}
                  </div>
                </div> )}
              {/* End: followers following */}
              <CloseFriends closeFriendList={closeFriendList} followers={followerData} isOwnProfile={userId === currUserId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
