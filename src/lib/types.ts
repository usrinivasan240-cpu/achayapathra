export type UserRole = 'student' | 'admin' | 'super-admin';

export interface NotificationPreferences {
  pushReady: boolean;
  emailUpdates: boolean;
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  photoURL: string;
  phone: string;
  address: string;
  role: UserRole;
  canteenId?: string | null;
  counterId?: string | null;
  loyaltyPoints: number;
  favorites: string[];
  notificationPreferences: NotificationPreferences;
  verified?: boolean;
}

export interface CanteenCounter {
  id: string;
  name: string;
  description?: string;
}

export interface Canteen {
  id: string;
  name: string;
  location: string;
  description?: string;
  counters: CanteenCounter[];
  isActive: boolean;
  totalRevenue: number;
  totalOrders: number;
}

export type MenuCategory =
  | 'Breakfast'
  | 'Lunch'
  | 'Snacks'
  | 'Beverages'
  | 'Combos'
  | 'Desserts';

export type FoodType = 'Veg' | 'Non-Veg';

export interface MenuItem {
  id: string;
  canteenId: string;
  counterId: string;
  name: string;
  category: MenuCategory;
  foodType: FoodType;
  price: number;
  imageUrl: string;
  ingredients: string[];
  description: string;
  isAvailable: boolean;
  rating: number;
  ratingCount: number;
  tags: string[];
}

export interface Coupon {
  code: string;
  description: string;
  discountType: 'percentage' | 'flat';
  value: number;
  isActive: boolean;
  minOrderValue?: number;
  maxDiscountAmount?: number;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  qty: number;
  price: number;
}

export type OrderStatus =
  | 'Pending'
  | 'Cooking'
  | 'Ready'
  | 'Delivered'
  | 'Cancelled'
  | 'Rejected';

export type PaymentStatus = 'Pending' | 'Paid' | 'Refunded';

export interface Order {
  id: string;
  userId: string;
  userName: string;
  canteenId: string;
  counterId: string;
  items: OrderItem[];
  subtotal: number;
  gst: number;
  serviceCharge: number;
  discount: number;
  totalAmount: number;
  couponCode?: string | null;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  tokenNumber: string;
  paymentMethod: 'UPI' | 'Card' | 'Wallet' | 'Cash';
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface Review {
  id: string;
  orderId: string;
  menuItemId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface FeedbackEntry {
  id: string;
  userId: string;
  message: string;
  mood: 'happy' | 'neutral' | 'unhappy';
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  actor: {
    id: string;
    name: string;
    role: UserRole;
  };
  action: string;
  metadata?: Record<string, unknown>;
}

export interface OfferBanner {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  couponCode?: string;
  highlightColor?: string;
}

export interface CartItem {
  menuItemId: string;
  qty: number;
  notes?: string;
}

export interface DailySalesSummary {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface AdminRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  canteenId: string;
  counterId?: string | null;
  isActive: boolean;
  createdAt: string;
}
