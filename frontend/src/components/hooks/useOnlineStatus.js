import { useState, useContext, useEffect } from 'react';
import { WebSocketContext } from '../store/websocket-context';

const useOnlineStatus = (userId) => {
  const [isOnline, setIsOnline] = useState(false);
  const wsCtx = useContext(WebSocketContext);

  useEffect(() => {
    // Update initial online status based on the online users list
    const initialOnlineUsers = wsCtx.newOnlineStatusObj.onlineUserIds || [];
    setIsOnline(initialOnlineUsers.includes(userId));

    // Listen for changes in the userOnline and userOffline
  }, [wsCtx.newOnlineStatusObj.onlineUserIds, userId]);

  useEffect(() => {
    // Update for a specific user coming online
    if (wsCtx.newOnlineStatusObj.userOnline === userId) {
      setIsOnline(true);
    }
  }, [wsCtx.newOnlineStatusObj.userOnline, userId]);

  useEffect(() => {
    // Update for a specific user going offline
    if (wsCtx.newOnlineStatusObj.userOffline === userId) {
      setIsOnline(false);
    }
  }, [wsCtx.newOnlineStatusObj.userOffline, userId]);

  return isOnline;
};

export default useOnlineStatus;
