import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Star, Sparkles, Check, ArrowRight, Rotate3d } from 'lucide-react';
import Product3DRotator from './Product3DRotator';
import { categoryImages } from '../assets/images/categories';
import { useCart } from '../context/CartContext';
import ScrollReveal from './ScrollReveal';
import '../styles/product3d.css';

const SHOWCASE_PRODUCTS = [
  {
    id: 'vanilla-3d-01',
    name: 'Madagascar Vanilla Bean Ice Cream',
    flavor: 'Vanilla',
    emoji: '🍦',
    image: categoryImages.vanilla,
    price: 4.99,
    originalPrice: 6.5,
    rating: 4.9,
    numReviews: 184,
    description:
      'Hand-scraped bourbon vanilla pods infused in slow-churned grass-fed cream with subtle honeyed caramel undertones.',
    attributes: ['100% Bourbon Vanilla', 'Grass-Fed Cream', 'Velvety Churn'],
    bgGradient: 'linear-gradient(135deg, #fefce8 0%, #fef08a 100%)',
    textColor: '#854d0e',
  },
  {
    id: 'chocolate-3d-02',
    name: 'Belgian Dark Chocolate Truffle',
    flavor: 'Chocolate',
    emoji: '🍫',
    image: categoryImages.chocolate,
    price: 5.49,
    originalPrice: 7.0,
    rating: 5.0,
    numReviews: 246,
    description:
      'Decadent 72% single-origin Belgian cocoa ribbons folded with rich handmade dark chocolate truffle crumbles.',
    attributes: ['72% Dark Cacao', 'Belgian Truffles', 'Deep Cocoa Ribbon'],
    bgGradient: 'linear-gradient(135deg, #f5ebe6 0%, #e6d5cc 100%)',
    textColor: '#4a2e2b',
  },
  {
    id: 'strawberry-3d-03',
    name: 'Wild Strawberry Cream Swirl',
    flavor: 'Strawberry',
    emoji: '🍓',
    image: categoryImages.strawberry,
    price: 5.29,
    originalPrice: 6.8,
    rating: 4.9,
    numReviews: 198,
    description:
      'Fresh farm-picked organic strawberries blended with clotted sweet cream and thick wild strawberry compote.',
    attributes: ['Fresh Strawberries', 'Real Fruit Compote', 'Zero Artificial Pink'],
    bgGradient: 'linear-gradient(135deg, #fce7ec 0%, #fbcfe8 100%)',
    textColor: '#be123c',
  },
  {
    id: 'mango-3d-04',
    name: 'Alphonso Golden Mango Gelato',
    flavor: 'Mango',
    emoji: '🥭',
    image: categoryImages.mango,
    price: 5.49,
    originalPrice: 7.2,
    rating: 4.8,
    numReviews: 162,
    description:
      'Sun-ripened Alphonso mango pulp churned to luscious, silky perfection for an explosion of tropical sunshine.',
    attributes: ['Alphonso Mango', 'Tropical Sweetness', 'Silky Churn'],
    bgGradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    textColor: '#b45309',
  },
  {
    id: 'blueberry-3d-05',
    name: 'Wild Blueberry & Cheesecake Gelato',
    flavor: 'Blueberry',
    emoji: '🫐',
    image: categoryImages['blueberry-cheesecake'],
    price: 5.99,
    originalPrice: 7.5,
    rating: 5.0,
    numReviews: 215,
    description:
      'Velvety mascarpone cheesecake gelato ribboned with mountain wild blueberry coulis and buttery graham cracker crust.',
    attributes: ['Mascarpone Gelato', 'Wild Blueberries', 'Graham Crust Ribbons'],
    bgGradient: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
    textColor: '#6b21a8',
  },
];

