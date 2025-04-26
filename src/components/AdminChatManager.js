import React, { useState, useEffect } from 'react';
import { Tab, Nav, Badge, Spinner, Button, Modal } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDocs 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import ChatWindow from './ChatWindow';

const AdminChatManager = () => {
  const { currentUser, isAdmin } = useAuth();
  const { isOpen, closeChat } = useChat();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
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
  
  // Handle chat deletion confirmation
  const handleDeleteConfirm = (chatId) => {
    setChatToDelete(chatId);
    setShowDeleteModal(true);
  };
  
  // Delete chat and all its messages
  const deleteChat = async () => {
    if (!chatToDelete) return;
    
    setDeleting(true);
    try {
      // 1. First delete all messages in the chat
      const messagesRef = collection(db, 'chats', chatToDelete, 'messages');
      const messagesSnapshot = await getDocs(messagesRef);
      
      const deletePromises = messagesSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      
      await Promise.all(deletePromises);
      
      // 2. Delete the chat document itself
      await deleteDoc(doc(db, 'chats', chatToDelete));
      
      // 3. If the deleted chat was the active one, reset active chat
      if (activeChat === chatToDelete) {
        setActiveChat(null);
      }
      
      setShowDeleteModal(false);
      setChatToDelete(null);
    } catch (error) {
      console.error('Error deleting chat:', error);
    } finally {
      setDeleting(false);
    }
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
                          <Button 
                            variant="danger" 
                            size="sm" 
                            className="mt-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteConfirm(chat.id);
                            }}
                            style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem' }}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
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
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header className={`bg-danger text-white`}>
          <Modal.Title>Delete Chat</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this chat? This action cannot be undone and will permanently delete all messages.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={deleteChat} 
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Deleting...</span>
              </>
            ) : 'Delete Chat'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminChatManager; 
