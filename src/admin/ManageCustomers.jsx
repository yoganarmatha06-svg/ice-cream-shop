import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  RefreshCw,
  ShoppingBag,
  MapPin,
  Phone,
  Mail,
  Calendar,
  ChevronRight,
  X,
  CreditCard,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  IndianRupee,
  IceCream,
  Tag,
  Package,
} from 'lucide-react';
import { customersAPI } from '../services/api';
import Loader from '../components/Loader';
import '../styles/admin.css';

const ManageCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('latest');
  const [filterType, setFilterType] = useState('all');

  // Selected customer for Order History Modal
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await customersAPI.getAll({ search: searchQuery, sort: sortOption });
      if (res.success) {
        setCustomers(res.data);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customer records. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCustomers();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, sortOption]);

  // Client-side quick filter
  const filteredCustomers = customers.filter((c) => {
    if (filterType === 'repeat') return c.totalOrders >= 2;
    if (filterType === 'single') return c.totalOrders === 1;
    if (filterType === 'registered') return c.userId !== null;
    return true;
  });

  // Summary Metrics
  const totalCustomers = customers.length;
  const repeatCustomersCount = customers.filter((c) => c.totalOrders >= 2).length;
  const totalOrdersSum = customers.reduce((acc, c) => acc + (c.totalOrders || 0), 0);
  const totalRevenueSum = customers.reduce((acc, c) => acc + (c.totalSpent || 0), 0);

  const getStatusBadgeClass = (status = '') => {
    const s = status.toLowerCase();
    if (s.includes('deliver') || s.includes('complet')) return 'status-badge-available';
    if (s.includes('cancel') || s.includes('fail')) return 'status-badge-unavailable';
    return 'status-badge-active';
  };

  return (
    <div className="admin-page-container">
      {/* Top Header */}
      <div className="admin-header">
        <div className="admin-header-title-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.8rem' }}>👥</span>
            <h1>Customer Management</h1>
          </div>
          <p>View complete customer profiles, verified delivery addresses, contact numbers, and order histories.</p>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            onClick={fetchCustomers}
            className="btn-secondary"
            style={{ padding: '10px 18px', fontSize: '0.88rem' }}
            title="Refresh Customer List"
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="admin-stats-grid" style={{ marginBottom: '28px' }}>
        <motion.div className="admin-stat-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <div className="stat-icon-wrapper stat-icon-pink">
            <Users size={26} />
          </div>
          <div className="stat-info">
            <h3>{totalCustomers}</h3>
            <p>Total Customers</p>
            <div className="stat-subtext" style={{ color: '#be123c', fontWeight: 600 }}>
              {repeatCustomersCount} Repeat Buyers
            </div>
          </div>
        </motion.div>

        <motion.div className="admin-stat-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="stat-icon-wrapper stat-icon-cream">
            <ShoppingBag size={26} />
          </div>
          <div className="stat-info">
            <h3>{totalOrdersSum}</h3>
            <p>Total Orders Placed</p>
            <div className="stat-subtext" style={{ color: '#b45309', fontWeight: 600 }}>
              Across All Parlour Scoops
            </div>
          </div>
        </motion.div>

        <motion.div className="admin-stat-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="stat-icon-wrapper stat-icon-green">
            <IndianRupee size={26} />
          </div>
          <div className="stat-info">
            <h3>₹{totalRevenueSum.toFixed(2)}</h3>
            <p>Lifetime Customer Sales</p>
            <div className="stat-subtext" style={{ color: '#15803d', fontWeight: 600 }}>
              Avg ₹{(totalCustomers > 0 ? totalRevenueSum / totalCustomers : 0).toFixed(2)} / Customer
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="admin-filter-bar">
        <div className="admin-search-wrapper" style={{ flex: 1, minWidth: '260px' }}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by customer name, email, phone, city, product, or flavor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#9c8e8c' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {/* Quick Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="admin-select"
            style={{ width: '160px' }}
          >
            <option value="all">All Customers</option>
            <option value="repeat">Repeat (2+ Orders)</option>
            <option value="single">Single Order (1)</option>
            <option value="registered">Registered Accounts</option>
          </select>

          {/* Sort By */}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="admin-select"
            style={{ width: '160px' }}
          >
            <option value="latest">Latest Activity</option>
            <option value="orders_desc">Highest Orders</option>
            <option value="spent_desc">Highest Spending</option>
            <option value="name_asc">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {error && (
        <div style={{ padding: '14px 20px', background: '#fee2e2', color: '#b91c1c', borderRadius: '16px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Main Customers Table Card */}
      <div className="admin-card">
        <div className="admin-card-header" style={{ borderBottom: '1px solid #f4e8e6', paddingBottom: '16px' }}>
          <div>
            <h2>Customer Directory ({filteredCustomers.length})</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Click "View Order History" to inspect full order logs, scoops bought, and delivery receipts.
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <Loader text="Loading customer records and order histories..." />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔍</div>
            <h3 style={{ color: 'var(--chocolate-dark)', marginBottom: '6px' }}>No Customers Found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              {searchQuery ? `No customer matching "${searchQuery}". Try another keyword.` : 'Customer orders and signups will appear here.'}
            </p>
          </div>
        ) : (
          <div className="admin-table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Contact Info</th>
                  <th>Complete Address</th>
                  <th>Purchased Products & Flavors</th>
                  <th>Total Orders</th>
                  <th>Lifetime Spend</th>
                  <th style={{ textAlign: 'center' }}>Order History</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((cust) => (
                  <tr key={cust._id}>
                    {/* Customer Name */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #fce7ec 0%, #fbcfe8 100%)',
                            color: '#be123c',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '1rem',
                            border: '2px solid #fff',
                            boxShadow: '0 4px 10px rgba(225, 29, 72, 0.12)',
                          }}
                        >
                          {cust.name ? cust.name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--chocolate-dark)', fontSize: '0.98rem' }}>
                            {cust.name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {cust.customerType} • Joined {new Date(cust.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info (Email & Phone) */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <a
                          href={`mailto:${cust.email}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: 'var(--chocolate-dark)',
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            textDecoration: 'none',
                          }}
                        >
                          <Mail size={14} color="#be123c" />
                          <span>{cust.email}</span>
                        </a>

                        {cust.phone ? (
                          <a
                            href={`tel:${cust.phone}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              color: 'var(--text-secondary)',
                              fontSize: '0.84rem',
                              textDecoration: 'none',
                            }}
                          >
                            <Phone size={13} color="#059669" />
                            <span>{cust.phone}</span>
                            {cust.altPhone && (
                              <span style={{ fontSize: '0.75rem', color: '#9c8e8c' }} title={`Alt: ${cust.altPhone}`}>
                                (Alt: {cust.altPhone})
                              </span>
                            )}
                          </a>
                        ) : (
                          <span style={{ fontSize: '0.82rem', color: '#9c8e8c' }}>No phone recorded</span>
                        )}
                      </div>
                    </td>

                    {/* Address */}
                    <td style={{ maxWidth: '240px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                        <MapPin size={15} color="#d97706" style={{ flexShrink: 0, marginTop: '3px' }} />
                        <div style={{ fontSize: '0.86rem', color: 'var(--chocolate-dark)', lineHeight: '1.4' }}>
                          {cust.fullAddressString}
                        </div>
                      </div>
                    </td>

                    {/* Purchased Products & Flavors */}
                    <td style={{ minWidth: '220px', maxWidth: '300px' }}>
                      {cust.purchasedProducts && cust.purchasedProducts.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {/* Products Mini Cards */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            {cust.purchasedProducts.slice(0, 2).map((prod, pIdx) => (
                              <div
                                key={pIdx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  background: '#fffdfa',
                                  padding: '5px 8px',
                                  borderRadius: '10px',
                                  border: '1px solid #fce7ec',
                                }}
                              >
                                {prod.image ? (
                                  <img
                                    src={prod.image}
                                    alt={prod.name}
                                    style={{ width: '28px', height: '28px', borderRadius: '8px', objectFit: 'cover' }}
                                  />
                                ) : (
                                  <span style={{ fontSize: '1rem' }}>🍨</span>
                                )}
                                <div style={{ overflow: 'hidden', flex: 1 }}>
                                  <div
                                    style={{
                                      fontSize: '0.82rem',
                                      fontWeight: 700,
                                      color: 'var(--chocolate-dark)',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                    title={prod.name}
                                  >
                                    {prod.name}
                                  </div>
                                  <div style={{ fontSize: '0.72rem', color: '#be123c', fontWeight: 600 }}>
                                    Flavor: {prod.flavor} • {prod.totalQuantity} {prod.totalQuantity === 1 ? 'scoop' : 'scoops'}
                                  </div>
                                </div>
                              </div>
                            ))}

                            {cust.purchasedProducts.length > 2 && (
                              <button
                                type="button"
                                onClick={() => setSelectedCustomer(cust)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  padding: '2px 4px',
                                  color: '#be123c',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                }}
                              >
                                +{cust.purchasedProducts.length - 2} more items ordered...
                              </button>
                            )}
                          </div>

                          {/* Flavor Tags */}
                          {cust.purchasedFlavors && cust.purchasedFlavors.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {cust.purchasedFlavors.slice(0, 3).map((flav, fIdx) => (
                                <span
                                  key={fIdx}
                                  className="badge badge-pink"
                                  style={{ fontSize: '0.68rem', padding: '2px 7px' }}
                                  title={`${flav.name}: ${flav.count} scoops`}
                                >
                                  🍦 {flav.name}
                                </span>
                              ))}
                              {cust.purchasedFlavors.length > 3 && (
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                                  +{cust.purchasedFlavors.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.82rem', color: '#9c8e8c', fontStyle: 'italic' }}>
                          No purchases yet
                        </span>
                      )}
                    </td>

                    {/* Total Orders */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '4px 12px',
                            borderRadius: '999px',
                            background: cust.totalOrders > 0 ? '#fdf2f4' : '#f3f4f6',
                            color: cust.totalOrders > 0 ? '#be123c' : '#6b7280',
                            fontWeight: 800,
                            fontSize: '0.9rem',
                          }}
                        >
                          {cust.totalOrders} {cust.totalOrders === 1 ? 'Order' : 'Orders'}
                        </span>
                      </div>
                    </td>

                    {/* Lifetime Spend */}
                    <td>
                      <div style={{ fontWeight: 800, color: '#be123c', fontSize: '1rem' }}>
                        ₹{cust.totalSpent.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {cust.lastOrderDate ? `Last: ${new Date(cust.lastOrderDate).toLocaleDateString()}` : 'No orders yet'}
                      </div>
                    </td>

                    {/* Action: View Order History */}
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedCustomer(cust)}
                        className="btn-secondary"
                        style={{
                          padding: '8px 16px',
                          fontSize: '0.84rem',
                          borderRadius: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <ShoppingBag size={14} color="#be123c" />
                        <span>Order History ({cust.orderHistory.length})</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================
          ORDER HISTORY MODAL DIALOG
          ======================================================== */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className="admin-modal-backdrop" onClick={() => setSelectedCustomer(null)}>
            <motion.div
              className="admin-modal-box"
              style={{ maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto' }}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.25 }}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f4e8e6', paddingBottom: '18px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #fce7ec 0%, #fbcfe8 100%)',
                      color: '#be123c',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.3rem',
                    }}
                  >
                    {selectedCustomer.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', color: 'var(--chocolate-dark)', marginBottom: '2px' }}>
                      {selectedCustomer.name}
                    </h2>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      {selectedCustomer.email} • {selectedCustomer.phone || 'No phone'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  style={{ background: '#fdf2f4', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#be123c' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Customer Profile Banner Info */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #fff7f9 0%, #fffdfa 100%)',
                  border: '1px solid #fbcfe8',
                  borderRadius: '18px',
                  padding: '16px 20px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '14px',
                  marginBottom: '24px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#be123c', textTransform: 'uppercase' }}>Delivery Address</div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--chocolate-dark)', marginTop: '3px' }}>
                    {selectedCustomer.fullAddressString}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#be123c', textTransform: 'uppercase' }}>Total Orders</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--chocolate-dark)', marginTop: '2px' }}>
                    {selectedCustomer.totalOrders}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#be123c', textTransform: 'uppercase' }}>Total Spent</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#be123c', marginTop: '2px' }}>
                    ₹{selectedCustomer.totalSpent.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Customer Purchased Flavors & Products Portfolio */}
              {((selectedCustomer.purchasedFlavors && selectedCustomer.purchasedFlavors.length > 0) ||
                (selectedCustomer.purchasedProducts && selectedCustomer.purchasedProducts.length > 0)) && (
                <div
                  style={{
                    background: '#fffdfa',
                    border: '1px solid #fce7ec',
                    borderRadius: '18px',
                    padding: '16px 20px',
                    marginBottom: '24px',
                  }}
                >
                  {/* Flavors Section */}
                  {selectedCustomer.purchasedFlavors && selectedCustomer.purchasedFlavors.length > 0 && (
                    <div style={{ marginBottom: selectedCustomer.purchasedProducts?.length > 0 ? '16px' : '0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Sparkles size={16} color="#be123c" />
                        <strong style={{ fontSize: '0.88rem', color: 'var(--chocolate-dark)' }}>
                          Customer Flavor Preferences:
                        </strong>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {selectedCustomer.purchasedFlavors.map((fl, fIdx) => (
                          <span
                            key={fIdx}
                            className="badge badge-pink"
                            style={{ fontSize: '0.8rem', padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          >
                            <span>🍨</span>
                            <strong>{fl.name}</strong>
                            <span style={{ opacity: 0.85 }}>({fl.count} {fl.count === 1 ? 'scoop' : 'scoops'})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Products Section */}
                  {selectedCustomer.purchasedProducts && selectedCustomer.purchasedProducts.length > 0 && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <IceCream size={16} color="#be123c" />
                        <strong style={{ fontSize: '0.88rem', color: 'var(--chocolate-dark)' }}>
                          Products Ordered by Customer ({selectedCustomer.purchasedProducts.length} varieties):
                        </strong>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                        {selectedCustomer.purchasedProducts.map((p, pIdx) => (
                          <div
                            key={pIdx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '8px 12px',
                              background: '#faf6f0',
                              borderRadius: '12px',
                              border: '1px solid #ebd9d7',
                            }}
                          >
                            {p.image ? (
                              <img
                                src={p.image}
                                alt={p.name}
                                style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }}
                              />
                            ) : (
                              <span style={{ fontSize: '1.4rem' }}>🍨</span>
                            )}
                            <div style={{ overflow: 'hidden', flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--chocolate-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {p.name}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#be123c', fontWeight: 600 }}>
                                Flavor: {p.flavor}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {p.totalQuantity} scoops across {p.orderCount} {p.orderCount === 1 ? 'order' : 'orders'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Order History Timeline / List */}
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', color: 'var(--chocolate-dark)', marginBottom: '14px' }}>
                Complete Order History ({selectedCustomer.orderHistory.length})
              </h3>

              {selectedCustomer.orderHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', background: '#faf6f0', borderRadius: '16px' }}>
                  <Package size={36} color="#9c8e8c" style={{ marginBottom: '10px' }} />
                  <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>This customer has not placed any orders yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {selectedCustomer.orderHistory.map((order, oIdx) => (
                    <div
                      key={order._id || oIdx}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #ebd9d7',
                        borderRadius: '18px',
                        padding: '18px 20px',
                        boxShadow: '0 4px 14px rgba(45, 24, 16, 0.04)',
                      }}
                    >
                      {/* Order Header Summary */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '1px dashed #f1e4e2', paddingBottom: '12px', marginBottom: '12px' }}>
                        <div>
                          <span style={{ fontWeight: 800, color: 'var(--chocolate-dark)', fontSize: '1.05rem' }}>
                            Order #{order.orderId}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '10px' }}>
                            {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className={`status-badge ${getStatusBadgeClass(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                          <span style={{ fontSize: '0.82rem', background: '#f3f4f6', padding: '4px 10px', borderRadius: '8px', color: '#4b5563', fontWeight: 600 }}>
                            {order.paymentMethod}
                          </span>
                        </div>
                      </div>

                      {/* Items Ordered List */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                        {order.products && order.products.map((item, pIdx) => (
                          <div
                            key={pIdx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '12px',
                              padding: '10px 14px',
                              background: '#faf6f0',
                              borderRadius: '12px',
                              border: '1px solid #ebd9d7',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'cover' }}
                                />
                              )}
                              <div>
                                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--chocolate-dark)' }}>
                                  {item.name}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '3px' }}>
                                  <span className="badge badge-pink" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                                    🍨 Flavor: {item.flavour || item.flavor || 'Artisan'}
                                  </span>
                                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                    {item.selectedSize} • Qty: {item.quantity}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div style={{ fontWeight: 800, color: 'var(--chocolate-dark)', fontSize: '0.98rem' }}>
                              ₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Footer & Delivery Snapshot */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fdf2f4', padding: '12px 16px', borderRadius: '12px', fontSize: '0.85rem' }}>
                        <div style={{ color: 'var(--text-secondary)' }}>
                          <strong>Delivered To:</strong> {order.deliveryAddress?.street}, {order.deliveryAddress?.city} ({order.deliveryAddress?.pincode})
                        </div>
                        <div style={{ fontWeight: 800, color: '#be123c', fontSize: '1.05rem' }}>
                          Total: ₹{Number(order.totalAmount).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Close Button */}
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="btn-primary"
                  style={{ padding: '10px 24px' }}
                >
                  Close History
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageCustomers;

