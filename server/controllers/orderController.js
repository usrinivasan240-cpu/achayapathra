const QRCode = require('qrcode');
const asyncHandler = require('../utils/asyncHandler');
const generateTokenNumber = require('../utils/generateTokenNumber');
const calculateBill = require('../utils/calculateBill');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { emitOrderUpdate, emitOrderEvent } = require('../services/socketService');
const { notifyUser } = require('../services/notificationService');

const TIMELINE_FIELDS = {
  Pending: 'pendingAt',
  Cooking: 'cookingAt',
  Ready: 'readyAt',
  Delivered: 'deliveredAt',
  Cancelled: 'cancelledAt',
  Rejected: 'cancelledAt',
};

const createOrder = asyncHandler(async (req, res) => {
  const { items, canteen, counter, couponCode } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Order items are required' });
  }

  if (!canteen) {
    return res.status(400).json({ success: false, message: 'Canteen is required to place an order' });
  }

  const menuItemIds = items.map((item) => item.itemId);
  const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } });

  if (menuItems.length !== menuItemIds.length) {
    return res.status(400).json({ success: false, message: 'Some menu items are invalid or unavailable' });
  }

  const orderItems = items.map((item) => {
    const menuItem = menuItems.find((menu) => menu._id.toString() === item.itemId);
    if (!menuItem || !menuItem.isAvailable) {
      throw new Error(`Menu item ${item.itemId} is not available`);
    }
    return {
      item: menuItem._id,
      name: menuItem.name,
      qty: Number(item.qty || 1),
      price: menuItem.price,
      imageUrl: menuItem.imageUrl,
    };
  });

  let couponDoc = null;
  if (couponCode) {
    couponDoc = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (!couponDoc || !couponDoc.isValidNow()) {
      couponDoc = null;
    } else {
      couponDoc.usageCount += 1;
      await couponDoc.save();
    }
  }

  const bill = calculateBill(
    orderItems,
    couponDoc
      ? {
          type: couponDoc.type,
          value: couponDoc.value,
          maxDiscount: couponDoc.maxDiscount,
        }
      : undefined,
  );

  const tokenNumber = generateTokenNumber();

  const order = await Order.create({
    user: req.user.id,
    canteen,
    counter,
    items: orderItems,
    subtotal: bill.subtotal,
    gst: bill.gst,
    serviceCharge: bill.serviceCharge,
    discount: bill.discount,
    totalAmount: bill.total,
    coupon: couponDoc?._id,
    tokenNumber,
    paymentStatus: 'Paid',
  });

  await User.findByIdAndUpdate(req.user.id, {
    $set: { lastOrderAt: new Date() },
    $addToSet: { favorites: orderItems.map((item) => item.item) },
  });

  await ActivityLog.create({
    actor: req.user.id,
    actorModel: 'User',
    action: 'order.create',
    context: { orderId: order._id, canteen },
  });

  emitOrderEvent('orders:new', order, [`canteen:${order.canteen}`]);
  emitOrderEvent('orders:new', order, [`user:${req.user.id.toString()}`]);

  return res.status(201).json({ success: true, order, bill });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, paymentStatus } = req.body;

  const order = await Order.findById(id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  if (status) {
    order.status = status;
    const timelineField = TIMELINE_FIELDS[status];
    if (timelineField) {
      order.timeline[timelineField] = new Date();
    }
  }

  if (paymentStatus) {
    order.paymentStatus = paymentStatus;
  }

  await order.save();

  await ActivityLog.create({
    actor: req.user.id,
    actorModel: 'Admin',
    action: 'order.updateStatus',
    context: { orderId: order._id, status, paymentStatus },
  });

  emitOrderUpdate(order);

  if (status === 'Ready') {
    notifyUser(order.user, {
      type: 'order-ready',
      title: 'Your order is ready! 🎉',
      body: `Token ${order.tokenNumber} is ready for pickup`,
      orderId: order._id,
    });
  }

  return res.json({ success: true, order });
});

const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findById(id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  if (order.user.toString() !== req.user.id.toString()) {
    return res.status(403).json({ success: false, message: 'You cannot cancel this order' });
  }

  if (['Ready', 'Delivered'].includes(order.status)) {
    return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
  }

  order.status = 'Cancelled';
  order.paymentStatus = 'Refunded';
  order.timeline.cancelledAt = new Date();
  await order.save();

  emitOrderUpdate(order);

  return res.json({ success: true, order });
});

const listOrders = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.query.canteen) {
    filters.canteen = req.query.canteen;
  } else if (req.user?.canteen) {
    filters.canteen = req.user.canteen;
  }
  if (req.query.status) {
    filters.status = req.query.status;
  }

  const orders = await Order.find(filters)
    .populate('user', 'name email phone')
    .populate('items.item', 'name imageUrl')
    .sort({ createdAt: -1 })
    .limit(Number(req.query.limit) || 100);

  return res.json({ success: true, orders });
});

const listMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id })
    .populate('items.item', 'name imageUrl price')
    .sort({ createdAt: -1 });

  return res.json({ success: true, orders });
});

const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const order = await Order.findById(id).populate('items.item', 'name imageUrl price');

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  if (req.user.role === 'student' && order.user.toString() !== req.user.id.toString()) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  return res.json({ success: true, order });
});

const getTokenQRCode = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const order = await Order.findById(id);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const dataUrl = await QRCode.toDataURL(order.tokenNumber, { margin: 2, width: 256 });
  return res.json({ success: true, qr: dataUrl, tokenNumber: order.tokenNumber });
});

module.exports = {
  createOrder,
  updateOrderStatus,
  cancelOrder,
  listOrders,
  listMyOrders,
  getOrderById,
  getTokenQRCode,
};