const Product3DShowcase = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { addToCart } = useCart();
  const currentProduct = SHOWCASE_PRODUCTS[selectedIndex];

  const handleAddToCart = () => {
    addToCart(
      {
        _id: currentProduct.id,
        name: currentProduct.name,
        price: currentProduct.price,
        discountPrice: currentProduct.price,
        image: currentProduct.image,
        flavour: currentProduct.flavor,
      },
      1,
      'Regular Scoop (120ml)'
    );
  };

  return (
    <section className="showcase-3d-section">
      <div className="showcase-3d-container">
        {/* Section Header */}
        <div className="showcase-3d-header">
          <ScrollReveal animation="fade-down" distance={20}>
            <span className="showcase-3d-pill">
              <Sparkles size={16} /> Interactive 3D Flavour Stage
            </span>
          </ScrollReveal>

          <ScrollReveal animation="blur-in" delay={0.1}>
            <h2 className="showcase-3d-title">Experience Our Artisanal Scoops in 3D</h2>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={0.2} distance={20}>
            <p className="showcase-3d-desc">
              Hover, tilt, and explore our five signature ice cream craft recipes with realistic 3D lighting,
              ambient rotation, and physical gravity shadows.
            </p>
          </ScrollReveal>
        </div>

        {/* Flavour Selector Pills */}
        <div className="showcase-3d-tabs">
          {SHOWCASE_PRODUCTS.map((prod, idx) => (
            <button
              key={prod.id}
              type="button"
              className={`showcase-tab-btn ${selectedIndex === idx ? 'active' : ''}`}
              onClick={() => setSelectedIndex(idx)}
            >
              <span className="showcase-tab-emoji">{prod.emoji}</span>
              <span>{prod.flavor}</span>
            </button>
          ))}
        </div>

        {/* Central 3D Stage */}
        <div className="showcase-3d-main-stage">
          {/* Left: 3D Product Interactive Stage */}
          <div
            className="showcase-stage-visual"
            style={{
              background: currentProduct.bgGradient,
            }}
          >
            <div className="showcase-360-hint">
              <Rotate3d size={15} /> Hover & Move Mouse to 3D Tilt
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentProduct.id}
                initial={{ opacity: 0, scale: 0.85, rotateY: -35 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.85, rotateY: 35 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
              >
                <Product3DRotator
                  src={currentProduct.image}
                  alt={currentProduct.name}
                  flavor={currentProduct.flavor}
                  size="hero"
                  maxTilt={20}
                  showShadow={true}
                  showGlow={true}
                  showSheen={true}
                />
              </motion.div>
            </AnimatePresence>

            <div className="showcase-3d-pedestal" />
          </div>

          {/* Right: Product Details & Purchase CTA */}
          <div className="showcase-stage-details">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentProduct.id}
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -25 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="showcase-flavour-tag" style={{ color: currentProduct.textColor }}>
                  {currentProduct.flavor} Artisan Craft
                </span>

                <h3 className="showcase-product-name">{currentProduct.name}</h3>

                <div className="showcase-rating-row">
                  <div className="showcase-stars">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i < Math.floor(currentProduct.rating) ? '#f59e0b' : '#d1d5db'}
                        color="#f59e0b"
                      />
                    ))}
                  </div>
                  <span className="showcase-reviews-count">
                    <strong>{currentProduct.rating.toFixed(1)}</strong> ({currentProduct.numReviews} happy reviews)
                  </span>
                </div>

                <p className="showcase-description">{currentProduct.description}</p>

                <div className="showcase-attributes">
                  {currentProduct.attributes.map((attr, idx) => (
                    <div key={idx} className="showcase-attr-item">
                      <Check size={16} color="var(--strawberry)" />
                      <span>{attr}</span>
                    </div>
                  ))}
                </div>

                <div className="showcase-price-bar">
                  <span className="showcase-price">${currentProduct.price.toFixed(2)}</span>
                  <span className="showcase-original-price">${currentProduct.originalPrice.toFixed(2)}</span>
                  <span className="badge badge-pink">Save ${(currentProduct.originalPrice - currentProduct.price).toFixed(2)}</span>
                </div>

                <div className="showcase-actions">
                  <motion.button
                    type="button"
                    className="showcase-add-btn"
                    onClick={handleAddToCart}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ShoppingBag size={18} /> Add 3D Scoop to Bag
                  </motion.button>

                  <Link to="/shop" className="showcase-details-link">
                    Explore All Menu <ArrowRight size={16} />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom 5 Flavour Thumbnail Strip */}
        <div className="showcase-strip-grid">
          {SHOWCASE_PRODUCTS.map((prod, idx) => (
            <motion.div
              key={prod.id}
              className={`showcase-mini-card ${selectedIndex === idx ? 'active' : ''}`}
              onClick={() => setSelectedIndex(idx)}
              whileHover={{ y: -6 }}
              whileTap={{ scale: 0.96 }}
            >
              <Product3DRotator
                src={prod.image}
                alt={prod.name}
                flavor={prod.flavor}
                size="sm"
                maxTilt={12}
                showShadow={true}
                showGlow={false}
              />
              <div className="showcase-mini-name">{prod.flavor}</div>
              <div className="showcase-mini-price">${prod.price.toFixed(2)}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Product3DShowcase;

