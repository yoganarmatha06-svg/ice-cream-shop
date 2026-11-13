import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import IceCream from '../models/IceCream.js';
import Flavor from '../models/Flavor.js';
import Order from '../models/Order.js';
import Address from '../models/Address.js';
import Setting from '../models/Setting.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
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

// Helper to extract or infer flavor name from product or order item
const extractItemFlavor = (item) => {
  if (item.flavour && item.flavour.trim()) return item.flavour.trim();
  if (item.flavor && item.flavor.trim()) return item.flavor.trim();
  if (item.product && item.product.flavour && item.product.flavour.trim()) return item.product.flavour.trim();
  const name = (item.name || '').toLowerCase();
  if (name.includes('vanilla')) return 'Bourbon Vanilla';
  if (name.includes('choco') || name.includes('fudge') || name.includes('cacao') || name.includes('belgian')) return 'Belgian Chocolate';
  if (name.includes('strawberr')) return 'Fresh Strawberry';
  if (name.includes('mango') || name.includes('alphonso')) return 'Alphonso Mango';
  if (name.includes('pistachio')) return 'Pistachio & Nuts';
  if (name.includes('butterscotch') || name.includes('caramel')) return 'Butterscotch';
  if (name.includes('cookie')) return 'Cookies & Cream';
  if (name.includes('coffee') || name.includes('mocha') || name.includes('espresso')) return 'Coffee & Mocha';
  if (name.includes('cotton candy')) return 'Cotton Candy';
  if (name.includes('blueberr') || name.includes('cheesecake')) return 'Blueberry & Cheesecake';
  if (name.includes('mint')) return 'Mint Choco Chip';
  if (name.includes('fruit') || name.includes('berry') || name.includes('sorbet')) return 'Fruit Flavours';
  return 'Artisan Ice Cream';
};

