import React from 'react';
import { Container, Row, Col, Form, Button, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useDarkMode } from '../context/DarkModeContext';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { darkMode } = useDarkMode();
  
  // Handle newsletter signup
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Would normally send this to an API, but just showing a success message for now
    alert('Thank you for subscribing to our newsletter!');
    e.target.reset();
  };

  return (
    <footer className={`pt-5 pb-4 ${darkMode ? 'dark-footer' : ''}`} style={{
      background: darkMode 
        ? 'linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 100%)' 
        : 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-color) 100%)',
      color: 'white',
      marginTop: '3rem',
      boxShadow: darkMode ? '0 -10px 20px rgba(0,0,0,0.2)' : '0 -10px 20px rgba(0,0,0,0.05)'
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
            <p className={`mb-3 ${darkMode ? 'text-light-gray' : 'text-light opacity-75'}`} style={{ fontSize: '0.9rem' }}>
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
                <Link to="/" className={`${darkMode ? 'text-light-gray' : 'text-light opacity-75'} text-decoration-none d-flex align-items-center`}>
                  <i className="bi bi-chevron-right me-1 text-gold" style={{ fontSize: '0.7rem' }}></i> Home
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/cart" className={`${darkMode ? 'text-light-gray' : 'text-light opacity-75'} text-decoration-none d-flex align-items-center`}>
                  <i className="bi bi-chevron-right me-1 text-gold" style={{ fontSize: '0.7rem' }}></i> Shop
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/profile" className={`${darkMode ? 'text-light-gray' : 'text-light opacity-75'} text-decoration-none d-flex align-items-center`}>
                  <i className="bi bi-chevron-right me-1 text-gold" style={{ fontSize: '0.7rem' }}></i> My Account
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/orders" className={`${darkMode ? 'text-light-gray' : 'text-light opacity-75'} text-decoration-none d-flex align-items-center`}>
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
                <Link to="/about" className={`${darkMode ? 'text-light-gray' : 'text-light opacity-75'} text-decoration-none d-flex align-items-center`}>
                  <i className="bi bi-chevron-right me-1 text-gold" style={{ fontSize: '0.7rem' }}></i> About Us
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/privacy" className={`${darkMode ? 'text-light-gray' : 'text-light opacity-75'} text-decoration-none d-flex align-items-center`}>
                  <i className="bi bi-chevron-right me-1 text-gold" style={{ fontSize: '0.7rem' }}></i> Privacy Policy
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/terms" className={`${darkMode ? 'text-light-gray' : 'text-light opacity-75'} text-decoration-none d-flex align-items-center`}>
                  <i className="bi bi-chevron-right me-1 text-gold" style={{ fontSize: '0.7rem' }}></i> Terms & Conditions
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/shipping" className={`${darkMode ? 'text-light-gray' : 'text-light opacity-75'} text-decoration-none d-flex align-items-center`}>
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
                <span className={`${darkMode ? 'text-light-gray' : 'text-light opacity-75'}`}>Purani sabza Mandi, Abbottabad, Pakistan</span>
              </li>
              <li className="mb-2 d-flex align-items-center">
                <i className="bi bi-telephone-fill me-2 text-gold"></i>
                <a href="tel:+923335059703" className={`${darkMode ? 'text-light-gray' : 'text-light opacity-75'} text-decoration-none`}>03335059703</a>
              </li>
              <li className="mb-2 d-flex align-items-center">
                <i className="bi bi-telephone-fill me-2 text-gold"></i>
                <a href="tel:+923335062656" className={`${darkMode ? 'text-light-gray' : 'text-light opacity-75'} text-decoration-none`}>03335062656</a>
              </li>
              <li className="mb-2 d-flex align-items-center">
                <i className="bi bi-telephone-fill me-2 text-gold"></i>
                <a href="tel:+923425050007" className={`${darkMode ? 'text-light-gray' : 'text-light opacity-75'} text-decoration-none`}>03425050007</a>
              </li>
              <li className="mb-2 d-flex align-items-center">
                <i className="bi bi-envelope-fill me-2 text-gold"></i>
                <a href="mailto:sarmadnaeem222@gmail.com" className={`${darkMode ? 'text-light-gray' : 'text-light opacity-75'} text-decoration-none`}>sarmadnaeem222@gmail.com</a>
              </li>
              <li className="mb-2 d-flex align-items-center">
                <i className="bi bi-clock-fill me-2 text-gold"></i>
                <span className={`${darkMode ? 'text-light-gray' : 'text-light opacity-75'}`}>Mon-Sun: 9AM - 9PM</span>
              </li>
            </ul>
          </Col>
          
          {/* Newsletter */}
          <Col lg={3} md={6} className="mb-4 mb-lg-0">
            <h5 className="text-gold mb-3 fw-bold">Newsletter</h5>
            <p className={`${darkMode ? 'text-light-gray' : 'text-light opacity-75'} mb-3`} style={{ fontSize: '0.9rem' }}>
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
                    backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: 'white'
                  }}
                  className={`py-2 ${darkMode ? 'dark-input' : ''}`}
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
          <Col className="text-center">
            <small className={`${darkMode ? 'text-light-gray' : 'text-light opacity-75'}`}>&copy; {1996} Golden Hair Oil. All rights reserved.</small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer; 
