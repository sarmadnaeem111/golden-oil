import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(product);
  };

  // Calculate the final price after discount
  const calculateFinalPrice = () => {
    if (product.discount && product.discount > 0) {
      const discountAmount = (product.price * product.discount) / 100;
      return product.price - discountAmount;
    }
    return product.price;
  };

  // Check if product has multiple images
  const hasMultipleImages = product.images && product.images.length > 1;

  const finalPrice = calculateFinalPrice();

  return (
    <Card className="h-100 shadow-sm">
      <div className="card-img-container position-relative" style={{ height: '250px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa' }}>
        {product.discount > 0 && (
          <Badge 
            bg="danger" 
            className="position-absolute top-0 end-0 m-2 px-2 py-1"
          >
            {product.discount}% OFF
          </Badge>
        )}
        {hasMultipleImages && (
          <Badge
            bg="info"
            className="position-absolute bottom-0 end-0 m-2 px-2 py-1"
          >
            {product.images.length} Images
          </Badge>
        )}
        <Card.Img 
          variant="top" 
          src={product.image || 'https://via.placeholder.com/300x200?text=No+Image'} 
          alt={product.name}
          className="img-fluid"
          style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
        />
      </div>
      <Card.Body className="d-flex flex-column">
        <Card.Title className="mb-2">{product.name}</Card.Title>
        <Card.Text className="text-muted mb-2">
          {product.description && product.description.length > 100
            ? `${product.description.substring(0, 100)}...`
            : product.description}
        </Card.Text>
        
        {/* Display weight information if available */}
        {product.weight && (
          <Card.Text className="text-muted small mb-2">
            Weight: {product.weight} {product.weightUnit}
          </Card.Text>
        )}
        
        <div className="mt-auto">
          {product.discount > 0 ? (
            <div className="mb-2">
              <span className="text-decoration-line-through text-muted me-2">
                Rs {product.price.toFixed(2)}
              </span>
              <span className="fs-5 fw-bold text-primary">
                Rs {finalPrice.toFixed(2)}
              </span>
            </div>
          ) : (
            <Card.Text className="fs-5 fw-bold text-primary mb-2">
              Rs {product.price.toFixed(2)}
            </Card.Text>
          )}
          <div className="d-flex justify-content-between">
            <Button 
              as={Link} 
              to={`/products/${product.id}`} 
              variant="outline-secondary" 
              size="sm"
            >
              Details
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard; 
