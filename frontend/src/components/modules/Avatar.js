import { useState, useContext, useEffect } from 'react';
import { WebSocketContext } from '../store/websocket-context';

const Avatar = ({ className, id, src, alt, width, showStatus }) => {
  const [onlineStatus, setOnlineStatus] = useState(false);
  const wsCtx = useContext(WebSocketContext);
  const currentUserId = +localStorage.getItem('user_id');

  useEffect(() => {
    //Listen for online users list ws message
    if (wsCtx.websocket !== null && wsCtx.newOnlineStatusObj.onlineUserIds) {
      console.log('Check 1 - all online users');
      if (id === currentUserId || wsCtx.newOnlineStatusObj.onlineUserIds.includes(id)) {
        setOnlineStatus(true);
      } else {
        setOnlineStatus(false);
      }
    }
  }, [wsCtx.websocket, wsCtx.newOnlineStatusObj.onlineUserIds, id, currentUserId]);

  useEffect(() => {
    //Listen for user coming online ws message
    if (wsCtx.websocket !== null && wsCtx.newOnlineStatusObj.userOnline) {
      console.log('Check 2 - new online user');
      if (wsCtx.newOnlineStatusObj.userOnline === id) {
        setOnlineStatus(true);
        wsCtx.newOnlineStatusObj.userOnline = null;
      }
    }
  }, [wsCtx.websocket, wsCtx.newOnlineStatusObj, id]);

  useEffect(() => {
    //Listen for user going offline ws message
    if (wsCtx.websocket !== null && wsCtx.newOnlineStatusObj.userOffline) {
      console.log('Check 3 - new offline user');
      if (wsCtx.newOnlineStatusObj.userOffline === id) {
        setOnlineStatus(false);
        wsCtx.newOnlineStatusObj.userOffline = null;
      }
    }
  }, [wsCtx.websocket, wsCtx.newOnlineStatusObj, id]);

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
