import { useContext } from 'react';
import { WebSocketContext } from '../store/websocket-context';

const useOnlineStatus = (userId) => {
  const wsCtx = useContext(WebSocketContext);
  const onlineUsers = wsCtx.onlineUsers;

  const isOnline = onlineUsers.has(userId);

  return isOnline;
};

export default useOnlineStatus;
