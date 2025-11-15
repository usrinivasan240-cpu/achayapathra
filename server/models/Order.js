const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    qty: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
    },
    imageUrl: String,
  },
  { _id: false },
);

const timelineSchema = new mongoose.Schema(
  {
    pendingAt: Date,
    cookingAt: Date,
    readyAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    canteen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Canteen',
      required: true,
    },
    counter: String,
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    gst: {
      type: Number,
      required: true,
      default: 0,
    },
    serviceCharge: {
      type: Number,
      required: true,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    tokenNumber: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Cooking', 'Ready', 'Delivered', 'Cancelled', 'Rejected'],
      default: 'Pending',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Refunded', 'Failed'],
      default: 'Pending',
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
    },
    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
    },
    timeline: {
      type: timelineSchema,
      default: () => ({ pendingAt: new Date() }),
    },
  },
  { timestamps: true },
);

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

module.exports = Order;
