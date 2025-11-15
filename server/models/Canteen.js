const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false },
);

const canteenSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    location: String,
    description: String,
    counters: [counterSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Canteen = mongoose.models.Canteen || mongoose.model('Canteen', canteenSchema);

module.exports = Canteen;
