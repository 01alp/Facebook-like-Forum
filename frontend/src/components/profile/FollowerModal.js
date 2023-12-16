import { Link, useNavigate } from 'react-router-dom';
import Avatar from '../modules/Avatar';

function FollowerModal(props) {
  const navigate = useNavigate();

  function handleClick(e) {
    const id = e.target.id;

    console.log('id: ', id);
    navigate(`/profile/${+id}`);
    //console.log('follower modal ', e);
  }

  return (
    <div>
      <Link
        className="btn btn-primary"
        style={{ marginRight: 50 }}
        data-bs-toggle="collapse"
        aria-expanded="false"
        aria-controls="collapse-1"
        to="#collapse-1"
        role="button"
      >
        <span className="followerCount" style={{ fontWeight: 'bold', marginRight: 5 }}>
          {props.followers ? props.followers.length : 0}
        </span>
        {''}
        <span>Followers</span>
      </Link>
      <div id="collapse-1" className="collapse">
        {props.followers && props.followers.length > 0 ? (
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
          ))
        ) : (
          <div style={{ margin: '5px' }}>No Follower</div>
        )}
      </div>
    </div>
  );
}

export default FollowerModal;
