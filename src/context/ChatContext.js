import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { collection, query, where, getDocs, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const { currentUser, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Listen for unread messages
  useEffect(() => {
    if (!currentUser) {
      setUnreadCount(0);
      return;
    }
    
    const fetchUnreadCount = async () => {
      try {
        if (isAdmin) {
          // For admins, count all chats with unread messages
          const adminChatsQuery = query(
            collection(db, 'chats')
          );
          
          const unsubscribe = onSnapshot(adminChatsQuery, (snapshot) => {
            let count = 0;
            snapshot.docs.forEach(doc => {
              count += doc.data().unreadAdmin || 0;
            });
            setUnreadCount(count);
          });
          
          return unsubscribe;
        } else {
          // For customers, count unread messages in their chats
          const userChatsQuery = query(
            collection(db, 'chats'),
            where('userId', '==', currentUser.uid)
          );
          
          const querySnapshot = await getDocs(userChatsQuery);
          
          if (!querySnapshot.empty) {
            const chatDoc = querySnapshot.docs[0];
            const chatId = chatDoc.id;
            
            const unsubscribe = onSnapshot(doc(db, 'chats', chatId), (doc) => {
              if (doc.exists()) {
                setUnreadCount(doc.data().unreadCustomer || 0);
              }
            });
            
            return unsubscribe;
          }
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };
    
    const unsubscribe = fetchUnreadCount();
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [currentUser, isAdmin]);
  
  // Open chat window
  const openChat = () => {
    setIsOpen(true);
  };
  
  // Close chat window
  const closeChat = () => {
    setIsOpen(false);
  };
  
  // Toggle chat window
  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };
  
  const value = {
    isOpen,
    openChat,
    closeChat,
    toggleChat,
    unreadCount
  };
  
  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext; 