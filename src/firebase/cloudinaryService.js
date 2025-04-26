// Cloudinary service for handling product image uploads
import cloudinaryConfig from '../config/cloudinaryConfig';

// Function to upload a file to Cloudinary
export const uploadToCloudinary = async (file) => {
  try {
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    formData.append('folder', 'products');
    
    // Upload to Cloudinary using their API
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload image to Cloudinary');
    }
    
    const data = await response.json();
    
    // Return relevant data
    return {
      public_id: data.public_id,
      url: data.secure_url,
      format: data.format,
      width: data.width,
      height: data.height
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

// Function to delete an image from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  
  try {
    // In a production environment, you would use a backend API to handle this
    // as the Cloudinary API key should not be exposed on the frontend
    console.log(`Image with public_id ${publicId} would be deleted from Cloudinary`);
    // For security reasons, actual deletion should be handled by a backend API
    
    // Example of how you would set up a secure backend endpoint for deletion:
    // const response = await fetch('/api/cloudinary/delete', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ publicId }),
    // });
    
    // if (!response.ok) {
    //   throw new Error('Failed to delete image from Cloudinary');
    // }
    
    return true;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
}; 