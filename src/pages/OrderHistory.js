import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getOrdersByUserId } from '../firebase/orderService';

const OrderHistory = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [newOrderId, setNewOrderId] = useState(null);

  useEffect(() => {
    // Check if redirected from checkout with successful order
    if (location.state?.orderSuccess) {
      setOrderSuccess(true);
      setNewOrderId(location.state.orderId);
      
      // Clear the location state
      window.history.replaceState({}, document.title);
    }
    
    fetchOrders();
  }, [location, currentUser]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      const ordersData = await getOrdersByUserId(currentUser.uid);
      setOrders(ordersData);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'processing':
        return <Badge bg="info">Processing</Badge>;
      case 'shipped':
        return <Badge bg="primary">Shipped</Badge>;
      case 'delivered':
        return <Badge bg="success">Delivered</Badge>;
      case 'cancelled':
        return <Badge bg="danger">Cancelled</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Container className="py-5">
      <h1 className="mb-4">Order History</h1>
      
      {orderSuccess && (
        <Alert variant="success" className="mb-4" dismissible onClose={() => setOrderSuccess(false)}>
          <Alert.Heading>Order Placed Successfully!</Alert.Heading>
          <p>
            Your order has been placed successfully. Order ID: <strong>{newOrderId}</strong>
          </p>
        </Alert>
      )}
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : orders.length > 0 ? (
        <>
          {orders.map(order => (
            <Card key={order.id} className="mb-4 shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>Order ID:</strong> {order.id}
                </div>
                <div>
                  {getStatusBadge(order.status)}
                </div>
              </Card.Header>
              
              <Card.Body>
                <Row className="mb-3">
                  <Col md={6}>
                    <p className="mb-1"><strong>Date:</strong> {formatDate(order.createdAt)}</p>
                    <p className="mb-1"><strong>Total:</strong> ₹{order.total.toFixed(2)}</p>
                  </Col>
                  <Col md={6}>
                    <p className="mb-1"><strong>Shipping Address:</strong></p>
                    <p className="text-muted">
                      {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}
                    </p>
                  </Col>
                </Row>
                
                <h5 className="mb-3">Items</h5>
                <Table responsive striped size="sm">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => (
                      <tr key={`${order.id}-${item.id || index}`}>
                        <td>{item.name}</td>
                        <td>₹{item.price.toFixed(2)}</td>
                        <td>{item.quantity}</td>
                        <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
              
              <Card.Footer className="bg-white text-end">
                <Button variant="outline-primary" size="sm">
                  View Details
                </Button>
              </Card.Footer>
            </Card>
          ))}
        </>
      ) : (
        <Alert variant="info">
          You don't have any orders yet. Start shopping to place your first order!
        </Alert>
      )}
    </Container>
  );
};

export default OrderHistory; 
