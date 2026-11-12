import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('scoop_dreams_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('scoop_dreams_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync with server cart when logged in
  const syncServerCart = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await cartAPI.get();
      if (res.success && res.data?.items) {
        setCartItems(res.data.items);
      }
    } catch (err) {
      console.warn('Cart sync warning:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      syncServerCart();
    }
  }, [isAuthenticated, syncServerCart]);

  useEffect(() => {
    localStorage.setItem('scoop_dreams_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('scoop_dreams_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('scoop_dreams_coupon');
    }
  }, [appliedCoupon]);

  const addToCart = async (product, quantity = 1, selectedSize = 'Regular Scoop (120ml)') => {
    const unitPrice = product.discountPrice > 0 ? product.discountPrice : product.price;

    if (isAuthenticated) {
      try {
        const res = await cartAPI.add({
          productId: product._id,
          quantity,
          selectedSize,
        });
        if (res.success) {
          setCartItems(res.data.items);
          showNotification(`Added ${product.name} to your scoops! 🍦`);
          return;
        }
      } catch (err) {
        console.warn('Server cart add failed, falling back to local:', err.message);
      }
    }

    // Local cart fallback
    setCartItems((prevItems) => {
      const existingIdx = prevItems.findIndex(
        (item) =>
          (item.product?._id || item.product) === product._id &&
          item.selectedSize === selectedSize
      );

      if (existingIdx > -1) {
        const updated = [...prevItems];
        updated[existingIdx].quantity += quantity;
        return updated;
      } else {
        return [
          ...prevItems,
          {
            _id: `local-${Date.now()}-${Math.random()}`,
            product,
            quantity,
            price: unitPrice,
            selectedSize,
          },
        ];
      }
    });

    showNotification(`Added ${product.name} to your scoops! 🍦`);
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    if (isAuthenticated && !itemId.startsWith?.('local-')) {
      try {
        const res = await cartAPI.update(itemId, { quantity: newQuantity });
        if (res.success) {
          setCartItems(res.data.items);
          return;
        }
      } catch (err) {
        console.warn('Server update error:', err.message);
      }
    }

    setCartItems((prev) =>
      prev.map((item) => (item._id === itemId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const removeFromCart = async (itemId) => {
    if (isAuthenticated && !itemId.startsWith?.('local-')) {
      try {
        const res = await cartAPI.remove(itemId);
        if (res.success) {
          setCartItems(res.data.items);
          showNotification('Item removed from cart');
          return;
        }
      } catch (err) {
        console.warn('Server remove error:', err.message);
      }
    }

    setCartItems((prev) => prev.filter((item) => item._id !== itemId));
    showNotification('Item removed from cart');
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await cartAPI.clear();
      } catch (err) {
        console.warn('Server clear error:', err.message);
      }
    }
    setCartItems([]);
    setAppliedCoupon(null);
  };

  const applyCouponCode = async (code) => {
    if (!code) return { success: false, message: 'Please enter a coupon code' };
    const currentSubtotal = cartItems.reduce(
      (sum, item) => sum + (item.price || item.product?.discountPrice || item.product?.price || 0) * (item.quantity || 1),
      0
    );

    if (currentSubtotal < 200) {
      return {
        success: false,
        message: 'Coupon codes are only applicable on orders above ₹200. Please add more items!',
      };
    }

    try {
      const res = await cartAPI.applyCoupon({
        code: code.trim(),
        cartTotal: currentSubtotal,
      });

      if (res.success) {
        setAppliedCoupon(res.data);
        showNotification(res.message);
        return { success: true, message: res.message };
      }
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showNotification('Coupon removed');
  };

  // Calculations
  const cartSubtotal = cartItems.reduce((acc, item) => {
    const p = item.price || item.product?.discountPrice || item.product?.price || 0;
    return acc + p * item.quantity;
  }, 0);

  const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = (cartSubtotal * appliedCoupon.discountValue) / 100;
    } else {
      discountAmount = Math.min(appliedCoupon.discountAmount, cartSubtotal);
    }
  }

  const shippingFee = cartSubtotal > 35 || cartSubtotal === 0 ? 0 : 3.5;
  const finalTotal = Math.max(0, cartSubtotal - discountAmount + shippingFee);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartSubtotal: Math.round(cartSubtotal * 100) / 100,
        discountAmount: Math.round(discountAmount * 100) / 100,
        shippingFee,
        finalTotal: Math.round(finalTotal * 100) / 100,
        appliedCoupon,
        loading,
        toastMessage,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCouponCode,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
