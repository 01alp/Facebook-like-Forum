import useOnlineStatus from '../hooks/useOnlineStatus';

const Avatar = ({ className, id, src, alt, width, showStatus }) => {
  const currentUserId = +localStorage.getItem('user_id');

  let isUserOnline = useOnlineStatus(id);
  if (id === currentUserId) {
    isUserOnline = true
  }

  const defaultAvatar = 'default_avatar.jpg';
  const imagePath = src || require(`../images/${defaultAvatar}`);

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {showStatus && <span style={{ marginRight: '5px', marginLeft: '5px' }}>{isUserOnline ? '🟢' : '⚪'}</span>}
      <img
        className={`border rounded-circle img-fluid  ${className || ''}`}
        src={imagePath}
        alt={alt}
        style={{ width: width, height: width, marginRight: '5px' }}
      />
    </div>
  );
};

export default Avatar;
