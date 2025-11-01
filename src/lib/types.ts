
import { Timestamp } from 'firebase/firestore';

export type Donation = {
  id: string;
  foodName: string;
  foodType: string;
  quantity: string;
  status: 'Available' | 'Claimed' | 'Delivered' | 'Pending';
  expires: Date | Timestamp;
  location: string;
  description: string;
  donorId: string;
  donorName: string;
  donorAvatarUrl: string;
  lat: number;
  lng: number;
};

export type User = {
  id: string;
  name:string;
  email: string;
  points: number;
  avatarUrl: string;
  phone: string;
  address: string;
};
