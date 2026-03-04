import React from 'react';
import './fooddisply.css';
import { useStore } from '../../context/StoreContext';
import FoodItem from '../Food Item/FoodItem';
import { motion, AnimatePresence } from 'framer-motion';

const FoodDisplay = ({ category }) => {
  const { food_list } = useStore();

  // For home page (category "All"), show top selling items (sorted by price descending, limited to 8)
  const displayItems = category === "All" 
    ? food_list.slice().sort((a, b) => b.price - a.price).slice(0, 8)
    : food_list.filter(item => category === "All" || category === item.category);

  // Animation variants for the container
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // This creates the "wave" effect
      },
    },
  };

  // Animation variants for individual items
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  return (
    <div className="food-display" id='food-display'>
      <h2>Top Selling Items</h2>
      
      <motion.div 
        className="food-display-list"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <AnimatePresence mode='popLayout'>
          {displayItems.map((item) => {
              return (
                <motion.div
                  layout
                  key={item._id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                >
                  <FoodItem 
                    id={item._id} 
                    name={item.name} 
                    description={item.description} 
                    price={item.price} 
                    image={item.image}
                  />
                </motion.div>
              )
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default FoodDisplay;