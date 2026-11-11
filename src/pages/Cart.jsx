import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, Trash2, Tag, Check, AlertCircle } from 'lucide-react';
import CartItem from '../components/CartItem';
import { useCart } from '../context/CartContext';
import ScrollReveal from '../components/ScrollReveal';
import '../styles/cart.css';

const Cart = () => {
  const {
    cartItems,
    cartCount,
    cartSubtotal,
    discountAmount,
    shippingFee,
    finalTotal,
    appliedCoupon,
    clearCart,
    applyCouponCode,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const navigate = useNavigate();

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    if (!couponInput.trim()) return;

    const res = await applyCouponCode(couponInput.trim());
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput('');
    }
  };

  if (cartItems.length === 0) {
    return (
      <ScrollReveal animation="zoom-in" duration={0.6}>
        <div className="cart-page-wrapper">
          <div className="container" style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🍦</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.4rem', color: 'var(--chocolate-dark)', marginBottom: '12px' }}>
              Your Scoop Bag is Empty
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 32px', fontSize: '1.05rem' }}>
              Looks like you haven't picked your favorite artisanal scoops yet. Explore our handcrafted fruit gelatos and chocolate truffles!
            </p>
            <Link to="/shop" className="btn-primary" style={{ padding: '16px 36px', fontSize: '1.05rem' }}>
              Explore Flavours <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </ScrollReveal>
    );
  }

  return (
    <div className="cart-page-wrapper">
      <div className="container">
        {/* Header */}
        <ScrollReveal animation="fade-down" distance={20}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <span className="badge badge-pink" style={{ marginBottom: '6px' }}>
                Your Selections
              </span>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', color: 'var(--chocolate-dark)' }}>
                Shopping Bag ({cartCount} {cartCount === 1 ? 'item' : 'items'})
              </h1>
            </div>

            <button
              type="button"
              onClick={clearCart}
              style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
            >
              <Trash2 size={16} /> Clear Bag
            </button>
          </div>
        </ScrollReveal>

        <div className="cart-layout-grid">
          {/* Cart Items List */}
          <ScrollReveal animation="fade-right" distance={40}>
            <div className="cart-items-card">
              {cartItems.map((item) => (
                <CartItem key={item._id} item={item} />
              ))}
            </div>
          </ScrollReveal>

          {/* Order Summary Box */}
          <ScrollReveal animation="fade-left" distance={40}>
            <div className="order-summary-box">
              <h3 className="summary-title">Order Summary</h3>

              <div className="summary-row">
                <span>Subtotal</span>
                <span style={{ fontWeight: 700, color: 'var(--chocolate-dark)' }}>
                  ${cartSubtotal.toFixed(2)}
                </span>
              </div>

              {/* Discount Row */}
              {discountAmount > 0 && (
                <div className="summary-row" style={{ color: '#15803d' }}>
                  <span>Coupon ({appliedCoupon?.code})</span>
                  <span style={{ fontWeight: 700 }}>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              {/* Shipping */}
              <div className="summary-row">
                <span>Sub-Zero Insulated Shipping</span>
                <span>{shippingFee === 0 ? <strong style={{ color: '#15803d' }}>FREE</strong> : `$${shippingFee.toFixed(2)}`}</span>
              </div>

              {shippingFee > 0 && (
                <div style={{ fontSize: '0.8rem', color: 'var(--strawberry)', marginBottom: '14px' }}>
                  Add ${(35 - cartSubtotal).toFixed(2)} more to qualify for <strong>FREE DELIVERY</strong>!
                </div>
              )}

              {/* Coupon Code Section (Available only for orders above $200) */}
              <div style={{ margin: '20px 0', borderTop: '1px dashed var(--border-soft)', paddingTop: '16px' }}>
                {cartSubtotal >= 200 ? (
                  appliedCoupon ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#dcfce7',
                        padding: '10px 16px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.85rem',
                        color: '#15803d',
                        fontWeight: 600,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Tag size={16} /> Code <strong>{appliedCoupon.code}</strong> Applied!
                      </div>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        style={{ color: '#b91c1c', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#15803d', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Tag size={14} /> Coupon Code (Unlocked for orders above $200)
                      </div>
                      <form onSubmit={handleApplyCoupon}>
                        <div className="coupon-box">
                          <input
                            type="text"
                            placeholder="Enter Coupon: SCOOP20"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value)}
                            className="coupon-input"
                          />
                          <button type="submit" className="btn-secondary" style={{ padding: '10px 18px', fontSize: '0.85rem' }}>
                            Apply
                          </button>
                        </div>
                        {couponError && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#b91c1c', marginTop: '6px' }}>
                            <AlertCircle size={14} /> {couponError}
                          </div>
                        )}
                      </form>
                    </div>
                  )
                ) : (
                  <div
                    style={{
                      padding: '12px 14px',
                      background: '#fffbeb',
                      border: '1px dashed #fde68a',
                      borderRadius: '16px',
                      fontSize: '0.82rem',
                      color: '#92400e',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      lineHeight: '1.4',
                    }}
                  >
                    <Tag size={16} color="#d97706" style={{ flexShrink: 0 }} />
                    <span>
                      Coupon code applies on orders <strong>above $200</strong>. Add <strong>${(200 - cartSubtotal).toFixed(2)}</strong> more to apply coupons!
                    </span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="summary-row total">
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>

              <motion.button
                type="button"
                className="btn-primary checkout-btn"
                onClick={() => navigate('/checkout')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Proceed to Pay <ArrowRight size={18} />
              </motion.button>

              <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                🔒 Guaranteed Freshness & Secure Payment
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
};

export default Cart;
