import React, { useEffect, useState } from 'react';
import './navbar.css';
import { assets } from '../../assets/assets';
import EventBus, { EVENTS } from '../../events/EventBus';

const MOBILE_BREAKPOINT = 768;

const Navbar = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < MOBILE_BREAKPOINT);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileSrc, setProfileSrc] = useState(assets.profile_image);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (!mobile) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const toggleMenu = () => {
    if (!isMobile) return;
    const next = !menuOpen;
    setMenuOpen(next);
    EventBus.emit(EVENTS.SIDEBAR_TOGGLE, { isOpen: next });
  };

  return (
    <nav className="navbar" aria-label="Top navigation">
      <div className="navbar-left">
        {isMobile && (
          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={toggleMenu}
            className="navbar-menu-btn"
          >
            {menuOpen ? 'x' : '≡'}
          </button>
        )}
        <img src={assets.logo} alt="Brand logo" className="navbar-logo" />
      </div>
      <img
        src={profileSrc}
        alt="Profile"
        className="navbar-profile"
        onError={() => setProfileSrc(assets.logo)}
      />
    </nav>
  );
};

export default Navbar;
