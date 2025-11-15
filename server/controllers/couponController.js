const asyncHandler = require('../utils/asyncHandler');
const Coupon = require('../models/Coupon');

const validateCoupon = asyncHandler(async (req, res) => {
  const { code, canteen } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: 'Coupon code is required' });
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true, canteen });
  if (!coupon) {
    return res.status(404).json({ success: false, message: 'Coupon not found' });
  }

  if (!coupon.isValidNow()) {
    return res.status(400).json({ success: false, message: 'Coupon is not valid at this time' });
  }

  return res.json({
    success: true,
    coupon: {
      id: coupon._id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      maxDiscount: coupon.maxDiscount,
      description: coupon.description,
    },
  });
});

module.exports = {
  validateCoupon,
};
