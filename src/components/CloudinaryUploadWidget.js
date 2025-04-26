import React, { useEffect, useRef } from 'react';
import { Button } from 'react-bootstrap';
import cloudinaryConfig from '../config/cloudinaryConfig';

const CloudinaryUploadWidget = ({ onImageUpload, buttonText = 'Upload Image', className = '', multiple = false }) => {
  const cloudinaryRef = useRef();
  const widgetRef = useRef();

  useEffect(() => {
    // Check if Cloudinary script is already loaded
    if (!window.cloudinary) {
      // Add the Cloudinary widget script
      const script = document.createElement('script');
      script.src = 'https://upload-widget.cloudinary.com/global/all.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => initializeWidget();
      
      return () => {
        document.body.removeChild(script);
      };
    } else {
      initializeWidget();
    }
  }, []);

  const initializeWidget = () => {
    cloudinaryRef.current = window.cloudinary;
    widgetRef.current = cloudinaryRef.current.createUploadWidget(
      {
        cloudName: cloudinaryConfig.cloudName,
        uploadPreset: cloudinaryConfig.uploadPreset,
        folder: 'products',
        cropping: true,
        multiple: multiple,
        maxImageFileSize: 5000000, // 5MB
        showSkipCropButton: false,
        styles: {
          palette: {
            window: '#FFFFFF',
            sourceBg: '#F4F4F5',
            windowBorder: '#90A0B3',
            tabIcon: '#0094C7',
            inactiveTabIcon: '#69778A',
            menuIcons: '#0094C7',
            link: '#0094C7',
            action: '#7367F0',
            inProgress: '#0194C7',
            complete: '#20BF55',
            error: '#EA2027',
            textDark: '#2C3E50',
            textLight: '#FFFFFF',
          },
        },
      },
      (error, result) => {
        if (!error && result && result.event === 'success') {
          // Call the callback with the uploaded image details
          onImageUpload({
            public_id: result.info.public_id,
            url: result.info.secure_url,
            format: result.info.format,
            width: result.info.width,
            height: result.info.height,
            original_filename: result.info.original_filename,
          });
        }
      }
    );
  };

  const openWidget = () => {
    if (widgetRef.current) {
      widgetRef.current.open();
    }
  };

  return (
    <Button
      variant="outline-primary"
      onClick={openWidget}
      className={className}
    >
      {buttonText}
    </Button>
  );
};

export default CloudinaryUploadWidget; 