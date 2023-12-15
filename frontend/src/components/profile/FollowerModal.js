import { useNavigate } from 'react-router-dom';
import Avatar from '../modules/Avatar';

function FollowerModal(props) {
  const navigate = useNavigate();

  function handleClick(e) {
    const id = e.target.id;

    console.log('id: ', id);
    navigate(`/profile/${id}`);
  }

  return (
    <div className="modal" role="dialog" tabIndex="-1" id="modal-1">
      <div className="modal-dialog modal-sm modal-dialog-centered modal-dialog-scrollable" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title">Followers</h4>
            <button className="btn-close" type="button" aria-label="Close" data-bs-dismiss="modal" onClick={props.onClose}></button>
          </div>
          <div className="modal-body">
            {props.followers &&
              props.followers.map((follower) => (
                <div
                  style={{ margin: '5px' }}
                  className="d-flex align-items-lg-center"
                  key={follower.id}
                  id={follower.id}
                  onClick={handleClick}
                >
                  <Avatar id={follower.id} width={52} src={follower.avatar} />
                  <span style={{ marginLeft: '10px' }} id={follower.id}>
                    {follower.fname}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FollowerModal;
