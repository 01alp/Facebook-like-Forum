import React, { createContext, useState, useContext, useEffect } from 'react';
import { UsersContext } from './users-context';

export const GroupContext = React.createContext({
  groupsInfo: [],
  groupPostsData: [],
  updateGroups: () => {},
  getGroupPostsData: () => {},
});

export const useGroup = () => useContext(GroupContext);

export const GroupContextProvider = ({ children }) => {
  const [groupsInfo, setGroupsInfo] = useState([]);
  const [groupPostsData, setGroupPostsData] = useState([]);
  const [postsLoaded, setPostsLoaded] = useState(false);
  const [refreshState, setRefreshState] = useState(false);

  const newPostUrl = 'http://localhost:8080/newPost';
  const newCommentUrl = 'http://localhost:8080/newComment';

  const userCtx = useContext(UsersContext);

  useEffect(() => {
    // get posts
    if (userCtx.usersList && userCtx.usersList.length > 0 && (!postsLoaded || refreshState)) {
      // !postsLoaded so it doesnt run every time usersList changes but only when it is first loaded
      getGroupPostsData();
    }
  }, [refreshState, userCtx.usersList]);

  const getGroupPostsData = async () => {
    try {
      const resp = await fetch(`http://localhost:8080/getGroupPosts`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!resp.ok) {
        throw new Error(`Failed to fetch posts: ${resp.status}`);
      }

      const data = await resp.json();
      // console.log('GROUP POSTS DATA:', data.posts);
      sortData(data);
    } catch (error) {
      console.error('Error fetching group data:', error);
    }
  };

  const sortData = (postsData) => {
    // sort posts
    postsData.posts.sort((a, b) => Date.parse(b.createdat) - Date.parse(a.createdat));
    // sort comments
    for (let i = 0; i < postsData.posts.length; i++) {
      if (postsData.posts[i].comments) {
        postsData.posts[i].comments.sort((a, b) => Date.parse(b.createdat) - Date.parse(a.createdat));
      }
    }

    addUserData(postsData.posts);
    setPostsLoaded(true);
  };

  const addUserData = (postsData) => {
    // add user postsData to posts
    let postsDataWithUsers = [];
    for (let i = 0; i < postsData.length; i++) {
      let post = postsData[i];
      let user = userCtx.usersList.find((user) => user.id == post.author);
      post.user = user;
      postsDataWithUsers.push(post);

      // add user data to comments
      if (post.comments) {
        for (let j = 0; j < post.comments.length; j++) {
          let comment = post.comments[j];
          let user = userCtx.usersList.find((user) => user.id == comment.userid);
          comment.user = user;
        }
      }
    }
    setGroupPostsData(postsDataWithUsers);
  };

  const createPostHandler = async (createPostPayload) => {
    // console.log('postpage create post', createPostPayload);
    console.log('Create new post');
    const reqOptions = {
      method: 'POST',
      mode: 'cors',
      body: createPostPayload,
    };

    try {
      const resp = await fetch(newPostUrl, reqOptions);

      console.log(resp.status);
      if (resp.status === 201) {
        setPostsLoaded(false);
        refreshPosts();
      } else {
        console.log(resp.status);
        console.log(await resp.text());
        throw new Error('Failed to add new post');
      }
    } catch (err) {
      console.log(err);
    }
  };

  const createCommentHandler = async (createCommentPayload) => {
    console.log('create comment for Post', createCommentPayload);

    const reqOptions = {
      method: 'POST',
      mode: 'cors',
      body: createCommentPayload,
    };

    try {
      const resp = await fetch(newCommentUrl, reqOptions);

      if (resp.ok) {
        setPostsLoaded(false);
        refreshPosts();
      } else {
        console.log(resp.status);
        console.log(await resp.text());
        throw new Error('Failed to add new comment');
      }
    } catch (err) {
      console.log(err);
    }
  };

  const updateGroups = (newGroups) => {
    setGroupsInfo(newGroups);
  };

  function refreshPosts() {
    refreshState ? setRefreshState(false) : setRefreshState(true);
  }

  return (
    <GroupContext.Provider
      value={{
        groupsInfo: groupsInfo,
        groupPostsData: groupPostsData,
        updateGroups: updateGroups,
        getGroupPostsData: getGroupPostsData,
        refreshPosts: refreshPosts,
        onCreatePost: createPostHandler,
        onCreateComment: createCommentHandler,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};
