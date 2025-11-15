import mongoose, { Schema, Document } from 'mongoose';

export interface IMenuItem extends Document {
  name: string;
  price: number;
  description?: string;
  category: 'Breakfast' | 'Lunch' | 'Snacks' | 'Beverages';
  isVeg: boolean;
  ingredients?: string[];
  image?: string;
  isAvailable: boolean;
  rating: number;
  reviews?: string[];
  canteenId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    category: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Snacks', 'Beverages'],
      required: true,
    },
    isVeg: { type: Boolean, default: true },
    ingredients: { type: [String] },
    image: { type: String },
    isAvailable: { type: Boolean, default: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: { type: [String] },
    canteenId: { type: Schema.Types.ObjectId, ref: 'Canteen', required: true },
  },
  { timestamps: true }
);

export default mongoose.models.MenuItem || mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
