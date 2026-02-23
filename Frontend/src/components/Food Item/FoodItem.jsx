import React, { useState, useContext } from 'react';
import './Fooditem.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';

function FoodItem({ id, name, price, description, image }) {
    const { cartItems = {}, addToCart, removeFromCart, url } = useContext(StoreContext);
    const quantity = (cartItems && cartItems[id]) || 0;

    return (
        <div className='food-item'>
            <div className='food-item-img-container'>
                <img className='food-item-image' src={url + "/images/" + image} alt={name} />   
                    {quantity === 0 ? (
                    <button 
                        className='food-item-add-btn'
                        onClick={(e) => {
                            e.stopPropagation();
                            addToCart(id);
                        }}
                    >
                        +
                    </button>
                ) : (
                    <div className='food-item-counter'>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                removeFromCart(id);
                            }}
                            className='counter-btn minus'
                        >
                            -
                        </button>
                        <span className='counter-value'>{quantity}</span>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                addToCart(id);
                            }}
                            className='counter-btn plus'
                        >
                            +
                        </button>
                    </div>
                )}
            </div>
            <div className='food-item-info'>
                <div className='food-item-name-rating'>
                    <p className='food-item-name'>{name}</p>
                    <img 
                        className='food-item-rating' 
                        src={assets.rating_starts} 
                        alt="rating" 
                    />
                </div>
                <p className='food-item-desc'>{description}</p>
                <div className='food-item-bottom'>
                    <p className='food-item-price'>${price}</p>
                </div>
            </div>
        </div>
    );
}

export default FoodItem;