import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  itemId: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  gst: number;
  serviceCharge: number;
  discount: number;
  totalAmount: number;
  tokenNumber: string;
  status: 'Pending' | 'Cooking' | 'Ready' | 'Delivered' | 'Cancelled';
  canteenId: mongoose.Types.ObjectId;
  couponCode?: string;
  paymentStatus: 'Pending' | 'Paid';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        itemId: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true },
    gst: { type: Number, required: true },
    serviceCharge: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    tokenNumber: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['Pending', 'Cooking', 'Ready', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    canteenId: { type: Schema.Types.ObjectId, ref: 'Canteen', required: true },
    couponCode: { type: String },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid'],
      default: 'Pending',
    },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
