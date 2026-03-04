import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; 
import { useStore } from '../../context/StoreContext';
import { assets } from '../../assets/assets';
import './Navbar.css';

const Navbar = ({ setShowLogin }) => {
  const [activeMenu, setActiveMenu] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sticky, setSticky] = useState(false);
  
  // Search State
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { getTotalCartAmount, token, setToken } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll effect for sticky navbar
  useEffect(() => {
    const handleScroll = () => {
      window.scrollY > 50 ? setSticky(true) : setSticky(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
      setShowSearch(false);
      setSearchQuery("");
    }
  };

  const handleMenuItemClick = (menuItem) => {
    setActiveMenu(menuItem);
    setIsMobileMenuOpen(false);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    navigate("/");
  };

  return (
    <div className={`navbar ${sticky ? 'sticky' : ''}`}>
      <Link to="/" onClick={() => handleMenuItemClick('home')}>
        <img src={assets.logo} alt="Logo" className='logo' />
      </Link>
      
      <ul className={`navbar-menu ${isMobileMenuOpen ? 'active' : ''}`}>
        <Link 
          to='/' 
          onClick={() => { navigate('/'); window.scrollTo(0, 0); handleMenuItemClick('home'); }} 
          className={activeMenu === "home" ? "active" : ""}
        >home</Link>
        <Link 
          to='/menu' 
          onClick={() => handleMenuItemClick('menu')} 
          className={activeMenu === "menu" ? "active" : ""}
        >menu</Link>
        {location.pathname === '/' && (
          <a 
            href='#OurServices' 
            onClick={() => handleMenuItemClick('services')} 
            className={activeMenu === "services" ? "active" : ""}
          >our services</a>
        )}
        <a 
          href='#footer' 
          onClick={() => handleMenuItemClick('contact')} 
          className={activeMenu === "contact" ? "active" : ""}
        >contact-us</a>
      </ul>
      
      <div className='navbar-right'>
        {/* Search Container */}
        <div className={`navbar-search-container ${showSearch ? 'active' : ''}`}>
          <form onSubmit={handleSearch}>
            <input 
              type="text" 
              placeholder="Search items..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus={showSearch}
            />
          </form>
          <img 
            src={assets.search_icon} 
            alt="Search" 
            className="search-icon" 
            onClick={() => setShowSearch(!showSearch)} 
          />
        </div>

        {/* Cart Icon with Dynamic Dot */}
        <div className='navbar-cart-icon'>
          <Link to="/cart" onClick={() => handleMenuItemClick('cart')}>
            <img src={assets.basket_icon} alt="Cart" />
            {/* Dot only appears if items are in the cart */}
            {getTotalCartAmount() > 0 && <div className="dot"></div>}
          </Link>
        </div>

        {/* User Authentication Logic */}
        {!token ? (
          <button onClick={() => setShowLogin(true)} className="signin-btn">Sign In</button>
        ) : (
          <div className='navbar-profile'>
            <img src={assets.profile_icon} alt="Profile" className='profile-icon-img' />
            <ul className='nav-profile-dropdown'>
              <li onClick={() => navigate('/myorders')}>
                <img src={assets.bag_icon} alt="Orders" />
                <p>Orders</p>
              </li>
              <hr />
              <li onClick={logout}>
                <img src={assets.logout_icon} alt="Logout" />
                <p>Logout</p>
              </li>
            </ul>
          </div>
        )}

        {/* Hamburger menu for mobile */}
        <div className={`mobile-menu-toggle ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;