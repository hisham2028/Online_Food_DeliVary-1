import React, { useState } from 'react';
import './OurServices.css';

const OurServices = () => {
  const [currentIndex, setCurrentIndex] = useState(1);

  const services = [
    { 
      title: 'Dine-In Experience', 
      description: 'Luxury atmosphere with top-tier service.',
      image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80' 
    },
    { 
      title: 'Home Delivery', 
      description: 'Fresh flavors delivered to your doorstep.',
      image: 'https://images.unsplash.com/photo-1585735633320-d24595a213a1?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    { 
      title: 'Event Catering', 
      description: 'Professional catering for your special moments.',
      image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80' 
    }
  ];

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % services.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + services.length) % services.length);

  return (
    <div className="services-section">
      {/* 1. The Dynamic Blurred Background */}
      <div 
        className="dynamic-bg" 
        style={{ backgroundImage: `url(${services[currentIndex].image})` }}
      ></div>
      {/* 2. Dark Overlay so the text remains readable over the image */}
      <div className="bg-overlay"></div>

      {/* 3. The Main Content */}
      <div className="services-content">
        <h2 className="services-title">Our Services</h2>
        <p className="services-subtitle">Exceptional dining tailored to your needs.</p>
        
        <div className="carousel-container">
          <button className="nav-btn prev" onClick={prevSlide}>&#10094;</button>
          
          <div className="cards-wrapper">
            {services.map((service, index) => {
              let position = 'next';
              if (index === currentIndex) position = 'active';
              else if (index === (currentIndex - 1 + services.length) % services.length) position = 'prev';

              return (
                <div key={index} className={`carousel-card ${position}`}>
                  <div 
                    className="card-image-bg" 
                    style={{ backgroundImage: `url(${service.image})` }}
                  >
                    <div className="card-overlay" />
                  </div>

                  <div className="card-content">
                    <div className="accent-line" />
                    <h3 className="card-title">{service.title}</h3>
                    <p className="card-description">{service.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <button className="nav-btn next" onClick={nextSlide}>&#10095;</button>
        </div>
      </div>
    </div>
  );
};

export default OurServices;