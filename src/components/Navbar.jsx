import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Heart,
  ShoppingBag,
  User as UserIcon,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  PackageCheck,
  ChevronDown,
  Phone,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import '../styles/navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount, toastMessage } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      const navbarHeight = 85;
      const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: Math.max(0, elementPosition - navbarHeight),
        behavior: 'smooth',
      });
    }
  };

  const handleNavSectionClick = (e, sectionId) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (location.pathname === '/') {
      scrollToSection(sectionId);
      window.history.pushState(null, '', `#${sectionId}`);
    } else {
      navigate(`/#${sectionId}`);
      setTimeout(() => {
        scrollToSection(sectionId);
      }, 250);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <motion.header
        className={`navbar-header ${scrolled ? 'navbar-scrolled' : ''}`}
        initial={{ y: -70, opacity: 0 }}
        animate={{
          y: 0,
          opacity: 1,
          backgroundColor: scrolled ? 'rgba(255, 253, 250, 0.98)' : 'rgba(255, 253, 250, 0.88)',
          boxShadow: scrolled
            ? '0 12px 28px -6px rgba(45, 24, 16, 0.08)'
            : '0 1px 0 rgba(241, 228, 226, 0.6)',
        }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          zIndex: 1000,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <div className="container navbar-container">
          {/* Brand Logo with Gentle Hover Bounce */}
          <Link to="/" className="nav-brand">
            <motion.span
              className="brand-text"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              Scoop Dreams
            </motion.span>
            <motion.span
              className="brand-dot"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            >
              🍦
            </motion.span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="nav-menu">
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive && !location.hash ? 'active' : ''}`}>
              Home
            </NavLink>
            <NavLink to="/shop" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Shop
            </NavLink>
            <a
              href="/#categories"
              onClick={(e) => handleNavSectionClick(e, 'categories')}
              className={`nav-link ${location.pathname === '/' && location.hash === '#categories' ? 'active' : ''}`}
            >
              Categories
            </a>
            <a
              href="/#about"
              onClick={(e) => handleNavSectionClick(e, 'about')}
              className={`nav-link ${location.pathname === '/' && location.hash === '#about' ? 'active' : ''}`}
            >
              About
            </a>
            <a
              href="/#why-us"
              onClick={(e) => handleNavSectionClick(e, 'why-us')}
              className={`nav-link ${location.pathname === '/' && location.hash === '#why-us' ? 'active' : ''}`}
            >
              Why Us
            </a>
          </nav>

          {/* Action Icons */}
          <div className="nav-actions">
            {/* Search Trigger */}
            <motion.button
              className="action-icon-btn"
              onClick={() => setSearchOpen(true)}
              aria-label="Search Flavours"
              title="Search Flavours"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.92 }}
            >
              <Search size={20} />
            </motion.button>

            {/* Cart */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}>
              <Link to="/cart" className="action-icon-btn" aria-label="Shopping Cart" title="Your Cart">
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <motion.span
                    className="nav-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    {cartCount}
                  </motion.span>
                )}
              </Link>
            </motion.div>

            {/* User Profile / Login (Desktop - Clean Icon, No Photo) */}
            {isAuthenticated ? (
              <div className="user-menu-wrapper desktop-user-menu">
                <motion.button
                  className="user-avatar-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-label="User Account"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="user-avatar-icon-wrap">
                    <UserIcon size={16} />
                  </div>
                  <span className="user-display-name">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown size={14} />
                </motion.button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      className="user-dropdown"
                      onClick={() => setUserDropdownOpen(false)}
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-soft)' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--chocolate-dark)' }}>
                          {user.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                      </div>

                      <Link to="/profile" className="dropdown-item">
                        <UserIcon size={16} /> My Profile
                      </Link>
                      <Link to="/my-orders" className="dropdown-item">
                        <PackageCheck size={16} /> My Orders
                      </Link>

                      <div className="dropdown-divider"></div>
                      <button
                        onClick={logout}
                        className="dropdown-item"
                        style={{ color: '#e11d48', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div className="desktop-login-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/login" className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
                  Sign In
                </Link>
              </motion.div>
            )}

            {/* Mobile Nav Toggle */}
            <motion.button
              className="mobile-toggle-btn"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open mobile navigation menu"
              whileTap={{ scale: 0.9 }}
            >
              <Menu size={24} />
            </motion.button>
          </div>
        </div>

        {/* Mobile Nav Drawer with Animated Backdrop & Slide-in */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Blur Backdrop */}
              <motion.div
                className="mobile-drawer-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
              />

              {/* Side Drawer Content */}
              <motion.div
                className="mobile-drawer-panel"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              >
                {/* Drawer Header */}
                <div className="mobile-drawer-header">
                  <div className="nav-brand">
                    <span className="brand-text" style={{ fontSize: '1.9rem' }}>Scoop Dreams</span>
                    <span>🍦</span>
                  </div>
                  <motion.button
                    className="mobile-drawer-close"
                    onClick={() => setMobileMenuOpen(false)}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Close menu"
                  >
                    <X size={22} />
                  </motion.button>
                </div>

                {/* User Card if Authenticated */}
                {isAuthenticated ? (
                  <div className="mobile-user-card">
                    <div className="mobile-user-avatar-icon">
                      <UserIcon size={22} />
                    </div>
                    <div>
                      <div className="mobile-user-name">{user?.name}</div>
                      <div className="mobile-user-email">{user?.email}</div>
                    </div>
                  </div>
                ) : (
                  <div className="mobile-guest-card">
                    <p>Welcome to Scoop Dreams!</p>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="btn-primary"
                      style={{ padding: '10px 20px', fontSize: '0.9rem', width: '100%' }}
                    >
                      Sign In or Register
                    </Link>
                  </div>
                )}

                {/* Staggered Navigation Links */}
                <motion.nav
                  className="mobile-drawer-nav"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
                  }}
                >
                  {[
                    { to: '/', label: 'Home', badge: '🍓 Fresh' },
                    { to: '/shop', label: 'All Flavours', badge: '12+ Recipes' },
                    { section: 'categories', label: 'Categories' },
                    { section: 'about', label: 'Our Artisan Story' },
                    { section: 'why-us', label: 'Why Choose Us' },
                    { to: '/cart', label: `Shopping Bag (${cartCount})` },
                    ...(isAuthenticated ? [{ to: '/my-orders', label: 'My Ice Cream Orders' }] : []),
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      variants={{
                        hidden: { opacity: 0, x: 20 },
                        visible: { opacity: 1, x: 0 },
                      }}
                    >
                      {item.section ? (
                        <a
                          href={`/#${item.section}`}
                          onClick={(e) => handleNavSectionClick(e, item.section)}
                          className={`mobile-drawer-link ${location.pathname === '/' && location.hash === `#${item.section}` ? 'active' : ''}`}
                        >
                          <span>{item.label}</span>
                        </a>
                      ) : (
                        <NavLink
                          to={item.to}
                          onClick={() => setMobileMenuOpen(false)}
                          className={({ isActive }) =>
                            `mobile-drawer-link ${isActive && !location.hash ? 'active' : ''} ${item.highlight ? 'admin-highlight' : ''}`
                          }
                        >
                          <span>{item.label}</span>
                          {item.badge && <span className="badge badge-pink">{item.badge}</span>}
                        </NavLink>
                      )}
                    </motion.div>
                  ))}
                </motion.nav>

                {/* Drawer Footer info */}
                <div className="mobile-drawer-footer">
                  {isAuthenticated && (
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="btn-secondary"
                      style={{ width: '100%', marginBottom: '16px', color: '#e11d48' }}
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <Clock size={15} color="var(--strawberry)" /> Daily 11:00 AM – 11:30 PM
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    <Phone size={15} color="var(--strawberry)" /> +1 (800) 555-SCOOP
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Instant Search Popover with Backdrop Blur & Scale In */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="search-modal-backdrop"
            onClick={() => setSearchOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="search-modal-box"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <form onSubmit={handleSearchSubmit} className="search-input-wrapper">
                <Search size={22} color="var(--strawberry)" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search flavors, strawberry, chocolate..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input-field"
                />
                <button type="submit" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                  Search
                </button>
              </form>
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Popular:</span>
                {['Berry Blush', 'Mango Velvet', 'Pistachio Dream', 'Dark Truffle', 'Vanilla Cloud'].map((flv) => (
                  <button
                    key={flv}
                    type="button"
                    onClick={() => {
                      navigate(`/shop?search=${encodeURIComponent(flv)}`);
                      setSearchOpen(false);
                    }}
                    className="badge badge-pink"
                    style={{ cursor: 'pointer', border: 'none' }}
                  >
                    {flv}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            className="scoop-toast"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
