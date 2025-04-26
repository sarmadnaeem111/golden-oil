import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children, user }) => {
  // Use the user passed in props or from AuthContext
  const { currentUser, userRole, isAdmin } = useAuth();
  const authenticatedUser = user || currentUser;

  if (!authenticatedUser) {
    // User is not authenticated, redirect to admin login
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    // User is authenticated but not an admin, redirect to home
    return <Navigate to="/" replace />;
  }

  // User is authenticated and is an admin, render the protected component
  return children;
};

export default AdminRoute; 