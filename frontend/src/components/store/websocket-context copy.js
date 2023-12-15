import React, { useState, useEffect, useContext } from 'react';
import { UsersContext } from './users-context';

export const WebSocketContext = React.createContext({
  websocket: null,
  newOnlineStatusObj: false,
  setNewOnlineStatusObj: () => {},
});

export const WebSocketContextProvider = (props) => {
  const [socket, setSocket] = useState(null);
  const [newOnlineStatusObj, setNewOnlineStatusObj] = useState(false);

  const usersCtx = useContext(UsersContext);

  useEffect(() => {
    const newSocket = new WebSocket('ws://localhost:8080/ws');

    newSocket.onopen = () => {
      console.log('WebSocket connected');
      setSocket(newSocket);
    };

    newSocket.onmessage = (e) => {
      const msgObj = JSON.parse(e.data);
      if (msgObj.label === 'online-status') {
        console.log('WebSocket receives online-status: ', msgObj);
        setNewOnlineStatusObj(msgObj);
      }
    };

    newSocket.onclose = () => {
      console.log('WebSocket disconnected');
      setSocket(null);
    };

    newSocket.onerror = (err) => {
      console.error('WebSocket error', err);
      console.log('WebSocket state:', newSocket.readyState);
    };

    return () => newSocket.close();
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        websocket: socket,
        newOnlineStatusObj: newOnlineStatusObj,
        setNewOnlineStatusObj: setNewOnlineStatusObj,
      }}
    >
      {props.children}
    </WebSocketContext.Provider>
  );
};
