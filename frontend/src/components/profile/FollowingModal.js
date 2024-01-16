import { Link, useNavigate } from 'react-router-dom';
import Avatar from '../modules/Avatar';

function FollowingModal(props) {
  const navigate = useNavigate();

  function handleClick(e) {
    let targetElement = e.target.closest('[data-id]');

    if (targetElement) {
      let id = targetElement.getAttribute('data-id');
      console.log(`Navigating to profile with ID: ${id}`);
      navigate(`/profile/${id}`);
    } else {
      console.log('No valid target found for navigation.');
    }
  }

  return (
    <div>
      <Link
        className="btn btn-primary"
        style={{ marginRight: 5 }}
        data-bs-toggle="collapse"
        aria-expanded="false"
        aria-controls="collapse-2"
        to="#collapse-2"
        role="button"
      >
        <span className="followerCount" style={{ fontWeight: 'bold', marginRight: 5 }}>
          {props.following ? props.following.length : 0}
        </span>
        {''}
        <span>Following</span>
      </Link>
      <div id="collapse-2" className="collapse">
        {props.following && props.following.length > 0 ? (
          props.following.map((follow) => (
            <div
              style={{ margin: '5px' }}
              className="d-flex align-items-lg-center"
              key={follow.id}
              data-id={follow.id}
              onClick={handleClick}
            >
              <Avatar id={follow.id} width={52} src={follow.avatar} />
              <span style={{ marginLeft: '10px' }} id={follow.id}>
                {follow.fname}
              </span>
            </div>
          ))
        ) : (
          <div style={{ margin: '5px' }}>No Following</div>
        )}
      </div>
    </div>
  );
}

export default FollowingModal;
