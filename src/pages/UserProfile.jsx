import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Phone, Mail, MapPin, Package, Heart, Save, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
import ScrollReveal from '../components/ScrollReveal';
import '../styles/auth.css';

const UserProfile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    profileImage: user?.profileImage || '',
  });
  const [password, setPassword] = useState('');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [successMsg, setSuccessMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await usersAPI.getAddresses();
        if (res.success) setSavedAddresses(res.data);
      } catch (err) {
        console.warn('Addresses error:', err.message);
      }
    };
    fetchAddresses();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = { ...formData };
      if (password) payload.password = password;
      await updateProfile(payload);
      setSuccessMsg('Profile updated successfully!');
      setPassword('');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await usersAPI.addAddress(newAddress);
      if (res.success) {
        setSavedAddresses([...savedAddresses, res.data]);
        setShowAddAddress(false);
        setNewAddress({ fullName: user?.name || '', phone: '', street: '', city: '', state: '', pincode: '' });
      }
    } catch (err) {
      alert(err.message || 'Failed to add address');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await usersAPI.deleteAddress(id);
      setSavedAddresses(savedAddresses.filter((a) => a._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="profile-wrapper">
      <div className="container">
        <div className="profile-layout">
          {/* Sidebar with Slide From Left */}
          <ScrollReveal animation="fade-right" distance={35}>
            <aside className="profile-sidebar-card">
              <div className="profile-avatar-icon-big">
                <User size={44} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--chocolate-dark)' }}>{user?.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user?.email}</p>
              <span className="badge badge-pink" style={{ marginTop: '10px' }}>
                {user?.role === 'admin' ? 'Master Admin' : 'Scoop Connoisseur'}
              </span>

              <nav className="profile-nav-list">
                <Link to="/profile" className="profile-nav-item active">
                  <User size={18} /> Account Profile
                </Link>
                <Link to="/my-orders" className="profile-nav-item">
                  <Package size={18} /> My Orders
                </Link>
                <Link to="/wishlist" className="profile-nav-item">
                  <Heart size={18} /> My Wishlist
                </Link>
              </nav>
            </aside>
          </ScrollReveal>

          {/* Main Account Settings with Slide From Right */}
          <ScrollReveal animation="fade-left" distance={35}>
            <main>
              {successMsg && (
                <div
                  style={{
                    padding: '14px 20px',
                    background: '#dcfce7',
                    color: '#15803d',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '24px',
                    fontWeight: 600,
                  }}
                >
                  <CheckCircle2 size={18} /> {successMsg}
                </div>
              )}

              {/* Profile Form Card */}
              <div style={{ background: '#ffffff', borderRadius: '28px', padding: '36px', border: '1px solid var(--border-soft)', boxShadow: 'var(--card-shadow)', marginBottom: '32px' }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', color: 'var(--chocolate-dark)', marginBottom: '24px' }}>
                  Personal Information
                </h3>

                <form onSubmit={handleProfileSubmit}>
                  <div className="form-grid-2">
                    <div className="form-field-group">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="form-input"
                      />
                    </div>

                    <div className="form-field-group">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-field-group">
                    <label className="form-label">New Password (leave blank to keep unchanged)</label>
                    <input
                      type="password"
                      placeholder="Enter new password if changing"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={saving}
                    className="btn-primary"
                    style={{ padding: '12px 28px' }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Save size={18} /> {saving ? 'Saving...' : 'Save Profile Changes'}
                  </motion.button>
                </form>
              </div>

              {/* Delivery Addresses Card */}
              <div style={{ background: '#ffffff', borderRadius: '28px', padding: '36px', border: '1px solid var(--border-soft)', boxShadow: 'var(--card-shadow)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', color: 'var(--chocolate-dark)' }}>
                    Saved Delivery Addresses
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddAddress(!showAddAddress)}
                    className="btn-secondary"
                    style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                  >
                    <Plus size={16} /> Add Address
                  </button>
                </div>

                {showAddAddress && (
                  <form onSubmit={handleAddAddressSubmit} style={{ background: '#fdf2f4', padding: '24px', borderRadius: '20px', marginBottom: '24px', border: '1px solid #fce7ec' }}>
                    <div className="form-grid-2">
                      <div className="form-field-group">
                        <label className="form-label">Contact Name</label>
                        <input
                          type="text"
                          required
                          value={newAddress.fullName}
                          onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                          className="form-input"
                        />
                      </div>
                      <div className="form-field-group">
                        <label className="form-label">Phone</label>
                        <input
                          type="tel"
                          required
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="form-field-group">
                      <label className="form-label">Street Address</label>
                      <input
                        type="text"
                        required
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        className="form-input"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                      <div className="form-field-group">
                        <label className="form-label">City</label>
                        <input
                          type="text"
                          required
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          className="form-input"
                        />
                      </div>
                      <div className="form-field-group">
                        <label className="form-label">State</label>
                        <input
                          type="text"
                          required
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          className="form-input"
                        />
                      </div>
                      <div className="form-field-group">
                        <label className="form-label">Pincode</label>
                        <input
                          type="text"
                          required
                          value={newAddress.pincode}
                          onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                          className="form-input"
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                      Save Address
                    </button>
                  </form>
                )}

                {savedAddresses.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                    {savedAddresses.map((addr) => (
                      <div
                        key={addr._id}
                        style={{
                          padding: '18px',
                          borderRadius: '18px',
                          border: '1px solid var(--border-soft)',
                          background: '#fdfaf9',
                          position: 'relative',
                        }}
                      >
                        <div style={{ fontWeight: 700, color: 'var(--chocolate-dark)', marginBottom: '4px' }}>
                          {addr.fullName}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                          {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          📞 {addr.phone}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addr._id)}
                          style={{ position: 'absolute', top: '14px', right: '14px', color: '#9c8e8c' }}
                          title="Delete address"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No saved addresses. Add your primary home or office delivery address above.
                  </p>
                )}
              </div>
            </main>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
