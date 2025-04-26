import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Badge, Button, Dropdown, Form, InputGroup } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';


const AppNavbar = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  // Use the user passed in props or from AuthContext
  const authenticatedUser = user || currentUser;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setExpanded(false);
  }, [location.pathname]);

  // Check if the link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <Navbar 
      bg={scrolled ? "light" : "transparent"} 
      variant={scrolled ? "light" : "dark"} 
      expand="lg" 
      fixed="top" 
      className={`py-2 ${scrolled ? 'shadow-sm' : ''}`}
      style={{
        transition: 'all 0.3s ease-in-out',
        background: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)'
      }}
      expanded={expanded}
      onToggle={(expanded) => setExpanded(expanded)}
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img
            src="/logo.png"
            alt="Golden Oil Logo"
            width="50px"
            
            height="50px"
            className="d-inline-block align-top me-2"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
            }}
          />
          <span className={`fw-bold ${scrolled ? 'text-gold' : 'text-light'}`} style={{ letterSpacing: '1px' }}>
            Golden Hair Oil
          </span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="navbar-nav" className="border-0">
          <i className={`bi ${expanded ? 'bi-x' : 'bi-list'} ${scrolled ? 'text-dark' : 'text-light'}`} style={{ fontSize: '1.5rem' }}></i>
        </Navbar.Toggle>
        
        <Navbar.Collapse id="navbar-nav">
          <Form className="d-flex mx-auto my-2 my-lg-0" style={{ maxWidth: '300px' }} onSubmit={(e) => { e.preventDefault(); navigate('/'); }}>
            <InputGroup>
              <Form.Control
                type="search"
                placeholder="Search products..."
                aria-label="Search"
                className="border-end-0"
              />
              <Button variant={scrolled ? "outline-gold" : "outline-light"} className="border-start-0 bg-transparent">
                <i className="bi bi-search"></i>
              </Button>
            </InputGroup>
          </Form>
          
          <Nav className="ms-auto">
            <Nav.Link 
              as={Link} 
              to="/" 
              className={`${scrolled ? (isActive('/') ? 'text-gold fw-bold' : 'text-dark') : 'text-light'} mx-1 position-relative`}
            >
              <i className="bi bi-house-door me-1"></i> Home
              {isActive('/') && <span className="position-absolute" style={{ height: '2px', width: '80%', backgroundColor: 'var(--accent-color)', bottom: '0', left: '10%' }}></span>}
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/cart" 
              className={`${scrolled ? (isActive('/cart') ? 'text-gold fw-bold' : 'text-dark') : 'text-light'} mx-1 position-relative`}
            >
              <div className="position-relative d-inline-block">
                <i className="bi bi-cart me-1"></i> Cart
                {itemCount > 0 && (
                  <Badge 
                    pill 
                    bg="danger" 
                    className="position-absolute top-0 start-100 translate-middle"
                    style={{ fontSize: '0.6rem', padding: '0.25rem 0.4rem' }}
                  >
                    {itemCount}
                  </Badge>
                )}
              </div>
              {isActive('/cart') && <span className="position-absolute" style={{ height: '2px', width: '80%', backgroundColor: 'var(--accent-color)', bottom: '0', left: '10%' }}></span>}
            </Nav.Link>
            
            {authenticatedUser ? (
              <Dropdown align="end">
                <Dropdown.Toggle 
                  as="a" 
                  className={`nav-link ${scrolled ? 'text-dark' : 'text-light'} mx-1 d-flex align-items-center cursor-pointer`} 
                  style={{ cursor: 'pointer' }}
                  id="dropdown-basic"
                >
                  <i className="bi bi-person-circle me-1"></i>
                  <span className="d-none d-sm-inline">{authenticatedUser.email?.split('@')[0] || 'Account'}</span>
                </Dropdown.Toggle>

                <Dropdown.Menu className="shadow-sm border-0 mt-2">
                  <Dropdown.Item as={Link} to="/profile">
                    <i className="bi bi-person me-2"></i> Profile
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/orders">
                    <i className="bi bi-bag me-2"></i> Orders
                  </Dropdown.Item>
                  {isAdmin && (
                    <Dropdown.Item as={Link} to="/admin">
                      <i className="bi bi-speedometer2 me-2"></i> Admin Dashboard
                    </Dropdown.Item>
                  )}
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i> Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <>
                <Nav.Link 
                  as={Link} 
                  to="/login" 
                  className={`${scrolled ? (isActive('/login') ? 'text-gold fw-bold' : 'text-dark') : 'text-light'} mx-1 position-relative`}
                >
                  <i className="bi bi-box-arrow-in-right me-1"></i> Login
                  {isActive('/login') && <span className="position-absolute" style={{ height: '2px', width: '80%', backgroundColor: 'var(--accent-color)', bottom: '0', left: '10%' }}></span>}
                </Nav.Link>
                <Button 
                  as={Link} 
                  to="/register" 
                  variant={scrolled ? "outline-gold" : "outline-light"} 
                  size="sm" 
                  className={`ms-2 ${isActive('/register') ? 'bg-gold text-white' : ''}`}
                >
                  <i className="bi bi-person-plus me-1"></i> Register
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar; 