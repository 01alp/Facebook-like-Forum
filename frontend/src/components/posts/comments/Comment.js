import React from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../../modules/Avatar';
import { formatDate } from '../../utils/commonFunc.js';

function Comment(props) {
  let created = formatDate(props.createdAt);
  const userId = localStorage.getItem('user_id');
  const imagesUrl = 'http://localhost:8080/images/comment_images/';

  return (
    <div className="commenting" style={{ margin: '25px', boxShadow: '3px 3px 5px 5px var(--bs-body-color)', padding: '15px' }}>
      <div className="d-flex justify-content-between align-items-lg-center">
        <div className="d-flex align-items-lg-center">
          <div>
            <Link to={`/profile/${props.authorId}`}>
              <Avatar id={props.authorId} src={props.avatar} alt="" showStatus={true} width={'32px'} />
            </Link>
          </div>
          <div className="commentUser">
            <Link to={`/profile/${props.authorId}`}>
              <div>{`${props.fname} ${props.lname}${userId == props.authorId ? ' (me)' : ' ' + '(' + props.nname + ')'}`}</div>
            </Link>
          </div>
        </div>
        <div className="text-end commentDate">
          <span>{created}</span>
        </div>
      </div>
      <div className="commentContent" style={{ margin: '5px' }}>
        <span>{props.message}</span>
      </div>
      {!props.group && props.image !== '0' && (
        <div className="d-flex justify-content-center">
          <img src={imagesUrl + props.image} alt="" width={'100px'} />
        </div>
      )}
    </div>
  );
}

export default Comment;
