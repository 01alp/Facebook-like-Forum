import Post from './Post';
import useGet from '../fetch/useGet';
import { useCallback, useEffect } from 'react';

function AllPosts(props) {
  return (
    <div>
      {props.data.map((post, p) => (
        <Post
          key={post.id}
          id={post.id}
          avatar={post.user.avatar}
          fname={post.user.fname}
          lname={post.user.lname}
          nname={post.user.nname}
          message={post.message}
          image={post.image}
          createdat={post.createdat}
          authorId={post.author}
          privacy={post.privacy}
          postNum={p}
          commentsForThisPost={post.comments ? post.comments : []}
          onCreateComment={props.onCreateComment}
          group={props.group}
          groupId={props.groupId}
        />
      ))}
    </div>
  );
}

export default AllPosts;
