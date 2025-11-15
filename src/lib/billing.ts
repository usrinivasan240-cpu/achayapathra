export const SERVICE_CHARGE_PER_ITEM = 2;
export const GST_RATE = 0.05;

type CouponInput = {
  type: 'percentage' | 'flat';
  value: number;
  maxDiscount?: number;
};

export interface BillLineItem {
  price: number;
  qty: number;
}

export const calculateBill = (items: BillLineItem[], coupon?: CouponInput) => {
  if (!Array.isArray(items) || items.length === 0) {
    return {
      subtotal: 0,
      serviceCharge: 0,
      gst: 0,
      discount: 0,
      total: 0,
    };
  }

  const subtotal = items.reduce((acc, item) => acc + (item.price || 0) * (item.qty || 0), 0);
  const quantity = items.reduce((acc, item) => acc + (item.qty || 0), 0);
  const serviceCharge = quantity * SERVICE_CHARGE_PER_ITEM;
  const gst = subtotal * GST_RATE;

  let discount = 0;
  if (coupon) {
    discount = coupon.type === 'percentage' ? (subtotal * coupon.value) / 100 : coupon.value;
    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
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
