import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../../modules/Avatar';
import { ImageValidation } from '../../utils/commonFunc.js';
import AlertElement from '../../modules/AlertElement.js';

function CreateComment(props) {
  const userId = +localStorage.getItem('user_id');
  const first = localStorage.getItem('fname');
  const last = localStorage.getItem('lname');
  const nickname = localStorage.getItem('nname');
  const avatar = localStorage.getItem('avatar');

  const [uploadedCommentImg, setUploadedCommentImg] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const commentInput = useRef();
  const imgInputRef = useRef();
  // const [commentMsg, setCommentMsg] = useState("");

  function SubmitHandler(event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append('image', uploadedCommentImg);
    const enteredContent = commentInput.current.value;

    const jsonData = {
      postId: props.pid,
      userId: userId, // author
      message: enteredContent,
      group_id: props.group ? +props.groupId : 0,
    };
    formData.append('json', JSON.stringify(jsonData));

    console.log('create comment: ', formData);

    props.onCreateComment(formData);

    commentInput.current.value = '';
    if (!props.group) {
      imgInputRef.current.value = '';
      setUploadedCommentImg(null);
      setImagePreview(null);
    }
    setErrorMessage('');
  }

  const CommentImgUploadHandler = (e) => {
    setUploadedCommentImg(null);
    setImagePreview(null);
    setErrorMessage('');

    const file = e.target.files[0];

    // file validation
    const validationResult = ImageValidation(file);
    if (validationResult !== '') {
      imgInputRef.current.value = ''; // reset the input
      setErrorMessage(validationResult);
      return;
    }
    setUploadedCommentImg(file);

    const previewURL = URL.createObjectURL(file);
    setImagePreview(previewURL);
  };

  return (
    <div
      className="makeComment"
      style={{
        padding: 5,
        boxShadow: '3px 3px 5px 5px var(--bs-body-color)',
      }}
    >
      <form style={{ padding: 5 }} onSubmit={SubmitHandler}>
        <div className="d-flex justify-content-between createPostAuthorDiv" style={{ margin: 5 }}>
          <div className="d-flex align-items-lg-center UserDiv" id="userDiv-1">
            <Link className="link-up" to={`/profile/${userId}`}>
              <div id="commentUserDiv-1" className="postUser">
                <div className="d-flex align-items-center">
                  <Avatar id={userId} src={avatar} showStatus={false} alt="" width={'40px'} />
                  <span style={{ marginLeft: '5px' }}>{`${first} ${last}`}</span>
                </div>
              </div>
            </Link>
          </div>
          <span>123</span>
        </div>
        <input
          className="form-control commentContentCreation"
          type="text"
          style={{ margin: 5 }}
          placeholder="Comment min3-max200"
          ref={commentInput}
        />
        {!props.group && (
          <div>
            {/* Start: image */}

            <input
              className="form-control"
              type="file"
              name={`comment-image-${props.pid}`}
              id={`comment-image-${props.pid}`}
              accept=".jpg, .jpeg, .png, .gif"
              onChange={CommentImgUploadHandler}
              style={{ margin: 5 }}
              ref={imgInputRef}
            />

            {imagePreview && <img src={imagePreview} width={'80px'} />}
            {errorMessage !== '' && <AlertElement message={errorMessage} type="warning" dismissible={true} onAlertDismiss={setErrorMessage} />}
            {/* End: Image Upload */}
          </div>
        )}

        <button className="btn btn-primary" type="submit" style={{ margin: 5 }}>
          Submit
          <i className="far fa-paper-plane" style={{ marginLeft: 5 }} />
        </button>
      </form>
    </div>
  );
}

export default CreateComment;
