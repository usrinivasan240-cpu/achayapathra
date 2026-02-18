
import { Timestamp } from 'firebase/firestore';

export type UserProfile = {
  id: string;
  displayName: string;
  email: string;
  photoURL: string;
  points: number;
  address: string;
  phone: string;
  role: string;
};

export type Donation = {
  id: string;
  foodName: string;
  foodType?: string;
  status: 'Available' | 'Claimed' | 'Delivered' | 'Pending';
  quantity: string;
  location: string;
  expiryTime: Timestamp;
  cookedTime?: Timestamp;
  description?: string;
  donor: {
    id: string;
    name: string;
    email: string;
    photoURL: string;
  };
  donorId: string;
  lat?: number;
  lng?: number;
  imageURL: string;
  aiImageAnalysis?: {
    foodName: string;
    isSafe: boolean;
    reason: string;
    description: string;
  };
  claimedBy?: string;
};
