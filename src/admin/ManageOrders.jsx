import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Search,
  Filter,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  IndianRupee,
  Phone,
  Mail,
  MapPin,
  Calendar,
  X,
  CreditCard,
  Sparkles,
  Package,
  ArrowRight,
  Send,
  IceCream,
  Check,
} from 'lucide-react';
import { ordersAPI } from '../services/api';
import Loader from '../components/Loader';
import '../styles/admin.css';

const ORDER_STATUSES = [
  'Processing',
  'Confirmed',
  'Preparing Scoops',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

const getStatusClass = (status = '') => {
  switch (status) {
    case 'Processing':
      return 'status-processing';
    case 'Confirmed':
      return 'status-confirmed';
    case 'Preparing Scoops':
      return 'status-preparing';
    case 'Out for Delivery':
      return 'status-delivery';
    case 'Delivered':
      return 'status-delivered';
    case 'Cancelled':
      return 'status-cancelled';
    default:
      return 'status-processing';
  }
};

const getNextStatus = (currentStatus) => {
  switch (currentStatus) {
    case 'Processing':
      return 'Confirmed';
    case 'Confirmed':
      return 'Preparing Scoops';
    case 'Preparing Scoops':
      return 'Out for Delivery';
    case 'Out for Delivery':
      return 'Delivered';
    default:
      return null;
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'Processing':
      return <Clock size={14} />;
    case 'Confirmed':
      return <CheckCircle2 size={14} />;
    case 'Preparing Scoops':
      return <IceCream size={14} />;
    case 'Out for Delivery':
      return <Truck size={14} />;
    case 'Delivered':
      return <CheckCircle2 size={14} />;
    case 'Cancelled':
      return <XCircle size={14} />;
    default:
      return <Clock size={14} />;
  }
};

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [modalNewStatus, setModalNewStatus] = useState('');
  const [modalTrackingNote, setModalTrackingNote] = useState('');
  const [notification, setNotification] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const res = await ordersAPI.getAll(params);
      if (res.success) {
        setOrders(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching admin orders:', err);
      setError('Unable to load orders. Please ensure backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Direct status update handler (called from quick dropdown or modal)
  const handleUpdateStatus = async (orderId, newStatus, customNote = '') => {
    try {
      setUpdatingOrderId(orderId);
      const res = await ordersAPI.updateStatus(orderId, {
        orderStatus: newStatus,
        trackingMessage: customNote || undefined,
      });

      if (res.success) {
        // Update local order list
        setOrders((prev) =>
          prev.map((ord) => (ord._id === orderId ? res.data : ord))
        );

        // Update selected order in modal if currently open
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(res.data);
          setModalTrackingNote('');
        }

        showToast(`Order #${res.data?.orderId || orderId.slice(-6)} status updated to "${newStatus}"!`);
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      showToast(err.response?.data?.message || 'Failed to update order status', 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Client side search filter
  const filteredOrders = orders.filter((ord) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const orderId = (ord.orderId || ord._id || '').toLowerCase();
    const custName = (ord.deliveryAddress?.fullName || ord.user?.name || '').toLowerCase();
    const custEmail = (ord.deliveryAddress?.email || ord.user?.email || '').toLowerCase();
    const custPhone = (ord.deliveryAddress?.phone || ord.user?.phone || '').toLowerCase();
    const hasItem = (ord.products || []).some(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.flavour && p.flavour.toLowerCase().includes(q))
    );
    return (
      orderId.includes(q) ||
      custName.includes(q) ||
      custEmail.includes(q) ||
      custPhone.includes(q) ||
      hasItem
    );
  });

  // KPI Metrics Calculation
  const totalOrdersCount = orders.length;
  const activeOrdersCount = orders.filter((o) =>
    ['Processing', 'Confirmed', 'Preparing Scoops'].includes(o.orderStatus)
  ).length;
  const deliveryOrdersCount = orders.filter((o) => o.orderStatus === 'Out for Delivery').length;
  const deliveredOrdersCount = orders.filter((o) => o.orderStatus === 'Delivered').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="admin-page-container">
      {/* Toast Notification Alert */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            style={{
              position: 'fixed',
              top: '24px',
              right: '24px',
              zIndex: 9999,
              padding: '14px 22px',
              borderRadius: '16px',
              background: notification.type === 'error' ? '#ef4444' : '#10b981',
              color: '#ffffff',
              boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
              fontWeight: 700,
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            {notification.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', marginLeft: '8px' }}
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Top Header */}
      <div className="admin-header">
        <div className="admin-header-title-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.9rem' }}>📦</span>
            <div>
              <h1>Order Status & Fulfillment</h1>
              <p>Manage customer orders, track preparation stages, and dispatch ice creams for fast delivery.</p>
            </div>
          </div>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            onClick={fetchOrders}
            className="btn-secondary"
            style={{ padding: '10px 20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
            title="Refresh Orders Data"
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="admin-stats-grid" style={{ marginBottom: '24px' }}>
        <div className="admin-stat-card">
          <div className="stat-icon-wrapper stat-icon-pink">
            <ShoppingBag size={26} />
          </div>
          <div className="stat-info">
            <h3>{totalOrdersCount}</h3>
            <p>Total Orders</p>
            <div className="stat-subtext" style={{ color: 'var(--strawberry)', fontWeight: 600 }}>
              ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })} Lifetime
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrapper stat-icon-cream">
            <IceCream size={26} />
          </div>
          <div className="stat-info">
            <h3>{activeOrdersCount}</h3>
            <p>In-Kitchen / Preparing</p>
            <div className="stat-subtext" style={{ color: '#b45309', fontWeight: 600 }}>
              Processing & Scooping
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#ffedd5', color: '#c2410c' }}>
            <Truck size={26} />
          </div>
          <div className="stat-info">
            <h3>{deliveryOrdersCount}</h3>
            <p>Out for Delivery</p>
            <div className="stat-subtext" style={{ color: '#c2410c', fontWeight: 600 }}>
              Cold Storage En Route
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrapper stat-icon-green">
            <CheckCircle2 size={26} />
          </div>
          <div className="stat-info">
            <h3>{deliveredOrdersCount}</h3>
            <p>Delivered Orders</p>
            <div className="stat-subtext" style={{ color: '#15803d', fontWeight: 600 }}>
              Successfully Completed
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="admin-card"
        style={{
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            className={`admin-filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
            style={{
              padding: '7px 16px',
              borderRadius: '999px',
              border: statusFilter === 'all' ? '1.5px solid var(--strawberry)' : '1px solid #e5e7eb',
              background: statusFilter === 'all' ? 'var(--strawberry)' : '#ffffff',
              color: statusFilter === 'all' ? '#ffffff' : 'var(--chocolate-dark)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            All Orders ({orders.length})
          </button>

          {ORDER_STATUSES.map((status) => {
            const count = orders.filter((o) => o.orderStatus === status).length;
            const isSelected = statusFilter === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '999px',
                  border: isSelected ? '1.5px solid var(--chocolate-dark)' : '1px solid #f1e7e4',
                  background: isSelected ? 'var(--chocolate-dark)' : '#ffffff',
                  color: isSelected ? '#ffffff' : 'var(--chocolate-dark)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                }}
              >
                <span className={`status-pill ${getStatusClass(status)}`} style={{ padding: '2px 8px', fontSize: '0.72rem' }}>
                  {status}
                </span>
                <span style={{ opacity: 0.75, fontSize: '0.78rem' }}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search Input Box */}
        <div style={{ position: 'relative', minWidth: '280px', flex: '1 1 280px', maxWidth: '420px' }}>
          <Search
            size={18}
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9c8e8c' }}
          />
          <input
            type="text"
            placeholder="Search Order ID, Customer, Phone, Item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 42px',
              borderRadius: '14px',
              border: '1.5px solid #ebdcd7',
              fontSize: '0.88rem',
              outline: 'none',
              background: '#fffdfa',
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#9c8e8c',
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ padding: '80px 0', textAlign: 'center' }}>
          <Loader text="Loading customer orders & status updates..." />
        </div>
      ) : error ? (
        <div
          style={{
            padding: '24px',
            background: '#fee2e2',
            color: '#b91c1c',
            borderRadius: '16px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
          }}
        >
          <AlertCircle size={22} />
          <span>{error}</span>
          <button onClick={fetchOrders} className="btn-secondary" style={{ marginLeft: '12px', padding: '6px 14px' }}>
            Try Again
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div
          className="admin-card"
          style={{ padding: '60px 20px', textAlign: 'center', borderRadius: '24px' }}
        >
          <div style={{ fontSize: '3.2rem', marginBottom: '14px' }}>🍦</div>
          <h3 style={{ fontSize: '1.3rem', color: 'var(--chocolate-dark)', marginBottom: '8px' }}>
            No Orders Found
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 18px', fontSize: '0.9rem' }}>
            {searchQuery
              ? `No orders matching "${searchQuery}". Try searching with another keyword.`
              : 'There are currently no orders in this category.'}
          </p>
          {(searchQuery || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="btn-secondary"
              style={{ padding: '8px 18px', fontSize: '0.85rem' }}
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="admin-card" style={{ padding: '0', overflow: 'hidden', borderRadius: '20px' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '150px' }}>Order ID & Date</th>
                  <th>Customer & Delivery</th>
                  <th>Items & Flavors</th>
                  <th>Amount & Payment</th>
                  <th style={{ width: '220px' }}>Status & Change</th>
                  <th style={{ textAlign: 'center', width: '130px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const customerName = order.deliveryAddress?.fullName || order.user?.name || 'Customer';
                  const customerPhone = order.deliveryAddress?.phone || order.user?.phone || 'N/A';
                  const city = order.deliveryAddress?.city || 'Chennai';
                  const pincode = order.deliveryAddress?.pincode || '';
                  const nextStatus = getNextStatus(order.orderStatus);
                  const isUpdating = updatingOrderId === order._id;

                  return (
                    <tr key={order._id} style={{ verticalAlign: 'middle' }}>
                      {/* Order ID & Date */}
                      <td>
                        <div style={{ fontWeight: 800, color: 'var(--chocolate-dark)', fontSize: '0.95rem' }}>
                          {order.orderId || `#${order._id.slice(-6).toUpperCase()}`}
                        </div>
                        <div
                          style={{
                            fontSize: '0.76rem',
                            color: 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginTop: '4px',
                          }}
                        >
                          <Calendar size={12} />
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Customer & Delivery */}
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--chocolate-dark)', fontSize: '0.92rem' }}>
                          {customerName}
                        </div>
                        <div
                          style={{
                            fontSize: '0.78rem',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginTop: '2px',
                          }}
                        >
                          <Phone size={12} color="var(--strawberry)" />
                          <span>{customerPhone}</span>
                        </div>
                        <div
                          style={{
                            fontSize: '0.76rem',
                            color: 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginTop: '2px',
                          }}
                        >
                          <MapPin size={12} />
                          <span>
                            {city} {pincode ? `- ${pincode}` : ''}
                          </span>
                        </div>
                      </td>

                      {/* Items & Flavours */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span
                            style={{
                              background: '#fdf2f4',
                              color: 'var(--strawberry)',
                              fontWeight: 800,
                              fontSize: '0.75rem',
                              padding: '2px 8px',
                              borderRadius: '999px',
                            }}
                          >
                            {order.products?.length || 0} {order.products?.length === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                        {/* Mini thumbnails preview */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          {order.products?.slice(0, 3).map((item, idx) => (
                            <div
                              key={idx}
                              title={`${item.name} (${item.flavour || 'Artisan'}) - Qty: ${item.quantity}`}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                padding: '3px 7px',
                              }}
                            >
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  style={{ width: '22px', height: '22px', borderRadius: '5px', objectFit: 'cover' }}
                                />
                              )}
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--chocolate-dark)' }}>
                                {item.name?.slice(0, 14)}.. x{item.quantity}
                              </span>
                            </div>
                          ))}
                          {order.products?.length > 3 && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              +{order.products.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Amount & Payment */}
                      <td>
                        <div style={{ fontWeight: 800, color: 'var(--strawberry)', fontSize: '1.05rem' }}>
                          ₹{order.totalAmount?.toFixed(2)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {order.paymentMethod || 'Cash on Delivery'}
                        </div>
                        <span
                          style={{
                            display: 'inline-block',
                            marginTop: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '999px',
                            background: order.paymentStatus === 'Completed' ? '#dcfce7' : '#fef3c7',
                            color: order.paymentStatus === 'Completed' ? '#15803d' : '#b45309',
                          }}
                        >
                          Payment: {order.paymentStatus || 'Pending'}
                        </span>
                      </td>

                      {/* Status Selector & Quick Advance */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {/* Live Status Dropdown */}
                          <div style={{ position: 'relative' }}>
                            <select
                              value={order.orderStatus}
                              disabled={isUpdating}
                              onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                              className={`status-pill ${getStatusClass(order.orderStatus)}`}
                              style={{
                                cursor: 'pointer',
                                border: 'none',
                                appearance: 'auto',
                                padding: '6px 12px',
                                width: '100%',
                                outline: 'none',
                                fontWeight: 700,
                              }}
                            >
                              {ORDER_STATUSES.map((st) => (
                                <option key={st} value={st} style={{ background: '#ffffff', color: '#1e293b' }}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Quick Advance Button (e.g. Next logical fulfillment step) */}
                          {nextStatus && order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled' && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleUpdateStatus(order._id, nextStatus)}
                              style={{
                                background: '#fdf2f4',
                                border: '1px solid #fbcfe8',
                                color: 'var(--strawberry)',
                                borderRadius: '8px',
                                padding: '4px 10px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px',
                                transition: 'all 0.15s ease',
                              }}
                              title={`Advance status to ${nextStatus}`}
                            >
                              <span>Next: {nextStatus}</span>
                              <ArrowRight size={12} />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrder(order);
                            setModalNewStatus(order.orderStatus);
                            setModalTrackingNote('');
                          }}
                          className="btn-secondary"
                          style={{
                            padding: '8px 14px',
                            fontSize: '0.82rem',
                            borderRadius: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <Eye size={15} color="var(--strawberry)" />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          ORDER DETAILS & LIVE TRACKING TIMELINE MODAL
          ======================================================== */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="admin-modal-backdrop" onClick={() => setSelectedOrder(null)}>
            <motion.div
              className="admin-modal-box"
              style={{ maxWidth: '900px', maxHeight: '92vh', overflowY: 'auto' }}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 20 }}
              transition={{ duration: 0.25 }}
            >
              {/* Modal Top Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  borderBottom: '1px solid #f4e8e6',
                  paddingBottom: '18px',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.6rem' }}>🍦</span>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', color: 'var(--chocolate-dark)' }}>
                      Order {selectedOrder.orderId || `#${selectedOrder._id.slice(-6).toUpperCase()}`}
                    </h2>
                    <span className={`status-pill ${getStatusClass(selectedOrder.orderStatus)}`}>
                      {selectedOrder.orderStatus}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Placed on{' '}
                    {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  style={{
                    background: '#fdf2f4',
                    border: 'none',
                    borderRadius: '50%',
                    width: '38px',
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--strawberry)',
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Quick Status Modifier Banner in Modal */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #fff7f9 0%, #fffbf8 100%)',
                  border: '1.5px solid #fbcfe8',
                  borderRadius: '20px',
                  padding: '20px',
                  marginBottom: '24px',
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--chocolate-dark)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} color="var(--strawberry)" />
                  <span>Update Order Status & Send Live Tracking Update</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', alignItems: 'flex-end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Change Order Status:
                    </label>
                    <select
                      value={modalNewStatus}
                      onChange={(e) => setModalNewStatus(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        border: '1.5px solid #e2e8f0',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        background: '#ffffff',
                        color: 'var(--chocolate-dark)',
                        outline: 'none',
                      }}
                    >
                      {ORDER_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Optional Custom Tracking Note for Customer:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Packed in insulated cryo-box with dry ice..."
                      value={modalTrackingNote}
                      onChange={(e) => setModalTrackingNote(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        border: '1.5px solid #e2e8f0',
                        fontSize: '0.88rem',
                        background: '#ffffff',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <button
                      type="button"
                      disabled={updatingOrderId === selectedOrder._id || modalNewStatus === selectedOrder.orderStatus && !modalTrackingNote.trim()}
                      onClick={() => handleUpdateStatus(selectedOrder._id, modalNewStatus, modalTrackingNote)}
                      className="btn-primary"
                      style={{
                        width: '100%',
                        padding: '11px 20px',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                    >
                      {updatingOrderId === selectedOrder._id ? (
                        <span>Updating...</span>
                      ) : (
                        <>
                          <Check size={16} />
                          <span>Apply & Save Status</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Two Column Layout for Order Info & Timeline */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
                {/* Left Column: Customer & Items Breakdown */}
                <div>
                  {/* Customer Information Card */}
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid #f1e7e4',
                      borderRadius: '18px',
                      padding: '18px',
                      marginBottom: '20px',
                    }}
                  >
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--strawberry)', marginBottom: '10px' }}>
                      Customer & Delivery Details
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--chocolate-dark)' }}>
                      {selectedOrder.deliveryAddress?.fullName || selectedOrder.user?.name || 'Customer'}
                    </div>

                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Phone size={14} color="var(--strawberry)" />
                        <span>{selectedOrder.deliveryAddress?.phone || selectedOrder.user?.phone || 'No phone'}</span>
                        {selectedOrder.deliveryAddress?.altPhone && (
                          <span style={{ color: 'var(--text-muted)' }}>(Alt: {selectedOrder.deliveryAddress.altPhone})</span>
                        )}
                      </div>

                      {selectedOrder.deliveryAddress?.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Mail size={14} color="var(--strawberry)" />
                          <span>{selectedOrder.deliveryAddress.email}</span>
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '4px' }}>
                        <MapPin size={16} color="var(--strawberry)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>
                          {selectedOrder.deliveryAddress?.street}, {selectedOrder.deliveryAddress?.city || 'Chennai'},{' '}
                          {selectedOrder.deliveryAddress?.state || 'Tamil Nadu'} - {selectedOrder.deliveryAddress?.pincode}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ordered Items List */}
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid #f1e7e4',
                      borderRadius: '18px',
                      padding: '18px',
                      marginBottom: '20px',
                    }}
                  >
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--strawberry)', marginBottom: '12px' }}>
                      Ordered Items ({selectedOrder.products?.length || 0})
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {selectedOrder.products?.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 12px',
                            background: '#fffdfa',
                            border: '1px solid #f3ece8',
                            borderRadius: '14px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img
                              src={
                                item.image ||
                                'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=400&q=80'
                              }
                              alt={item.name}
                              style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover' }}
                            />
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--chocolate-dark)' }}>
                                {item.name}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                {item.flavour && <span style={{ color: 'var(--strawberry)', fontWeight: 600 }}>{item.flavour} • </span>}
                                {item.selectedSize || 'Regular'}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--chocolate-dark)', fontWeight: 600 }}>
                                ₹{item.price?.toFixed(2)} × {item.quantity}
                              </div>
                            </div>
                          </div>

                          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--strawberry)' }}>
                            ₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Financial Totals */}
                    <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px dashed #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {selectedOrder.discountAmount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#15803d' }}>
                          <span>Discount Applied ({selectedOrder.couponApplied}):</span>
                          <span>-₹{selectedOrder.discountAmount?.toFixed(2)}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <span>Payment Method:</span>
                        <span style={{ fontWeight: 600 }}>{selectedOrder.paymentMethod}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, color: 'var(--chocolate-dark)', marginTop: '4px' }}>
                        <span>Total Paid:</span>
                        <span style={{ color: 'var(--strawberry)' }}>₹{selectedOrder.totalAmount?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Live Tracking Timeline Stepper */}
                <div>
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid #f1e7e4',
                      borderRadius: '18px',
                      padding: '20px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--strawberry)' }}>
                        Live Tracking History Timeline
                      </div>
                      <span className={`status-pill ${getStatusClass(selectedOrder.orderStatus)}`} style={{ fontSize: '0.75rem' }}>
                        Current: {selectedOrder.orderStatus}
                      </span>
                    </div>

                    {/* Stepper Timeline list */}
                    <div style={{ position: 'relative', paddingLeft: '24px' }}>
                      {/* Vertical line behind steps */}
                      <div
                        style={{
                          position: 'absolute',
                          left: '7px',
                          top: '12px',
                          bottom: '12px',
                          width: '2px',
                          background: '#fbcfe8',
                        }}
                      />

                      {(selectedOrder.trackingSteps || []).map((step, sIdx) => {
                        const isLatest = sIdx === (selectedOrder.trackingSteps.length - 1);
                        return (
                          <div key={sIdx} style={{ position: 'relative', marginBottom: '20px' }}>
                            {/* Dot / Indicator */}
                            <div
                              style={{
                                position: 'absolute',
                                left: '-24px',
                                top: '3px',
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                background: isLatest ? 'var(--strawberry)' : '#be123c',
                                border: '3px solid #ffffff',
                                boxShadow: '0 0 0 2px #fbcfe8',
                              }}
                            />

                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontWeight: 800, fontSize: '0.92rem', color: isLatest ? 'var(--strawberry)' : 'var(--chocolate-dark)' }}>
                                  {step.status}
                                </span>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                  {step.timestamp
                                    ? new Date(step.timestamp).toLocaleTimeString('en-IN', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        day: 'numeric',
                                        month: 'short',
                                      })
                                    : ''}
                                </span>
                              </div>
                              {step.message && (
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                                  {step.message}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {(!selectedOrder.trackingSteps || selectedOrder.trackingSteps.length === 0) && (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                          No tracking events logged yet. Update status above to record the first tracking step!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageOrders;

