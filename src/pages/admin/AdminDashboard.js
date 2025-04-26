import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getProducts } from '../../firebase/productService';
import { getAllOrders } from '../../firebase/orderService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get products count
      const products = await getProducts();
      
      // Get orders
      const orders = await getAllOrders();
      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      
      // Get users count
      const usersSnapshot = await getDocs(collection(db, 'users'));
      
      setStats({
        products: products.length,
        orders: orders.length,
        users: usersSnapshot.size,
        pendingOrders
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Admin Dashboard</h1>
      
      <Row className="mb-4">
        <Col md={3} className="mb-3 mb-md-0">
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <h2 className="display-4">{stats.products}</h2>
              <Card.Title>Products</Card.Title>
            </Card.Body>
            <Card.Footer>
              <Button as={Link} to="/admin/products" variant="outline-primary" size="sm">
                Manage Products
              </Button>
            </Card.Footer>
          </Card>
        </Col>
        
        <Col md={3} className="mb-3 mb-md-0">
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <h2 className="display-4">{stats.orders}</h2>
              <Card.Title>Total Orders</Card.Title>
            </Card.Body>
            <Card.Footer>
              <Button as={Link} to="/admin/orders" variant="outline-primary" size="sm">
                Manage Orders
              </Button>
            </Card.Footer>
          </Card>
        </Col>
        
        <Col md={3} className="mb-3 mb-md-0">
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <h2 className="display-4">{stats.pendingOrders}</h2>
              <Card.Title>Pending Orders</Card.Title>
            </Card.Body>
            <Card.Footer>
              <Button as={Link} to="/admin/orders" variant="outline-warning" size="sm">
                View Pending
              </Button>
            </Card.Footer>
          </Card>
        </Col>
        
        <Col md={3} className="mb-3 mb-md-0">
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <h2 className="display-4">{stats.users}</h2>
              <Card.Title>Customers</Card.Title>
            </Card.Body>
            <Card.Footer>
              <Button as={Link} to="/admin/customers" variant="outline-primary" size="sm">
                View Customers
              </Button>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col>
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">Quick Actions</h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4} className="mb-3 mb-md-0">
                  <Button 
                    as={Link} 
                    to="/admin/products" 
                    variant="primary" 
                    className="w-100"
                  >
                    Add New Product
                  </Button>
                </Col>
                <Col md={4} className="mb-3 mb-md-0">
                  <Button 
                    as={Link} 
                    to="/admin/orders" 
                    variant="success" 
                    className="w-100"
                  >
                    Process Orders
                  </Button>
                </Col>
                <Col md={4}>
                  <Button 
                    as={Link} 
                    to="/" 
                    variant="secondary" 
                    className="w-100"
                  >
                    View Store
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard; 