import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Form, Modal, Spinner, Alert, Card, Row, Col, ListGroup } from 'react-bootstrap';
import { getAllOrders, updateOrderStatus } from '../../firebase/orderService';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // New state to track viewport width for responsive display
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Listen for window resize events to detect mobile viewport
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let filtered = orders;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    // Apply payment filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(order => {
        if (paymentFilter === 'cod') {
          return order.paymentMethod === 'Cash on Delivery';
        } else if (paymentFilter === 'card') {
          return order.paymentMethod !== 'Cash on Delivery';
        }
        return true;
      });
    }
    
    setFilteredOrders(filtered);
  }, [statusFilter, paymentFilter, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const ordersData = await getAllOrders();
      setOrders(ordersData);
      setFilteredOrders(ordersData);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handlePaymentFilterChange = (e) => {
    setPaymentFilter(e.target.value);
  };

  const handleViewOrderClick = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowModal(true);
  };

  const handleStatusChange = (e) => {
    setNewStatus(e.target.value);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    
    try {
      setUpdatingStatus(true);
      
      await updateOrderStatus(selectedOrder.id, newStatus);
      
      // Update orders in state
      const updatedOrders = orders.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, status: newStatus } 
          : order
      );
      
      setOrders(updatedOrders);
      setSelectedOrder({ ...selectedOrder, status: newStatus });
      
    } catch (err) {
      console.error('Error updating order status:', err);
      // Handle error here
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
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
    <Container className="py-4">
      <h1 className="mb-4">Order Management</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={6} lg={3}>
              <Form.Group controlId="statusFilter" className="mb-3 mb-lg-0">
                <Form.Label>Filter by Status</Form.Label>
                <Form.Select value={statusFilter} onChange={handleStatusFilterChange}>
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6} lg={3}>
              <Form.Group controlId="paymentFilter" className="mb-3 mb-lg-0">
                <Form.Label>Filter by Payment</Form.Label>
                <Form.Select value={paymentFilter} onChange={handlePaymentFilterChange}>
                  <option value="all">All Payment Methods</option>
                  <option value="cod">Cash on Delivery</option>
                  <option value="card">Credit Card</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6} lg={3} className="text-center">
              <Card className="bg-light border-0">
                <Card.Body className="py-2">
                  <div className="small text-muted mb-1">Total Orders</div>
                  <h4 className="mb-0">{orders.length}</h4>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3} className="text-center">
              <Card className="bg-warning bg-opacity-10 border-0">
                <Card.Body className="py-2">
                  <div className="small text-muted mb-1">Pending Orders</div>
                  <h4 className="mb-0">{orders.filter(order => order.status === 'pending').length}</h4>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : filteredOrders.length > 0 ? (
        <>
          {/* Desktop View */}
          {!isMobile && (
            <Card className="shadow-sm d-none d-md-block">
              <Table responsive hover className="mb-0">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.id}>
                      <td>{order.id.substring(0, 8)}...</td>
                      <td>{order.userName || order.userEmail}</td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>Rs {order.total.toFixed(2)}</td>
                      <td>
                        {order.paymentMethod === 'Cash on Delivery' ? (
                          <Badge bg="success" title="Cash on Delivery">COD</Badge>
                        ) : (
                          <Badge bg="info" title="Credit Card Payment">Card</Badge>
                        )}
                      </td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => handleViewOrderClick(order)}
                        >
                          Manage
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          )}
          
          {/* Mobile View */}
          <div className="d-md-none">
            <ListGroup className="mb-4">
              {filteredOrders.map(order => (
                <ListGroup.Item key={order.id} className="px-3 py-3 mb-2 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 className="mb-0 text-truncate" style={{ maxWidth: '150px' }} title={order.id}>
                        #{order.id.substring(0, 8)}...
                      </h6>
                      <small className="text-muted">{formatDate(order.createdAt)}</small>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                  
                  <div className="mb-2">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Customer:</span>
                      <span className="text-truncate" style={{ maxWidth: '180px' }}>
                        {order.userName || order.userEmail}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span>Total:</span>
                      <strong>Rs {order.total.toFixed(2)}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Payment:</span>
                      {order.paymentMethod === 'Cash on Delivery' ? (
                        <Badge bg="success" title="Cash on Delivery">COD</Badge>
                      ) : (
                        <Badge bg="info" title="Credit Card Payment">Card</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="d-grid">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => handleViewOrderClick(order)}
                    >
                      <i className="bi bi-gear-fill me-1"></i> Manage Order
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        </>
      ) : (
        <Alert variant="info">
          No orders found matching the selected filter.
        </Alert>
      )}
      
      {/* Order Detail Modal */}
      <Modal 
        show={showModal} 
        onHide={handleCloseModal}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Order Details</Modal.Title>
        </Modal.Header>
        
        {selectedOrder && (
          <>
            <Modal.Body>
              <Row className="mb-4">
                <Col md={6}>
                  <h5>Order Information</h5>
                  <p className="mb-1"><strong>Order ID:</strong> {selectedOrder.id}</p>
                  <p className="mb-1"><strong>Date:</strong> {formatDate(selectedOrder.createdAt)}</p>
                  <p className="mb-1"><strong>Status:</strong> {getStatusBadge(selectedOrder.status)}</p>
                  <p className="mb-1"><strong>Total:</strong> Rs {selectedOrder.total.toFixed(2)}</p>
                  <p className="mb-1">
                    <strong>Payment Method:</strong> {selectedOrder.paymentMethod || 'Credit Card'}
                    {selectedOrder.paymentDetails?.lastFour && (
                      <span className="text-muted ms-1">
                        (ending in {selectedOrder.paymentDetails.lastFour})
                      </span>
                    )}
                    {selectedOrder.paymentMethod === 'Cash on Delivery' && (
                      <Badge bg="success" className="ms-2">COD</Badge>
                    )}
                  </p>
                </Col>
                
                <Col md={6}>
                  <h5>Customer Information</h5>
                  <p className="mb-1"><strong>Name:</strong> {selectedOrder.userName || 'N/A'}</p>
                  <p className="mb-1"><strong>Email:</strong> {selectedOrder.userEmail}</p>
                  <p className="mb-1"><strong>Shipping Address:</strong></p>
                  <p className="text-muted">
                    {selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zip}
                  </p>
                </Col>
              </Row>
              
              <h5>Order Items</h5>
              <Table responsive striped>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>Rs {item.price.toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td>Rs {(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              
              <Form.Group controlId="updateStatus" className="mt-4">
                <Form.Label>Update Order Status</Form.Label>
                <Row>
                  <Col sm={8}>
                    <Form.Select value={newStatus} onChange={handleStatusChange}>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </Form.Select>
                  </Col>
                  <Col sm={4}>
                    <Button 
                      variant="primary"
                      className="w-100"
                      onClick={handleUpdateStatus}
                      disabled={updatingStatus || newStatus === selectedOrder.status}
                    >
                      {updatingStatus ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Updating...
                        </>
                      ) : (
                        'Update Status'
                      )}
                    </Button>
                  </Col>
                </Row>
              </Form.Group>
            </Modal.Body>
            
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Close
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </Container>
  );
};

export default OrderManagement; 
