import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  flavour: {
    type: String,
    default: 'Artisan',
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  selectedSize: {
    type: String,
    default: 'Regular Scoop (120ml)',
  },
});

const deliveryAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, default: '' },
  phone: { type: String, required: true },
  altPhone: { type: String, default: '' },
  street: { type: String, required: true },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  pincode: { type: String, required: true },
});

const trackingStepSchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  message: { type: String, default: '' },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    products: [orderItemSchema],
    deliveryAddress: deliveryAddressSchema,
    totalAmount: {
      type: Number,
      required: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    couponApplied: {
      type: String,
      default: '',
    },
    paymentMethod: {
      type: String,
      enum: ['Credit/Debit Card', 'UPI / NetBanking', 'Cash on Delivery', 'Stripe'],
      default: 'Cash on Delivery',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
      default: 'Pending',
    },
    orderStatus: {
      type: String,
      enum: ['Processing', 'Confirmed', 'Preparing Scoops', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Processing',
    },
    trackingSteps: [trackingStepSchema],
    estimatedDelivery: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.pre('save', function () {
  if (!this.orderId) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(100 + Math.random() * 900);
    this.orderId = `SD-${timestamp}-${random}`;
  }
});

export default mongoose.model('Order', orderSchema);
