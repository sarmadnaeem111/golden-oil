import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Form, Modal, Spinner, Alert, Card, Row, Col, Badge } from 'react-bootstrap';
import { collection, getDocs, doc, getDoc, updateDoc, query, where, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [roleUpdating, setRoleUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCustomers(usersData);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleViewCustomerClick = async (customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
    fetchCustomerOrders(customer.id);
  };

  const fetchCustomerOrders = async (customerId) => {
    try {
      setLoadingOrders(true);
      
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('userId', '==', customerId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCustomerOrders(ordersData);
    } catch (err) {
      console.error('Error fetching customer orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleToggleAdminRole = async () => {
    if (!selectedCustomer) return;
    
    try {
      setRoleUpdating(true);
      
      const userRef = doc(db, 'users', selectedCustomer.id);
      const newRole = selectedCustomer.role === 'admin' ? 'customer' : 'admin';
      
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: new Date().toISOString()
      });
      
      // Update customer in state
      const updatedCustomers = customers.map(c => 
        c.id === selectedCustomer.id ? { ...c, role: newRole } : c
      );
      
      setCustomers(updatedCustomers);
      setSelectedCustomer({ ...selectedCustomer, role: newRole });
      
    } catch (err) {
      console.error('Error updating customer role:', err);
    } finally {
      setRoleUpdating(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCustomer(null);
    setCustomerOrders([]);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredCustomers = searchTerm 
    ? customers.filter(customer => 
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (customer.displayName && customer.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : customers;

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = typeof timestamp === 'string' 
      ? new Date(timestamp) 
      : timestamp.toDate ? timestamp.toDate() : new Date();
      
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  // Handle showing delete confirmation modal
  const handleShowDeleteModal = () => {
    setShowDeleteModal(true);
  };

  // Handle hiding delete confirmation modal
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  // Delete customer function
  const deleteCustomer = async () => {
    if (!selectedCustomer) return;
    
    try {
      setDeleting(true);
      
      // Reference to the customer document
      const customerRef = doc(db, 'users', selectedCustomer.id);
      
      // Delete customer document from Firestore
      await deleteDoc(customerRef);
      
      // Update local state to remove the customer
      setCustomers(prevCustomers => 
        prevCustomers.filter(c => c.id !== selectedCustomer.id)
      );
      
      // Close both modals
      setShowDeleteModal(false);
      setShowModal(false);
      setSelectedCustomer(null);
      
    } catch (err) {
      console.error('Error deleting customer:', err);
      setError('Failed to delete customer. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Customer Management</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={8}>
              <Form.Group controlId="searchCustomer">
                <Form.Label>Search Customers</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search by name or email"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </Form.Group>
            </Col>
            <Col md={4} className="text-center">
              <div className="mb-2">Total Customers</div>
              <h3>{customers.length}</h3>
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
      ) : filteredCustomers.length > 0 ? (
        <Card className="shadow-sm">
          <Table responsive hover className="mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Registered</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(customer => (
                <tr key={customer.id}>
                  <td>{customer.displayName || 'N/A'}</td>
                  <td>{customer.email}</td>
                  <td>{formatDate(customer.createdAt)}</td>
                  <td>
                    <Badge bg={customer.role === 'admin' ? 'primary' : 'secondary'}>
                      {customer.role || 'customer'}
                    </Badge>
                  </td>
                  <td>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => handleViewCustomerClick(customer)}
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      ) : (
        <Alert variant="info">
          No customers found matching your search.
        </Alert>
      )}
      
      {/* Customer Detail Modal */}
      <Modal 
        show={showModal} 
        onHide={handleCloseModal}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Customer Details</Modal.Title>
        </Modal.Header>
        
        {selectedCustomer && (
          <>
            <Modal.Body>
              <Row className="mb-4">
                <Col md={6}>
                  <h5>Customer Information</h5>
                  <p className="mb-1"><strong>Name:</strong> {selectedCustomer.displayName || 'N/A'}</p>
                  <p className="mb-1"><strong>Email:</strong> {selectedCustomer.email}</p>
                  <p className="mb-1"><strong>Registered:</strong> {formatDate(selectedCustomer.createdAt)}</p>
                  <p className="mb-1">
                    <strong>Role:</strong>{' '}
                    <Badge bg={selectedCustomer.role === 'admin' ? 'primary' : 'secondary'}>
                      {selectedCustomer.role || 'customer'}
                    </Badge>
                  </p>
                  {selectedCustomer.phone && <p className="mb-1"><strong>Phone:</strong> {selectedCustomer.phone}</p>}
                  {selectedCustomer.address && (
                    <p className="mb-1">
                      <strong>Address:</strong> <span className="text-muted">{selectedCustomer.address}</span>
                    </p>
                  )}
                </Col>
                
                <Col md={6}>
                  <h5>Account Actions</h5>
                  <Button
                    variant={selectedCustomer.role === 'admin' ? 'outline-danger' : 'outline-primary'}
                    className="mb-2 w-100"
                    onClick={handleToggleAdminRole}
                    disabled={roleUpdating}
                  >
                    {roleUpdating ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Updating...
                      </>
                    ) : (
                      selectedCustomer.role === 'admin' 
                        ? 'Remove Admin Privileges' 
                        : 'Grant Admin Privileges'
                    )}
                  </Button>
                  
                  {/* Add Delete Customer Button */}
                  <Button
                    variant="danger"
                    className="w-100"
                    onClick={handleShowDeleteModal}
                    disabled={selectedCustomer.role === 'admin'}
                  >
                    <i className="bi bi-trash me-2"></i>
                    Remove Customer
                  </Button>
                </Col>
              </Row>
              
              <h5 className="mb-3">Order History</h5>
              
              {loadingOrders ? (
                <div className="text-center my-3">
                  <Spinner animation="border" size="sm" />
                </div>
              ) : customerOrders.length > 0 ? (
                <Table responsive striped size="sm">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerOrders.map(order => (
                      <tr key={order.id}>
                        <td>{order.id.substring(0, 8)}...</td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>Rs {order.total.toFixed(2)}</td>
                        <td>{getStatusBadge(order.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted">No orders found for this customer.</p>
              )}
            </Modal.Body>
            
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Close
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
      
      {/* Delete Customer Confirmation Modal */}
      <Modal 
        show={showDeleteModal} 
        onHide={handleCloseDeleteModal}
        centered
        backdrop="static"
      >
        <Modal.Header className="bg-danger text-white">
          <Modal.Title>Delete Customer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this customer?</p>
          <p><strong>Email:</strong> {selectedCustomer?.email}</p>
          <p className="text-danger mb-0">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            This action cannot be undone and will permanently remove the customer account and all associated data.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={handleCloseDeleteModal}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={deleteCustomer}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Spinner animation="border" size="sm" role="status" className="me-2" />
                Deleting...
              </>
            ) : 'Delete Customer'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CustomerManagement; 
