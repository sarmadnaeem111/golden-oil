import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Table, Button, Form, Modal, Spinner, Alert, Card, Image } from 'react-bootstrap';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../../firebase/productService';
import CloudinaryUploadWidget from '../../components/CloudinaryUploadWidget';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount: '',
    stock: '',
    weight: '',
    weightUnit: 'g',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [cloudinaryData, setCloudinaryData] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imageFilePreviews, setImageFilePreviews] = useState([]);
  const [cloudinaryImages, setCloudinaryImages] = useState([]);
  const [replaceImages, setReplaceImages] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const productsData = await getProducts();
      setProducts(productsData);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'price' || name === 'stock' || name === 'discount') {
      // Make sure price, discount and stock are numbers
      const numValue = value === '' ? '' : Number(value);
      if (!isNaN(numValue)) {
        setFormData({ ...formData, [name]: numValue });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImageFiles(files);
      setCloudinaryImages([]);
      
      const previews = [];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push(reader.result);
          if (previews.length === files.length) {
            setImageFilePreviews(previews);
          }
        };
        reader.readAsDataURL(file);
      });
    } else {
      setImageFiles([]);
      setImageFilePreviews([]);
    }
    
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setCloudinaryData(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleCloudinaryUpload = (data) => {
    setCloudinaryImages(prevImages => [...prevImages, data]);
    
    if (cloudinaryImages.length === 0) {
      setCloudinaryData(data);
      setImagePreview(data.url);
    }
    
    setImageFiles([]);
    setImageFilePreviews([]);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      discount: '',
      stock: '',
      weight: '',
      weightUnit: 'g',
    });
    setImageFile(null);
    setImagePreview(null);
    setCloudinaryData(null);
    setImageFiles([]);
    setImageFilePreviews([]);
    setCloudinaryImages([]);
    setReplaceImages(false);
    setEditingProduct(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    resetForm();
  };

  const handleAddNewClick = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      discount: product.discount || 0,
      stock: product.stock || 0,
      weight: product.weight || '',
      weightUnit: product.weightUnit || 'g',
    });
    
    setImagePreview(product.image || null);
    setCloudinaryData(null);
    
    setImageFiles([]);
    setImageFilePreviews([]);
    setCloudinaryImages([]);
    setReplaceImages(false);
    
    setShowModal(true);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    
    try {
      setDeleteLoading(true);
      await deleteProduct(productToDelete.id);
      setProducts(products.filter(p => p.id !== productToDelete.id));
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (err) {
      console.error('Error deleting product:', err);
      // You can add error handling here
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      return alert('Name and price are required');
    }
    
    try {
      setFormSubmitting(true);
      
      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        discount: Number(formData.discount) || 0,
        stock: Number(formData.stock) || 0,
        weight: formData.weight ? Number(formData.weight) : null,
        weightUnit: formData.weightUnit,
        replaceImages: replaceImages,
      };
      
      if (cloudinaryImages.length > 0) {
        productData.image = cloudinaryImages[0].url;
        productData.imagePublicId = cloudinaryImages[0].public_id;
        productData.imageDetails = {
          format: cloudinaryImages[0].format,
          width: cloudinaryImages[0].width,
          height: cloudinaryImages[0].height
        };
        
        productData.images = cloudinaryImages.map(img => ({
          url: img.url,
          publicId: img.public_id,
          details: {
            format: img.format,
            width: img.width,
            height: img.height
          }
        }));
      } else if (cloudinaryData) {
        productData.image = cloudinaryData.url;
        productData.imagePublicId = cloudinaryData.public_id;
        productData.imageDetails = {
          format: cloudinaryData.format,
          width: cloudinaryData.width,
          height: cloudinaryData.height
        };
      }
      
      let updatedProduct;
      
      if (editingProduct) {
        updatedProduct = await updateProduct(
          editingProduct.id, 
          productData, 
          imageFiles.length > 0 ? imageFiles : cloudinaryData ? null : imageFile
        );
        
        setProducts(products.map(p => 
          p.id === updatedProduct.id ? updatedProduct : p
        ));
      } else {
        updatedProduct = await addProduct(
          productData, 
          imageFiles.length > 0 ? imageFiles : cloudinaryData ? null : imageFile
        );
        
        setProducts([updatedProduct, ...products]);
      }
      
      handleModalClose();
    } catch (err) {
      console.error('Error saving product:', err);
      // You can add error handling here
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Product Management</h1>
        <Button 
          variant="primary" 
          onClick={handleAddNewClick}
        >
          Add New Product
        </Button>
      </div>
      
      {error && (
        <Alert variant="danger">{error}</Alert>
      )}
      
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : products.length > 0 ? (
        <Card className="shadow-sm">
          <Table responsive hover className="mb-0">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Discount</th>
                <th>Stock</th>
                <th>Weight</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>
                    <div className="d-flex align-items-center justify-content-center bg-light" style={{ width: '60px', height: '60px', borderRadius: '0.25rem' }}>
                      <img 
                        src={product.image || 'https://via.placeholder.com/50?text=No+Image'} 
                        alt={product.name}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        className="rounded"
                      />
                    </div>
                  </td>
                  <td>{product.name}</td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>{product.discount ? `${product.discount}%` : '0%'}</td>
                  <td>{product.stock || 'N/A'}</td>
                  <td>{product.weight ? `${product.weight} ${product.weightUnit}` : 'N/A'}</td>
                  <td>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      className="me-2"
                      onClick={() => handleEditClick(product)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDeleteClick(product)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      ) : (
        <Alert variant="info">
          No products found. Click "Add New Product" to add one.
        </Alert>
      )}
      
      <Modal show={showModal} onHide={handleModalClose} backdrop="static" size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingProduct ? 'Edit Product' : 'Add New Product'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="name">
                  <Form.Label>Product Name*</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="price">
                  <Form.Label>Price*</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="discount">
                  <Form.Label>Discount (%)</Form.Label>
                  <Form.Control
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    step="1"
                    min="0"
                    max="100"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="stock">
                  <Form.Label>Stock Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="weight">
                  <Form.Label>Weight of Oil</Form.Label>
                  <div className="d-flex">
                    <Form.Control
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="Enter weight"
                      className="me-2"
                    />
                    <Form.Select 
                      name="weightUnit"
                      value={formData.weightUnit}
                      onChange={handleInputChange}
                      style={{ width: '80px' }}
                    >
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                    </Form.Select>
                  </div>
                  <Form.Text className="text-muted">
                    Specify the weight of the oil product
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Product Images</Form.Label>
                  <div className="d-flex flex-column gap-2">
                    <CloudinaryUploadWidget 
                      onImageUpload={handleCloudinaryUpload} 
                      buttonText="Upload with Cloudinary"
                      className="mb-2"
                      multiple={true}
                    />
                    
                    <div className="text-center text-muted mb-2">-- OR --</div>
                    
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      ref={fileInputRef}
                      multiple
                    />
                    <Form.Text className="text-muted">
                      {editingProduct ? 'Upload images to add to the product' : 'Upload images for the product'}
                    </Form.Text>
                  </div>
                </Form.Group>
                
                {editingProduct && editingProduct.images && editingProduct.images.length > 0 && (
                  <Form.Group className="mb-3">
                    <Form.Check 
                      type="checkbox" 
                      label="Replace all existing images" 
                      checked={replaceImages}
                      onChange={(e) => setReplaceImages(e.target.checked)}
                    />
                  </Form.Group>
                )}
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3" controlId="description">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </Form.Group>
                
                {imageFilePreviews.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-2">Image Previews:</p>
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {imageFilePreviews.map((preview, index) => (
                        <div key={index} style={{ width: '80px', height: '80px' }}>
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="img-thumbnail"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {cloudinaryImages.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-2">Uploaded Images:</p>
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {cloudinaryImages.map((img, index) => (
                        <div key={index} style={{ width: '80px', height: '80px' }}>
                          <img
                            src={img.url}
                            alt={`Upload ${index + 1}`}
                            className="img-thumbnail"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-success small">
                      <i className="bi bi-cloud-check"></i> Uploaded to Cloudinary
                    </p>
                  </div>
                )}
                
                {editingProduct && editingProduct.images && editingProduct.images.length > 0 && !replaceImages && (
                  <div className="mt-3">
                    <p className="mb-2">Existing Product Images:</p>
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {editingProduct.images.map((img, index) => (
                        <div key={index} style={{ width: '80px', height: '80px' }}>
                          <img
                            src={img.url}
                            alt={`Product Image ${index + 1}`}
                            className="img-thumbnail"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {imagePreview && imageFilePreviews.length === 0 && cloudinaryImages.length === 0 && (
                  <div className="text-center mt-3">
                    <p className="mb-2">Image Preview:</p>
                    <div className="image-preview-container" style={{ maxWidth: '200px', margin: '0 auto' }}>
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fluid
                        thumbnail
                        className="mb-2"
                      />
                      {cloudinaryData && (
                        <p className="text-success small">
                          <i className="bi bi-cloud-check"></i> Uploaded to Cloudinary
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </Col>
            </Row>
            
            <div className="d-flex justify-content-end mt-4">
              <Button 
                variant="secondary" 
                onClick={handleModalClose}
                className="me-2"
                disabled={formSubmitting}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={formSubmitting}
              >
                {formSubmitting ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Saving...
                  </>
                ) : (
                  editingProduct ? 'Update Product' : 'Add Product'
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the product "{productToDelete?.name}"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteProduct}
            disabled={deleteLoading}
          >
            {deleteLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProductManagement; 