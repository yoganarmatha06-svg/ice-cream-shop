import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  HeartHandshake,
  Award,
  CheckCircle2,
  Copy,
  Star,
  Send,
} from 'lucide-react';
import HeroSection from '../components/HeroSection';
import CategoryCard from '../components/CategoryCard';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import ScrollReveal, { StaggerContainer, StaggerItem, TextReveal } from '../components/ScrollReveal';
import { productsAPI, categoriesAPI } from '../services/api';
import '../styles/home.css';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, prodsRes] = await Promise.all([
          categoriesAPI.getAll(),
          productsAPI.getAll({ featured: 'true', limit: 8 }),
        ]);

        if (catsRes.success) setCategories(catsRes.data);
        if (prodsRes.success) setFeaturedProducts(prodsRes.data);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2500);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <div className="home-page">
      {/* 1. Hero Section (Parallax & Floating layers) */}
      <HeroSection />

      {/* 2. Featured Categories Section with Staggered Entrance */}
      <section id="categories" className="section-wrapper" style={{ background: '#fff' }}>
        <div className="container">
          <div className="section-header-center">
            <ScrollReveal animation="fade-down" distance={25}>
              <span className="section-pill-tag">Curated Selections</span>
            </ScrollReveal>

            <ScrollReveal animation="blur-in" delay={0.1}>
              <h2 className="section-title">Explore Artisanal Categories</h2>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={0.2} distance={20}>
              <p className="section-desc">
                From hand-picked fruit sorbets to deep cocoa indulgences, explore our craft collections.
              </p>
            </ScrollReveal>
          </div>

          {loading ? (
            <Loader text="Gathering artisanal categories..." />
          ) : (
            <StaggerContainer
              className="categories-grid"
              staggerDelay={0.09}
              initialDelay={0.1}
            >
              {categories.map((cat) => (
                <CategoryCard key={cat._id} category={cat} />
              ))}
            </StaggerContainer>
          )}
        </div>
      </section>

      {/* 3. Best Selling Products Section with Stagger Animation */}
      <section className="section-wrapper" style={{ background: 'var(--cream-white)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <ScrollReveal animation="fade-right" distance={30}>
                <span className="section-pill-tag">Customer Favorites</span>
                <h2 className="section-title" style={{ marginBottom: 0 }}>
                  Best Selling Scoops
                </h2>
              </ScrollReveal>
            </div>

            <ScrollReveal animation="fade-left" distance={30}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/shop" className="btn-secondary" style={{ padding: '10px 24px' }}>
                  View All Flavours <ArrowRight size={16} />
                </Link>
              </motion.div>
            </ScrollReveal>
          </div>

          {loading ? (
            <Loader text="Loading bestsellers..." />
          ) : (
            <StaggerContainer
              className="products-grid"
              staggerDelay={0.1}
              initialDelay={0.15}
            >
              {featuredProducts.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </StaggerContainer>
          )}
        </div>
      </section>

      {/* 4. About Our Ice Cream Section (Image from Left, Text from Right) */}
      <section id="about" className="section-wrapper" style={{ background: '#ffffff', overflow: 'hidden' }}>
        <div className="container">
          <div className="about-grid">
            {/* Left Column: Image Composition Sliding From Left */}
            <ScrollReveal animation="fade-right" distance={60} duration={0.85}>
              <div className="about-images-composition">
                <motion.img
                  src="https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80"
                  alt="Artisan Churning"
                  className="about-img-main"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.4 }}
                />
                <motion.img
                  src="https://images.unsplash.com/photo-1505394033641-40c6ad1178d7?auto=format&fit=crop&w=500&q=80"
                  alt="Berry Swirl Cone"
                  className="about-img-accent"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                  whileHover={{ scale: 1.08 }}
                />
              </div>
            </ScrollReveal>

            {/* Right Column: Content Sliding From Right */}
            <ScrollReveal animation="fade-left" distance={60} duration={0.85}>
              <div>
                <span className="section-pill-tag">The Scoop Dreams Philosophy</span>
                <h2 className="section-title">
                  Handcrafted With Passion, Pure Cream & True Fruit
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '24px' }}>
                  Every single batch at Scoop Dreams is churned slow and cold in small French copper vats. We never use artificial emulsifiers, corn syrups, or fake food colorings.
                </p>

                {/* Staggered Features List */}
                <StaggerContainer className="about-features-list" staggerDelay={0.12}>
                  <StaggerItem animation="fade-up" distance={25} className="about-feature-box">
                    <motion.div whileHover={{ y: -4 }}>
                      <h5>Grass-Fed Farm Milk</h5>
                      <p>Sourced fresh daily from local heritage dairy farms.</p>
                    </motion.div>
                  </StaggerItem>

                  <StaggerItem animation="fade-up" distance={25} className="about-feature-box">
                    <motion.div whileHover={{ y: -4 }}>
                      <h5>Real Vanilla & Cocoa</h5>
                      <p>Bourbon vanilla pods & 72% single-origin Belgian cacao.</p>
                    </motion.div>
                  </StaggerItem>

                  <StaggerItem animation="fade-up" distance={25} className="about-feature-box">
                    <motion.div whileHover={{ y: -4 }}>
                      <h5>Zero Artificial Flavors</h5>
                      <p>100% genuine fruit reductions and roasted nuts.</p>
                    </motion.div>
                  </StaggerItem>

                  <StaggerItem animation="fade-up" distance={25} className="about-feature-box">
                    <motion.div whileHover={{ y: -4 }}>
                      <h5>Sub-Zero Fresh Delivery</h5>
                      <p>Refrigerated cryo-packs keep every scoop firmly frozen.</p>
                    </motion.div>
                  </StaggerItem>
                </StaggerContainer>

                <div style={{ marginTop: '32px' }}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ display: 'inline-block' }}>
                    <Link to="/shop" className="btn-primary">
                      Taste The Difference <ArrowRight size={18} />
                    </Link>
                  </motion.div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 5. Special Offers / Discount Promo Section with Zoom Animation */}
      <section className="section-wrapper" style={{ background: 'var(--cream-white)' }}>
        <div className="container">
          <ScrollReveal animation="zoom-in" duration={0.8} threshold={0.2}>
            <div className="promo-banner">
              <div className="promo-grid">
                <div>
                  <ScrollReveal animation="fade-up" delay={0.1} distance={20}>
                    <span className="promo-tag">Limited Time Exclusive</span>
                  </ScrollReveal>

                  <ScrollReveal animation="fade-up" delay={0.2} distance={25}>
                    <h2 className="promo-title">
                      Get 20% Off Your First Artisanal Order!
                    </h2>
                  </ScrollReveal>

                  <ScrollReveal animation="fade-up" delay={0.3} distance={25}>
                    <p style={{ color: '#fed7aa', fontSize: '1.1rem', lineHeight: '1.6' }}>
                      Celebrate the season of sweet moments. Use coupon code at checkout for instant savings across all scoops, tubs, and party cones.
                    </p>
                  </ScrollReveal>

                  <ScrollReveal animation="blur-in" delay={0.4}>
                    <motion.div className="promo-coupon-pill" whileHover={{ scale: 1.04 }}>
                      <span>Use Coupon:</span>
                      <strong>SCOOP20</strong>
                      <button
                        type="button"
                        onClick={() => handleCopyCoupon('SCOOP20')}
                        style={{ background: 'none', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                      >
                        {copiedCoupon ? <CheckCircle2 size={16} color="#86efac" /> : <Copy size={16} />}
                        <span style={{ fontSize: '0.8rem' }}>{copiedCoupon ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </motion.div>
                  </ScrollReveal>

                  <ScrollReveal animation="fade-up" delay={0.5}>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ display: 'inline-block' }}>
                      <Link to="/shop" className="btn-primary" style={{ background: '#ff6b8b', color: '#fff' }}>
                        Shop Now <ArrowRight size={18} />
                      </Link>
                    </motion.div>
                  </ScrollReveal>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <motion.img
                    src="https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=600&q=80"
                    alt="Summer Mango Gelato"
                    style={{ width: '100%', maxWidth: '380px', borderRadius: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '4px solid rgba(255,255,255,0.2)' }}
                    animate={{ y: [0, -12, 0], rotate: [0, 1, 0, -1, 0] }}
                    transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                    whileHover={{ scale: 1.05 }}
                  />
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 6. Why Choose Us Section with Staggered Cards */}
      <section id="why-us" className="section-wrapper" style={{ background: '#ffffff' }}>
        <div className="container">
          <div className="section-header-center">
            <ScrollReveal animation="fade-down" distance={20}>
              <span className="section-pill-tag">The Scoop Dreams Standard</span>
            </ScrollReveal>

            <ScrollReveal animation="blur-in" delay={0.1}>
              <h2 className="section-title">Why Ice Cream Connoisseurs Choose Us</h2>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={0.2} distance={20}>
              <p className="section-desc">
                We hold every recipe to the highest global pastry and artisan standard.
              </p>
            </ScrollReveal>
          </div>

          <StaggerContainer className="features-grid" staggerDelay={0.12} initialDelay={0.15}>
            <StaggerItem animation="fade-up" distance={30} className="feature-card">
              <motion.div whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 300 }}>
                <div className="feature-icon-wrapper" style={{ background: '#ffe4e6', color: '#e11d48' }}>
                  <Award size={32} />
                </div>
                <h4>100% Fresh Ingredients</h4>
                <p>Natural strawberries, Alphonso mangoes, Sicilian pistachios, and fresh cream without fake syrups.</p>
              </motion.div>
            </StaggerItem>

            <StaggerItem animation="fade-up" distance={30} className="feature-card">
              <motion.div whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 300 }}>
                <div className="feature-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}>
                  <ShieldCheck size={32} />
                </div>
                <h4>Premium Quality</h4>
                <p>Small-batch churned with high butterfat content for the signature velvety Scoop Dreams mouthfeel.</p>
              </motion.div>
            </StaggerItem>

            <StaggerItem animation="fade-up" distance={30} className="feature-card">
              <motion.div whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 300 }}>
                <div className="feature-icon-wrapper" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                  <Truck size={32} />
                </div>
                <h4>Fast Sub-Zero Delivery</h4>
                <p>Delivered within 35 minutes in thermal dry-ice insulated containers to guarantee zero melting.</p>
              </motion.div>
            </StaggerItem>

            <StaggerItem animation="fade-up" distance={30} className="feature-card">
              <motion.div whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 300 }}>
                <div className="feature-icon-wrapper" style={{ background: '#dcfce7', color: '#15803d' }}>
                  <HeartHandshake size={32} />
                </div>
                <h4>Delicious Flavours</h4>
                <p>Over a dozen signature blends spanning classic vanillas, roasted nut gelatos, and exotic floral infusions.</p>
              </motion.div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* 7. Customer Reviews Section with Smooth Entrance */}
      <section className="section-wrapper" style={{ background: 'var(--cream-white)' }}>
        <div className="container">
          <div className="section-header-center">
            <ScrollReveal animation="fade-down" distance={20}>
              <span className="section-pill-tag">Love From Sweet Tooths</span>
            </ScrollReveal>

            <ScrollReveal animation="blur-in" delay={0.1}>
              <h2 className="section-title">Loved by Thousands of Scoop Aficionados</h2>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={0.2} distance={20}>
              <p className="section-desc">
                Discover why food critics and happy families rave about our scoops.
              </p>
            </ScrollReveal>
          </div>

          <StaggerContainer className="reviews-grid" staggerDelay={0.15} initialDelay={0.15}>
            <StaggerItem animation="fade-up" distance={35} className="review-card">
              <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300 }}>
                <div className="review-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <p className="review-comment">
                  "The Berry Blush Swirl cone is an absolute masterpiece. The tartness of forest raspberries cuts through the velvety cream so beautifully!"
                </p>
                <div className="review-author">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
                    alt="Elena Rostova"
                    className="review-avatar"
                  />
                  <div>
                    <h5>Elena Rostova</h5>
                    <p>Pastry Chef & Food Stylist</p>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>

            <StaggerItem animation="fade-up" distance={35} className="review-card">
              <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300 }}>
                <div className="review-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <p className="review-comment">
                  "The Mango Velvet Drip tastes like biting directly into an Alphonso mango right on the tree. Super fast delivery—arrived rock solid!"
                </p>
                <div className="review-author">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                    alt="Julian Vance"
                    className="review-avatar"
                  />
                  <div>
                    <h5>Julian Vance</h5>
                    <p>Culinary Writer</p>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>

            <StaggerItem animation="fade-up" distance={35} className="review-card">
              <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300 }}>
                <div className="review-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <p className="review-comment">
                  "Pistachio Dream Cream with the delicate mint touch was sensational. My kids and I ordered the family tub and finished it in one evening."
                </p>
                <div className="review-author">
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80"
                    alt="Camila Santos"
                    className="review-avatar"
                  />
                  <div>
                    <h5>Camila Santos</h5>
                    <p>Verified Buyer</p>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* 8. Newsletter Subscription with Blur & Zoom-In Reveal */}
      <section className="section-wrapper" style={{ background: '#ffffff', paddingTop: 0 }}>
        <div className="container">
          <ScrollReveal animation="zoom-in" duration={0.8} threshold={0.25}>
            <div className="newsletter-box">
              <span className="badge badge-pink" style={{ marginBottom: '14px' }}>
                The Sweet Letter
              </span>
              <h2 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '12px' }}>
                Join the Scoop Club & Get Sweet Perks
              </h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto' }}>
                Be the first to hear about seasonal limited batches, secret parlor flavors, and exclusive coupon drops.
              </p>

              {subscribed ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    marginTop: '24px',
                    padding: '16px 24px',
                    background: '#dcfce7',
                    color: '#15803d',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <CheckCircle2 size={20} />
                  Welcome to Scoop Dreams Club! Check your inbox for your 20% discount code.
                </motion.div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address..."
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="newsletter-input"
                  />
                  <motion.button
                    type="submit"
                    className="btn-primary"
                    style={{ padding: '12px 28px' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Subscribe <Send size={16} />
                  </motion.button>
                </form>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default Home;
