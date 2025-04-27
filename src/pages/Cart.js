import React from 'react';
import { Container, Row, Col, Table, Button, Form, Alert, Card, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleQuantityChange = (productId, e) => {
    const quantity = parseInt(e.target.value);
    if (quantity >= 1) {
      updateQuantity(productId, quantity);
    }
  };

  const handleCheckout = () => {
    if (currentUser) {
      navigate('/checkout');
    } else {
      navigate('/login', { state: { from: '/checkout' } });
    }
  };

  if (items.length === 0) {
    return (
      <Container className="my-5">
        <Alert variant="info">
          Your cart is empty
        </Alert>
        <Button as={Link} to="/" variant="primary">
          Continue Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h1 className="mb-4">Your Shopping Cart</h1>
      
      <Row>
        <Col lg={8}>
          <Table responsive striped hover>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Subtotal</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <img 
                        src={item.image || 'https://via.placeholder.com/50x50?text=No+Image'} 
                        alt={item.name} 
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        className="me-3 rounded"
                      />
                      <div>
                        <Link to={`/products/${item.id}`} className="text-decoration-none">
                          {item.name}
                        </Link>
                        {item.discount > 0 && (
                          <Badge bg="danger" className="ms-2">
                            {item.discount}% OFF
                          </Badge>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    {item.discount > 0 ? (
                      <div>
                        <span className="text-decoration-line-through text-muted d-block">
                          Rs {item.price.toFixed(2)}
                        </span>
                        <span className="text-danger">
                          Rs {item.finalPrice.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <>Rs {item.price.toFixed(2)}</>
                    )}
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, e)}
                      style={{ width: '70px' }}
                    />
                  </td>
                  <td>
                    Rs {((item.finalPrice || item.price) * item.quantity).toFixed(2)}
                  </td>
                  <td>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="d-flex justify-content-between">
            <Button 
              variant="outline-secondary" 
              onClick={() => navigate('/')}
            >
              Continue Shopping
            </Button>
            <Button 
              variant="outline-danger"
              onClick={clearCart}
            >
              Clear Cart
            </Button>
          </div>
        </Col>
        
        <Col lg={4} className="mt-4 mt-lg-0">
          <Card>
            <Card.Header as="h5">Order Summary</Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-3">
                <span>Items ({items.reduce((acc, item) => acc + item.quantity, 0)}):</span>
                <span>Rs {total.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-3 fw-bold">
                <span>Total:</span>
                <span>Rs {total.toFixed(2)}</span>
              </div>
              <Button 
                variant="primary" 
                size="lg" 
                className="w-100"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Cart; 
