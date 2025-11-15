const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    category: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Snacks', 'Beverages'],
      default: 'Lunch',
    },
    type: {
      type: String,
      enum: ['Veg', 'Non-Veg'],
      default: 'Veg',
    },
    price: {
      type: Number,
      required: true,
    },
    imageUrl: String,
    ingredients: [String],
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    canteen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Canteen',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  { timestamps: true },
);

const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);

module.exports = MenuItem;
