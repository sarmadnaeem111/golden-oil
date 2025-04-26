import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="home-hero">
      <div className="hero-content">
        <h1>Premium Quality Golden Oil</h1>
        <p>Experience the richness of our cold-pressed, organic golden oils</p>
        <div className="hero-buttons">
          <Link to="/products" className="btn btn-primary">
            Shop Now
          </Link>
          <Link to="/about" className="btn btn-outline">
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero; 