const asyncHandler = require('../utils/asyncHandler');
const Order = require('../models/Order');

const getDateRange = (dateString) => {
  const date = dateString ? new Date(dateString) : new Date();
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const dailySalesReport = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const { start, end } = getDateRange(date);

  const filters = {
    createdAt: { $gte: start, $lte: end },
    paymentStatus: 'Paid',
  };

  if (req.query.canteen) {
    filters.canteen = req.query.canteen;
  }

  const orders = await Order.find(filters);
  const summary = orders.reduce(
    (acc, order) => {
      acc.orderCount += 1;
      acc.totalRevenue += order.totalAmount;
      acc.totalGst += order.gst;
      acc.totalServiceCharge += order.serviceCharge;
      return acc;
    },
    {
      orderCount: 0,
      totalRevenue: 0,
      totalGst: 0,
      totalServiceCharge: 0,
    },
  );

  return res.json({ success: true, summary, orders });
});

const platformRevenue = asyncHandler(async (req, res) => {
  const pipeline = [
    {
      $match: { paymentStatus: 'Paid' },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' },
        orderCount: { $sum: 1 },
      },
    },
  ];

  const [result] = await Order.aggregate(pipeline);

  return res.json({
    success: true,
    totalRevenue: result?.totalRevenue || 0,
    orderCount: result?.orderCount || 0,
  });
});

module.exports = {
  dailySalesReport,
  platformRevenue,
};
