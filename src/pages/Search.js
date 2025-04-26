import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Form, InputGroup, Button, Alert } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { searchProducts } from '../firebase/productService';

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  // Get search query from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q') || '';
    setSearchQuery(query);
    
    // Load products with the new search
    fetchProducts(query);
  }, [location.search]);

  const fetchProducts = async (query) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the new searchProducts function
      const results = await searchProducts(query);
      setFilteredProducts(results || []);
    } catch (error) {
      console.error('Error searching products:', error);
      setError('There was an error searching for products. Please try again.');
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      // If empty search, just show all products
      navigate('/search');
    }
  };

  return (
    <Container className="py-5">
      <h1 className="mb-4 text-center">Product Search</h1>
      
      {/* Search Form */}
      <Form className="mb-5" onSubmit={handleSearch}>
        <InputGroup className="mb-3 mx-auto" style={{ maxWidth: '600px' }}>
          <Form.Control
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search"
          />
          <Button variant="gold" type="submit">
            <i className="bi bi-search me-1"></i> Search
          </Button>
        </InputGroup>
      </Form>
      
      {/* Error message */}
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      {/* Results */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" className="text-gold">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : filteredProducts.length > 0 ? (
        <>
          <p className="text-muted mb-4">
            Found {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} 
            {searchQuery ? ` for "${searchQuery}"` : ''}
          </p>
          
          <Row xs={1} sm={2} md={3} lg={4} className="g-4">
            {filteredProducts.map(product => (
              <Col key={product.id}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
        </>
      ) : (
        <div className="text-center my-5 py-5">
          <i className="bi bi-search text-muted" style={{ fontSize: '3rem' }}></i>
          <p className="lead mt-3">No products found {searchQuery ? `matching "${searchQuery}"` : ''}</p>
          <p className="text-muted">Try searching with different keywords or browse our categories</p>
          <Button variant="outline-gold" onClick={() => navigate('/')}>
            Browse All Products
          </Button>
        </div>
      )}
    </Container>
  );
};

export default Search; 
