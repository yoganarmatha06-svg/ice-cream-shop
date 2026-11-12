import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  Clock,
  ArrowRight,
  Package,
  User,
  Mail,
  Phone,
  PhoneCall,
  MapPin,
  Sparkles,
  Lock,
  AlertCircle,
  Building,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import ScrollReveal from '../components/ScrollReveal';
import '../styles/cart.css';

const Checkout = () => {
  const { cartItems, cartSubtotal, discountAmount, shippingFee, finalTotal, appliedCoupon, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Form State: Getting Name, Email, Phone, Alternative Phone, Address, and Pin Code
  const [address, setAddress] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    altPhone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Pre-fill user data if auth state changes
  useEffect(() => {
    if (user) {
      setAddress((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '4242 •••• •••• 4242',
    expDate: '12/28',
    cvv: '888',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const handleInputChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg('');
  };

  const handleFillDemo = () => {
    setAddress({
      fullName: user?.name || 'Emma Watson',
      email: user?.email || 'user@scoopdreams.com',
      phone: user?.phone || '+91 98765 43210',
      altPhone: '+91 98765 09876',
      street: 'Flat 4B, Lavender Gardens, 2nd Cross Artisan Boulevard',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600040',
    });
    setErrorMsg('');
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations for the required customer details
    if (!address.fullName.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    if (!address.email.trim() || !address.email.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }
    if (!address.phone.trim()) {
      setErrorMsg('Please enter your primary phone number');
      return;
    }
    if (!address.altPhone.trim()) {
      setErrorMsg('Please enter an alternative contact phone number');
      return;
    }
    if (!address.street.trim()) {
      setErrorMsg('Please enter your complete delivery street address (Door No, Building, Landmark)');
      return;
    }
    if (!address.pincode.trim() || address.pincode.trim().length < 4) {
      setErrorMsg('Please enter a valid postal pin code');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        products: cartItems,
        deliveryAddress: {
          fullName: address.fullName.trim(),
          email: address.email.trim(),
          phone: address.phone.trim(),
          altPhone: address.altPhone.trim(),
          street: address.street.trim(),
          city: address.city.trim() || 'Chennai',
          state: address.state.trim() || 'Tamil Nadu',
          pincode: address.pincode.trim(),
        },
        totalAmount: finalTotal,
        discountAmount,
        couponApplied: appliedCoupon?.code || '',
        paymentMethod,
      };

      const res = await ordersAPI.create(payload);
      if (res.success) {
        setPlacedOrder(res.data);
        clearCart();

        // Trigger celebratory confetti
        confetti({
          particleCount: 140,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#ff6b8b', '#e11d48', '#fbcfe8', '#fef08a', '#bbf7d0'],
        });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to place order. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  if (placedOrder) {
    return (
      <div className="cart-page-wrapper">
        <ScrollReveal animation="zoom-in" duration={0.65}>
          <div className="container" style={{ maxWidth: '680px', textAlign: 'center', padding: '60px 20px' }}>
            <div
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                background: '#dcfce7',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 10px 25px rgba(22, 101, 52, 0.15)',
              }}
            >
              <CheckCircle2 size={44} />
            </div>

            <span className="badge badge-pink" style={{ marginBottom: '8px' }}>
              Order Confirmed & Cryo-Packed!
            </span>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.4rem', color: 'var(--chocolate-dark)', marginBottom: '12px' }}>
              Thank You for Your Order!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '28px' }}>
              We have received your artisanal scoops order! Our master churners are carefully preparing your order with sub-zero cryo insulated packaging.
            </p>

            <div
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                padding: '28px',
                border: '1px solid var(--border-soft)',
                boxShadow: 'var(--card-shadow)',
                textAlign: 'left',
                marginBottom: '32px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--border-soft)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Order ID:</span>
                <strong style={{ color: 'var(--strawberry)' }}>{placedOrder.orderId || placedOrder._id}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--border-soft)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Customer Name:</span>
                <strong>{placedOrder.deliveryAddress?.fullName}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--border-soft)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Contact Numbers:</span>
                <span style={{ fontWeight: 600 }}>
                  {placedOrder.deliveryAddress?.phone}
                  {placedOrder.deliveryAddress?.altPhone ? ` • Alt: ${placedOrder.deliveryAddress?.altPhone}` : ''}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--border-soft)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Delivery Destination:</span>
                <span style={{ maxWidth: '320px', textAlign: 'right', fontSize: '0.9rem', color: 'var(--chocolate-dark)' }}>
                  {placedOrder.deliveryAddress?.street}, {placedOrder.deliveryAddress?.city} - {placedOrder.deliveryAddress?.pincode}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--border-soft)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Estimated Fast Delivery:</span>
                <span style={{ fontWeight: 700, color: '#15803d', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={16} /> 30 - 35 Minutes
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--border-soft)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Mode:</span>
                <strong>{placedOrder.paymentMethod}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800, color: 'var(--chocolate-dark)' }}>
                <span>Total Amount:</span>
                <span style={{ color: 'var(--strawberry)' }}>₹{placedOrder.totalAmount?.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/my-orders" className="btn-primary" style={{ padding: '14px 28px' }}>
                <Package size={18} /> View My Orders
              </Link>
              <Link to="/shop" className="btn-secondary" style={{ padding: '14px 28px' }}>
                Continue Shopping
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    );
  }

  return (
    <div className="cart-page-wrapper">
      <div className="container">
        <ScrollReveal animation="fade-down" distance={20}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
            <div>
              <span className="badge badge-pink" style={{ marginBottom: '6px' }}>
                Secure Payment & Fast Delivery
              </span>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', color: 'var(--chocolate-dark)' }}>
                Proceed to Pay
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Please fill in your contact & destination details to complete your order.
              </p>
            </div>

            {/* 1-Click Demo autofill */}
            <button
              type="button"
              onClick={handleFillDemo}
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Sparkles size={15} color="var(--strawberry)" /> 1-Click Demo Fill
            </button>
          </div>
        </ScrollReveal>

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '12px 18px',
              background: '#fee2e2',
              color: '#991b1b',
              borderRadius: '16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.9rem',
              border: '1px solid #fca5a5',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        <form onSubmit={handlePlaceOrder}>
          <div className="checkout-steps-grid">
            {/* Left Steps: User Details & Payment */}
            <ScrollReveal animation="fade-right" distance={40}>
              <div>
                {/* Step 1: User & Delivery Details */}
                <div className="checkout-card" style={{ marginBottom: '28px' }}>
                  <h3 className="checkout-card-title">
                    <span className="badge badge-pink">1</span> Customer & Delivery Information
                  </h3>

                  {/* 1. Full Name & Email */}
                  <div className="form-grid-2">
                    <div className="form-field-group">
                      <label className="form-label" style={{ fontWeight: 600 }}>
                        Full Name <span style={{ color: 'var(--strawberry)' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          name="fullName"
                          required
                          placeholder="e.g. Maya Lin"
                          value={address.fullName}
                          onChange={handleInputChange}
                          className="form-input"
                          style={{ paddingLeft: '40px' }}
                        />
                        <User size={18} color="#9c8e8c" style={{ position: 'absolute', left: '14px', top: '15px' }} />
                      </div>
                    </div>

                    <div className="form-field-group">
                      <label className="form-label" style={{ fontWeight: 600 }}>
                        Email Address <span style={{ color: 'var(--strawberry)' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="email"
                          name="email"
                          required
                          placeholder="you@domain.com"
                          value={address.email}
                          onChange={handleInputChange}
                          className="form-input"
                          style={{ paddingLeft: '40px' }}
                        />
                        <Mail size={18} color="#9c8e8c" style={{ position: 'absolute', left: '14px', top: '15px' }} />
                      </div>
                    </div>
                  </div>

                  {/* 2. Primary Phone & Alternative Phone */}
                  <div className="form-grid-2">
                    <div className="form-field-group">
                      <label className="form-label" style={{ fontWeight: 600 }}>
                        Primary Phone Number <span style={{ color: 'var(--strawberry)' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="tel"
                          name="phone"
                          required
                          placeholder="+91 98765 43210"
                          value={address.phone}
                          onChange={handleInputChange}
                          className="form-input"
                          style={{ paddingLeft: '40px' }}
                        />
                        <Phone size={18} color="#9c8e8c" style={{ position: 'absolute', left: '14px', top: '15px' }} />
                      </div>
                    </div>

                    <div className="form-field-group">
                      <label className="form-label" style={{ fontWeight: 600 }}>
                        Alternative Phone Number <span style={{ color: 'var(--strawberry)' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="tel"
                          name="altPhone"
                          required
                          placeholder="+91 98765 09876 (Alternate contact)"
                          value={address.altPhone}
                          onChange={handleInputChange}
                          className="form-input"
                          style={{ paddingLeft: '40px' }}
                        />
                        <PhoneCall size={18} color="#9c8e8c" style={{ position: 'absolute', left: '14px', top: '15px' }} />
                      </div>
                    </div>
                  </div>

                  {/* 3. Complete Address */}
                  <div className="form-field-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>
                      Complete Delivery Address <span style={{ color: 'var(--strawberry)' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        name="street"
                        required
                        placeholder="Door / Flat No., Apartment, Street Name, Area, Landmark"
                        value={address.street}
                        onChange={handleInputChange}
                        className="form-input"
                        style={{ paddingLeft: '40px' }}
                      />
                      <MapPin size={18} color="#9c8e8c" style={{ position: 'absolute', left: '14px', top: '15px' }} />
                    </div>
                  </div>

                  {/* 4. City, State & Pin Code */}
                  <div className="checkout-city-state-pin">
                    <div className="form-field-group">
                      <label className="form-label" style={{ fontWeight: 600 }}>City</label>
                      <input
                        type="text"
                        name="city"
                        placeholder="e.g. Chennai"
                        value={address.city}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    </div>

                    <div className="form-field-group">
                      <label className="form-label" style={{ fontWeight: 600 }}>State</label>
                      <input
                        type="text"
                        name="state"
                        placeholder="e.g. Tamil Nadu"
                        value={address.state}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    </div>

                    <div className="form-field-group">
                      <label className="form-label" style={{ fontWeight: 600 }}>
                        Pin Code <span style={{ color: 'var(--strawberry)' }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        required
                        placeholder="600040"
                        maxLength={8}
                        value={address.pincode}
                        onChange={handleInputChange}
                        className="form-input"
                        style={{ fontWeight: 700 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Step 2: Payment Options */}
                <div className="checkout-card">
                  <h3 className="checkout-card-title">
                    <span className="badge badge-pink">2</span> Select Payment Option
                  </h3>

                  <div className="payment-methods-grid">
                    <div
                      className={`payment-method-card ${paymentMethod === 'Cash on Delivery' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('Cash on Delivery')}
                    >
                      <Banknote size={24} color={paymentMethod === 'Cash on Delivery' ? 'var(--strawberry)' : '#6e5e5c'} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--chocolate-dark)' }}>
                          Cash on Delivery (Pay upon arrival)
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Pay cash or UPI scan directly to our sub-zero delivery courier.
                        </div>
                      </div>
                    </div>

                    <div
                      className={`payment-method-card ${paymentMethod === 'UPI / NetBanking' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('UPI / NetBanking')}
                    >
                      <Smartphone size={24} color={paymentMethod === 'UPI / NetBanking' ? 'var(--strawberry)' : '#6e5e5c'} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--chocolate-dark)' }}>
                          UPI / Google Pay / PhonePe / Paytm
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Instant online transfer via UPI apps or Net Banking.
                        </div>
                      </div>
                    </div>

                    <div
                      className={`payment-method-card ${paymentMethod === 'Credit/Debit Card' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('Credit/Debit Card')}
                    >
                      <CreditCard size={24} color={paymentMethod === 'Credit/Debit Card' ? 'var(--strawberry)' : '#6e5e5c'} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--chocolate-dark)' }}>
                          Credit or Debit Card
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Visa, MasterCard, RuPay, Amex (Encrypted 256-bit SSL)
                        </div>
                      </div>
                    </div>
                  </div>

                  {paymentMethod === 'Credit/Debit Card' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      style={{ marginTop: '20px', padding: '18px', background: 'var(--pastel-pink)', borderRadius: '18px' }}
                    >
                      <div className="form-field-group">
                        <label className="form-label">Card Number</label>
                        <input
                          type="text"
                          value={cardDetails.cardNumber}
                          onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                          className="form-input"
                          placeholder="•••• •••• •••• ••••"
                        />
                      </div>
                      <div className="form-grid-2">
                        <div className="form-field-group">
                          <label className="form-label">Expiry Date (MM/YY)</label>
                          <input
                            type="text"
                            value={cardDetails.expDate}
                            onChange={(e) => setCardDetails({ ...cardDetails, expDate: e.target.value })}
                            className="form-input"
                            placeholder="12/28"
                          />
                        </div>
                        <div className="form-field-group">
                          <label className="form-label">CVV</label>
                          <input
                            type="password"
                            maxLength={4}
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                            className="form-input"
                            placeholder="•••"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </ScrollReveal>

            {/* Right Summary Box */}
            <ScrollReveal animation="fade-left" distance={40}>
              <div className="order-summary-box">
                <h3 className="summary-title">Order Overview</h3>

                {/* Items Preview */}
                <div style={{ maxHeight: '220px', overflowY: 'auto', marginBottom: '20px', borderBottom: '1px solid var(--border-soft)', paddingBottom: '16px' }}>
                  {cartItems.map((item) => (
                    <div
                      key={item._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        marginBottom: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={item.product?.image || item.image}
                          alt={item.name}
                          style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--chocolate-dark)' }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Qty: {item.quantity} • {item.selectedSize}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--chocolate-dark)' }}>
                        ₹{((item.price || 0) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{cartSubtotal.toFixed(2)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="summary-row" style={{ color: '#15803d' }}>
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="summary-row">
                  <span>Sub-Zero Cryo Delivery</span>
                  <span>{shippingFee === 0 ? <strong style={{ color: '#15803d' }}>FREE</strong> : `₹${shippingFee.toFixed(2)}`}</span>
                </div>

                <div className="summary-row total">
                  <span>Total Amount</span>
                  <span style={{ color: 'var(--strawberry)' }}>₹{finalTotal.toFixed(2)}</span>
                </div>

                {/* Main Action Button: Proceed to Pay */}
                <motion.button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary checkout-btn"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    padding: '16px',
                    width: '100%',
                    background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                    boxShadow: '0 8px 24px -4px rgba(225, 29, 72, 0.4)',
                  }}
                >
                  {submitting ? (
                    'Processing Payment...'
                  ) : (
                    <>
                      <Lock size={18} />
                      <span>Proceed to Pay • ₹{finalTotal.toFixed(2)}</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </motion.button>

                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <ShieldCheck size={16} color="var(--strawberry)" /> 100% Encrypted & Safe Sub-Zero Delivery Guaranteed
                </div>
              </div>
            </ScrollReveal>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
