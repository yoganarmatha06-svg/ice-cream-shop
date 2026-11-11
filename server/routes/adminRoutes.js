import express from 'express';
import {
  adminLogin,
  getAdminProfile,
  getDashboardStats,
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Admin Authentication Routes
router.post('/login', adminLogin);
router.get('/profile', protect, adminOnly, getAdminProfile);

// Admin Dashboard stats (Protected)
router.get('/dashboard', protect, adminOnly, getDashboardStats);

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
