import { useContext, useEffect, useState } from 'react';
import useGet from '../fetch/useGet';
import AllPosts from '../posts/AllPosts';
import Profile from '../profile/Profile';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { PostsContext } from '../store/posts-context';

function ProfilePage() {
  const { userId } = useParams(); // get user ID from URL parameters
  const { posts } = useContext(PostsContext); // get posts from context
  console.log('context:', userId, posts);
  // Filter posts for the specific user
  const userPosts = posts.filter((post) => post.author == userId);

  return (
    <div>
      {/* <Profile userId={id}></Profile> */}
      {/* <AllPosts userId={id} posts={postData} comments={commentData}></AllPosts> */}
      <Profile userId={userId} />
      <AllPosts data={userPosts} />
    </div>
  );
}

export default ProfilePage;
