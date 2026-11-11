import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
} from '../controllers/cartController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Coupon check is available for both guest carts and authenticated carts (enforces cartTotal >= 200)
router.post('/coupon/apply', optionalProtect, applyCoupon);

// Cart sync routes require logged-in user
router.use(protect);

router.route('/')
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

router.route('/:itemId')
  .put(updateCartItem)
  .delete(removeFromCart);

export default router;
