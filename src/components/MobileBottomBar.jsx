import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Compass, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const MobileBottomBar = () => {
  const { cartCount } = useCart();
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Hide mobile bottom bar on checkout or admin dashboard to prevent obstruction
  if (location.pathname.startsWith('/admin') || location.pathname === '/checkout') {
    return null;
  }

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/shop', label: 'Flavours', icon: Compass },
    { to: '/cart', label: 'Bag', icon: ShoppingBag, badge: cartCount },
    { to: isAuthenticated ? '/profile' : '/login', label: 'Account', icon: User },
  ];

  return (
    <motion.nav
      className="mobile-bottom-bar"
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mobile-bottom-bar-inner">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`mobile-bar-item ${isActive ? 'active' : ''}`}
            >
              <motion.div
                whileTap={{ scale: 0.85 }}
                className="mobile-bar-icon-wrap"
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {item.badge > 0 && (
                  <motion.span
                    className="mobile-bar-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    {item.badge}
                  </motion.span>
                )}
              </motion.div>
              <span className="mobile-bar-label">{item.label}</span>
              {isActive && (
                <motion.div
                  className="mobile-bar-active-dot"
                  layoutId="mobileActiveDot"
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                />
              )}
            </NavLink>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default MobileBottomBar;

