import Comment from './Comment';

function AllComments(props) {
  console.log('postToCommentArr in All comments', props.postToCommentArr);

  return props.postToCommentArr.map((pToCElement, c) => {
    const [commentObj] = Object.values(pToCElement);

    if (commentObj.postid === props.postNum) {
      return (
        <Comment
          key={commentObj.id}
          id={commentObj.id}
          // postId={commentObj.postid}
          authorId={commentObj.userid}
          fname={commentObj.fname}
          lname={commentObj.lname}
          avatar={commentObj.avatar}
          nname={commentObj.nname}
          message={commentObj.message}
          createdAt={commentObj.createdat}
          image={commentObj.image}
        />
      );
    }
  });
}

export default AllComments;
