import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import './App.css';

// Customer Components
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import OrderHistory from './pages/OrderHistory';

// Admin Components
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductManagement from './pages/admin/ProductManagement';
import OrderManagement from './pages/admin/OrderManagement';
import CustomerManagement from './pages/admin/CustomerManagement';

// Shared Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import ChatSystem from './components/ChatSystem';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';

// Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="text-center d-flex align-items-center justify-content-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-gold" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <ChatProvider>
        <Router>
          <div className="App d-flex flex-column min-vh-100">
            <Navbar user={user} />
            <main className="flex-grow-1 page-transition" style={{ paddingTop: '76px' }}>
              <Routes>
                {/* Customer Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={
                  <ProtectedRoute user={user}>
                    <Checkout />
                  </ProtectedRoute>
                } />
                <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
                <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
                <Route path="/profile" element={
                  <ProtectedRoute user={user}>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/orders" element={
                  <ProtectedRoute user={user}>
                    <OrderHistory />
                  </ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={
                  <AdminRoute user={user}>
                    <AdminDashboard />
                  </AdminRoute>
                } />
                <Route path="/admin/products" element={
                  <AdminRoute user={user}>
                    <ProductManagement />
                  </AdminRoute>
                } />
                <Route path="/admin/orders" element={
                  <AdminRoute user={user}>
                    <OrderManagement />
                  </AdminRoute>
                } />
                <Route path="/admin/customers" element={
                  <AdminRoute user={user}>
                    <CustomerManagement />
                  </AdminRoute>
                } />
              </Routes>
            </main>
            <Footer />
            <ChatSystem />
          </div>
        </Router>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
