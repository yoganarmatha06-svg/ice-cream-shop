import Admin from '../models/Admin.js';
import User from '../models/User.js';
import IceCream from '../models/IceCream.js';
import Flavor from '../models/Flavor.js';
import { generateToken, setTokenCookie } from '../middleware/authMiddleware.js';

// @desc    Admin Login Authentication
// @route   POST /api/admin/login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both admin email and password',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Look up admin in Admin collection
    let admin = await Admin.findOne({ email: cleanEmail });

    // 2. Fallback check: Look up admin in User collection
    if (!admin) {
      const adminUser = await User.findOne({ email: cleanEmail, role: 'admin' });
      if (adminUser) {
        admin = adminUser;
      }
    }

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrator credentials. Email not found.',
      });
    }

    // 3. Verify password using bcrypt
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrator credentials. Incorrect password.',
      });
    }

    // 4. Verify admin role
    if (admin.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: This account does not possess administrator privileges.',
      });
    }

    // 5. Generate JWT token
    const token = generateToken(admin._id, 'admin');

    // 6. Set secure HTTP-only cookie
    setTokenCookie(res, token);

    // 7. Return success response
    res.json({
      success: true,
      token,
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: 'admin',
      },
      message: 'Admin authenticated successfully! Welcome to Scoop Dreams Management.',
    });
  } catch (error) {
    console.error('Admin Login Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Authenticated Admin Profile
// @route   GET /api/admin/profile
export const getAdminProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard metrics & analytics for Ice Cream & Flavors
// @route   GET /api/admin/dashboard
export const getDashboardStats = async (req, res) => {
  try {
    const totalIceCreams = await IceCream.countDocuments();
    const totalFlavors = await Flavor.countDocuments();
    const availableIceCreams = await IceCream.countDocuments({ status: 'Available' });
    const unavailableIceCreams = await IceCream.countDocuments({ status: 'Unavailable' });
    const activeFlavors = await Flavor.countDocuments({ status: 'Active' });
    const inactiveFlavors = await Flavor.countDocuments({ status: 'Inactive' });

    // Recently added 6 ice creams (populated with flavor details)
    const recentlyAdded = await IceCream.find()
      .populate('flavor', 'name image status')
      .sort({ createdAt: -1 })
      .limit(6);

    // Flavors breakdown with count of assigned ice creams
    const flavors = await Flavor.find().sort({ createdAt: -1 });
    const flavorStats = await Promise.all(
      flavors.map(async (f) => {
        const count = await IceCream.countDocuments({ flavor: f._id });
        return {
          _id: f._id,
          name: f.name,
          image: f.image,
          status: f.status,
          count,
        };
      })
    );

    res.json({
      success: true,
      data: {
        totalIceCreams,
        totalFlavors,
        availableIceCreams,
        unavailableIceCreams,
        activeFlavors,
        inactiveFlavors,
        recentlyAdded,
        flavorStats,
      },
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSalesReports = async (req, res) => res.json({ success: true, data: {} });
export const getCoupons = async (req, res) => res.json({ success: true, data: [] });
export const createCoupon = async (req, res) => res.json({ success: true, data: {} });
export const deleteCoupon = async (req, res) => res.json({ success: true, data: {} });
export const getAllReviews = async (req, res) => res.json({ success: true, data: [] });
export const deleteReview = async (req, res) => res.json({ success: true, data: {} });
