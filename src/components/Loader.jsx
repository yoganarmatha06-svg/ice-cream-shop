import React from 'react';
import { motion } from 'framer-motion';

const Loader = ({ text = 'Churning fresh ice cream...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        width: '100%',
      }}
    >
      <motion.div
        animate={{
          rotate: [0, 15, -15, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.8,
          ease: 'easeInOut',
        }}
        style={{
          fontSize: '3.5rem',
          marginBottom: '16px',
        }}
      >
        🍦
      </motion.div>
      <motion.p
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.2rem',
          color: 'var(--chocolate-dark)',
          fontWeight: 600,
        }}
      >
        {text}
      </motion.p>
    </div>
  );
};

export default Loader;
