import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
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

const App = () => {
  const url = "http://localhost:4002";
  
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
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order" element={<PlaceOrder />} />
          <Route path="/verify" element={<Verify />} />
          <Route path='/myorders' element={<MyOrders />} />
          <Route path='/menu' element={<Menu />} />
          
          {/* The :token dynamic parameter allows you to capture the 
              unique ID sent in the reset email.
          */}
        </Routes>
      </div>
      
      <Footer />
      <BackToTop />
    </>
  );
};

export default App;
