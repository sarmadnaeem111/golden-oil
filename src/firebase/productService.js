import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';
import { uploadToCloudinary, deleteFromCloudinary } from './cloudinaryService';

const PRODUCTS_COLLECTION = 'products';

// Get all products
export const getProducts = async () => {
  const productsQuery = query(
    collection(db, PRODUCTS_COLLECTION),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(productsQuery);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Get paginated products
export const getPaginatedProducts = async (lastVisible, pageSize = 10) => {
  let productsQuery;
  
  if (lastVisible) {
    productsQuery = query(
      collection(db, PRODUCTS_COLLECTION),
      orderBy('createdAt', 'desc'),
      startAfter(lastVisible),
      limit(pageSize)
    );
  } else {
    productsQuery = query(
      collection(db, PRODUCTS_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
  }
  
  const snapshot = await getDocs(productsQuery);
  const lastDoc = snapshot.docs[snapshot.docs.length - 1];
  
  const products = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  return { products, lastDoc };
};

// Get product by ID
export const getProductById = async (productId) => {
  const docRef = doc(db, PRODUCTS_COLLECTION, productId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  }
  
  return null;
};

// Upload product image to Cloudinary
export const uploadProductImage = async (file, productId) => {
  // Upload image to Cloudinary
  const cloudinaryResult = await uploadToCloudinary(file);
  
  return {
    publicId: cloudinaryResult.public_id,
    downloadURL: cloudinaryResult.url,
    imageDetails: {
      format: cloudinaryResult.format,
      width: cloudinaryResult.width,
      height: cloudinaryResult.height
    }
  };
};

// Upload multiple product images to Cloudinary
export const uploadMultipleProductImages = async (files, productId) => {
  if (!files || files.length === 0) return [];
  
  // Upload each image and return results
  const uploadPromises = Array.from(files).map(file => uploadProductImage(file, productId));
  return Promise.all(uploadPromises);
};

// Delete product image from Cloudinary
export const deleteProductImage = async (publicId) => {
  if (!publicId) return;
  
  try {
    // Delete from Cloudinary
    await deleteFromCloudinary(publicId);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};

// Delete multiple product images from Cloudinary
export const deleteMultipleProductImages = async (publicIds) => {
  if (!publicIds || publicIds.length === 0) return;
  
  const deletePromises = publicIds.map(publicId => deleteProductImage(publicId));
  return Promise.all(deletePromises);
};

// Add new product
export const addProduct = async (productData, imageFiles) => {
  // First create product with basic data
  const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
    ...productData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  
  // Handle single image for backward compatibility
  if (imageFiles && !Array.isArray(imageFiles)) {
    imageFiles = [imageFiles];
  }
  
  // Upload images if provided
  if (imageFiles && imageFiles.length > 0) {
    const imageResults = await uploadMultipleProductImages(imageFiles, docRef.id);
    
    // Update product with image info
    await updateDoc(docRef, {
      // Keep the first image as the main product image for compatibility
      image: imageResults[0].downloadURL,
      imagePublicId: imageResults[0].publicId,
      imageDetails: imageResults[0].imageDetails,
      // Store all images as an array
      images: imageResults.map(img => ({
        url: img.downloadURL,
        publicId: img.publicId,
        details: img.imageDetails
      }))
    });
  }
  
  // Get the updated product
  const updatedProduct = await getProductById(docRef.id);
  return updatedProduct;
};

// Update product
export const updateProduct = async (productId, productData, imageFiles) => {
  const docRef = doc(db, PRODUCTS_COLLECTION, productId);
  const currentProduct = await getProductById(productId);
  
  // Handle single image for backward compatibility
  if (imageFiles && !Array.isArray(imageFiles)) {
    imageFiles = [imageFiles];
  }
  
  // Upload new images if provided
  if (imageFiles && imageFiles.length > 0) {
    // Delete old images if replacing them
    if (productData.replaceImages && currentProduct.images && currentProduct.images.length > 0) {
      const publicIds = currentProduct.images.map(img => img.publicId);
      await deleteMultipleProductImages(publicIds);
    } 
    // If not replacing, just delete the main image if it's being replaced
    else if (currentProduct.imagePublicId) {
      await deleteProductImage(currentProduct.imagePublicId);
    }
    
    // Upload new images
    const imageResults = await uploadMultipleProductImages(imageFiles, productId);
    
    // Prepare images array - combine existing images with new ones if not replacing
    let allImages = [];
    if (!productData.replaceImages && currentProduct.images) {
      allImages = [...currentProduct.images];
    }
    
    // Add new images
    const newImages = imageResults.map(img => ({
      url: img.downloadURL,
      publicId: img.publicId,
      details: img.imageDetails
    }));
    allImages = [...allImages, ...newImages];
    
    // Update product data with new images
    await updateDoc(docRef, {
      ...productData,
      // Set first image as the main product image for compatibility
      image: allImages[0].url,
      imagePublicId: allImages[0].publicId,
      imageDetails: allImages[0].details,
      // Store all images
      images: allImages,
      updatedAt: serverTimestamp()
    });
  } else {
    // Update without changing images
    await updateDoc(docRef, {
      ...productData,
      updatedAt: serverTimestamp()
    });
  }
  
  // Get the updated product
  return await getProductById(productId);
};

// Delete product
export const deleteProduct = async (productId) => {
  const product = await getProductById(productId);
  
  // Delete all product images if they exist
  if (product && product.images && product.images.length > 0) {
    const publicIds = product.images.map(img => img.publicId);
    await deleteMultipleProductImages(publicIds);
  } 
  // Fallback for products without the images array
  else if (product && product.imagePublicId) {
    await deleteProductImage(product.imagePublicId);
  }
  
  // Delete product document
  await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
  
  return true;
}; 