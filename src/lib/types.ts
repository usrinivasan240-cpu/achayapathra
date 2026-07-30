import { Timestamp } from 'firebase/firestore';

// ============================================
// CORE USER TYPES
// ============================================

export type UserRole = 'donor' | 'receiver' | 'volunteer' | 'ngo' | 'admin' | 'corporate' | 'government';

export type UserProfile = {
  id: string;
  displayName: string;
  email: string;
  photoURL: string;
  points: number;
  address: string;
  phone: string;
  role: UserRole;
  verified?: boolean;
  createdAt?: string;
  badges?: string[];
  achievements?: string[];
  totalDonations?: number;
  totalDeliveries?: number;
  totalVolunteerHours?: number;
  streak?: number;
  level?: number;
  xp?: number;
};

// ============================================
// DONATION TYPES
// ============================================

export type DonationStatus = 'Pending' | 'Available' | 'Claimed' | 'Picked Up' | 'Delivered' | 'Expired' | 'Redirected' | 'Biogas' | 'Fertilizer';

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
  volunteerId?: string;
  ngoId?: string;
  ai_matches?: {
    demandId: string;
    score: number;
    reasoning: string;
  }[];
  matching_metadata?: {
    matched_demands: string[];
    expansion_level: number;
  };
  ai_matching_score?: number;
  food_safety?: FoodSafetyResult;
  delivery_timeline?: DeliveryEvent[];
  carbon_saved_kg?: number;
  circular_economy?: CircularEconomyData;
  gps_tracking?: GPSPoint[];
  photo_verification?: string[];
  qr_code?: string;
  corporate_id?: string;
  government_ward?: string;
};

export type DeliveryEvent = {
  timestamp: Timestamp;
  event: 'created' | 'matched' | 'accepted' | 'picked_up' | 'in_transit' | 'delivered' | 'verified';
  by_user?: string;
  location?: string;
  lat?: number;
  lng?: number;
  notes?: string;
};

export type GPSPoint = {
  lat: number;
  lng: number;
  timestamp: Timestamp;
  speed?: number;
};

// ============================================
// DEMAND TYPES
// ============================================

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
  fulfilledBy?: string;
  fulfilledDonationId?: string;
};

// ============================================
// NGO TYPES
// ============================================

export type NGODetails = {
  id: string;
  userId: string;
  name: string;
  registrationNumber: string;
  type: 'shelter' | 'kitchen' | 'food_bank' | 'community_center' | 'temple' | 'mosque' | 'church';
  capacity: number;
  currentInventory: number;
  storageType: 'ambient' | 'refrigerated' | 'frozen' | 'mixed';
  operatingHours: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  lat?: number;
  lng?: number;
  verified: boolean;
  verificationDate?: Timestamp;
  rating: number;
  totalServed: number;
  totalReceived: number;
  certificateUrl?: string;
  photos?: string[];
  operatingDays?: string[];
  specialRequirements?: string[];
};

// ============================================
// CORPORATE TYPES
// ============================================

export type CorporateProfile = {
  id: string;
  userId: string;
  companyName: string;
  industry: string;
  registrationNumber: string;
  csrBudget: number;
  csrSpent: number;
  esgScore: number;
  branches: CorporateBranch[];
  employeeCount: number;
  activeEmployees: number;
  totalDonations: number;
  totalMealsServed: number;
  carbonOffsetKg: number;
  certificates: Certificate[];
  logoUrl?: string;
  website?: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  verified: boolean;
};

export type CorporateBranch = {
  id: string;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
  city: string;
  state: string;
  pincode: string;
  managerName: string;
  managerPhone: string;
  employeeCount: number;
  totalDonations: number;
  isActive: boolean;
};

export type CSRActivity = {
  id: string;
  corporateId: string;
  branchId?: string;
  activity: string;
  description: string;
  amount?: number;
  mealsServed: number;
  date: Timestamp;
  category: 'food_donation' | 'volunteer' | 'infrastructure' | 'technology' | 'awareness';
};

