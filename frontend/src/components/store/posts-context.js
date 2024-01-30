import React, { useState, useEffect, useContext } from 'react';
import { UsersContext } from '../store/users-context';
import { useNavigate } from 'react-router-dom';

export const PostsContext = React.createContext({
  posts: [],
  getPosts: () => {},
  refreshPosts: () => {},
  onCreatePost: () => {},
  onCreateComment: () => {},
});

export const PostsContextProvider = (props) => {
  const postsCommentsUrl = 'http://localhost:8080/getPostsAndComments';
  const newPostUrl = 'http://localhost:8080/newPost';
  const newCommentUrl = 'http://localhost:8080/newComment';

  const [refreshState, setRefreshState] = useState(false);
  const [posts, setPosts] = useState([]);
  const [postsLoaded, setPostsLoaded] = useState(false);

  const userCtx = useContext(UsersContext);
  const userId = localStorage.getItem('user_id');
  // const navigate = useNavigate();

  useEffect(() => {
    // get posts
    if (userCtx.usersList && userCtx.usersList.length > 0 && (!postsLoaded || refreshState)) {
      // !postsLoaded so it doesnt run every time usersList changes but only when it is first loaded
      setPostsLoaded(true);
      getPostsHandler();
    }
  }, [refreshState, userCtx.usersList]);

  // get posts
  const getPostsHandler = async () => {
    const options = {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    try {
      const resp = await fetch(postsCommentsUrl + `?userID=${userId}`, options);

      if (resp.ok) {
        const data = await resp.json();
        // console.log('Posts and comments data: ', data);

        sortData(data);
      } else {
        console.log(resp.status);
        console.log(await resp.text());
      }
    } catch (err) {
      console.log(err);
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
    setPosts(postsDataWithUsers);
    setPostsLoaded(true);
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

  function refreshPosts() {
    refreshState ? setRefreshState(false) : setRefreshState(true);
  }

  return (
    <PostsContext.Provider
      value={{
        posts: posts,
        getPosts: getPostsHandler,
        refreshPosts: refreshPosts,
        onCreatePost: createPostHandler,
        onCreateComment: createCommentHandler,
      }}
    >
      {props.children}
    </PostsContext.Provider>
  );
};
