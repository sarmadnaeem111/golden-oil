import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  Timestamp,
  doc,
  getDoc,
  updateDoc,
  getDocs,
  increment
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { uploadToCloudinary } from '../config/cloudinaryConfig';

const ChatWindow = ({ chatId: propChatId }) => {
  const { currentUser, isAdmin } = useAuth();
  const { isOpen, closeChat } = useChat();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [imageUpload, setImageUpload] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [chatId, setChatId] = useState(propChatId || null);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // If chatId is passed as prop, use it directly
  useEffect(() => {
    if (propChatId) {
      setChatId(propChatId);
    }
  }, [propChatId]);

  // Find or create a chat for the current user
  useEffect(() => {
    if (!currentUser || !isOpen) return;
    
    // If chatId is already set from props, load messages for that chat
    if (propChatId) {
      loadMessages(propChatId);
      return;
    }

    const findOrCreateChat = async () => {
      setLoading(true);
      try {
        // If admin and no specific chat is provided, we need to handle showing a list of chats
        if (isAdmin && !propChatId) {
          // Just load admin messages for now - handled by AdminChatManager
          setMessages([]);
          setLoading(false);
          return;
        } else {
          // For customers, find their chat or create a new one
          const userChatsQuery = query(
            collection(db, 'chats'),
            where('userId', '==', currentUser.uid)
          );
          
          const querySnapshot = await getDocs(userChatsQuery);
          
          if (!querySnapshot.empty) {
            // Use existing chat
            const chatDoc = querySnapshot.docs[0];
            setChatId(chatDoc.id);
            loadMessages(chatDoc.id);
          } else {
            // Create a new chat
            const newChatRef = await addDoc(collection(db, 'chats'), {
              userId: currentUser.uid,
              userEmail: currentUser.email,
              adminId: null, // Will be assigned when an admin responds
              createdAt: serverTimestamp(),
              lastMessageTime: serverTimestamp(),
              lastMessage: 'Chat started',
              unreadCustomer: 0,
              unreadAdmin: 1 // Notify admins of new chat
            });
            
            setChatId(newChatRef.id);
            setMessages([]);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error finding or creating chat:', error);
        setLoading(false);
      }
    };

    findOrCreateChat();
  }, [currentUser, isOpen, isAdmin, propChatId]);

  // Load messages for a specific chat
  const loadMessages = (chatIdentifier) => {
    if (!chatIdentifier) return;

    const messagesQuery = query(
      collection(db, 'chats', chatIdentifier, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messageList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() // Convert Firestore timestamp to JS Date
      }));
      
      setMessages(messageList);
      setLoading(false);
      
      // Mark messages as read
      markMessagesAsRead(chatIdentifier);
      
      // Scroll to bottom after messages load
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    });

    return unsubscribe;
  };

  // Mark messages as read
  const markMessagesAsRead = async (chatIdentifier) => {
    if (!chatIdentifier || !currentUser) return;
    
    try {
      const chatRef = doc(db, 'chats', chatIdentifier);
      
      // Update the unread counter based on user type
      if (isAdmin) {
        await updateDoc(chatRef, {
          unreadAdmin: 0
        });
      } else {
        await updateDoc(chatRef, {
          unreadCustomer: 0
        });
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    
    if ((!message.trim() && !imageUpload) || !chatId || !currentUser) return;
    
    setSending(true);
    
    try {
      let imageUrl = null;
      
      // Upload image if selected
      if (imageUpload) {
        try {
          // Use Cloudinary for image upload instead of Firebase Storage
          imageUrl = await uploadToCloudinary(imageUpload, (progress) => {
            setUploadProgress(progress);
          });
        } catch (error) {
          console.error('Error uploading image to Cloudinary:', error);
        }
      }
      
      // Add message to subcollection
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        sender: currentUser.uid,
        senderEmail: currentUser.email,
        isAdmin: isAdmin,
        text: message.trim(),
        imageUrl: imageUrl,
        timestamp: serverTimestamp()
      });
      
      // Update the chat document with last message info
      const chatRef = doc(db, 'chats', chatId);
      
      await updateDoc(chatRef, {
        lastMessage: message.trim() || 'Image shared',
        lastMessageTime: serverTimestamp(),
        lastMessageSender: currentUser.uid,
        // Increment unread counter for the other party
        ...(isAdmin 
          ? { unreadCustomer: increment(1) } 
          : { unreadAdmin: increment(1) })
      });
      
      // If admin is responding for the first time, assign them to the chat
      if (isAdmin) {
        const chatDoc = await getDoc(chatRef);
        if (!chatDoc.data().adminId) {
          await updateDoc(chatRef, {
            adminId: currentUser.uid,
            adminEmail: currentUser.email
          });
        }
      }
      
      // Clear the form
      setMessage('');
      setImageUpload(null);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file size (max 5MB)
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      alert('Image size exceeds the 5MB limit. Please select a smaller image.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    // Validate file type (only images)
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    setImageUpload(file);
  };

  // Clear selected image
  const clearSelectedImage = () => {
    setImageUpload(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date for message groups
  const formatMessageDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = {};
    
    messages.forEach(message => {
      if (!message.timestamp) return;
      
      const dateKey = formatMessageDate(message.timestamp);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      
      groups[dateKey].push(message);
    });
    
    return groups;
  };

  // Show image in full screen or larger view
  const viewImageInLargeFormat = (imageUrl) => {
    // For Cloudinary images, we can use transformations to get a better viewing experience
    let optimizedUrl = imageUrl;
    
    // If it's a Cloudinary URL, apply quality transformations
    if (imageUrl && imageUrl.includes('cloudinary.com')) {
      // Extract base URL and add transformation for better viewing
      const urlParts = imageUrl.split('/upload/');
      if (urlParts.length === 2) {
        optimizedUrl = `${urlParts[0]}/upload/q_auto,f_auto,c_limit,w_1200/${urlParts[1]}`;
      }
    }
    
    // Open image in new tab/window
    window.open(optimizedUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h5>Customer Care</h5>
        <button className="chat-close-btn" onClick={closeChat}>
          <i className="bi bi-x-lg"></i>
        </button>
      </div>
      
      <div className="chat-messages">
        {loading ? (
          <div className="text-center p-4">
            <Spinner animation="border" variant="primary" size="sm" />
            <p className="mt-2 small">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center p-4 text-muted">
            <i className="bi bi-chat-dots display-4"></i>
            <p className="mt-3">Start a conversation with our customer service team.</p>
          </div>
        ) : (
          // Group messages by date
          Object.entries(groupMessagesByDate()).map(([date, dateMessages]) => (
            <div key={date}>
              <div className="message-date-divider">
                <span>{date}</span>
              </div>
              
              {dateMessages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`message ${msg.isAdmin ? 'admin-message' : 'user-message'}`}
                >
                  {msg.imageUrl && (
                    <div className="message-image">
                      <img 
                        src={msg.imageUrl} 
                        alt="Shared" 
                        onClick={() => viewImageInLargeFormat(msg.imageUrl)}
                        onLoad={(e) => e.target.classList.add('loaded')}
                      />
                      <div className="image-loading-indicator">
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      </div>
                    </div>
                  )}
                  {msg.text && <div className="message-text">{msg.text}</div>}
                  <div className="message-time">{formatTime(msg.timestamp)}</div>
                </div>
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <Form onSubmit={sendMessage} className="chat-form">
        {imageUpload && (
          <div className="selected-image">
            <div className="image-preview">
              <img src={URL.createObjectURL(imageUpload)} alt="Preview" />
              <button 
                type="button" 
                className="clear-image-btn" 
                onClick={clearSelectedImage}
              >
                <i className="bi bi-x-circle-fill"></i>
              </button>
            </div>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="upload-progress">
                <div 
                  className="progress-bar" 
                  style={{ width: `${uploadProgress}%` }} 
                />
              </div>
            )}
          </div>
        )}
        
        <div className="chat-input-group">
          <Button 
            variant="link" 
            className="attach-btn"
            onClick={() => fileInputRef.current.click()}
            disabled={sending}
            title="Attach Image"
          >
            <i className="bi bi-image"></i>
          </Button>
          
          <Form.Control
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={sending}
          />
          
          <Button 
            type="submit" 
            variant="primary"
            disabled={(!message.trim() && !imageUpload) || sending}
            title="Send Message"
          >
            {sending ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <i className="bi bi-send-fill"></i>
            )}
          </Button>
          
          <Form.Control
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
        </div>
      </Form>
    </div>
  );
};

export default ChatWindow; 