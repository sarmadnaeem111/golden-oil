import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../firebase/config';

// Secret admin credentials (hardcoded for demonstration)
const ADMIN_EMAIL = "admin@goldenoil.com";
const ADMIN_PASSWORD = "admin123!";

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      return setError('Please fill in all fields');
    }
    
    try {
      setError('');
      setLoading(true);
      
      // Check if using secret admin credentials
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        try {
          // Check if admin account exists
          let userCredential;
          try {
            // Try to sign in with admin credentials
            userCredential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
          } catch (err) {
            // If admin doesn't exist, create the admin account
            userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
            
            // Set user as admin in database
            await setDoc(doc(db, 'users', userCredential.user.uid), {
              email: ADMIN_EMAIL,
              displayName: 'System Administrator',
              role: 'admin',
              createdAt: new Date().toISOString()
            });
          }
          
          // Check if user has admin role
          const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
          if (!userDoc.exists() || userDoc.data().role !== 'admin') {
            // Update to admin role if not set
            await setDoc(doc(db, 'users', userCredential.user.uid), {
              email: ADMIN_EMAIL,
              displayName: 'System Administrator',
              role: 'admin',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }, { merge: true });
          }
          
          navigate('/admin');
          return;
        } catch (err) {
          console.error("Error with admin credentials:", err);
          setError("Error accessing admin account. Please try again.");
          setLoading(false);
          return;
        }
      }
      
      // Regular admin login flow
      await adminLogin(email, password);
      navigate('/admin');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Admin Login</h2>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-4" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>
                
                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Logging in...
                    </>
                  ) : (
                    'Log In as Admin'
                  )}
                </Button>
              </Form>
              
              <div className="text-center mt-3">
                <Button 
                  variant="link" 
                  onClick={() => navigate('/')}
                  className="text-decoration-none"
                >
                  Return to Store
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminLogin; 