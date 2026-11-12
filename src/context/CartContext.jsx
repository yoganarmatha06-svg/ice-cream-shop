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

  // Sync with server cart when logged in, with intelligent local merge
  const syncServerCart = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await cartAPI.get();
      if (res?.success && Array.isArray(res.data?.items)) {
        const serverItems = res.data.items;
        const localItems = (() => {
          try {
            const saved = localStorage.getItem('scoop_dreams_cart');
            return saved ? JSON.parse(saved) : [];
          } catch {
            return [];
          }
        })();

        if (serverItems.length > 0) {
          // Merge server items with any items from local cart that aren't on the server yet
          const merged = [...serverItems];
          for (const lItem of localItems) {
            const lProdId = lItem.product?._id || lItem.product;
            const alreadyOnServer = serverItems.some(
              (sItem) =>
                (sItem.product?._id || sItem.product) === lProdId &&
                sItem.selectedSize === lItem.selectedSize
            );
            if (!alreadyOnServer && lProdId && !String(lProdId).startsWith('local-')) {
              merged.push(lItem);
              try {
                await cartAPI.add({
                  productId: lProdId,
                  quantity: lItem.quantity,
                  selectedSize: lItem.selectedSize,
                });
              } catch (e) {
                console.warn('Sync item to server warning:', e.message);
              }
            }
          }
          setCartItems(merged);
          localStorage.setItem('scoop_dreams_cart', JSON.stringify(merged));
        } else if (localItems.length > 0) {
          // Server cart is currently empty but customer has items in localStorage:
          // Keep local items safe and sync them to server!
          setCartItems(localItems);
          for (const lItem of localItems) {
            const lProdId = lItem.product?._id || lItem.product;
            if (lProdId && !String(lProdId).startsWith('local-')) {
              try {
                await cartAPI.add({
                  productId: lProdId,
                  quantity: lItem.quantity,
                  selectedSize: lItem.selectedSize,
                });
              } catch (e) {
                console.warn('Sync local items to server warning:', e.message);
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('Cart sync warning (keeping local cart intact):', err.message);
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
    if (cartItems.length > 0) {
      localStorage.setItem('scoop_dreams_cart', JSON.stringify(cartItems));
    }
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

    // 1. Immediately update local state & localStorage so the cart persists instantly on refresh
    setCartItems((prevItems) => {
      const existingIdx = prevItems.findIndex(
        (item) =>
          (item.product?._id || item.product) === (product._id || product) &&
          item.selectedSize === selectedSize
      );

      let updated;
      if (existingIdx > -1) {
        updated = [...prevItems];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + quantity,
          price: unitPrice,
        };
      } else {
        updated = [
          ...prevItems,
          {
            _id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            product,
            name: product.name,
            image: product.image,
            flavour: product.flavour || 'Artisan',
            quantity,
            price: unitPrice,
            selectedSize,
          },
        ];
      }
      localStorage.setItem('scoop_dreams_cart', JSON.stringify(updated));
      return updated;
    });

    showNotification(`Added ${product.name} to your scoops! 🍦`);

    // 2. If authenticated, persist to backend DB in background
    if (isAuthenticated && product._id) {
      try {
        const res = await cartAPI.add({
          productId: product._id,
          quantity,
          selectedSize,
        });
        if (res?.success && res.data?.items) {
          setCartItems(res.data.items);
          localStorage.setItem('scoop_dreams_cart', JSON.stringify(res.data.items));
        }
      } catch (err) {
        console.warn('Server cart background add notice:', err.message);
      }
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    // Update local state immediately
    setCartItems((prev) => {
      const updated = prev.map((item) => (item._id === itemId ? { ...item, quantity: newQuantity } : item));
      localStorage.setItem('scoop_dreams_cart', JSON.stringify(updated));
      return updated;
    });

    // If authenticated, sync with server
    if (isAuthenticated && !String(itemId).startsWith('item-') && !String(itemId).startsWith('local-')) {
      try {
        const res = await cartAPI.update(itemId, { quantity: newQuantity });
        if (res?.success && res.data?.items) {
          setCartItems(res.data.items);
          localStorage.setItem('scoop_dreams_cart', JSON.stringify(res.data.items));
        }
      } catch (err) {
        console.warn('Server update notice:', err.message);
      }
    }
  };

  const removeFromCart = async (itemId) => {
    // Update local state immediately
    setCartItems((prev) => {
      const updated = prev.filter((item) => item._id !== itemId);
      localStorage.setItem('scoop_dreams_cart', JSON.stringify(updated));
      return updated;
    });
    showNotification('Item removed from cart');

    // If authenticated, sync with server
    if (isAuthenticated && !String(itemId).startsWith('item-') && !String(itemId).startsWith('local-')) {
      try {
        const res = await cartAPI.remove(itemId);
        if (res?.success && res.data?.items) {
          setCartItems(res.data.items);
          localStorage.setItem('scoop_dreams_cart', JSON.stringify(res.data.items));
        }
      } catch (err) {
        console.warn('Server remove notice:', err.message);
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    setAppliedCoupon(null);
    localStorage.removeItem('scoop_dreams_cart');
    localStorage.removeItem('scoop_dreams_coupon');

    if (isAuthenticated) {
      try {
        await cartAPI.clear();
      } catch (err) {
        console.warn('Server clear notice:', err.message);
      }
    }
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
