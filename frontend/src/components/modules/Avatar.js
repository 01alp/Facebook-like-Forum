import { useState, useContext, useEffect } from 'react';
import { WebSocketContext } from '../store/websocket-context';

const Avatar = ({ className, id, src, alt, width, showStatus }) => {
  const [onlineStatus, setOnlineStatus] = useState(false);
  const wsCtx = useContext(WebSocketContext);

  useEffect(() => {
    if (wsCtx.websocket !== null && wsCtx.newOnlineStatusObj.onlineuserids) {
      setOnlineStatus(wsCtx.newOnlineStatusObj.onlineuserids.includes(id));
    }
  }, [wsCtx.newOnlineStatusObj.onlineuserids]);

  const defaultAvatar = 'default_avatar.jpg';
  const imagePath = src || require(`../images/${defaultAvatar}`);

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {showStatus && <span style={{ marginRight: '5px', marginLeft: '5px' }}>{onlineStatus ? '🟢' : '⚪'}</span>}
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
