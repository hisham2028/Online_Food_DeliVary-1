import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/footer";
import Login from "./components/Login/login";
import Home from "./pages/Home/home";
import Cart from "./pages/Cart/cart";
import PlaceOrder from "./pages/Place Order/placeorder";
import Verify from './pages/verify/verify';
import MyOrders from './pages/myOrders/myorders';
import Menu from './pages/Menu/menu';
import BackToTop from './components/BackToTop/BackToTop';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';

const App = () => {
  const url = "http://localhost:4002";
  const location = useLocation();
  
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      {/* Toast notifications for success/error messages */}
      <ToastContainer position="top-center" autoClose={3000} />

      {/* Conditional Popups */}
      {showLogin && (
        <Login 
          setShowLogin={setShowLogin} 
        />
      )}

      <div className="app">
        <Navbar setShowLogin={setShowLogin} />
        <ScrollToTop />
        
        
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
              >
                <Home />
              </motion.div>
            } />
            <Route path="/cart" element={<Cart />} />
            <Route path="/order" element={<PlaceOrder />} />
            <Route path="/verify" element={
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
              >
                <Verify />
              </motion.div>
            } />
            <Route path='/myorders' element={<MyOrders />} />
            <Route path='/menu' element={
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
              >
                <Menu />
              </motion.div>
            } />
          </Routes>
        </AnimatePresence>
      </div>
      
      <Footer />
      <BackToTop />
    </>
  );
};

export default App;
