import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Mail, Phone, MapPin, Clock } from 'lucide-react';
import ScrollReveal, { StaggerContainer, StaggerItem } from './ScrollReveal';

const Footer = () => {
  return (
    <footer style={{ background: '#2d1810', color: '#fbf8f6', paddingTop: '80px', paddingBottom: '30px', overflow: 'hidden' }}>
      <div className="container">
        {/* Staggered Footer Columns */}
        <StaggerContainer
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '40px',
            marginBottom: '60px',
          }}
          staggerDelay={0.12}
          initialDelay={0.1}
        >
          {/* Brand Info */}
          <StaggerItem animation="fade-up" distance={30}>
            <div style={{ fontFamily: 'Dancing Script, cursive', fontSize: '2.6rem', color: '#ff6b8b', marginBottom: '14px' }}>
              Scoop Dreams 🍦
            </div>
            <p style={{ color: '#d5c7c5', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '24px' }}>
              Artisanal, small-batch ice creams crafted with pure organic creams, hand-picked seasonal fruits, and single-origin chocolates. Happiness comes in every scoop!
            </p>
            <div style={{ display: 'flex', gap: '14px' }}>
              {/* Instagram */}
              <motion.a
                href="#"
                aria-label="Instagram"
                whileHover={{ scale: 1.15, y: -3 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  transition: 'background 0.2s',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </motion.a>
              {/* Facebook */}
              <motion.a
                href="#"
                aria-label="Facebook"
                whileHover={{ scale: 1.15, y: -3 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  transition: 'background 0.2s',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </motion.a>
              {/* Twitter / X */}
              <motion.a
                href="#"
                aria-label="Twitter"
                whileHover={{ scale: 1.15, y: -3 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  transition: 'background 0.2s',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4l11.733 16h4.267l-11.733 -16z"></path>
                  <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path>
                </svg>
              </motion.a>
            </div>
          </StaggerItem>

          {/* Quick Links */}
          <StaggerItem animation="fade-up" distance={30}>
            <h4 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', color: '#fff', marginBottom: '20px' }}>
              Explore
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
              <li>
                <Link to="/" style={{ color: '#d5c7c5', transition: 'color 0.2s' }}>Home</Link>
              </li>
              <li>
                <Link to="/shop" style={{ color: '#d5c7c5', transition: 'color 0.2s' }}>All Flavours</Link>
              </li>
              <li>
                <a href="/#categories" style={{ color: '#d5c7c5' }}>Flavour Categories</a>
              </li>
              <li>
                <a href="/#about" style={{ color: '#d5c7c5' }}>Our Artisan Story</a>
              </li>
              <li>
                <a href="/#why-us" style={{ color: '#d5c7c5' }}>Why Choose Us</a>
              </li>
              <li>
                <Link to="/cart" style={{ color: '#d5c7c5' }}>Shopping Bag</Link>
              </li>
            </ul>
          </StaggerItem>

          {/* Signature Flavours */}
          <StaggerItem animation="fade-up" distance={30}>
            <h4 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', color: '#fff', marginBottom: '20px' }}>
              Artisan Picks
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.92rem', color: '#d5c7c5' }}>
              <li>🍦 Bourbon Vanilla Cloud</li>
              <li>🍪 Midnight Oreo Cookie Dough</li>
              <li>🍓 Berry Blush Swirl</li>
              <li>🥭 Alphonso Mango Velvet</li>
              <li>🌿 Pistachio Dream Cream</li>
              <li>🍫 Belgian Dark Truffle</li>
              <li>☕ Cold Brew Mocha Hazelnut</li>
              <li>🦄 Unicorn Cotton Candy Dream</li>
            </ul>
          </StaggerItem>

          {/* Contact Details */}
          <StaggerItem animation="fade-up" distance={30}>
            <h4 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', color: '#fff', marginBottom: '20px' }}>
              Parlour & Delivery
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem', color: '#d5c7c5' }}>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <MapPin size={18} color="#ff6b8b" /> 742 Evergreen Artisan Boulevard, Cream Valley
              </li>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Phone size={18} color="#ff6b8b" /> +1 (800) 555-SCOOP (7266)
              </li>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Mail size={18} color="#ff6b8b" /> hello@scoopdreams.com
              </li>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Clock size={18} color="#ff6b8b" /> Daily 11:00 AM – 11:30 PM
              </li>
            </ul>
          </StaggerItem>
        </StaggerContainer>

        {/* Bottom Bar with Reveal */}
        <ScrollReveal animation="fade-up" distance={20} delay={0.2}>
          <div
            style={{
              borderTop: '1px solid rgba(255,255,255,0.1)',
              paddingTop: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              fontSize: '0.85rem',
              color: '#a89a98',
            }}
          >
            <div>
              © {new Date().getFullYear()} Scoop Dreams Inc. Handcrafted with love & natural cream.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              Made with <Heart size={14} color="#ff6b8b" fill="#ff6b8b" /> for Ice Cream Connoisseurs
            </div>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
};

export default Footer;
