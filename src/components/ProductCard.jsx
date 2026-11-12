import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Star, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import Product3DRotator from './Product3DRotator';
import { categoryImages } from '../assets/images/categories';

const getFlavorClass = (flavour = '') => {
  const f = flavour.toLowerCase();
  if (f.includes('vanilla')) return 'flavor-vanilla';
  if (f.includes('blue') || f.includes('cheese')) return 'flavor-blueberry';
  if (f.includes('cotton') || f.includes('candy') || f.includes('unicorn')) return 'flavor-cottoncandy';
  if (f.includes('coffee') || f.includes('mocha') || f.includes('espresso')) return 'flavor-coffee';
  if (f.includes('oreo') || f.includes('cookie') || f.includes('dough')) return 'flavor-cookies';
  if (f.includes('mint')) return 'flavor-mint';
  if (f.includes('straw') || f.includes('berry') || f.includes('raspberry')) return 'flavor-strawberry';
  if (f.includes('mango') || f.includes('passion')) return 'flavor-mango';
  if (f.includes('pista') || f.includes('saffron') || f.includes('nut')) return 'flavor-pistachio';
  if (f.includes('choco') || f.includes('cocoa') || f.includes('hazelnut') || f.includes('truffle')) return 'flavor-chocolate';
  if (f.includes('butterscotch') || f.includes('caramel') || f.includes('toffee')) return 'flavor-butterscotch';
  return 'flavor-default';
};

const cardItemVariants = {
  hidden: { opacity: 1, y: 0 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const ProductCard = ({ product, customVariants = cardItemVariants }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState('Regular Scoop (120ml)');
  const navigate = useNavigate();

  const isFavorited = isInWishlist(product._id);
  const flavorClass = getFlavorClass(product.flavour || product.name);

  // Match local high-res asset image or fallback to product.image
  const resolveProductImage = () => {
    if (product.image && !product.image.includes('unsplash.com')) {
      return product.image;
    }
    const nameLower = (product.name || '').toLowerCase();
    const flavLower = (product.flavour || '').toLowerCase();
    for (const [key, val] of Object.entries(categoryImages)) {
      const cleanKey = key.replace(/-/g, ' ');
      if (nameLower.includes(cleanKey) || flavLower.includes(cleanKey)) {
        return val;
      }
    }
    return product.image || categoryImages.vanilla;
  };

  const displayImage = resolveProductImage();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    addToCart(product, 1, selectedSize);
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    toggleWishlist(product);
  };

  return (
    <>
      <motion.div
        className="product-card"
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{
          y: -10,
          transition: { type: 'spring', stiffness: 350, damping: 25 },
        }}
      >
        {/* Pastel Visual Container */}
        <div className={`product-card-visual ${flavorClass}`}>
          {/* Wishlist Heart Button with Spring Animation */}
          <motion.button
            type="button"
            className={`wishlist-pill-btn ${isFavorited ? 'active' : ''}`}
            onClick={handleWishlistClick}
            aria-label="Add to wishlist"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart size={18} fill={isFavorited ? 'var(--strawberry)' : 'none'} />
          </motion.button>

          {/* Quick View Button */}
          <button
            type="button"
            className="quick-view-btn"
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewOpen(true);
            }}
          >
            <Eye size={14} /> Quick View
          </button>

          {/* 3D Rotating & Floating Product Core with Interactive Cursor Tilt */}
          <Link to={`/products/${product._id}`} style={{ display: 'block', textDecoration: 'none' }}>
            <Product3DRotator
              src={displayImage}
              alt={product.name}
              flavor={product.flavour || product.name}
              size="md"
              fallbackSrc="https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=500&q=80"
            />
          </Link>
        </div>

        {/* Card Body */}
        <div className="product-card-body">
          {product.tags && product.tags.length > 0 && (
            <div className="product-card-tags">
              <span className="card-tag">{product.tags[0]}</span>
            </div>
          )}

          <Link to={`/products/${product._id}`}>
            <h3 className="product-card-name">{product.name}</h3>
          </Link>

          <div className="product-card-ratings">
            <div className="stars-list">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  fill={i < Math.floor(product.rating || 5) ? '#f59e0b' : '#d1d5db'}
                  color="#f59e0b"
                />
              ))}
            </div>
            <span className="rating-count-text">({product.numReviews || 12})</span>
          </div>

          <div className="product-card-footer">
            <div className="product-card-price">
              <span className="current-price">
                ₹{(product.discountPrice > 0 ? product.discountPrice : product.price).toFixed(2)}
              </span>
              {product.discountPrice > 0 && (
                <span className="original-price">₹{product.price.toFixed(2)}</span>
              )}
            </div>

            <motion.button
              type="button"
              className="card-add-cart-btn"
              onClick={handleAddToCart}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingBag size={15} /> Add to cart
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Quick View Modal */}
      {quickViewOpen && (
        <div className="admin-modal-backdrop" onClick={() => setQuickViewOpen(false)}>
          <motion.div
            className="admin-modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '750px' }}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
              <button onClick={() => setQuickViewOpen(false)} style={{ color: '#6e5e5c', padding: '4px' }}>
                <X size={24} />
              </button>
            </div>

            <div className="quick-view-grid">
              <div
                className={`product-card-visual ${flavorClass}`}
                style={{ height: '340px', margin: 0, borderRadius: '24px' }}
              >
                <Product3DRotator
                  src={displayImage}
                  alt={product.name}
                  flavor={product.flavour || product.name}
                  size="lg"
                  fallbackSrc="https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=500&q=80"
                />
              </div>

              <div>
                <span className="badge badge-pink" style={{ marginBottom: '8px' }}>
                  {product.flavour || 'Artisan Gelato'}
                </span>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: '#2d1810', marginBottom: '8px' }}>
                  {product.name}
                </h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', color: '#f59e0b' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={15} fill="#f59e0b" color="#f59e0b" />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.85rem', color: '#9c8e8c' }}>({product.numReviews || 12} reviews)</span>
                </div>

                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2d1810', marginBottom: '14px' }}>
                  ₹{(product.discountPrice > 0 ? product.discountPrice : product.price).toFixed(2)}
                  {product.discountPrice > 0 && (
                    <span style={{ fontSize: '1rem', color: '#9c8e8c', textDecoration: 'line-through', marginLeft: '8px' }}>
                      ₹{product.price.toFixed(2)}
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '0.9rem', color: '#6e5e5c', lineHeight: '1.6', marginBottom: '20px' }}>
                  {product.description}
                </p>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2d1810', display: 'block', marginBottom: '6px' }}>
                    Select Serving Size:
                  </label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1px solid #fce7ec',
                      background: '#fdf2f4',
                      fontWeight: 600,
                    }}
                  >
                    <option value="Regular Scoop (120ml)">Regular Scoop (120ml)</option>
                    <option value="Double Scoop (240ml)">Double Scoop (240ml)</option>
                    <option value="Family Tub (500ml)">Family Tub (500ml)</option>
                    <option value="Party Tub (1000ml)">Party Tub (1000ml)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <motion.button
                    type="button"
                    className="btn-primary"
                    style={{ flex: 1 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={(e) => {
                      handleAddToCart(e);
                      setQuickViewOpen(false);
                    }}
                  >
                    <ShoppingBag size={18} /> Add To Bag
                  </motion.button>
                  <motion.button
                    type="button"
                    className="btn-secondary"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setQuickViewOpen(false);
                      navigate(`/products/${product._id}`);
                    }}
                  >
                    View Details
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
