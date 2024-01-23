import React, { useState, useEffect, useContext } from 'react';
import { UsersContext } from './users-context';
import { ChatContext } from './chat-context';

export const WebSocketContext = React.createContext({
  websocket: null,
  newPrivateMsgsObj: null,
  setNewPrivateMsgsObj: () => { },
  newGroupMsgsObj: null,
  setNewGroupMsgsObj: () => { },
  newNotiObj: null,
  setNewNotiObj: () => { },
  newNotiFollowReplyObj: null,
  setNewNotiFollowReplyObj: () => { },
  newNotiJoinReplyObj: null,
  setNewNotiJoinReplyObj: () => { },
  newNotiInvitationReplyObj: null,
  setNewNotiInvitationReplyObj: () => { },
  onlineUsers: [],
  setOnlineUsers: () => { },
  newGroupObj: null,
  setnewGroupObj: () => { },
});

export const WebSocketContextProvider = (props) => {
  const { currentChat } = useContext(ChatContext);
  const { updateUserInList } = useContext(UsersContext);

  const [socket, setSocket] = useState(null);
  const [newChatMsgObj, setNewChatMsgObj] = useState(null);
  const [newPrivateMsgsObj, setNewPrivateMsgsObj] = useState(null);
  const [newGroupMsgsObj, setNewGroupMsgsObj] = useState(null);

  const [newNotiObj, setNewNotiObj] = useState(null);
  const [newNotiFollowReplyObj, setNewNotiFollowReplyObj] = useState(null);
  const [newNotiJoinReplyObj, setNewNotiJoinReplyObj] = useState(null);
  const [newNotiInvitationReplyObj, setNewNotiInvitationReplyObj] = useState(null);

  const [followRequestResult, setFollowRequestResult] = useState(null);

  const [onlineUsers, setOnlineUsers] = useState(new Set());

  const currUserId = localStorage.getItem('user_id');

  useEffect(() => {
    const newSocket = new WebSocket('ws://localhost:8080/ws');

    newSocket.onopen = () => {
      console.log('ws connected');
      setSocket(newSocket);
    };

    newSocket.onclose = () => {
      console.log('bye ws');
      setSocket(null);
    };

    newSocket.onerror = (err) => console.log('ws error');

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.onmessage = (message) => handleIncomingMessage(message);
      sendWsReadyMessage(socket);
    }
  }, [socket]);

  const handleIncomingMessage = (message) => {
    const combinedMsgObj = JSON.parse(message.data);

    if (combinedMsgObj.messages && Array.isArray(combinedMsgObj.messages)) {
      combinedMsgObj.messages.forEach((msgObj) => {
        console.log('New ws msg: ', msgObj);

        switch (msgObj.type) {
          case ('followRequest'):
            setNewNotiObj({
              id: 'follow_req_' + msgObj.payload.id, //Using source userID as id/key, because it's always unique
              type: 'follow-req',
              sourceid: msgObj.payload.id,
              targetid: Number(currUserId),
            });
            break;
          case ('followRequestResult'):
            if (msgObj.payload.accepted) {
              updateUserInList(msgObj.payload.userdata);
            };
            setFollowRequestResult({ userId: msgObj.payload.requestedid, status: msgObj.payload.accepted });
            break;
          case ('onlineUsersList'):
            if (msgObj.payload !== null) {
              setOnlineUsers(new Set(msgObj.payload.map(userData => userData.id)));
            }
            break;

          case ('userOnline'):
            console.log("User came online: ", msgObj.payload);
            setOnlineUsers(prevOnlineUsers => new Set([...prevOnlineUsers, msgObj.payload.id]));
            break;

          case ('userOffline'):
            setOnlineUsers(prevOnlineUsers => {
              const newOnlineUsers = new Set(prevOnlineUsers);
              newOnlineUsers.delete(msgObj.payload.id);
              return newOnlineUsers;
            });
            break;

          case ('chatMessages'):
            msgObj.payload.forEach((message) => {
              console.log("New message received: ", message);
              if (isMessageForCurrentChat(message, currentChat)) {
                setNewChatMsgObj(message);
              } else if (!message.group_chat) {
                setNewNotiObj({
                  id: 'private_chat_msg_' + message.id,
                  type: 'private-chat-msg',
                  sourceid: message.sender_id,
                  targetid: Number(currUserId),
                });
              } else {
                setNewNotiObj({
                  id: 'group_chat_msg_' + message.id,
                  type: 'group-chat-msg',
                  sourceid: message.sender_id,
                  targetid: Number(currUserId),
                  groupid: message.group_id,
                  groupname: message.group_name,
                });
              }
            });
            sendChatMessagesReply(msgObj.payload);
            break;
          case ('newGroupRequest'):
            setNewNotiObj({
              id: 'new_group_request' + msgObj.payload.id,
              type: 'new_group_request',
              groupPayload: msgObj.payload,
              sourceid: Number(currUserId),
              targetid: Number(msgObj.payload.creatorid),
            });

            break;
          default:
            console.log('Received unknown type ws message');
            break;
        }
      });
    };
  };

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
  };

  const sendWsReadyMessage = (socket) => { // To notify server that ready to receive ws messages
    socket.send(JSON.stringify({ type: "readyForWsMessages" }));
  };

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
        followRequestResult: followRequestResult,
        setFollowRequestResult: setFollowRequestResult,
        onlineUsers: onlineUsers,
        setOnlineUsers: setOnlineUsers,
      }}
    >
      {props.children}
    </WebSocketContext.Provider>
  );
};
