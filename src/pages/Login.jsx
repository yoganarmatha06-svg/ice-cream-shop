import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { userLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim() || !password) {
      setError('Please provide your email and password');
      return;
    }

    try {
      setSubmitting(true);
      const user = await userLogin(email.trim(), password);
      setSuccessMsg(`Welcome back, ${user.name}!`);
      setTimeout(() => {
        navigate(redirect === 'checkout' ? '/checkout' : redirect);
      }, 500);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('user@scoopdreams.com');
    setPassword('user123');
    setError('');
  };

  return (
    <div className="auth-page-wrapper">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 25, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link to="/" className="auth-logo">
          Scoop Dreams 🍦
        </Link>
        <p className="auth-subtitle">Customer Sign In – Access your account and order your favourite scoops.</p>

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
            <label className="form-label" style={{ fontWeight: 600 }}>Customer Email</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                placeholder="user@scoopdreams.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '40px', height: '48px' }}
                autoComplete="email"
              />
              <Mail size={18} color="#9c8e8c" style={{ position: 'absolute', left: '14px', top: '15px' }} />
            </div>
          </div>

          <div className="form-field-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '40px', height: '48px' }}
                autoComplete="current-password"
              />
              <Lock size={18} color="#9c8e8c" style={{ position: 'absolute', left: '14px', top: '15px' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary auth-submit-btn"
            style={{ height: '48px', fontSize: '0.95rem' }}
          >
            {submitting ? 'Signing In...' : <><LogIn size={18} /> Sign In</>}
          </button>
        </form>

        {/* 1-Click Demo Fill */}
        <div className="demo-accounts-box">
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--chocolate-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Sparkles size={16} color="var(--strawberry)" /> 1-Click Customer Demo
          </div>
          <div className="demo-pills">
            <button
              type="button"
              className="demo-pill-btn"
              onClick={handleFillDemo}
            >
              Fill: user@scoopdreams.com / user123
            </button>
          </div>
        </div>

        {/* Bottom links */}
        <div style={{ marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: 'var(--strawberry)', fontWeight: 700 }}>
            Create Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
