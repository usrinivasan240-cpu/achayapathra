const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: String,
    type: {
      type: String,
      enum: ['percentage', 'flat'],
      default: 'percentage',
    },
    value: {
      type: Number,
      required: true,
    },
    maxDiscount: Number,
    usageLimit: Number,
    usageCount: {
      type: Number,
      default: 0,
    },
    startsAt: Date,
    expiresAt: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    canteen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Canteen',
    },
  },
  { timestamps: true },
);

couponSchema.methods.isValidNow = function isValidNow() {
  const now = new Date();
  if (this.startsAt && now < this.startsAt) return false;
  if (this.expiresAt && now > this.expiresAt) return false;
  if (!this.isActive) return false;
  if (this.usageLimit && this.usageCount >= this.usageLimit) return false;
  return true;
};

const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
