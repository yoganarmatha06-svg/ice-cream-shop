import mongoose from 'mongoose';

const iceCreamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Ice cream variety name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be greater than or equal to 0'],
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
      default: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80',
    },
    flavor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flavor',
      required: [true, 'Flavor selection is required'],
    },
    status: {
      type: String,
      enum: ['Available', 'Unavailable'],
      default: 'Available',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

iceCreamSchema.index({ name: 'text', description: 'text' });

const IceCream = mongoose.models.IceCream || mongoose.model('IceCream', iceCreamSchema);

export default IceCream;

