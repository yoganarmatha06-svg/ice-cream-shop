import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Admin from '../models/Admin.js';

// Helper to generate JWT token (Valid for 7 Days)
export const generateToken = (id, role = 'user') => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'scoop_dreams_artisan_secret_key_2026_super_secure',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Helper to set HTTP-only cookie (7 Days Session)
export const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (604,800,000 ms)
  });
};

// Protect middleware: verifies JWT token from Authorization Header or HTTP-only cookie
export const protect = async (req, res, next) => {
  let token;

  // 1. Check Bearer token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2. Check HTTP-only cookie
  else if (req.cookies && (req.cookies.token || req.cookies.jwt)) {
    token = req.cookies.token || req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: No authentication token provided',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'scoop_dreams_artisan_secret_key_2026_super_secure'
    );

    // Look up based on role
    if (decoded.role === 'admin') {
      let adminAccount = await Admin.findById(decoded.id).select('-password');
      if (!adminAccount) {
        // Fallback: Check User collection for admin role
        adminAccount = await User.findOne({ _id: decoded.id, role: 'admin' }).select('-password');
      }
      if (!adminAccount) {
        return res.status(401).json({ success: false, message: 'Admin account not found or deactivated' });
      }
      req.user = {
        _id: adminAccount._id,
        name: adminAccount.name,
        email: adminAccount.email,
        role: 'admin',
      };
      return next();
    } else {
      // User role
      const userAccount = await User.findById(decoded.id).select('-password');
      if (!userAccount) {
        return res.status(401).json({ success: false, message: 'User account not found' });
      }
      req.user = userAccount;
      return next();
    }
  } catch (error) {
    console.error('JWT Token Verification Error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized: Token failed or expired. Please sign in again.',
    });
  }
};

// Admin only middleware: checks user role is strictly 'admin'
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Forbidden: Access denied. Administrator privileges required.',
  });
};

// User only middleware: checks user role is strictly 'user'
export const userOnly = (req, res, next) => {
  if (req.user && req.user.role === 'user') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Forbidden: Access denied. Customer privileges required.',
  });
};

// Optional Protect: attaches user if token is present, else continues for guest checkout
export const optionalProtect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && (req.cookies.token || req.cookies.jwt)) {
    token = req.cookies.token || req.cookies.jwt;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'scoop_dreams_artisan_secret_key_2026_super_secure'
    );
    if (decoded.role === 'admin') {
      const adminAccount = await Admin.findById(decoded.id).select('-password');
      if (adminAccount) req.user = adminAccount;
    } else {
      const userAccount = await User.findById(decoded.id).select('-password');
      if (userAccount) req.user = userAccount;
    }
  } catch {
    // Continue without req.user if token is invalid
  }
  next();
};
