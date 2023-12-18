import React, { createContext, useState } from 'react';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [currentChat, setCurrentChat] = useState({ recipientId: null, groupChat: null });

  const handleChatSelect = (recipientId, groupChat) => {
    setCurrentChat({ recipientId, groupChat });
  };

  return (
      <ChatContext.Provider value={{ currentChat, handleChatSelect }}>
          {children}
      </ChatContext.Provider>
  );
};
