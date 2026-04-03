import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './sidebar.css';
import { assets } from '../../assets/assets';
import EventBus, { EVENTS } from '../../events/EventBus';

const LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: assets.dashboard_icon },
  { to: '/add', label: 'Add Items', icon: assets.add_icon },
  { to: '/list', label: 'List Items', icon: assets.add_icon },
  { to: '/orders', label: 'Orders', icon: assets.order_icon },
];

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = EventBus.on(EVENTS.SIDEBAR_TOGGLE, (payload) => {
      setIsOpen(Boolean(payload?.isOpen));
    });

    return unsubscribe;
  }, []);

  return (
    <aside className={`sidebar${isOpen ? ' sidebar--open' : ''}`}>
      <div className="sidebar-options">
        {LINKS.map((link) => {
          const isActive = location.pathname === link.to || (link.to === '/dashboard' && location.pathname === '/');
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`sidebar-option${isActive ? ' active' : ''}`}
            >
              <img src={link.icon} alt="" aria-hidden="true" />
              <p>{link.label}</p>
            </Link>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
