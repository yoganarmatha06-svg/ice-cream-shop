import express from 'express';
import {
  adminLogin,
  getAdminProfile,
  getDashboardStats,
  getCustomers,
  getCustomerById,
  getSettings,
  updateSettings,
  updateAdminPassword,
  updateAdminProfile,
  resetSampleData,
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Admin Authentication Routes
router.post('/login', adminLogin);
router.get('/profile', protect, adminOnly, getAdminProfile);

// Admin Dashboard stats (Protected)
router.get('/dashboard', protect, adminOnly, getDashboardStats);

// Customer Management Routes (Protected, Admin Only)
router.get('/customers', protect, adminOnly, getCustomers);
router.get('/customers/:id', protect, adminOnly, getCustomerById);

// Store Settings Routes (Protected, Admin Only)
router.get('/settings', protect, adminOnly, getSettings);
router.put('/settings', protect, adminOnly, updateSettings);
router.put('/settings/password', protect, adminOnly, updateAdminPassword);
router.put('/settings/profile', protect, adminOnly, updateAdminProfile);
router.post('/settings/reset-data', protect, adminOnly, resetSampleData);

// Image Upload Endpoint (Multer)
router.post('/upload', protect, adminOnly, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload an image file' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    url: fileUrl,
    message: 'Image uploaded successfully!',
  });
});

export default router;
