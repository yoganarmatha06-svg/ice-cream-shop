import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Phone,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { userRegister } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!formData.email.trim()) {
      setError('Please enter a valid email address');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify both password fields.');
      return;
    }

    try {
      setSubmitting(true);
      const user = await userRegister({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      setSuccessMsg(`Welcome to Scoop Dreams, ${user.name}! Your customer account is active.`);
      setTimeout(() => {
        navigate('/');
      }, 700);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 25, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ maxWidth: '520px' }}
      >
        <Link to="/" className="auth-logo">
          Scoop Dreams 🍦
        </Link>
        <p className="auth-subtitle">
          Join the Scoop Club for artisan ice creams, fast deliveries, and exclusive rewards.
        </p>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '12px 16px',
              background: '#fee2e2',
              color: '#991b1b',
              borderRadius: '14px',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px',
              textAlign: 'left',
              border: '1px solid #fca5a5',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </motion.div>
        )}

        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '12px 16px',
              background: '#dcfce7',
              color: '#166534',
              borderRadius: '14px',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px',
              textAlign: 'left',
              border: '1px solid #86efac',
            }}
          >
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-field-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Maya Lin"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                style={{ paddingLeft: '40px', height: '48px' }}
                autoComplete="name"
              />
              <User size={18} color="#9c8e8c" style={{ position: 'absolute', left: '14px', top: '15px' }} />
            </div>
          </div>

          <div className="form-field-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                name="email"
                required
                placeholder="you@domain.com"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                style={{ paddingLeft: '40px', height: '48px' }}
                autoComplete="email"
              />
              <Mail size={18} color="#9c8e8c" style={{ position: 'absolute', left: '14px', top: '15px' }} />
            </div>
          </div>

          <div className="form-field-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Phone Number</label>
            <div style={{ position: 'relative' }}>
              <input
                type="tel"
                name="phone"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
                style={{ paddingLeft: '40px', height: '48px' }}
                autoComplete="tel"
              />
              <Phone size={18} color="#9c8e8c" style={{ position: 'absolute', left: '14px', top: '15px' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-field-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Min 6 chars"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  style={{ paddingLeft: '40px', height: '48px' }}
                  autoComplete="new-password"
                />
                <Lock size={18} color="#9c8e8c" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              </div>
            </div>

            <div className="form-field-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  placeholder="Repeat password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input"
                  style={{ paddingLeft: '40px', height: '48px' }}
                  autoComplete="new-password"
                />
                <Lock size={18} color="#9c8e8c" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary auth-submit-btn"
            style={{ height: '48px', fontSize: '0.95rem', marginTop: '16px' }}
          >
            {submitting ? 'Creating Scoop Account...' : <><UserPlus size={18} /> Join Scoop Dreams</>}
          </button>
        </form>

        <div style={{ marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--strawberry)', fontWeight: 700 }}>
            Sign In Here
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
