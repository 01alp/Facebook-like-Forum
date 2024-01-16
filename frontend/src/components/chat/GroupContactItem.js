import React, { useContext } from 'react';
import { ChatContext } from '../store/chat-context';

function GroupContactItem({ group }) {
  const { currentChat, handleChatSelect } = useContext(ChatContext);
  const isCurrentChat = currentChat.groupChat && currentChat.recipientId === group.id;

  const handleClick = () => {
    if (!isCurrentChat) {
      handleChatSelect(group.id, group.title, true);
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
  <div>
    <span style={{ marginLeft: 5 }}>{group.title}</span>
  </div>
  </div>
  )
}

export default GroupContactItem;