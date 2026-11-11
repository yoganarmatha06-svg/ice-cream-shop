import mongoose from 'mongoose';

const flavorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Flavor name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=600&q=80',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
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

// Add index on name for quick searching
flavorSchema.index({ name: 'text', description: 'text' });

const Flavor = mongoose.models.Flavor || mongoose.model('Flavor', flavorSchema);

export default Flavor;

