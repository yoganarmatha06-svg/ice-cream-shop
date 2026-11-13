import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      default: 'Scoop Dreams Artisan Parlour',
      trim: true,
    },
    tagline: {
      type: String,
      default: 'Handcrafted Daily Small-Batch Ice Creams',
      trim: true,
    },
    contactEmail: {
      type: String,
      default: 'contact@scoopdreams.com',
      trim: true,
    },
    contactPhone: {
      type: String,
      default: '+91 98765 43210',
      trim: true,
    },
    storeAddress: {
      type: String,
      default: '12 Sweet Treat Boulevard, Indiranagar, Bengaluru, Karnataka 560038',
      trim: true,
    },
    openingHours: {
      type: String,
      default: '10:00 AM - 11:30 PM, Everyday',
      trim: true,
    },
    currency: {
      type: String,
      default: '₹',
    },
    currencyCode: {
      type: String,
      default: 'INR',
    },
    freeDeliveryThreshold: {
      type: Number,
      default: 499,
    },
    deliveryFee: {
      type: Number,
      default: 49,
    },
    estimatedDeliveryTime: {
      type: String,
      default: '25 - 40 Mins',
    },
    packagingCharge: {
      type: Number,
      default: 0,
    },
    storeOpen: {
      type: Boolean,
      default: true,
    },
    codEnabled: {
      type: Boolean,
      default: true,
    },
    onlinePaymentEnabled: {
      type: Boolean,
      default: true,
    },
    orderSoundNotification: {
      type: Boolean,
      default: true,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
    sessionExpiryDays: {
      type: Number,
      default: 7,
    },
  },
  {
    timestamps: true,
  }
);

const Setting = mongoose.models.Setting || mongoose.model('Setting', settingSchema);

export default Setting;

