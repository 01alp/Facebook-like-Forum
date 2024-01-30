import { useCallback, useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AllComments from './comments/AllComments';
import CreateComment from './comments/CreateComment';
import Avatar from '../modules/Avatar';
import { formatDate } from '../utils/commonFunc.js';
import { UsersContext } from '../store/users-context';

function Post(props) {
  // console.log(props);
  const [showComments, setShowComments] = useState(false);
  const [postPrivacy, setPostPrivacy] = useState();
  const navigate = useNavigate();

  const imagesUrl = 'http://localhost:8080/images/post_images/';
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    if (props != undefined) {
      setPostPrivacy(props.privacy);
    }
  }, [props]);

  // console.log('comment for post: ', props.postNum, ' comments: ', props.commentsForThisPost);
  // const onlineStatus = false;
  const postCommentUrl = 'http://localhost:8080/post-comment';

  const showCommentsHandler = useCallback(() => {
    // !showComments && setShowComments(true);
    // showComments && setShowComments(false);
    setShowComments((prevShowComments) => !prevShowComments);
  }, []);

  function handleClick(e) {
    const id = e.target.id;

    // console.log('id: ', id);
    navigate('/profile', { state: { id } });
  }

  let created = formatDate(props.createdat);

  // console.log('created:', created);
  // console.log('props.createdAt:', props.createdat);
  let privacy = null;
  if (!props.group) {
    switch (props.privacy) {
      case 1:
        privacy = <span style={{ fontSize: 23 }}>🔐Prv.</span>;
        break;
      case 2:
        privacy = <span style={{ fontSize: 23 }}>🔓Fans</span>;
        break;
      default:
        privacy = <span style={{ fontSize: 23 }}>🟢Pub.</span>;
        break;
    }
  }

  return (
    <div className="posts" style={{ margin: 5, marginTop: 5 }}>
      {/* Start: postDiv */}
      <div
        className="d-flex flex-column post"
        id="postDiv"
        style={{
          margin: 5,
          marginTop: 10,
          boxShadow: '3px 3px 5px 5px var(--bs-body-color)',
          padding: 5,
        }}
      >
        {/* Start: PostAuthor line */}
        <div className="d-flex justify-content-between postDateUser" style={{ margin: 5 }}>
          <div className="d-flex align-items-lg-center UserDiv">
            <div>
              <Link to={`/profile/${props.authorId}`}>
                <Avatar id={props.authorId} src={props.avatar} alt="" showStatus={false} width={'50px'} />
              </Link>
            </div>
            <div>
              <Link to={`/profile/${props.authorId}`}>
                <div>{`${props.fname} ${props.lname}${userId == props.authorId ? ' (me)' : props.nname ? ' ' + '(' + props.nname + ')' : ''}`}</div>
              </Link>
            </div>
          </div>
          {privacy && (
            <div>
              <div className="d-lg-flex align-items-lg-center">{privacy}</div>
            </div>
          )}

          <div>
            <span>{created}</span>
          </div>
        </div>
        {/* End: PostAuthor line */}
        {/* Start: postContentwrapper */}
        <div className="postContent" style={{ margin: 5 }}>
          {/* Start: postContent */}
          <div>{props.message}</div>
          {/* End: postContent */}
          {/* Start: image */}
          {!props.group && (
            <div style={{ textAlign: 'center' }}>
              {props.image !== '0' && (
                <div>
                  <img src={imagesUrl + props.image} alt="" className="img-fluid" style={{ width: 100, margin: 'auto' }} />
                </div>
              )}
            </div>
          )}

          {/* End: image */}
          {/* Start: comments */}
          <div style={{ textAlign: 'right' }}>
            <button className="btn btn-primary" type="button" style={{ margin: 5, width: 150 }} onClick={showCommentsHandler}>
              {props.commentsForThisPost.length} comments
            </button>
          </div>
          {showComments && (
            <>
              <AllComments comments={props.commentsForThisPost} group={props.group} />
              <CreateComment pid={props.id} onCreateComment={props.onCreateComment} group={props.group} groupId={props.groupId} />
            </>
          )}
          {/* End: comments */}
        </div>
        {/* End: postContentwrapper */}
      </div>
      {/* End: postDiv */}
    </div>
  );
}

export default Post;
