import React from 'react';
import { assets } from '../../assets/assets';
import './footer.css';

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer id="footer" className="footer">
            
            {/* 1. THE FULL SIZE MAP SECTION */}
            <div className="footer-map-full">
                <iframe 
                    title="Restaurant Location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.2152061234!2d-73.985428!3d40.748817!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQ0JzU1LjciTiA3M8KwNTknMDcuNSJX!5e0!3m2!1sen!2sus!4v1621234567890" 
                    width="100%" 
                    height="450" 
                    style={{ border: 0 }} 
                    allowFullScreen="" 
                    loading="lazy"
                ></iframe>
            </div>

            {/* 2. THE TEXT CONTENT SECTION (Now below the map) */}
            <div className="footer-info-container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>Crave Yard</h3>
                        <p>Delicious meals delivered to your doorstep. Fresh ingredients, fast delivery, and premium taste.</p>
                        <div className="social-icons">
                            <img src={assets.facebook_icon} alt="Facebook" />
                            <img src={assets.twitter_icon} alt="Twitter" />
                            <img src={assets.linkedin_icon} alt="Instagram" />
                        </div>
                    </div>

                    <div className="footer-section">
                        <h4>Contact Us</h4>
                        <p><b>Email:</b> info@craveyard.com</p>
                        <p><b>Phone:</b> (123) 456-7890</p>
                        <p><b>Address:</b> 123 Food Street, Cuisine City</p>
                    </div>
                </div>

                <hr />
                
                <div className="footer-bottom">
                    <p>© {year} Crave Yard. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;