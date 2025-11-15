import mongoose, { Schema, Document } from 'mongoose';

export interface ICanteen extends Document {
  name: string;
  location: string;
  adminId: mongoose.Types.ObjectId;
  counters: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CanteenSchema = new Schema<ICanteen>(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    counters: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Canteen || mongoose.model<ICanteen>('Canteen', CanteenSchema);
