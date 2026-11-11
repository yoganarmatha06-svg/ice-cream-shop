import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Payment from '../models/Payment.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const {
      products,
      deliveryAddress,
      totalAmount,
      discountAmount = 0,
      couponApplied = '',
      paymentMethod = 'Cash on Delivery',
      transactionId,
    } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items specified' });
    }

    if (!deliveryAddress || !deliveryAddress.fullName || !deliveryAddress.phone || !deliveryAddress.street || !deliveryAddress.pincode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide complete delivery details (Name, Phone, Address, Pin Code)',
      });
    }

    // Resolve user ID if authenticated or match with user record
    let orderUserId = req.user ? req.user._id : null;
    if (!orderUserId && deliveryAddress.email) {
      const existingUser = await User.findOne({ email: deliveryAddress.email.toLowerCase().trim() });
      if (existingUser) {
        orderUserId = existingUser._id;
      }
    }

    // Set estimated delivery: 35 minutes from now for fast ice cream delivery!
    const estimatedDelivery = new Date(Date.now() + 35 * 60 * 1000);

    const initialTracking = [
      {
        status: 'Order Placed',
        timestamp: new Date(),
        message: 'Your artisanal ice cream order has been received.',
      },
      {
        status: 'Confirmed',
        timestamp: new Date(Date.now() + 2 * 60 * 1000),
        message: 'Scoop Master has confirmed your order.',
      },
    ];

    const order = new Order({
      user: orderUserId,
      products: products.map((item) => ({
        product: item.product._id || item.product,
        name: item.product.name || item.name,
        image: item.product.image || item.image,
        quantity: item.quantity,
        price: item.price,
        selectedSize: item.selectedSize || 'Regular Scoop (120ml)',
      })),
      deliveryAddress,
      totalAmount,
      discountAmount,
      couponApplied,
      paymentMethod,
      paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Completed',
      orderStatus: 'Confirmed',
      trackingSteps: initialTracking,
      estimatedDelivery,
    });

    const createdOrder = await order.save();

    // Create Payment Record
    const payment = await Payment.create({
      order: createdOrder._id,
      user: orderUserId,
      amount: totalAmount,
      transactionId: transactionId || `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      paymentMethod,
      paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Completed',
    });

    // Update coupon usage count if applied
    if (couponApplied) {
      await Coupon.updateOne({ code: couponApplied }, { $inc: { usedCount: 1 } });
    }

    // Clear user cart if authenticated
    if (orderUserId) {
      await Cart.findOneAndUpdate({ user: orderUserId }, { items: [], totalPrice: 0 });
    }

    res.status(201).json({
      success: true,
      data: createdOrder,
      payment,
      message: 'Ice Cream Order Placed Successfully! 🍦',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if user owns order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    let query = {};
    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    const pageSize = Number(limit);
    const currentPage = Number(page);
    const skip = (currentPage - 1) * pageSize;

    const totalOrders = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    res.json({
      success: true,
      data: orders,
      total: totalOrders,
      page: currentPage,
      pages: Math.ceil(totalOrders / pageSize),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, trackingMessage } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.orderStatus = orderStatus || order.orderStatus;
    if (orderStatus === 'Delivered') {
      order.paymentStatus = 'Completed';
    }

    const statusMessages = {
      Processing: 'Order is currently being processed.',
      Confirmed: 'Order confirmed and ingredients being prepared.',
      'Preparing Scoops': 'Artisan scoops are being handcrafted in refrigerated cones/tubs.',
      'Out for Delivery': 'Your ice cream order is on its way in insulated cold-storage bags!',
      Delivered: 'Ice cream safely delivered. Enjoy every delightful scoop!',
      Cancelled: 'Order has been cancelled.',
    };

    order.trackingSteps.push({
      status: orderStatus,
      timestamp: new Date(),
      message: trackingMessage || statusMessages[orderStatus] || `Status updated to ${orderStatus}`,
    });

    const updatedOrder = await order.save();
    res.json({ success: true, data: updatedOrder, message: `Order status updated to ${orderStatus}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
