import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Badge, Button, Dropdown, Form, InputGroup } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useDarkMode } from '../context/DarkModeContext';

const AppNavbar = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [scrolled, setScrolled] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use the user passed in props or from AuthContext
  const authenticatedUser = user || currentUser;

  // Update search query when on search page
  useEffect(() => {
    if (location.pathname === '/search') {
      const params = new URLSearchParams(location.search);
      const query = params.get('q') || '';
      setSearchQuery(query);
    }
  }, [location]);

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

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      // If empty search, show all products
      navigate('/search');
    }
    setExpanded(false); // Close mobile menu if open
  };

  // Compute navbar styles based on scroll and dark mode
  const navbarStyle = {
    transition: 'all 0.3s ease-in-out',
    background: darkMode 
      ? (scrolled ? 'var(--card-bg)' : 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)')
      : (scrolled ? 'rgba(255, 255, 255, 0.95)' : 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)')
  };

  // Determine navbar variant based on dark mode and scroll
  const navbarVariant = darkMode 
    ? 'dark' 
    : (scrolled ? 'light' : 'dark');

  return (
    <Navbar 
      bg={scrolled ? (darkMode ? "dark" : "light") : "transparent"} 
      variant={navbarVariant} 
      expand="lg" 
      fixed="top" 
      className={`py-2 ${scrolled ? 'shadow-sm' : ''}`}
      style={navbarStyle}
      expanded={expanded}
      onToggle={(expanded) => setExpanded(expanded)}
      data-bs-theme={darkMode ? "dark" : "light"}
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
          <i className={`bi ${expanded ? 'bi-x' : 'bi-list'} ${scrolled ? (darkMode ? 'text-light' : 'text-dark') : 'text-light'}`} style={{ fontSize: '1.5rem' }}></i>
        </Navbar.Toggle>
        
        <Navbar.Collapse id="navbar-nav">
          <Form className="d-flex mx-auto my-2 my-lg-0" style={{ maxWidth: '300px' }} onSubmit={handleSearch}>
            <InputGroup>
              <Form.Control
                type="search"
                placeholder="Search products..."
                aria-label="Search"
                className="border-end-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                variant={scrolled ? "outline-gold" : "outline-light"} 
                className="border-start-0 bg-transparent"
                type="submit"
              >
                <i className="bi bi-search"></i>
              </Button>
            </InputGroup>
          </Form>
          
          <Nav className="ms-auto">
            {/* Dark Mode Toggle Button */}
            <Button 
              variant="link" 
              className="dark-mode-toggle nav-link me-2 p-0"
              onClick={toggleDarkMode}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              <i className={`bi ${darkMode ? 'bi-sun' : 'bi-moon'} fs-5`}></i>
            </Button>
            
            <Nav.Link 
              as={Link} 
              to="/" 
              className={`${scrolled ? (isActive('/') ? 'text-gold fw-bold' : (darkMode ? 'text-light' : 'text-dark')) : 'text-light'} mx-1 position-relative d-none d-lg-block`}
            >
              <i className="bi bi-house-door me-1"></i> Home
              {isActive('/') && <span className="position-absolute" style={{ height: '2px', width: '80%', backgroundColor: 'var(--accent-color)', bottom: '0', left: '10%' }}></span>}
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/cart" 
              className={`${scrolled ? (isActive('/cart') ? 'text-gold fw-bold' : (darkMode ? 'text-light' : 'text-dark')) : 'text-light'} mx-1 position-relative d-none d-lg-block`}
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
            
            {/* Mobile-specific Home link with better visibility */}
            <div className="d-lg-none w-100 mt-2">
              <Link 
                to="/" 
                className="nav-link w-100 mobile-nav-link"
              >
                <i className="bi bi-house-door"></i> Home
              </Link>
            </div>
            
            {/* Mobile-specific Cart link with better visibility */}
            <div className="d-lg-none w-100 mt-2">
              <Link 
                to="/cart" 
                className="nav-link w-100 mobile-nav-link"
              >
                <i className="bi bi-cart"></i> Cart
                {itemCount > 0 && (
                  <Badge 
                    pill 
                    bg="danger" 
                    className="ms-2"
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.4rem' }}
                  >
                    {itemCount}
                  </Badge>
                )}
              </Link>
            </div>
            
            {authenticatedUser ? (
              <Dropdown align="end">
                <Dropdown.Toggle 
                  as="a" 
                  className={`nav-link ${scrolled ? (darkMode ? 'text-light' : 'text-dark') : 'text-light'} mx-1 d-flex align-items-center cursor-pointer`} 
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
                  className={`${scrolled ? (isActive('/login') ? 'text-gold fw-bold' : (darkMode ? 'text-light' : 'text-dark')) : 'text-light'} mx-1 position-relative`}
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
