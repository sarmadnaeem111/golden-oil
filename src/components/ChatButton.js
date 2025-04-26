import React from 'react';
import { useChat } from '../context/ChatContext';

const ChatButton = () => {
  const { openChat, isOpen } = useChat();

  return (
    <div 
      className="chat-button"
      onClick={openChat}
    >
      {!isOpen && (
        <div className="chat-button-icon">
          {/* The icon is applied via CSS background-image */}
        </div>
      )}
    </div>
  );
};

export default ChatButton; 