// ============================================
// GOVERNMENT TYPES
// ============================================

export type GovernmentProfile = {
  id: string;
  userId: string;
  department: string;
  designation: string;
  district: string;
  state: string;
  jurisdictionLevel: 'state' | 'district' | 'taluk' | 'ward' | 'municipality';
  jurisdictionName: string;
  officialId: string;
  phone: string;
  email: string;
  verified: boolean;
};

export type District = {
  id: string;
  name: string;
  state: string;
  population: number;
  area_sq_km: number;
  totalNGOs: number;
  totalDonations: number;
  totalMealsServed: number;
  hungerRiskScore: number;
  foodWasteKg: number;
  carbonSavedKg: number;
  biogasCentres: number;
  fertilizerCentres: number;
  municipalities: string[];
  taluks: string[];
};

export type Ward = {
  id: string;
  name: string;
  districtId: string;
  taluk: string;
  municipality: string;
  population: number;
  totalDonations: number;
  totalNGOs: number;
  hungerRiskScore: number;
  foodWasteKg: number;
  weeklyGrowthRate: number;
  lat?: number;
  lng?: number;
};

// ============================================
// CIRCULAR ECONOMY TYPES
// ============================================

export type CircularEconomyData = {
  stage: 'donation' | 'safety_check' | 'matched' | 'in_transit' | 'delivered' | 'consumed' | 'unsuitable' | 'biogas' | 'fertilizer';
  redirectedTo?: string;
  redirectType?: 'biogas_plant' | 'fertilizer_centre' | 'composting' | 'animal_feed';
  energyGeneratedKwh?: number;
  compostProducedKg?: number;
  carbonOffsetKg?: number;
  timestamp?: Timestamp;
};

export type BiogasPlant = {
  id: string;
  name: string;
  address: string;
  district: string;
  lat?: number;
  lng?: number;
  capacity: number;
  currentInput: number;
  energyOutputKwh: number;
  operational: boolean;
  contactPerson: string;
  phone: string;
};

export type FertilizerCentre = {
  id: string;
  name: string;
  address: string;
  district: string;
  lat?: number;
  lng?: number;
  capacity: number;
  currentInput: number;
  compostOutputKg: number;
  operational: boolean;
  contactPerson: string;
  phone: string;
};

// ============================================
// AI MODULE TYPES
// ============================================

export type FoodSafetyResult = {
  isSafe: boolean;
  foodName: string;
  confidence: number;
  reason: string;
  description: string;
  estimatedShelfLifeHours: number;
  temperatureRequirement?: 'room' | 'cold' | 'frozen';
  allergens?: string[];
  safetyScore: number;
};

export type SmartMatchResult = {
  donationId: string;
  ngoId: string;
  matchScore: number;
  eta: number;
  confidence: number;
  route?: string;
  distance: number;
  factors: MatchFactors;
};

export type MatchFactors = {
  distanceScore: number;
  expiryScore: number;
  quantityScore: number;
  foodTypeScore: number;
  volunteerScore: number;
  trafficScore: number;
  capacityScore: number;
  demandScore: number;
  inventoryScore: number;
};

export type DemandPrediction = {
  zoneId: string;
  zoneName: string;
  predictedDemand: number;
  currentDemand: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
  factors: string[];
  date: string;
};

export type CarbonCalculation = {
  donationId?: string;
  totalDonations: number;
  totalKgRescued: number;
  co2SavedKg: number;
  waterSavedLiters: number;
  mealsEquivalent: number;
  treesEquivalent: number;
  energySavedKwh: number;
  methaneAvoidedKg: number;
};

