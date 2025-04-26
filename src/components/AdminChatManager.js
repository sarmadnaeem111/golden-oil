import React, { useState, useEffect } from 'react';
import { Tab, Nav, Badge, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  doc,
  updateDoc 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import ChatWindow from './ChatWindow';

const AdminChatManager = () => {
  const { currentUser, isAdmin } = useAuth();
  const { isOpen, closeChat } = useChat();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  
  // Load all chats for the admin
  useEffect(() => {
    if (!isAdmin || !currentUser || !isOpen) return;
    
    // Query for all chats - admins can see all chats
    const allChatsQuery = query(
      collection(db, 'chats'),
      orderBy('lastMessageTime', 'desc')
    );
    
    const unsubscribe = onSnapshot(allChatsQuery, (snapshot) => {
      const chatList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastMessageTime: doc.data().lastMessageTime?.toDate() // Convert to JS Date
      }));
      
      setChats(chatList);
      setLoading(false);
      
      // Set active chat if none is selected
      if (chatList.length > 0 && !activeChat) {
        setActiveChat(chatList[0].id);
      }
    });
    
    return unsubscribe;
  }, [currentUser, isAdmin, isOpen]);
  
  // Mark active chat as read when admin selects it
  useEffect(() => {
    if (!activeChat || !isAdmin) return;
    
    const markChatAsRead = async () => {
      try {
        const chatRef = doc(db, 'chats', activeChat);
        await updateDoc(chatRef, {
          unreadAdmin: 0
        });
      } catch (error) {
        console.error('Error marking chat as read:', error);
      }
    };
    
    markChatAsRead();
  }, [activeChat, isAdmin]);
  
  // Format last message time
  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const messageDate = new Date(timestamp);
    
    // If today, show time
    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this year, show month and day
    if (messageDate.getFullYear() === now.getFullYear()) {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Otherwise show full date
    return messageDate.toLocaleDateString();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="admin-chat-window">
      <div className="chat-header">
        <h5>Admin Chat Manager</h5>
        <button className="chat-close-btn" onClick={closeChat}>
          <i className="bi bi-x-lg"></i>
        </button>
      </div>
      
      <div className="admin-chat-container">
        {loading ? (
          <div className="text-center p-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading chats...</p>
          </div>
        ) : (
          <Tab.Container 
            id="chat-list" 
            activeKey={activeChat || 'empty'} 
            onSelect={(k) => k !== 'empty' && setActiveChat(k)}
          >
            <div className="chat-sidebar">
              <h6 className="chat-sidebar-title">Customer Conversations</h6>
              {chats.length === 0 ? (
                <div className="text-center p-3 text-muted">
                  <p>No active customer chats</p>
                </div>
              ) : (
                <Nav variant="pills" className="flex-column chat-list">
                  {chats.map(chat => (
                    <Nav.Item key={chat.id}>
                      <Nav.Link 
                        eventKey={chat.id} 
                        className="chat-list-item"
                      >
                        <div className="chat-item-user">
                          <div className="chat-avatar">
                            <i className="bi bi-person-circle"></i>
                          </div>
                          <div className="chat-user-info">
                            <div className="chat-username">
                              {chat.userEmail?.split('@')[0] || 'Customer'}
                            </div>
                            <div className="chat-last-message">
                              {chat.lastMessage || 'New conversation'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="chat-item-meta">
                          <div className="chat-time">
                            {formatLastMessageTime(chat.lastMessageTime)}
                          </div>
                          {chat.unreadAdmin > 0 && (
                            <Badge bg="danger" pill>
                              {chat.unreadAdmin}
                            </Badge>
                          )}
                        </div>
                      </Nav.Link>
                    </Nav.Item>
                  ))}
                </Nav>
              )}
            </div>
            
            <div className="chat-content">
              <Tab.Content>
                {chats.length === 0 ? (
                  <div className="text-center p-5 text-muted">
                    <i className="bi bi-chat-square-text display-4"></i>
                    <p className="mt-3">No conversations yet</p>
                    <p className="small">When customers start chatting, their messages will appear here.</p>
                  </div>
                ) : (
                  <>
                    {activeChat ? (
                      <Tab.Pane eventKey={activeChat}>
                        <ChatWindow chatId={activeChat} />
                      </Tab.Pane>
                    ) : (
                      <div className="text-center p-5 text-muted">
                        <p>Select a conversation to view messages</p>
                      </div>
                    )}
                  </>
                )}
              </Tab.Content>
            </div>
          </Tab.Container>
        )}
      </div>
    </div>
  );
};

export default AdminChatManager; 