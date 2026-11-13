import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  IceCream,
  Sparkles,
  ShoppingBag,
  Users,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Store,
  Settings,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/admin.css';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If loading session, show smooth loader
  if (loading) {
    return (
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle at center, #fff0f3 0%, #fffdfa 70%)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '14px', animation: 'bounce 1s infinite' }}>🍦</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--chocolate-dark)', letterSpacing: '0.5px' }}>
            Verifying Administrator Access...
          </div>
        </div>
      </div>
    );
  }

  // Protected: Allow access to the Admin Dashboard ONLY after successful backend verification
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-wrapper">
      {/* Mobile Sticky Header Bar */}
      <header className="admin-mobile-header">
        <Link to="/admin" className="admin-brand-link">
          <span className="admin-brand-title" style={{ fontSize: '1.65rem' }}>Scoop Dreams</span>
          <span className="admin-badge">Admin</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Admin Avatar Chip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', background: '#fdf2f4', borderRadius: '999px' }}>
            <img
              src={user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
              alt={user?.name}
              style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--chocolate-dark)' }}>
              {user?.name?.split(' ')[0] || 'Admin'}
            </span>
          </div>

          {/* Toggle Navigation Button */}
          <motion.button
            type="button"
            className="admin-mobile-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle Navigation"
            whileTap={{ scale: 0.92 }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </motion.button>
        </div>
      </header>

      {/* Backdrop for Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="admin-sidebar-backdrop"
            onClick={() => setSidebarOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop Sticky & Mobile Drawer */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div className="admin-brand">
          <Link to="/admin" className="admin-brand-link" onClick={() => setSidebarOpen(false)}>
            <span className="admin-brand-title">Scoop Dreams</span>
            <span style={{ fontSize: '1.2rem' }}>🍦</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="admin-badge">Admin</span>
            {/* Close button inside mobile drawer */}
            <button
              type="button"
              className="admin-sidebar-close-btn"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close Sidebar"
              style={{ display: sidebarOpen ? 'flex' : 'none' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Links: ONLY Dashboard, Ice Cream Varieties, Flavors */}
        <nav className="admin-nav">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/icecreams"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <IceCream size={20} />
            <span>Ice Cream Varieties</span>
          </NavLink>

          <NavLink
            to="/admin/flavors"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <Sparkles size={20} />
            <span>Flavor Management</span>
          </NavLink>

          <NavLink
            to="/admin/orders"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <ShoppingBag size={20} />
            <span>Orders & Status</span>
          </NavLink>

          <NavLink
            to="/admin/customers"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <Users size={20} />
            <span>Customer Management</span>
          </NavLink>

          <NavLink
            to="/admin/reports"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <BarChart3 size={20} />
            <span>Sales Reports</span>
          </NavLink>

          <NavLink
            to="/admin/settings"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <Settings size={20} />
            <span>Store Settings</span>
          </NavLink>
        </nav>

        {/* Sidebar Footer */}
        <div className="admin-sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#fdf2f4', borderRadius: '14px', marginBottom: '8px' }}>
            <img
              src={user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
              alt={user?.name}
              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--chocolate-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Administrator'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Store Manager</div>
            </div>
          </div>

          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-nav-item"
            style={{ color: 'var(--text-secondary)' }}
            onClick={() => setSidebarOpen(false)}
          >
            <ExternalLink size={18} />
            <span>View Storefront</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="admin-nav-item"
            style={{ color: '#e11d48', width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content View */}
      <main className="admin-main">
        <Outlet />
      </main>

      {/* Dedicated Admin Mobile Bottom Navigation Bar */}
      <nav className="admin-mobile-bottom-bar" aria-label="Admin Mobile Navigation">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) => `admin-bottom-tab ${isActive ? 'active' : ''}`}
          onClick={() => setSidebarOpen(false)}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/admin/icecreams"
          className={({ isActive }) => `admin-bottom-tab ${isActive ? 'active' : ''}`}
          onClick={() => setSidebarOpen(false)}
        >
          <IceCream size={20} />
          <span>Varieties</span>
        </NavLink>

        <NavLink
          to="/admin/flavors"
          className={({ isActive }) => `admin-bottom-tab ${isActive ? 'active' : ''}`}
          onClick={() => setSidebarOpen(false)}
        >
          <Sparkles size={20} />
          <span>Flavors</span>
        </NavLink>

        <NavLink
          to="/admin/orders"
          className={({ isActive }) => `admin-bottom-tab ${isActive ? 'active' : ''}`}
          onClick={() => setSidebarOpen(false)}
        >
          <ShoppingBag size={20} />
          <span>Orders</span>
        </NavLink>

        <NavLink
          to="/admin/settings"
          className={({ isActive }) => `admin-bottom-tab ${isActive ? 'active' : ''}`}
          onClick={() => setSidebarOpen(false)}
        >
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>

        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`admin-bottom-tab ${sidebarOpen ? 'active' : ''}`}
          aria-label="Toggle Admin Menu"
        >
          <Menu size={20} />
          <span>Menu</span>
        </button>
      </nav>
    </div>
  );
};

export default AdminLayout;
