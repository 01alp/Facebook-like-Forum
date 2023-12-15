import { useNavigate } from 'react-router-dom';
import Avatar from '../modules/Avatar';

function FollowingModal(props) {
  const navigate = useNavigate();
  function handleClick(e) {
    const id = e.target.id;

    console.log('id: ', id);
    navigate(`/profile/${id}`);
  }

  return (
    <div className="modal" role="dialog" tabIndex="-1" id="modal-2" onClick={props.onClose}>
      <div className="modal-dialog modal-sm modal-dialog-centered modal-dialog-scrollable" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title">Following</h4>
            <button className="btn-close" type="button" aria-label="Close" data-bs-dismiss="modal" onClick={props.onClose}></button>
          </div>
          <div className="modal-body">
            {props.following &&
              props.following.map((follow) => (
                <div
                  style={{ margin: '5px' }}
                  className="d-flex align-items-lg-center"
                  key={follow.id}
                  id={follow.id}
                  onClick={handleClick}
                >
                  <Avatar id={follow.id} width={52} src={follow.avatar} />
                  <span style={{ marginLeft: '10px' }} id={follow.id}>
                    {follow.fname}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FollowingModal;
