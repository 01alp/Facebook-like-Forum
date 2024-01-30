import Comment from './Comment';

function AllComments(props) {
  return props.comments.map((comment) => {
    return (
      <Comment
        key={comment.id}
        id={comment.id}
        postId={comment.postid}
        authorId={comment.userid}
        fname={comment.user.fname}
        lname={comment.user.lname}
        avatar={comment.user.avatar}
        nname={comment.user.nname}
        message={comment.message}
        createdAt={comment.createdat}
        image={comment.image}
        group={props.group}
      />
    );
  });
}

export default AllComments;
