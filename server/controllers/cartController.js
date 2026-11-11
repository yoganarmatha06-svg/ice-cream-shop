import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';

const calculateTotal = (items) => {
  return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
};

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name price discountPrice image flavour stock category isFeatured',
    });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
        totalPrice: 0,
      });
    }

    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, selectedSize = 'Regular Scoop (120ml)' } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const itemPrice = product.discountPrice > 0 ? product.discountPrice : product.price;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: [],
        totalPrice: 0,
      });
    }

    // Check if item with same product and size exists
    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.selectedSize === selectedSize
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += Number(quantity);
      cart.items[existingIndex].price = itemPrice;
    } else {
      cart.items.push({
        product: productId,
        quantity: Number(quantity),
        price: itemPrice,
        selectedSize,
      });
    }

    cart.totalPrice = calculateTotal(cart.items);
    await cart.save();

    const populated = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name price discountPrice image flavour stock category',
    });

    res.json({ success: true, data: populated, message: `${product.name} added to cart!` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update item quantity or size in cart
// @route   PUT /api/cart/:itemId
// @access  Private
export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity, selectedSize } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    if (quantity !== undefined) {
      if (Number(quantity) <= 0) {
        cart.items.pull(itemId);
      } else {
        item.quantity = Number(quantity);
      }
    }

    if (selectedSize) {
      item.selectedSize = selectedSize;
    }

    cart.totalPrice = calculateTotal(cart.items);
    await cart.save();

    const populated = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name price discountPrice image flavour stock category',
    });

    res.json({ success: true, data: populated, message: 'Cart updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items.pull(itemId);
    cart.totalPrice = calculateTotal(cart.items);
    await cart.save();

    const populated = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name price discountPrice image flavour stock category',
    });

    res.json({ success: true, data: populated, message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      cart.totalPrice = 0;
      await cart.save();
    }
    res.json({ success: true, message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Apply discount coupon
// @route   POST /api/cart/coupon
// @access  Private
export const applyCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code' });
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ success: false, message: 'This coupon has expired' });
    }

    const subtotal = Number(cartTotal) || 0;
    if (subtotal < 200) {
      return res.status(400).json({
        success: false,
        message: 'Coupon codes are only applicable on orders above $200. Please add more items to your bag!',
      });
    }

    if (coupon.minSpend && subtotal < coupon.minSpend) {
      return res.status(400).json({
        success: false,
        message: `Minimum order of $${coupon.minSpend} required for this coupon`,
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (subtotal * coupon.discount) / 100;
    } else {
      discountAmount = Math.min(coupon.discount, subtotal);
    }

    const finalTotal = Math.max(0, subtotal - discountAmount);

    res.json({
      success: true,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discount,
        discountAmount: Math.round(discountAmount * 100) / 100,
        finalTotal: Math.round(finalTotal * 100) / 100,
      },
      message: `Coupon ${coupon.code} applied! You save $${discountAmount.toFixed(2)}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
