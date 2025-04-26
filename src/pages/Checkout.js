import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { createOrder } from '../firebase/orderService';

const Checkout = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { items, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  const [formData, setFormData] = useState({
    fullName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    address: '',
    city: '',
    state: '',
    zip: '',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVC: ''
  });
  
  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Create order data
      const orderData = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: formData.fullName,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity
        })),
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip
        },
        total: total,
        paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Credit Card',
        paymentDetails: paymentMethod === 'cod' 
          ? { type: 'Cash on Delivery' } 
          : { lastFour: formData.cardNumber.slice(-4) }
      };
      
      // Create order in Firestore
      const order = await createOrder(orderData);
      
      // Clear cart
      clearCart();
      
      // Navigate to confirmation page
      navigate('/orders', { state: { orderSuccess: true, orderId: order.id } });
    } catch (err) {
      console.error('Error placing order:', err);
      setError('Failed to place your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.address || 
        !formData.city || !formData.state || !formData.zip) {
      setError('Please fill in all required shipping fields');
      return false;
    }
    
    if (paymentMethod === 'creditCard' && 
        (!formData.cardName || !formData.cardNumber || 
         !formData.cardExpiry || !formData.cardCVC)) {
      setError('Please fill in all required credit card fields');
      return false;
    }
    
    return true;
  };

  return (
    <Container className="py-5">
      <h1 className="mb-4">Checkout</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col lg={8}>
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Shipping Information</h5>
              </Card.Header>
              <Card.Body>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="fullName">
                      <Form.Label>Full Name*</Form.Label>
                      <Form.Control
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="email">
                      <Form.Label>Email*</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3" controlId="address">
                  <Form.Label>Address*</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                
                <Row className="mb-3">
                  <Col md={5}>
                    <Form.Group controlId="city">
                      <Form.Label>City*</Form.Label>
                      <Form.Control
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="state">
                      <Form.Label>State*</Form.Label>
                      <Form.Control
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group controlId="zip">
                      <Form.Label>Zip*</Form.Label>
                      <Form.Control
                        type="text"
                        name="zip"
                        value={formData.zip}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
            
            <Card>
              <Card.Header>
                <h5 className="mb-0">Payment Information</h5>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-4">
                  <Form.Label className="d-block">Payment Method*</Form.Label>
                  <div className="payment-methods">
                    <div className="d-flex align-items-center mb-3">
                      <Form.Check
                        type="radio"
                        id="creditCardPayment"
                        name="paymentMethod"
                        value="creditCard"
                        checked={paymentMethod === 'creditCard'}
                        onChange={handlePaymentMethodChange}
                        className="me-2"
                      />
                      <label htmlFor="creditCardPayment" className="d-flex align-items-center cursor-pointer">
                        <i className="bi bi-credit-card me-2 text-primary"></i>
                        <span>Credit Card</span>
                      </label>
                    </div>
                    
                    <div className="d-flex align-items-center mb-3">
                      <Form.Check
                        type="radio"
                        id="codPayment"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={handlePaymentMethodChange}
                        className="me-2"
                      />
                      <label htmlFor="codPayment" className="d-flex align-items-center cursor-pointer">
                        <i className="bi bi-cash-coin me-2 text-success"></i>
                        <span>Cash on Delivery</span>
                      </label>
                    </div>
                  </div>
                </Form.Group>
                
                {paymentMethod === 'creditCard' && (
                  <>
                    <Form.Group className="mb-3" controlId="cardName">
                      <Form.Label>Name on Card*</Form.Label>
                      <Form.Control
                        type="text"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        required={paymentMethod === 'creditCard'}
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3" controlId="cardNumber">
                      <Form.Label>Card Number*</Form.Label>
                      <Form.Control
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="XXXX XXXX XXXX XXXX"
                        required={paymentMethod === 'creditCard'}
                      />
                    </Form.Group>
                    
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Group controlId="cardExpiry">
                          <Form.Label>Expiration Date*</Form.Label>
                          <Form.Control
                            type="text"
                            name="cardExpiry"
                            value={formData.cardExpiry}
                            onChange={handleInputChange}
                            placeholder="MM/YY"
                            required={paymentMethod === 'creditCard'}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group controlId="cardCVC">
                          <Form.Label>CVC*</Form.Label>
                          <Form.Control
                            type="text"
                            name="cardCVC"
                            value={formData.cardCVC}
                            onChange={handleInputChange}
                            placeholder="XXX"
                            required={paymentMethod === 'creditCard'}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </>
                )}
                
                {paymentMethod === 'cod' && (
                  <Alert variant="info" className="mb-0">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-info-circle-fill me-2"></i>
                      <div>
                        <p className="mb-0">You will pay in cash when your order is delivered.</p>
                      </div>
                    </div>
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={4} className="mt-4 mt-lg-0">
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Order Summary</h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  {items.map(item => (
                    <div key={item.id} className="d-flex justify-content-between mb-2">
                      <span>{item.name} × {item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <hr />
                
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="d-flex justify-content-between mb-2 fw-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-100 mt-3" 
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {paymentMethod === 'cod' 
                        ? `Place Order (Cash on Delivery) - $${total.toFixed(2)}`
                        : `Place Order - $${total.toFixed(2)}`
                      }
                    </>
                  )}
                </Button>
              </Card.Body>
            </Card>
            
            <Button 
              variant="outline-secondary" 
              className="w-100" 
              onClick={() => navigate('/cart')}
            >
              Back to Cart
            </Button>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default Checkout; 