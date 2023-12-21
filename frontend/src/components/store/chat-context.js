import React, { createContext, useState, useCallback } from 'react';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [currentChat, setCurrentChat] = useState({ recipientId: null, groupChat: null });

  const handleChatSelect = useCallback((recipientId, groupChat) => {
    setCurrentChat({ recipientId, groupChat });
  }, []);

  return (
      <ChatContext.Provider value={{ currentChat, handleChatSelect }}>
          {children}
      </ChatContext.Provider>
  );
};