// @desc    Get All Customers (Registered + Order Customers with Full Details, Products & Flavors)
// @route   GET /api/admin/customers
export const getCustomers = async (req, res) => {
  try {
    const { search = '', sort = 'latest' } = req.query;

    // 1. Fetch registered users
    const users = await User.find({ role: 'user' }).select('-password').lean();

    // 2. Fetch all orders with product details populated
    const orders = await Order.find()
      .populate('products.product', 'name flavour category image')
      .sort({ createdAt: -1 })
      .lean();

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
        totalScoops: 0,
        purchasedProducts: [],
        purchasedFlavors: [],
        topFlavors: [],
        orderHistory: [],
        customerType: 'Registered User',
        createdAt: u.createdAt,
        lastOrderDate: null,
        _productMap: new Map(),
        _flavorMap: new Map(),
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

    // Process all orders to aggregate total orders, products, flavors & addresses
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
          totalScoops: 0,
          purchasedProducts: [],
          purchasedFlavors: [],
          topFlavors: [],
          orderHistory: [],
          customerType: userRefId ? 'Registered User' : 'Order Customer',
          createdAt: ord.createdAt,
          lastOrderDate: null,
          _productMap: new Map(),
          _flavorMap: new Map(),
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

      // Process order products & flavors
      const enrichedProducts = (ord.products || []).map((item) => {
        const flavorName = extractItemFlavor(item);
        const pName = item.name || item.product?.name || 'Artisan Ice Cream';
        const pImage = item.image || item.product?.image || '';
        const qty = Number(item.quantity) || 1;

        cust.totalScoops += qty;

        // Aggregate Product
        if (cust._productMap.has(pName)) {
          const existing = cust._productMap.get(pName);
          existing.totalQuantity += qty;
          existing.orderCount += 1;
        } else {
          cust._productMap.set(pName, {
            name: pName,
            image: pImage,
            flavor: flavorName,
            totalQuantity: qty,
            orderCount: 1,
            selectedSize: item.selectedSize || 'Regular Scoop (120ml)',
          });
        }

        // Aggregate Flavor
        if (cust._flavorMap.has(flavorName)) {
          const fExisting = cust._flavorMap.get(flavorName);
          fExisting.count += qty;
        } else {
          cust._flavorMap.set(flavorName, {
            name: flavorName,
            count: qty,
          });
        }

        return {
          ...item,
          flavour: flavorName,
          flavor: flavorName,
        };
      });

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
        productsCount: enrichedProducts.reduce((sum, p) => sum + (p.quantity || 1), 0),
        products: enrichedProducts,
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

      // Extract products & flavors arrays
      const purchasedProducts = Array.from(c._productMap.values()).sort(
        (a, b) => b.totalQuantity - a.totalQuantity
      );
      const purchasedFlavors = Array.from(c._flavorMap.values()).sort((a, b) => b.count - a.count);
      const topFlavors = purchasedFlavors.slice(0, 3).map((f) => f.name);

      delete c._productMap;
      delete c._flavorMap;

      return {
        ...c,
        purchasedProducts,
        purchasedFlavors,
        topFlavors,
        totalSpent: Math.round(c.totalSpent * 100) / 100,
        fullAddressString: parts.length > 0 ? parts.join(', ') : 'No delivery address provided yet',
      };
    });

    // Search filter (name, email, phone, address, product name, flavor)
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      customerList = customerList.filter((c) => {
        const productMatch = (c.purchasedProducts || []).some(
          (p) => p.name.toLowerCase().includes(q) || (p.flavor && p.flavor.toLowerCase().includes(q))
        );
        const flavorMatch = (c.purchasedFlavors || []).some((f) => f.name.toLowerCase().includes(q));
        return (
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          (c.altPhone && c.altPhone.toLowerCase().includes(q)) ||
          c.fullAddressString.toLowerCase().includes(q) ||
          productMatch ||
          flavorMatch
        );
      });
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
      
      const orders = await Order.find({ 'deliveryAddress.email': order.deliveryAddress?.email })
        .populate('products.product', 'name flavour category image')
        .sort({ createdAt: -1 })
        .lean();

      // Aggregate products & flavors
      const prodMap = new Map();
      const flavMap = new Map();
      orders.forEach((ord) => {
        (ord.products || []).forEach((item) => {
          const flavorName = extractItemFlavor(item);
          item.flavour = flavorName;
          item.flavor = flavorName;
          const pName = item.name || item.product?.name || 'Artisan Ice Cream';
          const qty = Number(item.quantity) || 1;
          if (prodMap.has(pName)) {
            prodMap.get(pName).totalQuantity += qty;
          } else {
            prodMap.set(pName, {
              name: pName,
              image: item.image || item.product?.image || '',
              flavor: flavorName,
              totalQuantity: qty,
              orderCount: 1,
            });
          }
          if (flavMap.has(flavorName)) {
            flavMap.get(flavorName).count += qty;
          } else {
            flavMap.set(flavorName, { name: flavorName, count: qty });
          }
        });
      });

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
          purchasedProducts: Array.from(prodMap.values()),
          purchasedFlavors: Array.from(flavMap.values()),
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
    })
      .populate('products.product', 'name flavour category image')
      .sort({ createdAt: -1 })
      .lean();

    const prodMap = new Map();
    const flavMap = new Map();
    orders.forEach((ord) => {
      (ord.products || []).forEach((item) => {
        const flavorName = extractItemFlavor(item);
        item.flavour = flavorName;
        item.flavor = flavorName;
        const pName = item.name || item.product?.name || 'Artisan Ice Cream';
        const qty = Number(item.quantity) || 1;
        if (prodMap.has(pName)) {
          prodMap.get(pName).totalQuantity += qty;
        } else {
          prodMap.set(pName, {
            name: pName,
            image: item.image || item.product?.image || '',
            flavor: flavorName,
            totalQuantity: qty,
            orderCount: 1,
          });
        }
        if (flavMap.has(flavorName)) {
          flavMap.get(flavorName).count += qty;
        } else {
          flavMap.set(flavorName, { name: flavorName, count: qty });
        }
      });
    });

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
        purchasedProducts: Array.from(prodMap.values()),
        purchasedFlavors: Array.from(flavMap.values()),
        orderHistory: orders,
      },
    });
  } catch (error) {
    console.error('Error in getCustomerById:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Comprehensive Business & Sales Reports for the whole project
// @route   GET /api/admin/reports
export const getSalesReports = async (req, res) => {
  try {
    const { timeRange = 'all' } = req.query;

    let dateFilter = {};
    const now = new Date();
    if (timeRange === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateFilter = { createdAt: { $gte: startOfDay } };
    } else if (timeRange === 'week') {
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: last7Days } };
    } else if (timeRange === 'month') {
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: last30Days } };
    } else if (timeRange === 'year') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      dateFilter = { createdAt: { $gte: startOfYear } };
    }

    // 1. Fetch Orders with populated items
    const allOrders = await Order.find(dateFilter)
      .populate('user', 'name email phone profileImage')
      .populate('products.product', 'name category flavour price image')
      .sort({ createdAt: -1 })
      .lean();

    // Also fetch inventory stats
    const totalVarieties = await IceCream.countDocuments();
    const availableVarieties = await IceCream.countDocuments({ status: 'Available' });
    const outOfStockVarieties = await IceCream.countDocuments({ status: 'Unavailable' });
    const totalFlavors = await Flavor.countDocuments();
    const totalRegisteredUsers = await User.countDocuments({ role: 'user' });

    // 2. Financial & Order Totals
    let grossRevenue = 0;
    let netRevenue = 0;
    let totalDiscount = 0;
    let totalItemsCount = 0;
    let completedCount = 0;
    let processingCount = 0;
    let cancelledCount = 0;

    const timelineMap = new Map();
    const flavorMap = new Map();
    const categoryMap = new Map();
    const paymentMap = new Map();
    const statusMap = new Map();
    const customerMap = new Map();

    allOrders.forEach((ord) => {
      const status = ord.orderStatus || 'Processing';
      const isCancelled = status.toLowerCase() === 'cancelled';
      const totalAmt = Number(ord.totalAmount) || 0;
      const discount = Number(ord.discountAmount) || 0;

      // Status aggregation
      statusMap.set(status, (statusMap.get(status) || 0) + 1);

      if (isCancelled) {
        cancelledCount++;
      } else {
        grossRevenue += totalAmt;
        totalDiscount += discount;
        if (status === 'Delivered' || status === 'Confirmed') {
          completedCount++;
        } else {
          processingCount++;
        }
      }

      // Payment method aggregation
      const pMethod = ord.paymentMethod || 'Cash on Delivery';
      if (!paymentMap.has(pMethod)) {
        paymentMap.set(pMethod, { method: pMethod, count: 0, revenue: 0 });
      }
      const pStat = paymentMap.get(pMethod);
      pStat.count += 1;
      if (!isCancelled) pStat.revenue += totalAmt;

      // Timeline aggregation by date YYYY-MM-DD
      const dateObj = new Date(ord.createdAt);
      const dateKey = dateObj.toISOString().split('T')[0];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dateLabel = `${dateObj.getDate()} ${monthNames[dateObj.getMonth()]}`;

      if (!timelineMap.has(dateKey)) {
        timelineMap.set(dateKey, {
          date: dateKey,
          label: dateLabel,
          revenue: 0,
          orders: 0,
          items: 0,
        });
      }
      const timeStat = timelineMap.get(dateKey);
      timeStat.orders += 1;
      if (!isCancelled) timeStat.revenue += totalAmt;

      // Customer aggregation
      const customerEmail = (ord.deliveryAddress?.email || ord.user?.email || `customer-${ord.deliveryAddress?.phone || 'guest'}`).toLowerCase().trim();
      const customerName = ord.deliveryAddress?.fullName || ord.user?.name || 'Valued Customer';
      const customerPhone = ord.deliveryAddress?.phone || ord.user?.phone || '';

      if (!customerMap.has(customerEmail)) {
        customerMap.set(customerEmail, {
          email: customerEmail,
          name: customerName,
          phone: customerPhone,
          totalOrders: 0,
          totalSpent: 0,
          topFlavorsMap: new Map(),
        });
      }
      const custStat = customerMap.get(customerEmail);
      custStat.totalOrders += 1;
      if (!isCancelled) custStat.totalSpent += totalAmt;

      // Process individual products in the order
      (ord.products || []).forEach((item) => {
        const qty = Number(item.quantity) || 1;
        const itemPrice = Number(item.price) || 0;
        const itemTotal = itemPrice * qty;
        totalItemsCount += qty;
        timeStat.items += qty;

        const flavorName = extractItemFlavor(item);
        const pImage = item.image || item.product?.image || '/images/categories/vanilla.jpg';
        const catName = item.product?.category?.name || item.category || 'Artisanal Flavours';

        // Flavour aggregation
        if (!flavorMap.has(flavorName)) {
          flavorMap.set(flavorName, {
            name: flavorName,
            image: pImage,
            totalQuantity: 0,
            revenue: 0,
            ordersCount: 0,
          });
        }
        const flavStat = flavorMap.get(flavorName);
        flavStat.totalQuantity += qty;
        flavStat.ordersCount += 1;
        if (!isCancelled) flavStat.revenue += itemTotal;

        // Customer favourite flavour tracking
        custStat.topFlavorsMap.set(flavorName, (custStat.topFlavorsMap.get(flavorName) || 0) + qty);

        // Category aggregation
        if (!categoryMap.has(catName)) {
          categoryMap.set(catName, {
            category: catName,
            revenue: 0,
            totalQuantity: 0,
            ordersCount: 0,
          });
        }
        const catStat = categoryMap.get(catName);
        catStat.totalQuantity += qty;
        catStat.ordersCount += 1;
        if (!isCancelled) catStat.revenue += itemTotal;
      });
    });

    netRevenue = grossRevenue - totalDiscount;
    const effectiveOrders = allOrders.length - cancelledCount;
    const averageOrderValue = effectiveOrders > 0 ? Math.round(grossRevenue / effectiveOrders) : 0;

    // Convert Flavours Map to Sorted Array
    const flavoursList = Array.from(flavorMap.values()).map((f) => ({
      ...f,
      percentage: totalItemsCount > 0 ? Number(((f.totalQuantity / totalItemsCount) * 100).toFixed(1)) : 0,
    })).sort((a, b) => b.totalQuantity - a.totalQuantity);

    // Convert Categories Map to Sorted Array
    const categoriesList = Array.from(categoryMap.values()).map((c) => ({
      ...c,
      percentage: grossRevenue > 0 ? Number(((c.revenue / grossRevenue) * 100).toFixed(1)) : 0,
    })).sort((a, b) => b.revenue - a.revenue);

    // Convert Timeline to Chronological Array (sorted by date ascending)
    const timelineList = Array.from(timelineMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    // Convert Payment Methods Map to Array
    const paymentMethodsList = Array.from(paymentMap.values()).map((p) => ({
      ...p,
      percentage: allOrders.length > 0 ? Number(((p.count / allOrders.length) * 100).toFixed(1)) : 0,
    })).sort((a, b) => b.count - a.count);

    // Convert Status Map to Array
    const orderStatusList = Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count,
      percentage: allOrders.length > 0 ? Number(((count / allOrders.length) * 100).toFixed(1)) : 0,
    }));

    // Convert Top Customers to Array
    const topCustomersList = Array.from(customerMap.values()).map((c) => {
      let bestFlav = 'Artisanal Flavours';
      let maxFlavCount = 0;
      for (const [flav, count] of c.topFlavorsMap.entries()) {
        if (count > maxFlavCount) {
          maxFlavCount = count;
          bestFlav = flav;
        }
      }
      return {
        name: c.name,
        email: c.email,
        phone: c.phone,
        totalOrders: c.totalOrders,
        totalSpent: c.totalSpent,
        topFlavor: bestFlav,
      };
    }).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 10);

    // Recent 15 Orders Ledger for quick export/view
    const recentOrders = allOrders.slice(0, 15).map((ord) => ({
      _id: ord._id,
      orderId: ord.orderId,
      customerName: ord.deliveryAddress?.fullName || ord.user?.name || 'Customer',
      phone: ord.deliveryAddress?.phone || '',
      itemsCount: (ord.products || []).reduce((sum, i) => sum + (Number(i.quantity) || 1), 0),
      itemsSummary: (ord.products || []).map((i) => `${i.quantity}x ${extractItemFlavor(i)}`).join(', '),
      totalAmount: ord.totalAmount,
      paymentMethod: ord.paymentMethod,
      orderStatus: ord.orderStatus,
      createdAt: ord.createdAt,
    }));

    res.json({
      success: true,
      data: {
        summary: {
          grossRevenue,
          netRevenue,
          totalDiscount,
          totalOrders: allOrders.length,
          completedOrders: completedCount,
          processingOrders: processingCount,
          cancelledOrders: cancelledCount,
          averageOrderValue,
          totalScoopsSold: totalItemsCount,
          totalCustomers: customerMap.size,
          registeredUsers: totalRegisteredUsers,
        },
        inventory: {
          totalVarieties,
          availableVarieties,
          outOfStockVarieties,
          totalFlavors,
        },
        timeline: timelineList,
        topFlavours: flavoursList,
        categories: categoriesList,
        paymentMethods: paymentMethodsList,
        orderStatuses: orderStatusList,
        topCustomers: topCustomersList,
        recentOrders,
      },
    });
  } catch (error) {
    console.error('Error generating sales reports:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getCoupons = async (req, res) => res.json({ success: true, data: [] });
export const createCoupon = async (req, res) => res.json({ success: true, data: {} });
export const deleteCoupon = async (req, res) => res.json({ success: true, data: {} });
export const getAllReviews = async (req, res) => res.json({ success: true, data: [] });
export const deleteReview = async (req, res) => res.json({ success: true, data: {} });

// ==========================================
// STORE SETTINGS CONTROLLERS
// ==========================================

// @desc    Get current store & parlour settings
// @route   GET /api/admin/settings
export const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }

    const isConnected = mongoose.connection.readyState === 1;
    const dbStatus = isConnected ? 'Connected (Atlas Cloud DB)' : 'In-Memory / Local';

    res.json({
      success: true,
      data: settings,
      meta: {
        dbStatus,
        host: mongoose.connection.host || 'cluster0.mongodb.net',
        dbName: mongoose.connection.name || 'icecreamshop',
      },
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update store & parlour settings
// @route   PUT /api/admin/settings
export const updateSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();

    res.json({
      success: true,
      data: settings,
      message: 'Store settings saved successfully!',
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update admin password securely
// @route   PUT /api/admin/settings/password
export const updateAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new passwords',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirmation password do not match',
      });
    }

    let admin = await Admin.findById(req.user._id);
    if (!admin) {
      admin = await User.findById(req.user._id);
    }

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Administrator account not found' });
    }

    const isMatch = await admin.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password. Please try again.',
      });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({
      success: true,
      message: 'Administrator password updated successfully!',
    });
  } catch (error) {
    console.error('Error updating admin password:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update admin profile info (Name & Email)
// @route   PUT /api/admin/settings/profile
export const updateAdminProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    let admin = await Admin.findById(req.user._id);
    if (!admin) {
      admin = await User.findById(req.user._id);
    }

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Administrator account not found' });
    }

    if (name) admin.name = name.trim();
    if (email) admin.email = email.toLowerCase().trim();

    await admin.save();

    res.json({
      success: true,
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      message: 'Administrator profile updated successfully!',
    });
  } catch (error) {
    console.error('Error updating admin profile:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset and reseed database with fresh sample artisanal varieties
// @route   POST /api/admin/settings/reset-data
export const resetSampleData = async (req, res) => {
  try {
    const { seedDatabase } = await import('../seedData.js');
    await seedDatabase();
    res.json({
      success: true,
      message: 'Artisanal database seeded successfully with 12 categories and 18 flavours!',
    });
  } catch (error) {
    console.error('Error resetting database:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
