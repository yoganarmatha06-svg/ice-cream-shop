import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  IceCream,
  Sparkles,
  PlusCircle,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  ChevronRight,
  RefreshCw,
  Users,
} from 'lucide-react';
import { adminAPI } from '../services/api';
import Loader from '../components/Loader';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await adminAPI.getDashboard();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Unable to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center' }}>
        <Loader text="Loading Scoop Dreams Admin Dashboard..." />
      </div>
    );
  }

  const totalVarieties = stats?.totalIceCreams || 0;
  const totalFlavors = stats?.totalFlavors || 0;
  const totalCustomers = stats?.totalCustomers || 0;
  const totalOrders = stats?.totalOrders || 0;
  const availableCount = stats?.availableIceCreams || 0;
  const unavailableCount = stats?.unavailableIceCreams || 0;
  const activeFlavors = stats?.activeFlavors || 0;
  const recentItems = stats?.recentlyAdded || [];
  const flavorStats = stats?.flavorStats || [];

  return (
    <div>
      {/* Dashboard Top Header */}
      <div className="admin-header">
        <div className="admin-header-title-box">
          <h1>Admin Dashboard</h1>
          <p>Overview of your artisanal ice cream varieties and flavor portfolio.</p>
        </div>
        <div className="admin-header-actions">
          <button
            type="button"
            onClick={fetchStats}
            className="btn-secondary"
            style={{ padding: '10px 18px', fontSize: '0.88rem' }}
            title="Refresh Dashboard Data"
          >
            <RefreshCw size={15} /> Refresh
          </button>
          <Link
            to="/admin/icecreams"
            className="btn-primary"
            style={{ padding: '10px 22px', fontSize: '0.88rem' }}
          >
            <PlusCircle size={16} /> Add Ice Cream
          </Link>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '14px 20px',
            background: '#fee2e2',
            color: '#b91c1c',
            borderRadius: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Quick Stats Cards Grid */}
      <div className="admin-stats-grid">
        {/* Total Ice Cream Varieties */}
        <motion.div
          className="admin-stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="stat-icon-wrapper stat-icon-pink">
            <IceCream size={28} />
          </div>
          <div className="stat-info">
            <h3>{totalVarieties}</h3>
            <p>Ice Cream Varieties</p>
            <div className="stat-subtext" style={{ color: '#059669', fontWeight: 600 }}>
              {availableCount} Available • {unavailableCount} Out of Stock
            </div>
          </div>
        </motion.div>

        {/* Total Flavors */}
        <motion.div
          className="admin-stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="stat-icon-wrapper stat-icon-cream">
            <Sparkles size={28} />
          </div>
          <div className="stat-info">
            <h3>{totalFlavors}</h3>
            <p>Flavor Collections</p>
            <div className="stat-subtext" style={{ color: '#b45309', fontWeight: 600 }}>
              {activeFlavors} Active Flavors
            </div>
          </div>
        </motion.div>

        {/* In-Stock Rate */}
        <motion.div
          className="admin-stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="stat-icon-wrapper stat-icon-green">
            <CheckCircle2 size={28} />
          </div>
          <div className="stat-info">
            <h3>{totalVarieties > 0 ? Math.round((availableCount / totalVarieties) * 100) : 0}%</h3>
            <p>Availability Health</p>
            <div className="stat-subtext" style={{ color: '#15803d' }}>
              Parlour & Delivery Ready
            </div>
          </div>
        </motion.div>

        {/* Total Customers */}
        <motion.div
          className="admin-stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="stat-icon-wrapper stat-icon-blue">
            <Users size={28} />
          </div>
          <div className="stat-info">
            <h3>{totalCustomers}</h3>
            <p>Total Customers</p>
            <div className="stat-subtext" style={{ color: '#0284c7', fontWeight: 600 }}>
              {totalOrders} Total Orders
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Access to Management Modules */}
      <div className="admin-quick-actions-banner">
        <div className="quick-action-text">
          <h3>Quick Management Access</h3>
          <p>Choose an admin module to manage your ice creams, flavors, or customer profiles.</p>
        </div>
        <div className="quick-actions-btns">
          <Link
            to="/admin/icecreams"
            className="btn-primary"
            style={{ padding: '12px 24px', fontSize: '0.92rem' }}
          >
            <IceCream size={18} /> Manage Ice Creams <ArrowRight size={16} />
          </Link>
          <Link
            to="/admin/flavors"
            className="btn-secondary"
            style={{ padding: '12px 24px', fontSize: '0.92rem' }}
          >
            <Sparkles size={18} /> Manage Flavors <ArrowRight size={16} />
          </Link>
          <Link
            to="/admin/customers"
            className="btn-secondary"
            style={{ padding: '12px 24px', fontSize: '0.92rem' }}
          >
            <Users size={18} /> Manage Customers <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Two Column Layout: Recently Added Ice Creams & Flavors Breakdown */}
      <div className="admin-dashboard-split-grid">
        {/* Recently Added Ice Creams */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2>Recently Added Ice Creams</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Latest artisan creations on your menu</p>
            </div>
            <Link
              to="/admin/icecreams"
              style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--strawberry)', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              View All ({totalVarieties}) <ChevronRight size={16} />
            </Link>
          </div>

          {recentItems.length === 0 ? (
            <div className="admin-empty-state" style={{ padding: '40px 10px' }}>
              <div className="admin-empty-icon">🍦</div>
              <h3>No Ice Creams Yet</h3>
              <p>Add your first ice cream variety to showcase it in your shop.</p>
              <Link to="/admin/icecreams" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                + Add Variety
              </Link>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Variety</th>
                    <th>Flavor</th>
                    <th>Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentItems.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div className="table-product-cell">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="table-thumb"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=300&q=80';
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--chocolate-dark)' }}>{item.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-pink" style={{ fontSize: '0.75rem' }}>
                          {item.flavor?.name || 'Artisan'}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--chocolate-dark)' }}>₹{Number(item.price).toFixed(2)}</strong>
                      </td>
                      <td>
                        <span className={`status-pill ${item.status === 'Available' ? 'status-available' : 'status-unavailable'}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Flavors Portfolio Breakdown */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2>Flavor Portfolio</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Assigned recipes per flavor</p>
            </div>
            <Link
              to="/admin/flavors"
              style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--strawberry)', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Manage ({totalFlavors}) <ChevronRight size={16} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {flavorStats.slice(0, 7).map((flavor) => (
              <div
                key={flavor._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: '#fdfaf9',
                  borderRadius: '16px',
                  border: '1px solid var(--border-soft)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={flavor.image}
                    alt={flavor.name}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=200&q=80';
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--chocolate-dark)' }}>
                      {flavor.name}
                    </div>
                    <span className={`status-pill ${flavor.status === 'Active' ? 'status-active' : 'status-inactive'}`} style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                      {flavor.status}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      background: '#ffe4e6',
                      color: 'var(--strawberry)',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    {flavor.count} {flavor.count === 1 ? 'Variety' : 'Varieties'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Link
              to="/admin/flavors"
              className="btn-secondary"
              style={{ width: '100%', padding: '10px 16px', fontSize: '0.85rem' }}
            >
              + Create New Flavor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
