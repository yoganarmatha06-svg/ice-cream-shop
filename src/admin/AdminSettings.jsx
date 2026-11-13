import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Store,
  Truck,
  ShieldCheck,
  Bell,
  Database,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin,
  Clock,
  IndianRupee,
  Layers,
  Sparkles,
  Server,
  KeyRound,
  Check,
  X,
  User,
  ShieldAlert,
} from 'lucide-react';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import '../styles/admin.css';

const AdminSettings = () => {
  const { user } = useAuth();

  // Active Tab
  const [activeTab, setActiveTab] = useState('store');

  // Loading & Action states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Success & Error feedback
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Store & Parlour Settings state
  const [settings, setSettings] = useState({
    storeName: 'Scoop Dreams Artisan Parlour',
    tagline: 'Handcrafted Daily Small-Batch Ice Creams',
    contactEmail: 'contact@scoopdreams.com',
    contactPhone: '+91 98765 43210',
    storeAddress: '12 Sweet Treat Boulevard, Indiranagar, Bengaluru, Karnataka 560038',
    openingHours: '10:00 AM - 11:30 PM, Everyday',
    currency: '₹',
    currencyCode: 'INR',
    freeDeliveryThreshold: 499,
    deliveryFee: 49,
    estimatedDeliveryTime: '25 - 40 Mins',
    packagingCharge: 0,
    storeOpen: true,
    codEnabled: true,
    onlinePaymentEnabled: true,
    orderSoundNotification: true,
    lowStockThreshold: 5,
    sessionExpiryDays: 7,
  });

  // System & Database metadata
  const [meta, setMeta] = useState({
    dbStatus: 'Connected (Atlas Cloud DB)',
    host: 'cluster0.mongodb.net',
    dbName: 'icecreamshop',
  });

  // Admin Profile edit state
  const [adminProfile, setAdminProfile] = useState({
    name: user?.name || 'Administrator',
    email: user?.email || 'admin@scoopdreams.com',
  });

  // Password Change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Fetch initial settings from backend
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getSettings();
      if (res.success && res.data) {
        setSettings((prev) => ({ ...prev, ...res.data }));
        if (res.meta) setMeta(res.meta);
      }
    } catch (err) {
      console.error('Error fetching store settings:', err);
      showFeedback('error', 'Could not load store settings from server. Showing local defaults.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    if (user) {
      setAdminProfile({
        name: user.name || 'Administrator',
        email: user.email || 'admin@scoopdreams.com',
      });
    }
  }, [user]);

  // Helper to show dismissible feedback
  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback({ type: '', message: '' });
    }, 4500);
  };

  // Handle Form Change for Store Settings
  const handleSettingChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Save Store Settings
  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      const res = await adminAPI.updateSettings(settings);
      if (res.success) {
        setSettings((prev) => ({ ...prev, ...res.data }));
        showFeedback('success', 'Store & parlour settings saved successfully!');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      showFeedback('error', err.response?.data?.message || err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  // Update Admin Profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await adminAPI.updateProfile(adminProfile);
      if (res.success) {
        showFeedback('success', 'Administrator profile updated successfully!');
      }
    } catch (err) {
      console.error('Error updating admin profile:', err);
      showFeedback('error', err.response?.data?.message || err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  // Change Admin Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      showFeedback('error', 'Please fill in both current and new passwords.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showFeedback('error', 'New password must contain at least 6 characters.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showFeedback('error', 'New password and confirm password do not match.');
      return;
    }

    try {
      setPasswordSaving(true);
      const res = await adminAPI.updatePassword(passwordForm);
      if (res.success) {
        showFeedback('success', 'Admin password changed successfully!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (err) {
      console.error('Error changing admin password:', err);
      showFeedback('error', err.response?.data?.message || err.message || 'Failed to change password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  // Reset & Reseed Database
  const handleReseedDatabase = async () => {
    try {
      setResetting(true);
      const res = await adminAPI.resetData();
      if (res.success) {
        showFeedback('success', res.message || 'Database re-seeded with fresh artisanal varieties!');
        setShowResetConfirm(false);
        fetchSettings();
      }
    } catch (err) {
      console.error('Error reseeding database:', err);
      showFeedback('error', err.response?.data?.message || err.message || 'Failed to re-seed database.');
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center' }}>
        <Loader text="Loading Scoop Dreams Store Settings..." />
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      {/* Page Header */}
      <div className="admin-page-header" style={{ marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--strawberry)',
              }}
            >
              <Settings size={22} />
            </div>
            <h1 className="admin-page-title" style={{ margin: 0 }}>
              Store Settings
            </h1>
          </div>
          <p className="admin-page-subtitle">
            Configure your parlour details, online delivery fees, security credentials & operational preferences.
          </p>
        </div>

        {/* Global Save Button */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={fetchSettings}
            className="admin-btn-secondary"
            title="Reload settings from server"
          >
            <RefreshCw size={16} />
            <span className="hide-mobile">Reload</span>
          </button>

          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={saving}
            className="admin-btn-primary"
            style={{
              background: 'linear-gradient(135deg, var(--strawberry) 0%, #be123c 100%)',
              boxShadow: '0 8px 18px -4px rgba(225, 29, 72, 0.35)',
            }}
          >
            {saving ? (
              <>
                <RefreshCw size={16} className="spin-animate" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Floating / Inline Feedback Alert Banner */}
      <AnimatePresence>
        {feedback.message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              marginBottom: '20px',
              padding: '14px 18px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: feedback.type === 'success' ? '#ecfdf5' : '#fff1f2',
              border: `1.5px solid ${feedback.type === 'success' ? '#a7f3d0' : '#fecdd3'}`,
              color: feedback.type === 'success' ? '#065f46' : '#9f1239',
              fontSize: '0.92rem',
              fontWeight: 600,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {feedback.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <span>{feedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback({ type: '', message: '' })}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '4px' }}
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Status Bar */}
      <div
        className="admin-card"
        style={{
          padding: '16px 22px',
          marginBottom: '24px',
          background: 'linear-gradient(135deg, #ffffff 0%, #fffbfb 100%)',
          border: '1.5px solid #fae8e8',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            {/* Store Status Pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '0.85rem',
                fontWeight: 700,
                background: settings.storeOpen ? '#ecfdf5' : '#fef2f2',
                color: settings.storeOpen ? '#059669' : '#dc2626',
                border: `1px solid ${settings.storeOpen ? '#a7f3d0' : '#fecaca'}`,
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: settings.storeOpen ? '#10b981' : '#ef4444',
                  boxShadow: settings.storeOpen ? '0 0 8px #10b981' : 'none',
                }}
              />
              {settings.storeOpen ? 'Online Orders: Accepting' : 'Online Orders: Temporarily Paused'}
            </div>

            {/* Currency Pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '0.85rem',
                fontWeight: 600,
                background: '#f8fafc',
                color: '#334155',
                border: '1px solid #e2e8f0',
              }}
            >
              <IndianRupee size={14} color="#64748b" />
              <span>Currency: <strong>₹ (INR)</strong></span>
            </div>

            {/* Session Pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '0.85rem',
                fontWeight: 600,
                background: '#fdf4ff',
                color: '#86198f',
                border: '1px solid #f5d0fe',
              }}
            >
              <ShieldCheck size={14} />
              <span>7-Day Session Active</span>
            </div>
          </div>

          {/* Database Cloud Tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#64748b' }}>
            <Database size={15} color="#059669" />
            <span>MongoDB: <strong style={{ color: '#059669' }}>{meta.dbStatus}</strong></span>
          </div>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '12px',
          marginBottom: '20px',
          borderBottom: '2px solid #f3eceb',
        }}
      >
        {[
          { id: 'store', label: 'Parlour Details', icon: Store },
          { id: 'delivery', label: 'Delivery & Pricing', icon: Truck },
          { id: 'security', label: 'Admin Security', icon: ShieldCheck },
          { id: 'alerts', label: 'Order Notifications', icon: Bell },
          { id: 'system', label: 'Database & System', icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '14px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                border: 'none',
                background: isActive ? 'var(--chocolate-dark)' : '#ffffff',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                boxShadow: isActive ? '0 4px 14px rgba(45, 24, 16, 0.18)' : '0 2px 6px rgba(0,0,0,0.03)',
              }}
            >
              <Icon size={17} color={isActive ? '#ffffff' : 'var(--strawberry)'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Parlour Details */}
      {activeTab === 'store' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="admin-card"
        >
          <div className="admin-card-header" style={{ marginBottom: '22px' }}>
            <div>
              <h2>Artisanal Parlour Profile</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Customer-facing brand information displayed on storefront, invoices, and contact pages.
              </p>
            </div>

            {/* Store Open / Closed Switch */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--chocolate-dark)' }}>
                Online Ordering:
              </span>
              <button
                type="button"
                onClick={() => handleSettingChange('storeOpen', !settings.storeOpen)}
                style={{
                  width: '54px',
                  height: '28px',
                  borderRadius: '999px',
                  background: settings.storeOpen ? '#10b981' : '#cbd5e1',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.25s',
                  padding: '2px',
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    transform: settings.storeOpen ? 'translateX(26px)' : 'translateX(0px)',
                    transition: 'transform 0.25s',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                  }}
                />
              </button>
            </div>
          </div>

          <form onSubmit={handleSaveSettings}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {/* Store Name */}
              <div className="form-group-item">
                <label>Parlour Brand Name</label>
                <input
                  type="text"
                  className="modal-input"
                  value={settings.storeName}
                  onChange={(e) => handleSettingChange('storeName', e.target.value)}
                  placeholder="e.g. Scoop Dreams Artisan Parlour"
                  required
                />
              </div>

              {/* Tagline */}
              <div className="form-group-item">
                <label>Brand Tagline</label>
                <input
                  type="text"
                  className="modal-input"
                  value={settings.tagline}
                  onChange={(e) => handleSettingChange('tagline', e.target.value)}
                  placeholder="e.g. Handcrafted Daily Small-Batch Ice Creams"
                />
              </div>

              {/* Contact Email */}
              <div className="form-group-item">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={15} color="var(--strawberry)" /> Support & Contact Email
                </label>
                <input
                  type="email"
                  className="modal-input"
                  value={settings.contactEmail}
                  onChange={(e) => handleSettingChange('contactEmail', e.target.value)}
                  placeholder="contact@scoopdreams.com"
                  required
                />
              </div>

              {/* Contact Phone */}
              <div className="form-group-item">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={15} color="var(--strawberry)" /> Parlour Care Phone Number
                </label>
                <input
                  type="text"
                  className="modal-input"
                  value={settings.contactPhone}
                  onChange={(e) => handleSettingChange('contactPhone', e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>

              {/* Opening Hours */}
              <div className="form-group-item">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={15} color="var(--strawberry)" /> Opening & Churning Hours
                </label>
                <input
                  type="text"
                  className="modal-input"
                  value={settings.openingHours}
                  onChange={(e) => handleSettingChange('openingHours', e.target.value)}
                  placeholder="10:00 AM - 11:30 PM, Everyday"
                />
              </div>

              {/* Store Physical Address */}
              <div className="form-group-item" style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={15} color="var(--strawberry)" /> Parlour Physical Address & Landmark
                </label>
                <textarea
                  className="modal-input modal-textarea"
                  rows={3}
                  value={settings.storeAddress}
                  onChange={(e) => handleSettingChange('storeAddress', e.target.value)}
                  placeholder="Full parlour address for pickup orders and billing..."
                />
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={saving}
                className="admin-btn-primary"
                style={{ padding: '12px 28px', fontSize: '0.95rem' }}
              >
                {saving ? 'Saving...' : 'Save Parlour Details'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Tab 2: Delivery & Pricing */}
      {activeTab === 'delivery' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="admin-card"
        >
          <div className="admin-card-header" style={{ marginBottom: '22px' }}>
            <div>
              <h2>Delivery Rules & Checkout Fees</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Set free shipping thresholds, standard shipping fees, and accepted payment gateways.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveSettings}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '22px' }}>
              {/* Currency Symbol & Code */}
              <div className="form-group-item">
                <label>Currency Format</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    className="modal-input"
                    value={settings.currency}
                    onChange={(e) => handleSettingChange('currency', e.target.value)}
                    style={{ width: '80px', textAlign: 'center', fontWeight: 800, fontSize: '1.1rem' }}
                  />
                  <input
                    type="text"
                    className="modal-input"
                    value={settings.currencyCode}
                    onChange={(e) => handleSettingChange('currencyCode', e.target.value)}
                    style={{ fontWeight: 700 }}
                  />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  All customer amounts and pricing will be rendered in ₹ (INR).
                </span>
              </div>

              {/* Free Delivery Threshold */}
              <div className="form-group-item">
                <label>Free Delivery Threshold (₹)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '16px', top: '12px', fontWeight: 700, color: '#94a3b8' }}>₹</span>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    className="modal-input"
                    style={{ paddingLeft: '34px' }}
                    value={settings.freeDeliveryThreshold}
                    onChange={(e) => handleSettingChange('freeDeliveryThreshold', Number(e.target.value))}
                    required
                  />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Orders with cart total above ₹{settings.freeDeliveryThreshold} receive 100% Free Shipping.
                </span>
              </div>

              {/* Standard Delivery Fee */}
              <div className="form-group-item">
                <label>Standard Delivery Fee (₹)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '16px', top: '12px', fontWeight: 700, color: '#94a3b8' }}>₹</span>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    className="modal-input"
                    style={{ paddingLeft: '34px' }}
                    value={settings.deliveryFee}
                    onChange={(e) => handleSettingChange('deliveryFee', Number(e.target.value))}
                    required
                  />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Applied to orders below the free shipping threshold.
                </span>
              </div>

              {/* Estimated Delivery Time */}
              <div className="form-group-item">
                <label>Estimated Express Delivery Time</label>
                <input
                  type="text"
                  className="modal-input"
                  value={settings.estimatedDeliveryTime}
                  onChange={(e) => handleSettingChange('estimatedDeliveryTime', e.target.value)}
                  placeholder="e.g. 25 - 40 Mins"
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Shown to customer at checkout and order confirmation.
                </span>
              </div>

              {/* Cold-Box Packing Charge */}
              <div className="form-group-item">
                <label>Refrigerated Cold-Box Packaging Fee (₹)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '16px', top: '12px', fontWeight: 700, color: '#94a3b8' }}>₹</span>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    className="modal-input"
                    style={{ paddingLeft: '34px' }}
                    value={settings.packagingCharge}
                    onChange={(e) => handleSettingChange('packagingCharge', Number(e.target.value))}
                  />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Keep ₹0 for complimentary thermal insulated packaging.
                </span>
              </div>
            </div>

            {/* Payment Modes Enabled */}
            <div style={{ marginTop: '28px', padding: '20px', background: '#faf6f5', borderRadius: '18px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--chocolate-dark)', marginBottom: '14px' }}>
                Payment Methods Available at Checkout
              </h3>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={settings.codEnabled}
                    onChange={(e) => handleSettingChange('codEnabled', e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--strawberry)' }}
                  />
                  <span style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--chocolate-dark)' }}>
                    Cash on Delivery (COD)
                  </span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={settings.onlinePaymentEnabled}
                    onChange={(e) => handleSettingChange('onlinePaymentEnabled', e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--strawberry)' }}
                  />
                  <span style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--chocolate-dark)' }}>
                    Instant Online Payment (UPI, Cards, NetBanking)
                  </span>
                </label>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={saving}
                className="admin-btn-primary"
                style={{ padding: '12px 28px', fontSize: '0.95rem' }}
              >
                {saving ? 'Saving...' : 'Save Delivery & Pricing Settings'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Tab 3: Security & Profile */}
      {activeTab === 'security' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
          {/* Admin Profile Form */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="admin-card"
          >
            <div className="admin-card-header" style={{ marginBottom: '20px' }}>
              <div>
                <h2>Administrator Profile</h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Update your display name and login email address.
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group-item">
                  <label>Administrator Name</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '13px', color: '#94a3b8' }}>
                      <User size={18} />
                    </span>
                    <input
                      type="text"
                      className="modal-input"
                      style={{ paddingLeft: '44px' }}
                      value={adminProfile.name}
                      onChange={(e) => setAdminProfile({ ...adminProfile, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group-item">
                  <label>Administrator Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '13px', color: '#94a3b8' }}>
                      <Mail size={18} />
                    </span>
                    <input
                      type="email"
                      className="modal-input"
                      style={{ paddingLeft: '44px' }}
                      value={adminProfile.email}
                      onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })}
                      required
                    />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Used for logging into the `/admin/login` portal.
                  </span>
                </div>

                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: '14px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.85rem',
                    color: '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <ShieldCheck size={18} color="#059669" />
                  <span>
                    Current Role: <strong style={{ color: '#0f172a' }}>Super Administrator</strong>
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="admin-btn-primary"
                  style={{ marginTop: '8px', padding: '12px 20px', width: '100%', justifyContent: 'center' }}
                >
                  {saving ? 'Updating...' : 'Update Admin Profile'}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Change Password Form */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="admin-card"
          >
            <div className="admin-card-header" style={{ marginBottom: '20px' }}>
              <div>
                <h2>Change Admin Password</h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Secure your management portal with a strong password.
                </p>
              </div>
            </div>

            <form onSubmit={handleChangePassword}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Current Password */}
                <div className="form-group-item">
                  <label>Current Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      className="modal-input"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="Enter existing password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      style={{
                        position: 'absolute',
                        right: '14px',
                        top: '12px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94a3b8',
                      }}
                    >
                      {showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="form-group-item">
                  <label>New Password (min 6 characters)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      className="modal-input"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Enter new strong password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      style={{
                        position: 'absolute',
                        right: '14px',
                        top: '12px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94a3b8',
                      }}
                    >
                      {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="form-group-item">
                  <label>Confirm New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      className="modal-input"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Re-enter new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      style={{
                        position: 'absolute',
                        right: '14px',
                        top: '12px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94a3b8',
                      }}
                    >
                      {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="admin-btn-primary"
                  style={{
                    marginTop: '8px',
                    padding: '12px 20px',
                    width: '100%',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  }}
                >
                  {passwordSaving ? (
                    <>
                      <RefreshCw size={16} className="spin-animate" />
                      <span>Saving New Password...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound size={16} />
                      <span>Save New Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Tab 4: Order Notifications */}
      {activeTab === 'alerts' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="admin-card"
        >
          <div className="admin-card-header" style={{ marginBottom: '22px' }}>
            <div>
              <h2>Order Alerts & Stock Notifications</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Control real-time sounds and inventory thresholds for low parlour stock.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveSettings}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {/* Sound Notification Toggle */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '18px 20px',
                  background: '#faf6f5',
                  borderRadius: '16px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.96rem', color: 'var(--chocolate-dark)' }}>
                    New Order Audio Chime
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Plays a gentle chime in your browser whenever a customer places an order.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSettingChange('orderSoundNotification', !settings.orderSoundNotification)}
                  style={{
                    width: '54px',
                    height: '28px',
                    borderRadius: '999px',
                    background: settings.orderSoundNotification ? 'var(--strawberry)' : '#cbd5e1',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.25s',
                    padding: '2px',
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      transform: settings.orderSoundNotification ? 'translateX(26px)' : 'translateX(0px)',
                      transition: 'transform 0.25s',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    }}
                  />
                </button>
              </div>

              {/* Low Stock Threshold */}
              <div
                style={{
                  padding: '18px 20px',
                  background: '#faf6f5',
                  borderRadius: '16px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.96rem', color: 'var(--chocolate-dark)' }}>
                    Low Inventory Alert Threshold
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Highlights ice cream flavours in yellow badge when remaining tubs drop below this quantity.
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    className="modal-input"
                    style={{ width: '90px', textAlign: 'center', fontWeight: 800 }}
                    value={settings.lowStockThreshold}
                    onChange={(e) => handleSettingChange('lowStockThreshold', Number(e.target.value))}
                  />
                  <span style={{ fontWeight: 700, color: 'var(--chocolate-dark)', fontSize: '0.9rem' }}>tubs</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={saving}
                className="admin-btn-primary"
                style={{ padding: '12px 28px', fontSize: '0.95rem' }}
              >
                {saving ? 'Saving...' : 'Save Notification Preferences'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Tab 5: Database & System */}
      {activeTab === 'system' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="admin-card"
        >
          <div className="admin-card-header" style={{ marginBottom: '22px' }}>
            <div>
              <h2>Database & System Maintenance</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Monitor your database connectivity and reset artisanal flavour seeds when testing.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {/* MongoDB Connection Card */}
            <div
              style={{
                padding: '20px',
                borderRadius: '18px',
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '14px',
                    background: '#ecfdf5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#059669',
                  }}
                >
                  <Server size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                    MongoDB Primary Engine
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                    Cluster: <strong>{meta.host}</strong> | Database: <strong>{meta.dbName}</strong>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 16px',
                  borderRadius: '999px',
                  background: '#ecfdf5',
                  color: '#059669',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  border: '1px solid #a7f3d0',
                }}
              >
                <CheckCircle2 size={16} />
                <span>{meta.dbStatus}</span>
              </div>
            </div>

            {/* Re-seed Database Tool */}
            <div
              style={{
                padding: '20px',
                borderRadius: '18px',
                background: '#fff1f2',
                border: '1.5px solid #fecdd3',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '1rem', color: '#9f1239' }}>
                  <Sparkles size={18} /> Re-seed Sample Artisanal Flavours
                </div>
                <div style={{ fontSize: '0.85rem', color: '#be123c', marginTop: '4px', maxWidth: '600px' }}>
                  Resets the parlour catalogue with all 12 categories and 18 high-resolution artisanal flavours
                  (Vanilla, Belgian Chocolate, Alphonso Mango, Strawberry Swirl, Butterscotch, etc.).
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                disabled={resetting}
                style={{
                  background: '#be123c',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 20px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(190, 18, 60, 0.25)',
                }}
              >
                {resetting ? (
                  <>
                    <RefreshCw size={15} className="spin-animate" />
                    <span>Re-seeding...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={15} />
                    <span>Re-seed Flavours</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Confirmation Modal for Database Re-seeding */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="admin-modal-overlay">
            <motion.div
              className="delete-dialog-box"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#fff1f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: '#e11d48',
                }}
              >
                <Sparkles size={28} />
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--chocolate-dark)', marginBottom: '8px' }}>
                Re-seed Catalogue Data?
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '22px' }}>
                This will refresh all categories and seed 18 fresh artisanal flavours. Existing items with matching names will be safely updated.
              </p>

              <div className="delete-dialog-actions">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setShowResetConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={handleReseedDatabase}
                  disabled={resetting}
                  style={{ background: '#be123c' }}
                >
                  {resetting ? 'Seeding...' : 'Yes, Re-seed Catalog'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminSettings;