export type EmergencyEvent = {
  id: string;
  type: 'flood' | 'cyclone' | 'drought' | 'earthquake' | 'pandemic' | 'fire' | 'industrial';
  title: string;
  description: string;
  district: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'contained' | 'resolved';
  startDate: Timestamp;
  endDate?: Timestamp;
  affectedPopulation: number;
  mealsRequired: number;
  mealsDelivered: number;
  activeVolunteers: number;
  activeNGOs: number;
  lat?: number;
  lng?: number;
  radius: number;
};

export type Notification = {
  id: string;
  userId: string;
  type: 'donation' | 'match' | 'delivery' | 'emergency' | 'achievement' | 'system' | 'certificate';
  title: string;
  message: string;
  read: boolean;
  createdAt: Timestamp;
  actionUrl?: string;
  icon?: string;
};

// ============================================
// CERTIFICATE TYPES
// ============================================

export type Certificate = {
  id: string;
  userId: string;
  userName: string;
  type: 'donation' | 'volunteer' | 'ngo' | 'corporate' | 'government' | 'achievement' | 'carbon';
  title: string;
  description: string;
  issuedDate: Timestamp;
  issuedBy: string;
  qrCode: string;
  verificationUrl: string;
  validUntil?: Timestamp;
  metadata?: Record<string, any>;
};

// ============================================
// REWARD & GAMIFICATION TYPES
// ============================================

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'donation' | 'volunteer' | 'ngo' | 'corporate' | 'streak' | 'special';
  requirement: string;
  xpReward: number;
};

export type Achievement = {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: Timestamp;
  progress?: number;
  maxProgress?: number;
};

export type Reward = {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  category: 'discount' | 'voucher' | 'gift' | 'recognition';
  image?: string;
  partner?: string;
  validUntil?: Timestamp;
  stock: number;
};

// ============================================
// COMPLAINT TYPES
// ============================================

export type Complaint = {
  id: string;
  userId: string;
  userName: string;
  type: 'food_quality' | 'delivery' | 'service' | 'safety' | 'other';
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Timestamp;
  resolvedAt?: Timestamp;
  assignedTo?: string;
  response?: string;
  donationId?: string;
  photos?: string[];
};

// ============================================
// HUNGER ZONE TYPES
// ============================================

export type HungerZone = {
  id: string;
  zone_name: string;
  geo_location: { lat: number; lng: number };
  weekly_request_count: number;
  avg_meals_required: number;
  last_30_days_growth_rate: number;
  hunger_risk_score: number;
  population?: number;
  povertyRate?: number;
  foodDesert?: boolean;
};

// ============================================
// SYSTEM TYPES
// ============================================

export type SystemSettings = {
  emergencyMode: boolean;
  lastUpdated: Timestamp;
  maintenanceMode?: boolean;
  announcementText?: string;
  maxDonationPerDay?: number;
  autoMatchEnabled?: boolean;
  notificationsEnabled?: boolean;
};

export type AuditLog = {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  timestamp: Timestamp;
  details?: Record<string, any>;
  ipAddress?: string;
};

// ============================================
// ANALYTICS TYPES
// ============================================

export type PlatformAnalytics = {
  totalUsers: number;
  totalDonations: number;
  totalNGOs: number;
  totalVolunteers: number;
  totalCorporates: number;
  totalMealsServed: number;
  totalKgRescued: number;
  totalCO2Saved: number;
  totalBiogasRedirected: number;
  totalFertilizerRedirected: number;
  avgMatchTime: number;
  avgDeliveryTime: number;
  matchSuccessRate: number;
  dailyActiveUsers: number;
  monthlyGrowth: number;
  districtWise: DistrictWiseAnalytics[];
  monthlyTrends: MonthlyTrend[];
};

export type DistrictWiseAnalytics = {
  district: string;
  donations: number;
  mealsServed: number;
  ngos: number;
  volunteers: number;
  carbonSaved: number;
  hungerRiskScore: number;
};

export type MonthlyTrend = {
  month: string;
  donations: number;
  meals: number;
  users: number;
  carbon: number;
};
