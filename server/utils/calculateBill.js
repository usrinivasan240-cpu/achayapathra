const SERVICE_CHARGE_PER_ITEM = 2;
const GST_RATE = 0.05;

const calculateBill = (items, coupon) => {
  if (!Array.isArray(items) || items.length === 0) {
    return {
      subtotal: 0,
      serviceCharge: 0,
      gst: 0,
      discount: 0,
      total: 0,
    };
  }

  const subtotal = items.reduce(
    (acc, item) => acc + Number(item.price || 0) * Number(item.qty || 0),
    0,
  );
  const quantity = items.reduce((acc, item) => acc + Number(item.qty || 0), 0);
  const serviceCharge = quantity * SERVICE_CHARGE_PER_ITEM;
  const gst = subtotal * GST_RATE;

  let discount = 0;
  if (coupon) {
    if (coupon.type === 'percentage') {
      discount = (subtotal * Number(coupon.value || 0)) / 100;
    } else if (coupon.type === 'flat') {
      discount = Number(coupon.value || 0);
    }

    if (coupon.maxDiscount) {
      discount = Math.min(discount, Number(coupon.maxDiscount));
    }
  }

  const total = Math.max(subtotal + serviceCharge + gst - discount, 0);

  return {
    subtotal,
    serviceCharge,
    gst,
    discount,
    total,
  };
};

module.exports = calculateBill;
