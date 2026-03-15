/**
 * Navbar — Presentational Component
 *
 * Patterns: Observer (emits SIDEBAR_TOGGLE via EventBus)
 *           Single Responsibility (only nav UI + mobile toggle)
 *           Sub-component decomposition (ProfileAvatar, HamburgerButton)
 */
import React, { useState, useEffect, useCallback } from 'react';
import './navbar.css';
import { assets } from '../../assets/assets';
import EventBus, { EVENTS } from '../../events/EventBus';

// ─── ProfileAvatar ─────────────────────────────────────────────────────────────
const ProfileAvatar = ({ src, alt = 'Profile' }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return <div className="profile-fallback" role="img" aria-label={alt} />;
  }
  return (
    <img
      className="profile"
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
    />
  );
};

// ─── HamburgerButton ───────────────────────────────────────────────────────────
const HamburgerButton = ({ isOpen, onClick }) => (
  <button
    className="menu-toggle"
    onClick={onClick}
    aria-label={isOpen ? 'Close menu' : 'Open menu'}
    aria-expanded={isOpen}
  >
    {isOpen ? '✕' : '☰'}
  </button>
);

// ─── Navbar ────────────────────────────────────────────────────────────────────
const Navbar = () => {
  const [isMobile,   setIsMobile]   = useState(window.innerWidth < 768);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsMenuOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleToggle = useCallback(() => {
    if (!isMobile) return;
    setIsMenuOpen((prev) => {
      const next = !prev;
      // Observer: broadcast so Sidebar can open/close independently
      EventBus.emit(EVENTS.SIDEBAR_TOGGLE, { isOpen: next });
      return next;
    });
  }, [isMobile]);

  return (
    <nav className={`navbar${isMenuOpen ? ' menu-open' : ''}`}>
      <div className="navbar-left">
        <HamburgerButton isOpen={isMenuOpen} onClick={handleToggle} />
        <img className="logo" src={assets.logo} alt="Brand logo" />
      </div>
      <div className="nav-right">
        <div className="profile-container">
          <ProfileAvatar src={assets.profile_image} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
