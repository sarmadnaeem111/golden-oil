import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, user }) => {
  // Use the user passed in props or from AuthContext
  const { currentUser } = useAuth();
  const authenticatedUser = user || currentUser;

  if (!authenticatedUser) {
    // User is not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render the protected component
  return children;
};

export default ProtectedRoute; 