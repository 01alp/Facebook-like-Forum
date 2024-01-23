import React, { useContext } from 'react';
import useOnlineStatus from '../hooks/useOnlineStatus';
import { ChatContext } from '../store/chat-context';

function UserContactItem({ user }) {
  const { currentChat, handleChatSelect } = useContext(ChatContext);
  const isUserOnline = useOnlineStatus(user.id);
  const isCurrentChat = !currentChat.groupChat && currentChat.recipientId === user.id;

  const handleClick = () => {
    if (!isCurrentChat) {
      handleChatSelect(user.id, user.fname, false);
    }
  };
  
  return (
    <div
    className="d-flex d-lg-flex align-items-lg-center"
    onClick={handleClick}
    style={{
      padding: 5,
      margin: 5,
      boxShadow: '3px 3px 5px 5px var(--bs-body-color)',
      marginBottom: 10,
      width: 250,
      cursor: isCurrentChat ? 'default' : 'pointer',
      color: isCurrentChat ? 'var(--bs-body-bg)' : 'black',
      background: isCurrentChat ? 'rgb(40 130 260)' : 'var(--bs-body-bg)',
    }}
  >
  {/* Start: Online */}
  <div>
    <span style={{ marginRight: 5 }}>{isUserOnline ? '🟢' : '⚪'}</span>
    {/* {isCurrentChat && (
      <span className="flash animated" style={{ marginRight: 3 }}>
        💬
      </span>
    )} */}
  </div>
  {/* End: Online */}
  {/* Start: Avatar */}
  <div>
    <img className="rounded-circle" alt="" src={user.avatar} style={{ width: 32, marginRight: 5 }} />
  </div>
  {/* End: Avatar */}
  <div>
    <span>{user.fname}</span>
  </div>
  </div>
  )
}

export default UserContactItem;