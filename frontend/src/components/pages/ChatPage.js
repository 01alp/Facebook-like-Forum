import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Helmet } from 'react-helmet';
import ContactList from '../chat/ContactList';
import ChatWindow from '../chat/ChatWindow';
import { ChatContext } from '../store/chat-context';

const ChatPage = () => {
  const { currentChat, handleChatSelect } = useContext(ChatContext);
  const [ chatTitle, setChatTitle] = useState("Chat")

  useEffect(() => {
    if (currentChat.recipientId) {
      if (!currentChat.groupChat) {
        setChatTitle("Chat - " + currentChat.recipientName);
      } else {
        setChatTitle("Group chat - " + currentChat.recipientName);
      }
    } else {
      setChatTitle("Chat");
    };
  }, [currentChat])

  useEffect(() => { // Set currentChat to null when navigating away from chat page
    return () => {
      handleChatSelect(null, "", null);
    };
  }, [handleChatSelect]);

  return (
    <>
      <Helmet>
        <title>Chat</title>
      </Helmet>
      <div className="container-fluid">
        <h3 className="text-dark mb-3" style={{ textAlign: 'center' }}>
          {chatTitle}
        </h3>
        <div>
          <div>
            <div className="tab-content">
              <div className="tab-pane fade show active" role="tabpanel" id="tab-1">
                <div className="d-flex flex-wrap">
                  <ContactList />
                  <ChatWindow />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatPage;
