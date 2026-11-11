import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getUserAddresses,
  addUserAddress,
  deleteUserAddress,
} from '../controllers/userController.js';
import { protect, adminOnly, userOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// User Authentication Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, userOnly, getUserProfile);

// User Delivery Addresses
router.route('/addresses')
  .get(protect, getUserAddresses)
  .post(protect, addUserAddress);

router.delete('/addresses/:id', protect, deleteUserAddress);

// User Management (Admin Only)
router.route('/')
  .get(protect, adminOnly, getAllUsers);

router.route('/:id')
  .get(protect, adminOnly, getUserById)
  .delete(protect, adminOnly, deleteUser);

router.put('/:id/role', protect, adminOnly, updateUserRole);

export default router;
