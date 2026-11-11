import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import ScrollReveal, { StaggerContainer } from '../components/ScrollReveal';

const Wishlist = () => {
  const { wishlist } = useWishlist();

  if (wishlist.length === 0) {
    return (
      <ScrollReveal animation="zoom-in" duration={0.6}>
        <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>💖</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.4rem', color: 'var(--chocolate-dark)', marginBottom: '12px' }}>
            Your Wishlist is Empty
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 32px' }}>
            Explore our parlour and tap the heart on any flavor to save your dream scoops for later!
          </p>
          <Link to="/shop" className="btn-primary" style={{ padding: '14px 32px' }}>
            Discover Flavours <ArrowRight size={18} />
          </Link>
        </div>
      </ScrollReveal>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 20px 80px' }}>
      <ScrollReveal animation="fade-down" distance={20}>
        <div style={{ marginBottom: '32px' }}>
          <span className="badge badge-pink" style={{ marginBottom: '8px' }}>
            Saved Flavours
          </span>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', color: 'var(--chocolate-dark)' }}>
            My Wishlist ({wishlist.length} {wishlist.length === 1 ? 'item' : 'items'})
          </h1>
        </div>
      </ScrollReveal>

      <StaggerContainer className="products-grid" staggerDelay={0.08} initialDelay={0.1}>
        {wishlist.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </StaggerContainer>
    </div>
  );
};

export default Wishlist;
