import React, { useEffect, useState, useCallback, useContext } from 'react';
import { Helmet } from 'react-helmet';
import Comment from '../posts/comments/Comment';
import CreatePost from '../posts/CreatePost.js';
import CreateComment from '../posts/comments/CreateComment.js';
import AllPosts from '../posts/AllPosts.js';
import UserEvent from '../posts/UserEvent';
import AllUsers from '../posts/AllUsers';
import JoinedGroup from '../groups/JoinedGroup';
import { PostsContext } from '../store/posts-context.js';

const PostsPage = () => {
  const postsCtx = useContext(PostsContext);

  return (
    <>
      <Helmet>
        <title>Posts</title>
      </Helmet>
      <div className="container" id="mainContainer" style={{ marginTop: 20, marginBottom: 20 }}>
        <div className="row">
          {/* Start: leftColumn */}
          <div className="col-12 col-sm-12 col-md-12 col-lg-3 col-xl-3 col-xxl-3">
            <AllUsers />
            <JoinedGroup currentUser={true} />
            <UserEvent />
          </div>
          {/* End: leftColumn */}
          {/* Start: rightColumn */}
          <div className="col-12 col-sm-12 col-md-12 col-lg-9 col-xl-9 col-xxl-9">
            {/* Start: makePostDiv */}
            <div>
              <CreatePost onCreatePost={postsCtx.onCreatePost} />
            </div>
            {/* End: makePostDiv */}
            {/* Start: refreshDiv */}
            <div className="refresh" style={{ marginTop: 15, marginBottom: 15, textAlign: 'right' }}>
              <button className="btn" type="button" style={{ borderRadius: 30 }} onClick={postsCtx.refreshPosts}>
                <i
                  className="fas fa-redo"
                  data-bss-hover-animate="pulse"
                  style={{
                    fontSize: 32,
                    marginRight: 10,
                    textShadow: '3px 3px 5px var(--bs-emphasis-color)',
                  }}
                />
              </button>
            </div>
            {/* End: refreshDiv */}
            {/* Start: all postst wrapper */}
            <AllPosts data={postsCtx.posts} onCreateComment={postsCtx.onCreateComment} />
            {/* End: all postst wrapper */}
          </div>
          {/* End: rightColumn */}
        </div>
      </div>
      {/* End: 1 Row 2 Columns */}
    </>
  );
};

export default PostsPage;
