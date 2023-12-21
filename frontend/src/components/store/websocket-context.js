import React, { useState, useEffect, useContext } from 'react';
import { UsersContext } from './users-context';
import { ChatContext } from './chat-context';

export const WebSocketContext = React.createContext({
  websocket: null,
  newPrivateMsgsObj: null,
  setNewPrivateMsgsObj: () => {},
  newGroupMsgsObj: null,
  setNewGroupMsgsObj: () => {},
  newNotiObj: null,
  setNewNotiObj: () => {},
  newNotiFollowReplyObj: null,
  setNewNotiFollowReplyObj: () => {},
  newNotiJoinReplyObj: null,
  setNewNotiJoinReplyObj: () => {},
  newNotiInvitationReplyObj: null,
  setNewNotiInvitationReplyObj: () => {},
  newOnlineStatusObj: false,
  setNewOnlineStatusObj: () => {},
});

export const WebSocketContextProvider = (props) => {
  const { currentChat } = useContext(ChatContext);

  const [socket, setSocket] = useState(null);
  const [newChatMsgObj, setNewChatMsgObj] = useState(null);
  const [newPrivateMsgsObj, setNewPrivateMsgsObj] = useState(null);
  const [newGroupMsgsObj, setNewGroupMsgsObj] = useState(null);

  const [newNotiObj, setNewNotiObj] = useState(null);
  const [newNotiFollowReplyObj, setNewNotiFollowReplyObj] = useState(null);
  const [newNotiJoinReplyObj, setNewNotiJoinReplyObj] = useState(null);
  const [newNotiInvitationReplyObj, setNewNotiInvitationReplyObj] = useState(null);

  const [newOnlineStatusObj, setNewOnlineStatusObj] = useState(false);

  const currUserId = localStorage.getItem('user_id');

  const usersCtx = useContext(UsersContext);

  useEffect(() => {
    const newSocket = new WebSocket('ws://localhost:8080/ws');

    newSocket.onopen = () => {
      console.log('ws connected');
      setSocket(newSocket);
      sendWsReadyMessage(newSocket);
    };

    newSocket.onclose = () => {
      console.log('bye ws');
      setSocket(null);
    };

    newSocket.onerror = (err) => console.log('ws error');

    newSocket.onmessage = (message) => console.log(message);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (e) => {
      const combinedMsgObj = JSON.parse(e.data);

      if (combinedMsgObj.messages && Array.isArray(combinedMsgObj.messages)) {
        combinedMsgObj.messages.forEach((msgObj) => {
          console.log('New ws msg: ', msgObj)

          switch (msgObj.type) {
            case ('followRequest'):
              setNewNotiObj({
                id: 'follow_req_' + msgObj.payload.id, //Using source userID as id/key, because it's always unique
                type: 'follow-req',
                sourceid: msgObj.payload.id,
                targetid: Number(currUserId),
              });
              break;

            case ('onlineUsersList'):
              if (msgObj.payload !== null) {
                let onlineIds = [];
                msgObj.payload.forEach((userData) => onlineIds.push(userData.id))
                setNewOnlineStatusObj({onlineUserIds: onlineIds});
              }
              break;

            case ('userOnline'):
              setNewOnlineStatusObj({userOnline: msgObj.payload.id});
              break;

            case ('userOffline'):
              setNewOnlineStatusObj({userOffline: msgObj.payload.id});
              break;

            case ('chatMessages'):
              msgObj.payload.forEach((message) => {
                if (isMessageForCurrentChat(message, currentChat)) {
                  setNewChatMsgObj(message);
                } else {
                  setNewNotiObj({
                    id: 'chat_msg_' + message.id,
                    type: 'chat-msg',
                    sourceid: message.sender_id,
                    targetid: Number(currUserId),
                  }); 
                }
              });
              sendChatMessagesReply(msgObj.payload);
              break;

            default: 
              console.log('Received unknown type ws message');
              break;
          }
        });
      };
    };

    socket.addEventListener('message', handleMessage);

    return () => {
      socket.removeEventListener('message', handleMessage);
    };

  }, [currentChat, socket]);

  const isMessageForCurrentChat = (message, currentChat) => {
    return (message.group_chat === currentChat.groupChat) && 
           (message.group_chat ? message.group_id === currentChat.recipientId 
                               : message.sender_id === currentChat.recipientId);
  };

  const sendChatMessagesReply = (receivedMessages) => {
    const replyMsg = {
      type: "chatMessagesReply",
      payload: receivedMessages
    };
    socket.send(JSON.stringify(replyMsg));
  }

  const sendWsReadyMessage = (socket) => { // To notify server that ready to receive ws messages
    socket.send(JSON.stringify({type: "readyForWsMessages"}));
  }

  return (
    <WebSocketContext.Provider
      value={{
        websocket: socket,
        newChatMsgObj: newChatMsgObj,
        setNewChatMsgObj: setNewChatMsgObj,
        newPrivateMsgsObj: newPrivateMsgsObj,
        setNewPrivateMsgsObj: setNewPrivateMsgsObj,
        newGroupMsgsObj: newGroupMsgsObj,
        setNewGroupMsgsObj: setNewGroupMsgsObj,
        newNotiObj: newNotiObj,
        setNewNotiObj: setNewNotiObj,
        newNotiFollowReplyObj: newNotiFollowReplyObj,
        setNewNotiFollowReplyObj: setNewNotiFollowReplyObj,
        newNotiJoinReplyObj: newNotiJoinReplyObj,
        setNewNotiJoinReplyObj: setNewNotiJoinReplyObj,
        newNotiInvitationReplyObj: newNotiInvitationReplyObj,
        setNewNotiInvitationReplyObj: setNewNotiInvitationReplyObj,
        newOnlineStatusObj: newOnlineStatusObj,
        setNewOnlineStatusObj: setNewOnlineStatusObj,
      }}
    >
      {props.children}
    </WebSocketContext.Provider>
  );
};
