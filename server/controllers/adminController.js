import Admin from '../models/Admin.js';
import User from '../models/User.js';
import IceCream from '../models/IceCream.js';
import Flavor from '../models/Flavor.js';
import Order from '../models/Order.js';
import Address from '../models/Address.js';
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
    const totalCustomers = await User.countDocuments({ role: 'user' });
    const totalOrders = await Order.countDocuments();
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
        totalCustomers,
        totalOrders,
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

// @desc    Get All Customers (Registered + Order Customers with Full Details & Order History)
// @route   GET /api/admin/customers
export const getCustomers = async (req, res) => {
  try {
    const { search = '', sort = 'latest' } = req.query;

    // 1. Fetch registered users
    const users = await User.find({ role: 'user' }).select('-password').lean();

    // 2. Fetch all orders
    const orders = await Order.find().sort({ createdAt: -1 }).lean();

    // 3. Fetch all saved addresses
    const addresses = await Address.find().lean();

    // 4. Map customers by email
    const customerMap = new Map();

    users.forEach((u) => {
      const email = (u.email || '').toLowerCase().trim();
      customerMap.set(email, {
        _id: String(u._id),
        userId: String(u._id),
        name: u.name,
        email: u.email,
        phone: u.phone || '',
        altPhone: '',
        address: {
          street: '',
          city: '',
          state: '',
          pincode: '',
        },
        fullAddressString: '',
        totalOrders: 0,
        totalSpent: 0,
        orderHistory: [],
        customerType: 'Registered User',
        createdAt: u.createdAt,
        lastOrderDate: null,
      });
    });

    // Populate addresses from Address model
    addresses.forEach((addr) => {
      const uId = String(addr.user);
      for (const cust of customerMap.values()) {
        if (cust.userId === uId && !cust.address.street) {
          cust.address = {
            street: addr.street || '',
            city: addr.city || '',
            state: addr.state || '',
            pincode: addr.pincode || '',
          };
          if (!cust.phone && addr.phone) cust.phone = addr.phone;
        }
      }
    });

    // Process all orders to aggregate total orders, order history & addresses
    orders.forEach((ord) => {
      const userRefId = ord.user ? String(ord.user) : null;
      let email = (ord.deliveryAddress?.email || '').toLowerCase().trim();

      // If no delivery address email, try finding registered user by userRefId
      if (!email && userRefId) {
        for (const [e, c] of customerMap.entries()) {
          if (c.userId === userRefId) {
            email = e;
            break;
          }
        }
      }

      if (!email) {
        email = `order-user-${ord._id}@guest.com`;
      }

      let cust = customerMap.get(email);
      if (!cust) {
        cust = {
          _id: `guest-${ord._id}`,
          userId: userRefId,
          name: ord.deliveryAddress?.fullName || 'Guest Customer',
          email: ord.deliveryAddress?.email || email,
          phone: ord.deliveryAddress?.phone || '',
          altPhone: ord.deliveryAddress?.altPhone || '',
          address: {
            street: ord.deliveryAddress?.street || '',
            city: ord.deliveryAddress?.city || '',
            state: ord.deliveryAddress?.state || '',
            pincode: ord.deliveryAddress?.pincode || '',
          },
          fullAddressString: '',
          totalOrders: 0,
          totalSpent: 0,
          orderHistory: [],
          customerType: userRefId ? 'Registered User' : 'Order Customer',
          createdAt: ord.createdAt,
          lastOrderDate: null,
        };
        customerMap.set(email, cust);
      }

      // Update phone and address if empty
      if (ord.deliveryAddress) {
        if (!cust.phone && ord.deliveryAddress.phone) cust.phone = ord.deliveryAddress.phone;
        if (!cust.altPhone && ord.deliveryAddress.altPhone) cust.altPhone = ord.deliveryAddress.altPhone;
        if (!cust.address.street && ord.deliveryAddress.street) {
          cust.address = {
            street: ord.deliveryAddress.street || '',
            city: ord.deliveryAddress.city || '',
            state: ord.deliveryAddress.state || '',
            pincode: ord.deliveryAddress.pincode || '',
          };
        }
      }

      // Increment counts
      cust.totalOrders += 1;
      cust.totalSpent += Number(ord.totalAmount) || 0;
      if (!cust.lastOrderDate || new Date(ord.createdAt) > new Date(cust.lastOrderDate)) {
        cust.lastOrderDate = ord.createdAt;
      }

      // Add to Order History
      cust.orderHistory.push({
        _id: ord._id,
        orderId: ord.orderId || `ORD-${String(ord._id).slice(-6).toUpperCase()}`,
        totalAmount: Number(ord.totalAmount) || 0,
        discountAmount: Number(ord.discountAmount) || 0,
        couponApplied: ord.couponApplied || '',
        orderStatus: ord.orderStatus || 'Processing',
        paymentMethod: ord.paymentMethod || 'Cash on Delivery',
        paymentStatus: ord.paymentStatus || 'Pending',
        productsCount: (ord.products || []).reduce((sum, p) => sum + (p.quantity || 1), 0),
        products: ord.products || [],
        deliveryAddress: ord.deliveryAddress || {},
        createdAt: ord.createdAt,
      });
    });

    let customerList = Array.from(customerMap.values()).map((c) => {
      const parts = [
        c.address.street,
        c.address.city,
        c.address.state,
        c.address.pincode ? `PIN: ${c.address.pincode}` : '',
      ].filter(Boolean);

      // Sort order history for each customer newest first
      c.orderHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return {
        ...c,
        totalSpent: Math.round(c.totalSpent * 100) / 100,
        fullAddressString: parts.length > 0 ? parts.join(', ') : 'No delivery address provided yet',
      };
    });

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      customerList = customerList.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          (c.altPhone && c.altPhone.toLowerCase().includes(q)) ||
          c.fullAddressString.toLowerCase().includes(q)
      );
    }

    // Sort order
    if (sort === 'orders_desc') {
      customerList.sort((a, b) => b.totalOrders - a.totalOrders);
    } else if (sort === 'spent_desc') {
      customerList.sort((a, b) => b.totalSpent - a.totalSpent);
    } else if (sort === 'name_asc') {
      customerList.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      customerList.sort((a, b) => new Date(b.lastOrderDate || b.createdAt) - new Date(a.lastOrderDate || a.createdAt));
    }

    res.json({
      success: true,
      totalCustomers: customerList.length,
      data: customerList,
    });
  } catch (error) {
    console.error('Error in getCustomers:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single customer by ID or email
// @route   GET /api/admin/customers/:id
export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if ID is a Mongo User ID or guest order id
    let user = null;
    if (id.startsWith('guest-')) {
      const orderId = id.replace('guest-', '');
      const order = await Order.findById(orderId).lean();
      if (!order) return res.status(404).json({ success: false, message: 'Customer not found' });
      
      const orders = await Order.find({ 'deliveryAddress.email': order.deliveryAddress?.email }).sort({ createdAt: -1 }).lean();
      return res.json({
        success: true,
        data: {
          _id: id,
          name: order.deliveryAddress?.fullName || 'Guest Customer',
          email: order.deliveryAddress?.email || '',
          phone: order.deliveryAddress?.phone || '',
          altPhone: order.deliveryAddress?.altPhone || '',
          address: {
            street: order.deliveryAddress?.street || '',
            city: order.deliveryAddress?.city || '',
            state: order.deliveryAddress?.state || '',
            pincode: order.deliveryAddress?.pincode || '',
          },
          totalOrders: orders.length,
          totalSpent: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
          orderHistory: orders,
        },
      });
    }

    user = await User.findById(id).select('-password').lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const orders = await Order.find({
      $or: [{ user: user._id }, { 'deliveryAddress.email': user.email }],
    }).sort({ createdAt: -1 }).lean();

    const address = await Address.findOne({ user: user._id }).lean();

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || address?.phone || '',
        address: address || orders[0]?.deliveryAddress || {},
        totalOrders: orders.length,
        totalSpent: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
        orderHistory: orders,
      },
    });
  } catch (error) {
    console.error('Error in getCustomerById:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSalesReports = async (req, res) => res.json({ success: true, data: {} });
export const getCoupons = async (req, res) => res.json({ success: true, data: [] });
export const createCoupon = async (req, res) => res.json({ success: true, data: {} });
export const deleteCoupon = async (req, res) => res.json({ success: true, data: {} });
export const getAllReviews = async (req, res) => res.json({ success: true, data: [] });
export const deleteReview = async (req, res) => res.json({ success: true, data: {} });
