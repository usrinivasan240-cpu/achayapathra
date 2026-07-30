import { Timestamp } from 'firebase/firestore';

export type UserRole = 'donor' | 'receiver' | 'volunteer' | 'ngo' | 'admin';

export type UserProfile = {
  id: string;
  displayName: string;
  email: string;
  photoURL: string;
  points: number;
  address: string;
  phone: string;
  role: UserRole;
};

export type DonationStatus = 'Pending' | 'Available' | 'Claimed' | 'Picked Up' | 'Delivered';

export type DemandUrgency = 'Low' | 'Medium' | 'High' | 'Critical';

export type DemandRequest = {
  id: string;
  ngoId: string;
  ngoName: string;
  foodType: string;
  requiredQuantity: string;
  urgency: DemandUrgency;
  minShelfLifeHours: number;
  requiredBefore: Timestamp;
  location: string;
  status: 'Active' | 'Fulfilled' | 'Cancelled';
  createdAt?: Timestamp;
};

export type Donation = {
  id: string;
  foodName: string;
  foodType?: string;
  status: DonationStatus;
  quantity: string;
  quantity_kg?: number;
  location: string;
  expiryTime: Timestamp;
  cookedTime?: Timestamp;
  createdAt?: Timestamp;
  description?: string;
  tags?: string[];
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
  trackingId: string;
  claimedBy?: string;
  ai_matches?: {
    demandId: string;
    score: number;
    reasoning: string;
  }[];
  matching_metadata?: {
    matched_demands: string[];
    expansion_level: number;
  };
  ai_matching_score?: number; // Calculated dynamic score
};

export type HungerZone = {
  id: string;
  zone_name: string;
  geo_location: { lat: number; lng: number };
  weekly_request_count: number;
  avg_meals_required: number;
  last_30_days_growth_rate: number;
  hunger_risk_score: number; // 0-100
};

export type SystemSettings = {
  emergencyMode: boolean;
  lastUpdated: Timestamp;
};
