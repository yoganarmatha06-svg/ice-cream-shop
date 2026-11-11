import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Sparkles,
  KeyRound,
  Store,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim() || !password) {
      setError('Please provide both admin email and password');
      return;
    }

    try {
      setSubmitting(true);
      const admin = await adminLogin(email.trim(), password);
      setSuccessMsg(`Welcome back, ${admin.name}! Redirecting to Admin Dashboard...`);
      setTimeout(() => {
        navigate(redirect);
      }, 700);
    } catch (err) {
      setError(err.message || 'Invalid administrator credentials. Access denied.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@scoopdreams.com');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="auth-page-wrapper admin-login-wrapper">
      <motion.div
        className="auth-card admin-auth-card"
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          border: '1.5px solid rgba(225, 29, 72, 0.18)',
          boxShadow: '0 25px 60px -12px rgba(45, 24, 16, 0.15)',
        }}
      >
        {/* Admin Badge Header */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              background: '#fdf2f4',
              borderRadius: '999px',
              border: '1px solid #fecdd3',
              color: 'var(--strawberry)',
              fontSize: '0.82rem',
              fontWeight: 700,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            <ShieldCheck size={16} />
            <span>Admin Management Portal</span>
          </div>
        </div>

        <Link to="/" className="auth-logo" style={{ display: 'inline-block' }}>
          Scoop Dreams 🍦
        </Link>
        <p className="auth-subtitle" style={{ maxWidth: '380px', margin: '0 auto 24px' }}>
          Sign in with administrator credentials to manage ice cream varieties and flavour profiles.
        </p>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
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

        {/* Success Alert */}
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
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
            <label className="form-label" style={{ fontWeight: 600 }}>
              Admin Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                placeholder="admin@scoopdreams.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '42px', height: '50px' }}
                autoComplete="email"
              />
              <Mail
                size={18}
                color="#9c8e8c"
                style={{ position: 'absolute', left: '14px', top: '16px' }}
              />
            </div>
          </div>

          <div className="form-field-group">
            <label className="form-label" style={{ fontWeight: 600 }}>
              Admin Secret Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '42px', height: '50px' }}
                autoComplete="current-password"
              />
              <Lock
                size={18}
                color="#9c8e8c"
                style={{ position: 'absolute', left: '14px', top: '16px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary auth-submit-btn"
            style={{
              height: '50px',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
              boxShadow: '0 8px 24px -4px rgba(225, 29, 72, 0.4)',
            }}
          >
            {submitting ? (
              'Verifying Admin Credentials...'
            ) : (
              <>
                <KeyRound size={18} />
                <span>Sign In to Admin Portal</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Login Helper */}
        <div className="demo-accounts-box" style={{ marginTop: '24px', background: '#faf5ff', borderColor: '#e9d5ff' }}>
          <div
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#6b21a8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={16} color="#9333ea" /> Quick Demo Admin Access
          </div>
          <div className="demo-pills" style={{ marginTop: '8px' }}>
            <button
              type="button"
              className="demo-pill-btn"
              onClick={handleFillDemo}
              style={{
                borderColor: '#c084fc',
                color: '#7e22ce',
                background: '#ffffff',
                padding: '6px 16px',
              }}
            >
              Fill: admin@scoopdreams.com / admin123
            </button>
          </div>
        </div>

        {/* Cross Links */}
        <div
          style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-soft)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            fontSize: '0.88rem',
            color: 'var(--text-secondary)',
          }}
        >
          <div>
            Are you a customer?{' '}
            <Link to="/login" style={{ color: 'var(--strawberry)', fontWeight: 700 }}>
              Customer Sign In
            </Link>
          </div>

          <div>
            <Link
              to="/"
              style={{
                color: 'var(--chocolate-dark)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 600,
              }}
            >
              <Store size={15} /> Return to Scoop Dreams Storefront
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;

