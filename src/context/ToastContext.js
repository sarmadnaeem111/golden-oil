import React, { createContext, useContext, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // Add a new toast
  const showToast = (message, variant = 'success', autoHide = true, delay = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, variant, autoHide, delay }]);
    return id;
  };

  // Remove a toast by id
  const hideToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const value = {
    showToast,
    hideToast
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer 
        position="bottom-end" 
        className="p-3" 
        style={{ zIndex: 1070 }}
      >
        {toasts.map(toast => (
          <Toast 
            key={toast.id} 
            onClose={() => hideToast(toast.id)} 
            show={true} 
            delay={toast.delay} 
            autohide={toast.autoHide}
            bg={toast.variant}
            className="text-white"
          >
            <Toast.Header closeButton>
              <strong className="me-auto">
                {toast.variant === 'success' ? '✓ Success' : 
                 toast.variant === 'danger' ? '✗ Error' : 
                 toast.variant === 'warning' ? '⚠ Warning' : 'Notification'}
              </strong>
            </Toast.Header>
            <Toast.Body>{toast.message}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
} 