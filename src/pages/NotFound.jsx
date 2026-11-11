import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '5rem', marginBottom: '16px' }}>🍦💧</div>
      <h1
        style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: '3.5rem',
          color: 'var(--chocolate-dark)',
          marginBottom: '12px',
        }}
      >
        404 - Scoop Melted Away!
      </h1>
      <p
        style={{
          color: 'var(--text-secondary)',
          fontSize: '1.1rem',
          maxWidth: '460px',
          marginBottom: '32px',
          lineHeight: '1.6',
        }}
      >
        The page you are looking for has slipped off its cone. Let's get you back to the fresh parlour selections.
      </p>

      <div style={{ display: 'flex', gap: '16px' }}>
        <Link to="/" className="btn-primary" style={{ padding: '14px 28px' }}>
          <Home size={18} /> Back to Home
        </Link>
        <Link to="/shop" className="btn-secondary" style={{ padding: '14px 28px' }}>
          Explore Flavours
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
