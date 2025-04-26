import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import ChatButton from './ChatButton';
import ChatWindow from './ChatWindow';
import AdminChatManager from './AdminChatManager';

const ChatSystem = () => {
  const { currentUser, isAdmin } = useAuth();
  const { isOpen, unreadCount } = useChat();

  if (!currentUser) return null;

  return (
    <>
      {/* Chat Button (shown when chat is closed) */}
      <ChatButton />
      
      {/* Badge for unread messages */}
      {!isOpen && unreadCount > 0 && (
        <div className="chat-badge">{unreadCount}</div>
      )}
      
      {/* Chat Window for regular users */}
      {isOpen && !isAdmin && <ChatWindow />}
      
      {/* Admin Chat Manager for admins */}
      {isOpen && isAdmin && <AdminChatManager />}
    </>
  );
};

export default ChatSystem; 