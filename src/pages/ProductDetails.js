import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Image, Button, Form, Spinner, Alert, Badge } from 'react-bootstrap';
import { getProductById } from '../firebase/productService';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const productData = await getProductById(id);
      
      if (!productData) {
        setError('Product not found');
      } else {
        setProduct(productData);
        setSelectedImageIndex(0); // Reset selected image when loading a new product
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    setQuantity(value > 0 ? value : 1);
  };

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };
  
  // Calculate the final price after discount
  const calculateFinalPrice = (product) => {
    if (product?.discount && product.discount > 0) {
      const discountAmount = (product.price * product.discount) / 100;
      return product.price - discountAmount;
    }
    return product?.price || 0;
  };

  // Get all product images or fallback to main image
  const getProductImages = () => {
    if (product?.images && product.images.length > 0) {
      return product.images.map(img => img.url);
    } else if (product?.image) {
      return [product.image];
    }
    return ['https://via.placeholder.com/600x400?text=No+Image'];
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container className="my-5">
        <Alert variant="danger">
          {error || 'Product not found'}
        </Alert>
        <Button variant="primary" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </Container>
    );
  }
  
  const finalPrice = calculateFinalPrice(product);
  const productImages = getProductImages();

  return (
    <Container className="my-5">
      {addedToCart && (
        <Alert variant="success" className="mb-4">
          Product added to cart successfully!
        </Alert>
      )}
      
      <Row>
        <Col md={6} className="mb-4 mb-md-0">
          <div className="position-relative mb-3">
            {product.discount > 0 && (
              <Badge 
                bg="danger" 
                className="position-absolute top-0 end-0 m-3 px-3 py-2 fs-6"
              >
                {product.discount}% OFF
              </Badge>
            )}
            <div className="d-flex align-items-center justify-content-center" style={{ height: '400px', backgroundColor: '#f8f9fa', borderRadius: '0.25rem' }}>
              <Image 
                src={productImages[selectedImageIndex]} 
                alt={`${product.name} - Image ${selectedImageIndex + 1}`} 
                fluid 
                className="rounded shadow"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            </div>
          </div>
          
          {/* Thumbnails navigation - only show if there are multiple images */}
          {productImages.length > 1 && (
            <Row className="g-2 mt-2">
              {productImages.map((imgUrl, index) => (
                <Col xs={3} key={index}>
                  <div className="d-flex align-items-center justify-content-center bg-light" style={{ height: '80px', borderRadius: '0.25rem' }}>
                    <Image 
                      src={imgUrl}
                      alt={`Thumbnail ${index + 1}`}
                      thumbnail
                      className={`cursor-pointer ${selectedImageIndex === index ? 'border-primary' : ''}`}
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '100%', 
                        objectFit: 'contain',
                        cursor: 'pointer',
                        borderWidth: selectedImageIndex === index ? '3px' : '1px'
                      }}
                      onClick={() => setSelectedImageIndex(index)}
                    />
                  </div>
                </Col>
              ))}
            </Row>
          )}
        </Col>
        <Col md={6}>
          <h1 className="mb-3">{product.name}</h1>
          <p className="text-muted mb-4">{product.description}</p>
          
          {product.discount > 0 ? (
            <div className="mb-4">
              <p className="mb-1 text-muted">Regular price:</p>
              <h4 className="text-decoration-line-through text-muted mb-2">
                ${product.price.toFixed(2)}
              </h4>
              <p className="mb-1 text-danger">Discount price:</p>
              <h3 className="text-primary">
                ${finalPrice.toFixed(2)} <span className="ms-2 fs-6 text-danger">Save {product.discount}%</span>
              </h3>
            </div>
          ) : (
            <h3 className="text-primary mb-4">${product.price.toFixed(2)}</h3>
          )}
          
          {/* Display weight information if available */}
          {product.weight && (
            <div className="mb-4">
              <p className="mb-1 text-muted">Weight:</p>
              <p className="fs-5">{product.weight} {product.weightUnit}</p>
            </div>
          )}
          
          <Form className="mb-4">
            <Form.Group className="mb-3" controlId="quantity">
              <Form.Label>Quantity</Form.Label>
              <Form.Control 
                type="number" 
                value={quantity} 
                onChange={handleQuantityChange}
                min="1" 
                max="99"
                style={{ width: '100px' }}
              />
            </Form.Group>
            
            <Button 
              variant="primary" 
              size="lg" 
              onClick={handleAddToCart}
              className="w-100"
            >
              Add to Cart
            </Button>
          </Form>
          
          <Button 
            variant="outline-secondary" 
            onClick={() => navigate('/')}
            className="mt-2"
          >
            Back to Products
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetails; 