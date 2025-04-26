import React from 'react';
import { Container, Row, Col, Form, Button, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  // Handle newsletter signup
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Would normally send this to an API, but just showing a success message for now
    alert('Thank you for subscribing to our newsletter!');
    e.target.reset();
  };

  return (
    <footer className="pt-5 pb-4" style={{
      background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-color) 100%)',
      color: 'white',
      marginTop: '3rem',
      boxShadow: '0 -10px 20px rgba(0,0,0,0.05)'
    }}>
      <Container>
        {/* Main Footer Content */}
        <Row className="mb-5">
          {/* Company Info */}
          <Col lg={3} md={6} className="mb-4 mb-lg-0">
            <div className="d-flex align-items-center mb-3">
              <img 
                src="/golden-logo.png" 
                alt="Golden Oil Logo" 
                height="50" 
                className="me-2"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
              <h4 className="text-gold mb-0 fw-bold">Golden Oil</h4>
            </div>
            <p className="mb-3 text-light opacity-75" style={{ fontSize: '0.9rem' }}>
              Providing premium quality oils and natural products for your wellness journey.
            </p>
            <div className="social-icons d-flex gap-3 mb-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <i className="bi bi-facebook fs-4 text-light hover-text-gold"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <i className="bi bi-instagram fs-4 text-light hover-text-gold"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <i className="bi bi-twitter-x fs-4 text-light hover-text-gold"></i>
              </a>
              <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <i className="bi bi-pinterest fs-4 text-light hover-text-gold"></i>
              </a>
            </div>
          </Col>
          
          {/* Quick Links */}
          <Col lg={2} md={6} className="mb-4 mb-lg-0">
            <h5 className="text-gold mb-3 fw-bold">Quick Links</h5>
            <ul className="list-unstyled footer-links">
              <li className="mb-2">
                <Link to="/" className="text-light text-decoration-none opacity-75 d-flex align-items-center">
                  <i className="bi bi-chevron-right me-1 text-gold" style={{ fontSize: '0.7rem' }}></i> Home
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/cart" className="text-light text-decoration-none opacity-75 d-flex align-items-center">
                  <i className="bi bi-chevron-right me-1 text-gold" style={{ fontSize: '0.7rem' }}></i> Shop
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/profile" className="text-light text-decoration-none opacity-75 d-flex align-items-center">
                  <i className="bi bi-chevron-right me-1 text-gold" style={{ fontSize: '0.7rem' }}></i> My Account
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/orders" className="text-light text-decoration-none opacity-75 d-flex align-items-center">
                  <i className="bi bi-chevron-right me-1 text-gold" style={{ fontSize: '0.7rem' }}></i> Orders
                </Link>
              </li>
            </ul>
          </Col>
          
          {/* Info Links */}
          <Col lg={2} md={6} className="mb-4 mb-lg-0">
            <h5 className="text-gold mb-3 fw-bold">Information</h5>
            <ul className="list-unstyled footer-links">
              <li className="mb-2">
                <Link to="/about" className="text-light text-decoration-none opacity-75 d-flex align-items-center">
                  <i className="bi bi-chevron-right me-1 text-gold" style={{ fontSize: '0.7rem' }}></i> About Us
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/privacy" className="text-light text-decoration-none opacity-75 d-flex align-items-center">
                  <i className="bi bi-chevron-right me-1 text-gold" style={{ fontSize: '0.7rem' }}></i> Privacy Policy
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/terms" className="text-light text-decoration-none opacity-75 d-flex align-items-center">
                  <i className="bi bi-chevron-right me-1 text-gold" style={{ fontSize: '0.7rem' }}></i> Terms & Conditions
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/shipping" className="text-light text-decoration-none opacity-75 d-flex align-items-center">
                  <i className="bi bi-chevron-right me-1 text-gold" style={{ fontSize: '0.7rem' }}></i> Shipping Info
                </Link>
              </li>
            </ul>
          </Col>
          
          {/* Contact Info */}
          <Col lg={2} md={6} className="mb-4 mb-lg-0">
            <h5 className="text-gold mb-3 fw-bold">Contact</h5>
            <ul className="list-unstyled footer-links">
              <li className="mb-2 d-flex align-items-center">
                <i className="bi bi-geo-alt-fill me-2 text-gold"></i>
                <span className="text-light opacity-75">123 Main St, City, Country</span>
              </li>
              <li className="mb-2 d-flex align-items-center">
                <i className="bi bi-telephone-fill me-2 text-gold"></i>
                <a href="tel:+15551234567" className="text-light text-decoration-none opacity-75">+1 (555) 123-4567</a>
              </li>
              <li className="mb-2 d-flex align-items-center">
                <i className="bi bi-envelope-fill me-2 text-gold"></i>
                <a href="mailto:contact@goldenoil.com" className="text-light text-decoration-none opacity-75">contact@goldenoil.com</a>
              </li>
              <li className="mb-2 d-flex align-items-center">
                <i className="bi bi-clock-fill me-2 text-gold"></i>
                <span className="text-light opacity-75">Mon-Fri: 9AM - 5PM</span>
              </li>
            </ul>
          </Col>
          
          {/* Newsletter */}
          <Col lg={3} md={6} className="mb-4 mb-lg-0">
            <h5 className="text-gold mb-3 fw-bold">Newsletter</h5>
            <p className="text-light opacity-75 mb-3" style={{ fontSize: '0.9rem' }}>
              Subscribe to our newsletter to receive updates and special offers.
            </p>
            <Form onSubmit={handleNewsletterSubmit}>
              <InputGroup className="mb-3">
                <Form.Control
                  placeholder="Your email address"
                  aria-label="Email address"
                  aria-describedby="button-newsletter"
                  type="email"
                  required
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: 'white'
                  }}
                  className="py-2"
                />
                <Button 
                  id="button-newsletter" 
                  type="submit"
                  variant="gold"
                  className="bg-gold border-0"
                >
                  <i className="bi bi-send-fill"></i>
                </Button>
              </InputGroup>
            </Form>
            <div className="mt-3">
              <img 
                src="/payment-methods.png" 
                alt="Payment methods" 
                className="img-fluid"
                style={{ maxHeight: '30px' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </Col>
        </Row>
        
        {/* Divider */}
        <hr className="my-4 opacity-25" />
        
        {/* Bottom Footer */}
        <Row>
          <Col className="text-center text-light opacity-75">
            <small>&copy; {currentYear} Golden Oil Shop. All rights reserved.</small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer; 