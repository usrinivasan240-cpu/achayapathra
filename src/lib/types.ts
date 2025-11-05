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

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  points: number;
  address: string;
  phone: string;
};

export type Donation = {
  id: string;
  foodName: string;
  status: 'Available' | 'Claimed' | 'Delivered' | 'Pending';
  quantity: string;
  location: string;
  expires: Timestamp;
  donor: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
  };
  donorId: string;
  lat?: number;
  lng?: number;
};
