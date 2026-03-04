import React from 'react';
import './OrderConfirmation.css';

const OrderConfirmation = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="checkmark-wrapper">
          <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
            <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </div>
        
        <h2>Order Confirmed!</h2>
        <p>Your order has been placed successfully. Check your email for details.</p>
        
        <button className="confirm-btn" onClick={onClose}>
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;