import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Hero from '../components/Hero';
import { getPaginatedProducts } from '../firebase/productService';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    // Load initial products
    fetchProducts();
    
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  const fetchProducts = async (loadMore = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      // Get products with pagination
      const lastVisible = loadMore ? lastDoc : null;
      const result = await getPaginatedProducts(lastVisible);

      if (result.products.length === 0) {
        setHasMore(false);
      } else {
        if (loadMore) {
          // Append to existing products
          setProducts(prevProducts => [...prevProducts, ...result.products]);
        } else {
          // Replace with new products
          setProducts(result.products);
        }
        setLastDoc(result.lastDoc);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreProducts = () => {
    if (!loadingMore && hasMore) {
      fetchProducts(true);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <Hero />
      
      {/* Products Section */}
      <Container className="home-content">
        <div className="text-center mb-5">
          <h2 className="fw-bold">Our Featured Products</h2>
          <div className="mx-auto" style={{ width: '50px', height: '3px', backgroundColor: 'var(--gold-color)', marginBottom: '1rem' }}></div>
          <p className="text-muted">Explore our best-selling premium oils and products</p>
        </div>

        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" role="status" className="text-gold">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : products.length > 0 ? (
          <>
            <Row xs={1} sm={2} md={3} lg={4} className="g-4 mb-5">
              {products.map(product => (
                <Col key={product.id}>
                  <ProductCard product={product} />
                </Col>
              ))}
            </Row>
            
            {hasMore && (
              <div className="text-center mt-4 mb-5">
                <Button 
                  variant="outline-primary" 
                  onClick={loadMoreProducts}
                  disabled={loadingMore}
                  className="px-4"
                >
                  {loadingMore ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      <span className="ms-2">Loading...</span>
                    </>
                  ) : (
                    <>Load More Products</>
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center my-5 py-5">
            <i className="bi bi-exclamation-circle text-muted" style={{ fontSize: '3rem' }}></i>
            <p className="lead mt-3">No products available at the moment.</p>
            <p className="text-muted">Please check back soon for our latest offerings.</p>
          </div>
        )}
      </Container>
      
      {/* Benefits Section */}
      <section className="benefits-section py-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold">Why Choose Golden Oil?</h2>
            <div className="mx-auto" style={{ width: '50px', height: '3px', backgroundColor: 'var(--gold-color)', marginBottom: '1rem' }}></div>
          </div>
          
          <Row className="g-4">
            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm benefit-card">
                <Card.Body className="text-center p-4">
                  <div className="benefit-icon mb-3">
                    <i className="bi bi-award"></i>
                
                  </div>
                  <Card.Title className="fw-bold">Premium Quality</Card.Title>
                  <Card.Text>
                    All our products are crafted from the finest ingredients, ensuring superior quality.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm benefit-card">
                <Card.Body className="text-center p-4">
                  <div className="benefit-icon mb-3">
                    <i className="bi bi-leaf"></i>
                  </div>
                  <Card.Title className="fw-bold">Natural Ingredients</Card.Title>
                  <Card.Text>
                    We use only 100% natural ingredients with no harmful chemicals or additives.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm benefit-card">
                <Card.Body className="text-center p-4">
                  <div className="benefit-icon mb-3">
                    <i className="bi bi-truck"></i>
                  </div>
                  <Card.Title className="fw-bold">Fast Delivery</Card.Title>
                  <Card.Text>
                    We ensure quick and reliable shipping with careful packaging to preserve quality.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default Home; 