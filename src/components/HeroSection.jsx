import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, Sparkles, Star, Zap, Award } from 'lucide-react';
import heroBannerImg from '../assets/images/good-vibes-hero.jpg';
import { TextReveal } from './ScrollReveal';

const smoothTransition = { duration: 0.9, ease: [0.22, 1, 0.36, 1] };

const HeroSection = () => {
  const heroRef = useRef(null);

  // Parallax scroll hook
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  // Multi-layered parallax values
  const rawBgBlob1Y = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const rawBgBlob2Y = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const rawBgBlob3Y = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const rawImageY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const rawContentY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const rawOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.2]);

  // Spring smoothing for zero jitter
  const bgBlob1Y = useSpring(rawBgBlob1Y, { stiffness: 90, damping: 20 });
  const bgBlob2Y = useSpring(rawBgBlob2Y, { stiffness: 90, damping: 20 });
  const bgBlob3Y = useSpring(rawBgBlob3Y, { stiffness: 90, damping: 20 });
  const imageY = useSpring(rawImageY, { stiffness: 100, damping: 22 });
  const contentY = useSpring(rawContentY, { stiffness: 100, damping: 22 });
  const contentOpacity = useSpring(rawOpacity, { stiffness: 100, damping: 22 });

  return (
    <section ref={heroRef} className="hero-wrapper" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background Pastel Aura Blobs with Parallax Movement */}
      <div className="hero-backdrop-shapes">
        <motion.div style={{ y: bgBlob1Y }} className="pastel-blob blob-1" />
        <motion.div style={{ y: bgBlob2Y }} className="pastel-blob blob-2" />
        <motion.div style={{ y: bgBlob3Y }} className="pastel-blob blob-3" />
      </div>

      <div className="container hero-grid">
        {/* Left Column: Headlines & CTA with Staggered Scroll Transitions */}
        <motion.div
          className="hero-content"
          style={{ y: contentY, opacity: contentOpacity }}
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Pill Badge with Shimmer & Entrance */}
          <motion.div
            className="hero-pill-badge"
            initial={{ opacity: 0, scale: 0.9, y: -15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles size={16} />
            <span>Artisanal Gelato & Small-Batch Ice Cream</span>
          </motion.div>

          {/* Main Heading with Word-by-Word Text Reveal */}
          <div style={{ marginBottom: '20px' }}>
            <TextReveal
              text="Happiness Comes in Every"
              as="h1"
              className="hero-title"
              style={{ display: 'inline', margin: 0 }}
            />
            <motion.span
              className="highlight-text"
              initial={{ opacity: 0, scale: 0.8, filter: 'blur(8px)', rotate: -4 }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: 'inline-block', transformOrigin: 'bottom left' }}
            >
              Scoop!
            </motion.span>
          </div>

          {/* Subtitle with Blur-to-Clear Reveal */}
          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 25, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.35, ease: 'easeOut' }}
          >
            Indulge in a symphony of taste handcrafted with slow-churned farm fresh cream, sun-ripened organic fruits, and velvety single-origin chocolate.
          </motion.p>

          {/* Action Buttons with Micro-Interactions */}
          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: 'easeOut' }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
              <Link to="/shop" className="btn-primary" style={{ padding: '16px 36px', fontSize: '1.05rem' }}>
                Shop Now <ArrowRight size={18} />
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <a href="#categories" className="btn-secondary" style={{ padding: '16px 32px', fontSize: '1.05rem' }}>
                Explore Flavours
              </a>
            </motion.div>
          </motion.div>

          {/* Social Proof & Metrics with Staggered Entrance */}
          <motion.div
            className="hero-stats-row"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15, delayChildren: 0.65 },
              },
            }}
          >
            {[
              { title: '4.9 ★', desc: 'Over 15,000+ Happy Foodies' },
              { title: '100%', desc: 'Fresh Farm Organic Cream' },
              { title: '35 Min', desc: 'Sub-Zero Insulated Delivery' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                className="stat-item"
                variants={{
                  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
                  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
                }}
                transition={{ duration: 0.6 }}
              >
                <h4>{stat.title}</h4>
                <p>{stat.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Column: Hero Visual Frame with Parallax & Continuous Floating */}
        <motion.div
          className="hero-visual"
          style={{ y: imageY }}
          initial={{ opacity: 0, scale: 0.92, filter: 'blur(8px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Main Hero Card Frame with Soft Breathing/Floating Float */}
          <motion.div
            className="hero-image-frame"
            animate={{
              y: [0, -8, 0],
              rotate: [0, 0.5, 0, -0.5, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 7,
              ease: 'easeInOut',
            }}
          >
            <motion.img
              src={heroBannerImg}
              alt="Good Vibes and Ice Cream - Scoop Dreams Artisan Parlour"
              className="hero-main-img"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>

          {/* Floating Glass Pill 1: Grand Award (Opposite Trajectory Wave) */}
          <motion.div
            className="floating-glass-card floating-card-1"
            animate={{
              y: [0, -16, 0],
              x: [0, 6, 0],
            }}
            transition={{ repeat: Infinity, duration: 4.8, ease: 'easeInOut' }}
            whileHover={{ scale: 1.08, y: -20 }}
          >
            <div className="floating-card-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
              <Award size={22} />
            </div>
            <div className="floating-card-text">
              <h5>Best Artisan Ice Cream</h5>
              <p>Grand Confection Award 2026</p>
            </div>
          </motion.div>

          {/* Floating Glass Pill 2: Fresh Churning Wave */}
          <motion.div
            className="floating-glass-card floating-card-2"
            animate={{
              y: [0, 14, 0],
              x: [0, -6, 0],
            }}
            transition={{ repeat: Infinity, duration: 5.2, ease: 'easeInOut', delay: 0.8 }}
            whileHover={{ scale: 1.08, y: 18 }}
          >
            <div className="floating-card-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
              <Zap size={22} />
            </div>
            <div className="floating-card-text">
              <h5>Freshly Churned Daily</h5>
              <p>Zero Preservatives & Artificial Colors</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
