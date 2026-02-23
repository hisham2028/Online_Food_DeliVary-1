import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './header.css';

const Header = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = ["header_img.png", "header_img_2.png", "header_img_3.png"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className='header' id="header">
      {images.map((img, index) => (
        <div
          key={index}
          className={`header-bg ${index === currentIndex ? 'active' : ''}`}
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}
      <div className="header-overlay"></div>

      <div className="headercontent">
        <div className="header-badge">Now Open: 24/7 Delivery</div>
        <h2>Order your <br/> favorite food</h2>
        <p>Crafted with the finest ingredients and culinary expertise, delivered straight to your door.</p>

        <div className="header-btns">
          <Link to="/menu">
            <button className="view-menu-btn">View Menu</button>
          </Link>

        </div>
      </div>

      {/* Animated Scroll Down Arrow */}
      <div className="scroll-indicator">
        <div className="mouse"></div>
      </div>
    </div>
  );
};

export default Header;