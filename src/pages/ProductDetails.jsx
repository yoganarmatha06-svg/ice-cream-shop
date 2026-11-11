import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Send,
  CheckCircle2,
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import ScrollReveal, { StaggerContainer, StaggerItem } from '../components/ScrollReveal';
import { productsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import '../styles/product.css';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // User selections
  const [selectedSize, setSelectedSize] = useState('Regular Scoop (120ml)');
  const [quantity, setQuantity] = useState(1);

  // Review Form
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await productsAPI.getById(id);
        if (res.success) {
          setProduct(res.data);

          // Fetch related products in same category
          const relRes = await productsAPI.getAll({
            category: res.data.category?._id || res.data.category,
            limit: 4,
          });
          if (relRes.success) {
            setRelatedProducts(relRes.data.filter((p) => p._id !== id));
          }
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
    window.scrollTo(0, 0);
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmittingReview(true);
      const res = await productsAPI.addReview(id, {
        rating: newRating,
        comment: newComment,
      });

      if (res.success) {
        setReviewSubmitted(true);
        // Refresh product details
        const refreshed = await productsAPI.getById(id);
        if (refreshed.success) setProduct(refreshed.data);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0' }}>
        <Loader text="Crafting product tasting notes..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Product not found</h2>
        <Link to="/shop" className="btn-primary" style={{ marginTop: '20px' }}>
          Back to Shop
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product._id);
  const unitPrice = product.discountPrice > 0 ? product.discountPrice : product.price;

  return (
    <div className="product-details-page" style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Breadcrumb with Fade Down */}
        <ScrollReveal animation="fade-down" distance={15}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <Link to="/" style={{ color: 'var(--chocolate-dark)' }}>Home</Link>
            <span>/</span>
            <Link to="/shop" style={{ color: 'var(--chocolate-dark)' }}>Shop</Link>
            <span>/</span>
            <span style={{ color: 'var(--strawberry)', fontWeight: 600 }}>{product.name}</span>
          </div>
        </ScrollReveal>

        {/* Main Details Grid */}
        <div className="product-details-grid">
          {/* Gallery View with Slide From Left */}
          <ScrollReveal animation="fade-right" distance={50} duration={0.8}>
            <div className="product-gallery-frame">
              <motion.button
                type="button"
                className={`wishlist-pill-btn ${isFavorited ? 'active' : ''}`}
                style={{ width: '46px', height: '46px', top: '24px', right: '24px' }}
                onClick={() => toggleWishlist(product)}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
              >
                <Heart size={22} fill={isFavorited ? 'var(--strawberry)' : 'none'} />
              </motion.button>
              <motion.img
                src={product.image}
                alt={product.name}
                className="product-gallery-img"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80';
                }}
              />
            </div>
          </ScrollReveal>

          {/* Details Content with Slide From Right */}
          <ScrollReveal animation="fade-left" distance={50} duration={0.8}>
            <div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <span className="badge badge-pink">{product.flavour || 'Artisan Gelato'}</span>
                <span className="badge badge-mint">In Stock ({product.stock} available)</span>
              </div>

              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.8rem', color: 'var(--chocolate-dark)', lineHeight: 1.15, marginBottom: '12px' }}>
                {product.name}
              </h1>

              {/* Ratings */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', color: '#f59e0b' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      fill={i < Math.floor(product.rating || 5) ? '#f59e0b' : '#d1d5db'}
                      color="#f59e0b"
                    />
                  ))}
                </div>
                <span style={{ fontWeight: 700, color: 'var(--chocolate-dark)' }}>{product.rating}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  ({product.numReviews || 0} customer reviews)
                </span>
              </div>

              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', marginBottom: '20px' }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--chocolate-dark)' }}>
                  ${unitPrice.toFixed(2)}
                </span>
                {product.discountPrice > 0 && (
                  <span style={{ fontSize: '1.3rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '28px' }}>
                {product.description}
              </p>

              {/* Size Selector */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: 'var(--chocolate-dark)', marginBottom: '10px' }}>
                  Choose Your Portion / Container:
                </label>
                <div className="size-selector-grid">
                  {[
                    { name: 'Regular Scoop (120ml)', desc: '1 Crisp Waffle Cone' },
                    { name: 'Double Scoop (240ml)', desc: '2 Scoops + Topping' },
                    { name: 'Family Tub (500ml)', desc: 'Serves 3-4 People' },
                    { name: 'Party Tub (1000ml)', desc: 'Serves 6-8 People' },
                  ].map((s) => (
                    <motion.button
                      key={s.name}
                      type="button"
                      className={`size-option-btn ${selectedSize === s.name ? 'active' : ''}`}
                      onClick={() => setSelectedSize(s.name)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--chocolate-dark)' }}>{s.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.desc}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Quantity and Add to Cart */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '32px' }}>
                <div className="quantity-control" style={{ padding: '6px' }}>
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <span style={{ fontWeight: 700, minWidth: '28px', textAlign: 'center', fontSize: '1.1rem' }}>
                    {quantity}
                  </span>
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <motion.button
                  type="button"
                  className="btn-primary"
                  style={{ flex: 1, padding: '16px 28px', fontSize: '1.05rem' }}
                  onClick={() => addToCart(product, quantity, selectedSize)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <ShoppingBag size={20} /> Add To Bag (${(unitPrice * quantity).toFixed(2)})
                </motion.button>
              </div>

              {/* Artisan Badges */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', paddingTop: '24px', borderTop: '1px solid var(--border-soft)' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <Truck size={20} color="var(--strawberry)" />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    35-min sub-zero cryo insulated delivery
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <ShieldCheck size={20} color="var(--strawberry)" />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    100% natural, no corn syrup or preservatives
                  </span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Reviews Section with ScrollReveal */}
        <ScrollReveal animation="fade-up" distance={40}>
          <div style={{ marginTop: '60px', background: '#ffffff', borderRadius: '32px', padding: '48px', border: '1px solid var(--border-soft)', boxShadow: 'var(--card-shadow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', color: 'var(--chocolate-dark)' }}>
                  Customer Reviews
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Real feedback from verified ice cream enthusiasts.
                </p>
              </div>
            </div>

            {/* Add Review Form */}
            {isAuthenticated ? (
              <div style={{ background: '#fdf2f4', borderRadius: '24px', padding: '28px', marginBottom: '40px', border: '1px solid #fce7ec' }}>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--chocolate-dark)', marginBottom: '14px' }}>
                  Leave Your Scoop Review
                </h4>

                {reviewSubmitted ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontWeight: 600 }}>
                    <CheckCircle2 size={20} /> Thank you! Your review has been published.
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                        Your Rating:
                      </label>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <motion.button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            style={{ cursor: 'pointer' }}
                          >
                            <Star
                              size={24}
                              fill={star <= newRating ? '#f59e0b' : '#d1d5db'}
                              color="#f59e0b"
                            />
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                        Tasting Experience / Notes:
                      </label>
                      <textarea
                        required
                        rows="3"
                        placeholder="Share your thoughts on the texture, freshness, sweetness, and flavor..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '16px',
                          border: '1px solid #fbcfe8',
                          background: '#ffffff',
                          fontSize: '0.95rem',
                        }}
                      ></textarea>
                    </div>

                    <motion.button
                      type="submit"
                      className="btn-primary"
                      disabled={submittingReview}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {submittingReview ? 'Submitting...' : 'Post Review'} <Send size={15} />
                    </motion.button>
                  </form>
                )}
              </div>
            ) : (
              <div style={{ padding: '20px', background: '#fdf2f4', borderRadius: '18px', textAlign: 'center', marginBottom: '32px' }}>
                <p style={{ color: 'var(--chocolate-dark)', marginBottom: '8px' }}>
                  Want to review this flavor?
                </p>
                <Link to="/login" className="btn-secondary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
                  Sign In to Leave a Review
                </Link>
              </div>
            )}

            {/* Reviews List */}
            {product.reviews && product.reviews.length > 0 ? (
              <StaggerContainer style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {product.reviews.map((rev) => (
                  <StaggerItem
                    key={rev._id}
                    animation="fade-up"
                    distance={25}
                    style={{
                      padding: '20px',
                      borderRadius: '20px',
                      border: '1px solid var(--border-soft)',
                      background: '#fff',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            background: 'var(--pastel-pink)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            color: 'var(--strawberry)',
                          }}
                        >
                          {rev.userName ? rev.userName[0] : 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--chocolate-dark)' }}>
                            {rev.userName || 'Ice Cream Connoisseur'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(rev.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', color: '#f59e0b' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < rev.rating ? '#f59e0b' : '#d1d5db'}
                            color="#f59e0b"
                          />
                        ))}
                      </div>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                      {rev.comment}
                    </p>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No reviews yet for this flavor. Be the first to taste and share your review!
              </p>
            )}
          </div>
        </ScrollReveal>

        {/* Related Products with Stagger Animation */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: '80px' }}>
            <ScrollReveal animation="fade-down" distance={20}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.2rem', color: 'var(--chocolate-dark)', marginBottom: '32px' }}>
                You May Also Crave
              </h3>
            </ScrollReveal>

            <StaggerContainer className="products-grid" staggerDelay={0.12}>
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </StaggerContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
