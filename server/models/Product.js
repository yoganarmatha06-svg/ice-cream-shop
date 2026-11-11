import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    discountPrice: {
      type: Number,
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    image: {
      type: String,
      required: [true, 'Product image is required'],
    },
    flavour: {
      type: String,
      default: 'Artisan',
    },
    stock: {
      type: Number,
      default: 50,
      min: 0,
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 12,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: ['Premium', 'Artisan'],
    },
    calories: {
      type: Number,
      default: 240,
    },
    allergens: {
      type: [String],
      default: ['Dairy'],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Product', productSchema);
