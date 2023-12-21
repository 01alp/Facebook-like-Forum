import React, { useCallback, useContext, useEffect, useState } from 'react';
import { WebSocketContext } from './websocket-context';
import { UsersContext } from './users-context';

export const FollowingContext = React.createContext({
  following: [],
  setFollowing: () => {},
  followingChat: [],
  getFollowing: () => {},
  followers: [],
  setFollowers: () => {},
  followersChat: [],
  getFollowers: () => {},
  requestToFollowOrUnfollow: (followUser) => {},
  follow: (followUser) => {},
  unfollow: (unfollowUser) => {},
  receiveMsgFollowing: (frdId, open, isFollowing) => {},
});

export const FollowingContextProvider = (props) => {
  const selfId = localStorage.getItem('user_id');
  const followingUrl = `http://localhost:8080/getFollowing?userID=${selfId}`;
  const followersUrl = `http://localhost:8080/getFollowers?userID=${selfId}`;
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [followingChat, setFollowingChat] = useState([]);
  const wsCtx = useContext(WebSocketContext);
  const usersCtx = useContext(UsersContext);

  // get following from db
  const getFollowingHandler = useCallback(() => {
    fetch(followingUrl, {
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
        let [followingArr] = Object.values(data);
        setFollowing([...new Set(followingArr)]);
        localStorage.setItem('following', JSON.stringify(followingArr));
      })
      .catch((err) => console.log('Error fetching following:', err));
  }, []);

  // get follower from db
  const getFollowerHandler = useCallback(() => {
    fetch(followersUrl, {
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
        let [followersArr] = Object.values(data);
        setFollowers([...new Set(followersArr)]);
        localStorage.setItem('follower', JSON.stringify(followersArr));
      })
      .catch((err) => console.log('Error fetching followers:', err));
  }, []);

  const requestToFollowOrUnfollowHandler = async (followUser, follow) => {
    console.log('request to follow (context): ', followUser.id);

    const followPayloadObj = {
      label: 'noti',
      id: Date.now(),
      type: 'follow-req',
      sourceid: +selfId,
      targetid: followUser.id,
      createdat: Date.now().toString(),
    };
    console.log('gonna send fol req: ', followPayloadObj);

    try {
      const tempurl = `http://localhost:8080/followOrUnfollowRequest?id=${selfId}`;
      const response = await fetch(tempurl, {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Follow: follow, // Set to true for follow, false for unfollow
          TargetID: followUser.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Follow/unfollow request failed');
      }

      const responseData = await response.json();
      console.log('Follow/unfollow request successful');
      return responseData.data;
    } catch (error) {
      console.error('Error sending follow/unfollow request:', error);
      return null;
    }
  };

  // const requestToFollowHandler = (followUser) => {
  //   console.log('request to follow (context): ', followUser.id);

  //   const followPayloadObj = {};
  //   followPayloadObj['label'] = 'noti';
  //   followPayloadObj['id'] = Date.now();
  //   followPayloadObj['type'] = 'follow-req';
  //   followPayloadObj['sourceid'] = +selfId;
  //   followPayloadObj['targetid'] = followUser.id;
  //   followPayloadObj['createdat'] = Date.now().toString();
  //   console.log('gonna send fol req : ', followPayloadObj);
  //   if (wsCtx.websocket !== null) wsCtx.websocket.send(JSON.stringify(followPayloadObj));
  // };

  // const followHandler = (followUser) => {
  //   if (following && following.length !== 0) {
  //     // not empty
  //     setFollowing((prevFollowing) => [...new Set(prevFollowing), followUser]);
  //     followUser['chat_noti'] = false; // add noti to followUser
  //     setFollowingChat((prevFollowingChat) => [...new Set(prevFollowingChat), followUser]);

  //     const storedFollowing = JSON.parse(localStorage.getItem('following'));
  //     const curFollowing = [...storedFollowing, followUser];
  //     localStorage.setItem('following', JSON.stringify(curFollowing));
  //   } else {
  //     setFollowing([followUser]);
  //     followUser['chat_noti'] = false; // add noti to followUser
  //     setFollowingChat([followUser]);
  //     localStorage.setItem('following', JSON.stringify([followUser]));
  //   }
  //   console.log('locally stored following (fol)', JSON.parse(localStorage.getItem('following')));
  // };

  // const unfollowHandler = (unfollowUser) => {
  //   console.log('unfollowUser (folctx)', unfollowUser);
  //   setFollowing((prevFollowing) => prevFollowing.filter((followingUser) => followingUser.id !== unfollowUser.id));
  //   setFollowingChat((prevFollowingChat) => prevFollowingChat.filter((followingChatUser) => followingChatUser.id !== unfollowUser.id));
  //   const storedFollowing = JSON.parse(localStorage.getItem('following'));
  //   const curFollowing = storedFollowing.filter((followingUser) => followingUser.id !== unfollowUser.id);
  //   localStorage.setItem('following', JSON.stringify(curFollowing));
  //   console.log('locally stored following (unfol)', JSON.parse(localStorage.getItem('following')));
  // };

  useEffect(() => {
    getFollowingHandler();
    getFollowerHandler();
    //getPrivateChatHandler();
  }, [usersCtx.users]);

  return (
    <FollowingContext.Provider
      value={{
        followers: followers,
        setFollowers: setFollowers,
        following: following,
        setFollowing: setFollowing,
        followingChat: followingChat,
        getFollowing: getFollowingHandler,
        getFollowers: getFollowerHandler,
        requestToFollowOrUnfollow: requestToFollowOrUnfollowHandler,
        // follow: followHandler,
        // unfollow: unfollowHandler,
      }}
    >
      {props.children}
    </FollowingContext.Provider>
  );
};
