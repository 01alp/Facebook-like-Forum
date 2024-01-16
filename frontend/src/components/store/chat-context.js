import React, { createContext, useState, useCallback } from 'react';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [currentChat, setCurrentChat] = useState({ recipientId: null, recipientName: "", groupChat: null });

  const handleChatSelect = useCallback((recipientId, recipientName, groupChat) => {
    setCurrentChat({ recipientId, recipientName, groupChat });
  }, []);

  return (
      <ChatContext.Provider value={{ currentChat, handleChatSelect }}>
          {children}
      </ChatContext.Provider>
  );
};
