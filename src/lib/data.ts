import { Donation, UserProfile, HungerZone, NGODetails, CorporateProfile, GovernmentProfile, District, Ward, EmergencyEvent, Certificate, Badge, Reward, Complaint, CircularEconomyData, BiogasPlant, FertilizerCentre, Notification, DemandPrediction, AuditLog } from './types';
import { Timestamp } from 'firebase/firestore';

// ============================================
// HELPER FUNCTIONS
// ============================================

const randomDate = (daysAgo: number, daysForward: number = 0): Timestamp => {
  const now = Date.now();
  const offset = (Math.random() * daysAgo - daysForward) * 24 * 60 * 60 * 1000;
  return Timestamp.fromDate(new Date(now - Math.abs(offset) + (daysForward > 0 ? offset : 0)));
};

const futureDate = (hoursAhead: number): Timestamp => {
  return Timestamp.fromDate(new Date(Date.now() + hoursAhead * 60 * 60 * 1000));
};

const pastDate = (hoursAgo: number): Timestamp => {
  return Timestamp.fromDate(new Date(Date.now() - hoursAgo * 60 * 60 * 1000));
};

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min: number, max: number) => Math.random() * (max - min) + min;

// ============================================
// CONSTANTS
// ============================================

const TN_DISTRICTS = [
  'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem',
  'Tirunelveli', 'Erode', 'Vellore', 'Thoothukudi', 'Dindigul',
  'Thanjavur', 'Ramanathapuram', 'Krishnagiri', 'Namakkal', 'Karur',
  'Nilgiris', 'Kancheepuram', 'Virudhunagar', 'Theni', 'Dharmapuri',
  'Perambalur', 'Ariyalur', 'Cuddalore', 'Nagapattinam', 'Tiruvallur',
  'Kanyakumari', 'Sivaganga', 'Tiruvannamalai', 'Villupuram', 'Pudukkottai'
];

const TN_CITIES = [
  'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem',
  'Tirunelveli', 'Erode', 'Vellore', 'Thoothukudi', 'Dindigul',
  'Thanjavur', 'Ramanathapuram', 'Krishnagiri', 'Namakkal', 'Karur',
  'Ooty', 'Kancheepuram', 'Virudhunagar', 'Theni', 'Dharmapuri',
  'Ambur', 'Hosur', 'Nagercoil', 'Tuticorin', 'Pollachi',
  'Mettupalayam', 'Sivakasi', 'Arakkonam', 'Gingee', 'Vriddhachalam'
];

const FOOD_TYPES = [
  'Cooked Meals', 'Rice & Curry', 'Sambar Rice', 'Idli Vada', 'Biryani',
  'Chapati & Curry', 'Pongal', 'Lemon Rice', 'Curd Rice', 'Tiffin',
  'Fresh Vegetables', 'Fruits', 'Milk & Dairy', 'Bread & Bakery',
  'Dry Ration', 'Canned Goods', 'Snacks', 'Baby Food', 'Packaged Food',
  'Protein Bars', 'Juices', 'Water Bottles'
];

const FOOD_NAMES = [
  'Sambar Rice', 'Idli Vada', 'Biryani', 'Chapati Dal', 'Pongal',
  'Lemon Rice', 'Curd Rice', 'Meals (Full)', 'Vegetable Curry', 'Rasam Rice',
  'Paneer Curry', 'Dal Fry', 'Egg Curry', 'Fish Curry', 'Chicken Curry',
  'Pasta', 'Noodles', 'Fried Rice', 'Soup', 'Salad',
  'Bread Loaves', 'Milk Packets', 'Fresh Fruits', 'Vegetable Bundle',
  'Protein Bars', 'Juice Packets', 'Water Bottles', 'Snack Packs',
  'Baby Cerelac', 'Powdered Milk', 'Toor Dal', 'Rice 10kg', 'Wheat Flour',
  'Sugar Packet', 'Salt Packet', 'Cooking Oil', 'Turmeric Powder'
];

const NGO_NAMES = [
  'Hope Foundation', 'Annam Charity Trust', 'Feed The Hungry TN', 'Anna Daanam',
  'Karuna Trust', 'Sathya Sai Organization', 'Rotary Food Bank', 'Lions Club Food Drive',
  'Akshaya Patra TN', 'Feeding India Chennai', 'No Food Waste Coimbatore', 'Green Volunteers Madurai',
  'People Foundation', 'World Vision TN', 'Goonj Trichy', 'Hara Food Bank Salem',
  'Dhanvantari Health Trust', 'Isai Ambalam Education', 'Arunodhaya Child Care', 'Banyan Mental Health',
  'Hand in Hand TN', 'SEWA Chennai', 'Pratham Education', 'CRY Tamil Nadu',
  'Save the Children TN', 'Oxfam India TN', 'ActionAid TN', 'Concern India TN',
  'Give India Partners', 'Milaap Foundation', 'Ketto Food', 'ImpactGuru TN',
  'Rang De Social', 'Voting India', 'Nanhi Kali TN', 'Teach For India Chennai',
  'Magic Bus TN', 'ChildFund India TN', 'Plan India TN', 'CARE India TN',
  'Oxfam TN', 'World Food Programme TN', 'UNICEF India TN', 'WFP Chennai',
  'UNDP Tamil Nadu', 'FAO India TN', 'WHO India TN', 'Red Cross TN',
  'Indian Red Cross Chennai', 'St John Ambulance TN'
];

const CORPORATE_NAMES = [
  'TCS', 'Infosys', 'Wipro', 'HCL Technologies', 'Tech Mahindra',
  'Reliance Industries', 'Tata Motors', 'L&T', 'Adani Group', 'ITC Limited',
  'Mahindra Group', 'Godrej', 'Bajaj Auto', 'Hero MotoCorp', 'Maruti Suzuki',
  'Samsung India', 'Amazon India', 'Google India', 'Microsoft India', 'Flipkart',
  'Zoho Corporation', 'Freshworks', 'Razorpay', 'PhonePe', 'Swiggy',
  'Zomato', 'Ola Electric', 'BYJU\'S', 'Unacademy', 'Dream11',
  'Titan Company', 'Asian Paints', 'Nestle India', 'Britannia', 'Dabur',
  'HUL', 'P&G India', 'Colgate Palmolive', 'PepsiCo India', 'Coca Cola India',
  'Bosch India', 'Siemens India', 'ABB India', 'Schneider Electric India', 'Honeywell India',
  'Airbus India', 'Boeing India', 'Lockheed Martin India', 'L3Harris India', 'Raytheon India'
];

const VOLUNTEER_FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Arjun', 'Sai', 'Rohan', 'Vihaan', 'Krishna',
  'Diya', 'Ananya', 'Priya', 'Kavya', 'Ishita', 'Nisha', 'Meera', 'Riya',
  'Karthik', 'Suresh', 'Rajesh', 'Mohan', 'Anitha', 'Lakshmi', 'Suganya', 'Deepa',
  'Prakash', 'Venkatesh', 'Ganesh', 'Murugan', 'Saravanan', 'Kumar',
  'Divya', 'Swathi', 'Revathi', 'Kavitha', 'Latha', 'Sumathi',
  'Gokul', 'Harish', 'Jawahar', 'Lokesh', 'Manikandan', 'Naveen',
  'Amala', 'Bhavani', 'Chitra', 'Devi', 'Ezhil', 'Fathima'
];

const VOLUNTEER_LAST_NAMES = [
  'Krishnan', 'Kumar', 'Rajan', 'Muthu', 'Sundaram', 'Subramanian',
  'Selvam', 'Palani', 'Murugan', 'Ganesan', 'Raman', 'Iyer',
  'Nair', 'Pillai', 'Gounder', 'Thevar', 'Chettiar', 'Nadar',
  'Reddy', 'Naidu', 'Rao', 'Sharma', 'Singh', 'Gupta',
  'Bose', 'Das', 'Mukherjee', 'Banerjee', 'Sen', 'Ghosh'
];

const LANDMARKS = [
  'Near Central Railway Station', 'Opposite City Hospital', 'Behind Municipal Office',
  'Near Anna University', 'Opposite Bus Stand', 'Near Temple Street',
  'Behind Market Road', 'Near Park', 'Opposite School', 'Near Lake',
  'Behind Mall', 'Near Highway Junction', 'Opposite Police Station',
  'Near Fire Station', 'Behind Post Office', 'Near Bank',
  'Opposite ATM', 'Near Pharmacy', 'Behind Cinema Hall', 'Near Stadium'
];

const STREET_NAMES = [
  'Anna Salai', 'Mount Road', 'Gandhi Road', 'Nehru Street', 'Patel Road',
  'Station Road', 'Market Road', 'Temple Road', 'Beach Road', 'Lake Road',
  'Hill Road', 'Garden Road', 'Lake View Road', 'Park Street', 'MG Road',
  'BR Ambedkar Road', 'Rajaji Road', 'Kamarajar Road', 'EV Ramasamy Road',
  'Subbulakshmi Road', 'Bharathiar Road', 'Kamaraj Salai', 'EvK Sampath Salai'
];

// ============================================
// MOCK USERS
// ============================================

const generateUsers = (): UserProfile[] => {
  const users: UserProfile[] = [];

  // Super Admin
  users.push({
    id: 'admin-001',
    displayName: 'Subathra Srinivasan',
    email: 'usrinivasan240@gmail.com',
    photoURL: 'https://picsum.photos/seed/admin/100/100',
    points: 15000,
    address: '101 Gandhi Road, Trichy',
    phone: '9843345678',
    role: 'admin',
    verified: true,
    badges: ['super_admin', 'founding_member', 'hunger_hero', 'million_meals'],
    achievements: ['ach-001', 'ach-002', 'ach-003'],
    totalDonations: 450,
    totalDeliveries: 0,
    totalVolunteerHours: 2000,
    streak: 365,
    level: 50,
    xp: 150000,
  });

  // Donors (50)
  for (let i = 0; i < 50; i++) {
    const firstName = pick(VOLUNTEER_FIRST_NAMES);
    const lastName = pick(VOLUNTEER_LAST_NAMES);
    const city = pick(TN_CITIES);
    const street = pick(STREET_NAMES);
    users.push({
      id: `donor-${String(i + 1).padStart(3, '0')}`,
      displayName: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      photoURL: `https://picsum.photos/seed/donor${i}/100/100`,
      points: rand(100, 15000),
      address: `${rand(1, 999)} ${street}, ${city}`,
      phone: `9${rand(8000000000, 9999999999)}`,
      role: 'donor',
      verified: true,
      badges: ['first_donation', 'generous_donor', 'food_hero'],
      totalDonations: rand(5, 200),
      streak: rand(0, 180),
      level: rand(1, 30),
      xp: rand(500, 50000),
    });
  }

  // NGOs (100)
  for (let i = 0; i < 100; i++) {
    const city = pick(TN_CITIES);
    users.push({
      id: `ngo-${String(i + 1).padStart(3, '0')}`,
      displayName: NGO_NAMES[i % NGO_NAMES.length],
      email: `ngo${i + 1}@ngo.org`,
      photoURL: `https://picsum.photos/seed/ngo${i}/100/100`,
      points: rand(500, 25000),
      address: `${rand(1, 99)} ${pick(STREET_NAMES)}, ${city}`,
      phone: `9${rand(8000000000, 9999999999)}`,
      role: 'ngo',
      verified: true,
      badges: ['verified_ngo', 'community_pillar', 'hunger_warrior'],
      totalDonations: 0,
      totalDeliveries: rand(50, 500),
      streak: rand(30, 365),
      level: rand(5, 40),
      xp: rand(5000, 100000),
    });
  }

  // Volunteers (1000)
  for (let i = 0; i < 1000; i++) {
    const firstName = pick(VOLUNTEER_FIRST_NAMES);
    const lastName = pick(VOLUNTEER_LAST_NAMES);
    const city = pick(TN_CITIES);
    users.push({
      id: `vol-${String(i + 1).padStart(4, '0')}`,
      displayName: `${firstName} ${lastName}`,
      email: `vol${i + 1}@volunteer.org`,
      photoURL: `https://picsum.photos/seed/vol${i}/100/100`,
      points: rand(50, 8000),
      address: `${rand(1, 999)} ${pick(STREET_NAMES)}, ${city}`,
      phone: `9${rand(8000000000, 9999999999)}`,
      role: 'volunteer',
      verified: true,
      badges: ['first_delivery', 'road_warrior'],
      totalDeliveries: rand(5, 300),
      totalVolunteerHours: rand(10, 2000),
      streak: rand(0, 120),
      level: rand(1, 25),
      xp: rand(200, 30000),
    });
  }

  // Receivers (30)
  for (let i = 0; i < 30; i++) {
    const firstName = pick(VOLUNTEER_FIRST_NAMES);
    const lastName = pick(VOLUNTEER_LAST_NAMES);
    users.push({
      id: `recv-${String(i + 1).padStart(3, '0')}`,
      displayName: `${firstName} ${lastName}`,
      email: `recv${i + 1}@example.com`,
      photoURL: `https://picsum.photos/seed/recv${i}/100/100`,
      points: rand(10, 500),
      address: `${rand(1, 999)} ${pick(STREET_NAMES)}, ${pick(TN_CITIES)}`,
      phone: `9${rand(8000000000, 9999999999)}`,
      role: 'receiver',
      verified: true,
      level: rand(1, 5),
      xp: rand(50, 2000),
    });
  }

  // Corporate (50)
  for (let i = 0; i < 50; i++) {
    users.push({
      id: `corp-${String(i + 1).padStart(3, '0')}`,
      displayName: CORPORATE_NAMES[i % CORPORATE_NAMES.length],
      email: `csr${i + 1}@corporate.com`,
      photoURL: `https://picsum.photos/seed/corp${i}/100/100`,
      points: rand(1000, 50000),
      address: `${rand(1, 99)} ${pick(STREET_NAMES)}, ${pick(TN_CITIES)}`,
      phone: `9${rand(8000000000, 9999999999)}`,
      role: 'corporate',
      verified: true,
      badges: ['csr_partner', 'esg_champion'],
      totalDonations: rand(20, 500),
      level: rand(5, 35),
      xp: rand(10000, 200000),
    });
  }

  // Government (20)
  for (let i = 0; i < 20; i++) {
    users.push({
      id: `gov-${String(i + 1).padStart(3, '0')}`,
      displayName: `Collector ${pick(TN_DISTRICTS)}`,
      email: `collector${i + 1}@tn.gov.in`,
      photoURL: `https://picsum.photos/seed/gov${i}/100/100`,
      points: rand(500, 10000),
      address: `District Collectorate, ${pick(TN_DISTRICTS)}`,
      phone: `9${rand(8000000000, 9999999999)}`,
      role: 'government',
      verified: true,
      badges: ['government_partner'],
      level: rand(10, 40),
      xp: rand(20000, 100000),
    });
  }

  return users;
};

// ============================================
// MOCK DONATIONS (500+)
// ============================================

const generateDonations = (): Donation[] => {
  const donations: Donation[] = [];
  const statuses: Donation['status'][] = ['Available', 'Claimed', 'Picked Up', 'Delivered', 'Expired', 'Redirected'];
  const weights = [0.3, 0.15, 0.1, 0.3, 0.1, 0.05];

  for (let i = 0; i < 550; i++) {
    const city = pick(TN_CITIES);
    const district = pick(TN_DISTRICTS);
    const lat = 8.0 + Math.random() * 4.5;
    const lng = 76.0 + Math.random() * 4.5;
    const status = (() => {
      const r = Math.random();
      let acc = 0;
      for (let j = 0; j < statuses.length; j++) {
        acc += weights[j];
        if (r < acc) return statuses[j];
      }
      return 'Available';
    })();

    const foodType = pick(FOOD_TYPES);
    const foodName = pick(FOOD_NAMES);
    const kg = randFloat(1, 100);

    const circularStage = status === 'Redirected' ? 'biogas' : status === 'Delivered' ? 'delivered' : 'donation';

    donations.push({
      id: `don-${String(i + 1).padStart(4, '0')}`,
      foodName,
      foodType,
      status,
      quantity: `${rand(1, 100)} ${pick(['packets', 'kg', 'meals', 'cans', 'liters', 'sets'])}`,
      quantity_kg: kg,
      location: `${rand(1, 999)} ${pick(STREET_NAMES)}, ${pick(LANDMARKS)}, ${city}`,
      expiryTime: futureDate(rand(1, 72)),
      cookedTime: pastDate(rand(1, 12)),
      createdAt: randomDate(90),
      description: `Fresh ${foodName.toLowerCase()} prepared with care. Available for immediate pickup.`,
      tags: [pick(['High Protein', 'Child Friendly', 'Elderly Suitable', 'Emergency Meal', 'Vegetarian', 'Vegan']), pick(['Fresh', 'Packaged', 'Hot Meal', 'Ready to Eat'])].filter(() => Math.random() > 0.5),
      donor: {
        id: `donor-${String(rand(1, 50)).padStart(3, '0')}`,
        name: pick(VOLUNTEER_FIRST_NAMES) + ' ' + pick(VOLUNTEER_LAST_NAMES),
        email: `donor${rand(1, 50)}@example.com`,
        photoURL: `https://picsum.photos/seed/user${rand(1, 50)}/100/100`,
      },
      donorId: `donor-${String(rand(1, 50)).padStart(3, '0')}`,
      lat,
      lng,
      imageURL: `https://picsum.photos/seed/food${i}/400/300`,
      trackingId: `TRK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      claimedBy: status !== 'Available' ? `vol-${String(rand(1, 100)).padStart(4, '0')}` : undefined,
      volunteerId: ['Picked Up', 'Delivered'].includes(status) ? `vol-${String(rand(1, 100)).padStart(4, '0')}` : undefined,
      ngoId: ['Claimed', 'Picked Up', 'Delivered'].includes(status) ? `ngo-${String(rand(1, 50)).padStart(3, '0')}` : undefined,
      ai_matching_score: rand(40, 99),
      carbon_saved_kg: kg * 2.5,
      delivery_timeline: status !== 'Available' ? [
        { timestamp: randomDate(90), event: 'created', by_user: `donor-${String(rand(1, 50)).padStart(3, '0')}`, location: city },
        { timestamp: randomDate(60), event: 'matched', location: city },
        ...(status !== 'Pending' ? [{ timestamp: randomDate(30), event: 'accepted' as const, by_user: `vol-${String(rand(1, 100)).padStart(4, '0')}`, location: city }] : []),
        ...(['Picked Up', 'Delivered'].includes(status) ? [{ timestamp: randomDate(20), event: 'picked_up' as const, by_user: `vol-${String(rand(1, 100)).padStart(4, '0')}`, location: city }] : []),
        ...(status === 'Delivered' ? [{ timestamp: randomDate(10), event: 'delivered' as const, location: city }] : []),
      ] : undefined,
      circular_economy: status === 'Redirected' ? {
        stage: circularStage as any,
        redirectedTo: pick(['BioGas Plant Chennai', 'Fertilizer Centre Coimbatore', 'Composting Unit Madurai']),
        redirectType: pick(['biogas_plant', 'fertilizer_centre']),
        energyGeneratedKwh: randFloat(5, 50),
        carbonOffsetKg: kg * 3,
      } : undefined,
    });
  }

  return donations;
};

// ============================================
// MOCK NGOs (100)
// ============================================

const generateNGOs = (): NGODetails[] => {
  return Array.from({ length: 100 }, (_, i) => {
    const city = pick(TN_CITIES);
    const lat = 8.0 + Math.random() * 4.5;
    const lng = 76.0 + Math.random() * 4.5;
    return {
      id: `ngo-${String(i + 1).padStart(3, '0')}`,
      userId: `ngo-${String(i + 1).padStart(3, '0')}`,
      name: NGO_NAMES[i % NGO_NAMES.length],
      registrationNumber: `NGO-TN-${2020 + rand(0, 5)}-${String(i + 1).padStart(4, '0')}`,
      type: pick(['shelter', 'kitchen', 'food_bank', 'community_center', 'temple', 'mosque', 'church'] as const),
      capacity: rand(50, 500),
      currentInventory: rand(0, 100),
      storageType: pick(['ambient', 'refrigerated', 'frozen', 'mixed'] as const),
      operatingHours: `${rand(6, 9)}:00 AM - ${rand(6, 10)}:00 PM`,
      contactPerson: pick(VOLUNTEER_FIRST_NAMES) + ' ' + pick(VOLUNTEER_LAST_NAMES),
      phone: `9${rand(8000000000, 9999999999)}`,
      email: `ngo${i + 1}@ngo.org`,
      address: `${rand(1, 99)} ${pick(STREET_NAMES)}, ${city}`,
      lat,
      lng,
      verified: Math.random() > 0.15,
      rating: randFloat(3.0, 5.0),
      totalServed: rand(100, 10000),
      totalReceived: rand(100, 10000),
      photos: [`https://picsum.photos/seed/ngo${i}a/400/300`, `https://picsum.photos/seed/ngo${i}b/400/300`],
      operatingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    };
  });
};

// ============================================
// MOCK HUNGER ZONES
// ============================================

const generateHungerZones = (): HungerZone[] => {
  const zones: HungerZone[] = [];
  TN_CITIES.forEach((city, i) => {
    zones.push({
      id: `hz-${String(i + 1).padStart(3, '0')}`,
      zone_name: `${city} Central`,
      geo_location: { lat: 8.0 + Math.random() * 4.5, lng: 76.0 + Math.random() * 4.5 },
      weekly_request_count: rand(200, 2000),
      avg_meals_required: rand(500, 5000),
      last_30_days_growth_rate: randFloat(-5, 20),
      hunger_risk_score: rand(15, 95),
      population: rand(50000, 2000000),
      povertyRate: randFloat(5, 40),
      foodDesert: Math.random() > 0.7,
    });
  });
  return zones;
};

// ============================================
// MOCK CORPORATES
// ============================================

const generateCorporates = (): CorporateProfile[] => {
  return Array.from({ length: 50 }, (_, i) => {
    const city = pick(TN_CITIES);
    const budget = rand(100000, 50000000);
    return {
      id: `corp-${String(i + 1).padStart(3, '0')}`,
      userId: `corp-${String(i + 1).padStart(3, '0')}`,
      companyName: CORPORATE_NAMES[i % CORPORATE_NAMES.length],
      industry: pick(['IT', 'Manufacturing', 'Automotive', 'Pharma', 'FMCG', 'Banking', 'Telecom', 'Energy', 'Retail', 'Aviation']),
      registrationNumber: `CIN-${rand(10000000, 99999999)}`,
      csrBudget: budget,
      csrSpent: Math.floor(budget * randFloat(0.3, 0.9)),
      esgScore: rand(30, 95),
      branches: Array.from({ length: rand(2, 8) }, (_, j) => ({
        id: `branch-${i}-${j}`,
        name: `${CORPORATE_NAMES[i % CORPORATE_NAMES.length]} ${city} Branch ${j + 1}`,
        address: `${rand(1, 99)} ${pick(STREET_NAMES)}, ${city}`,
        lat: 8.0 + Math.random() * 4.5,
        lng: 76.0 + Math.random() * 4.5,
        city,
        state: 'Tamil Nadu',
        pincode: String(rand(600000, 640000)),
        managerName: pick(VOLUNTEER_FIRST_NAMES) + ' ' + pick(VOLUNTEER_LAST_NAMES),
        managerPhone: `9${rand(8000000000, 9999999999)}`,
        employeeCount: rand(50, 2000),
        totalDonations: rand(10, 200),
        isActive: Math.random() > 0.1,
      })),
      employeeCount: rand(100, 50000),
      activeEmployees: rand(50, 10000),
      totalDonations: rand(20, 1000),
      totalMealsServed: rand(500, 50000),
      carbonOffsetKg: rand(1000, 500000),
      certificates: [],
      logoUrl: `https://picsum.photos/seed/corp${i}logo/200/200`,
      website: `https://www.${CORPORATE_NAMES[i % CORPORATE_NAMES.length].toLowerCase().replace(/[^a-z]/g, '')}.com`,
      contactPerson: pick(VOLUNTEER_FIRST_NAMES) + ' ' + pick(VOLUNTEER_LAST_NAMES),
      phone: `9${rand(8000000000, 9999999999)}`,
      email: `csr@${CORPORATE_NAMES[i % CORPORATE_NAMES.length].toLowerCase().replace(/[^a-z]/g, '')}.com`,
      address: `${rand(1, 99)} ${pick(STREET_NAMES)}, ${city}`,
      verified: Math.random() > 0.2,
    };
  });
};

// ============================================
// MOCK GOVERNMENT PROFILES
// ============================================

const generateGovernmentProfiles = (): GovernmentProfile[] => {
  const designations = ['District Collector', 'Sub Collector', 'Taluk Dar', 'Municipal Commissioner', 'Ward Councillor', 'Revenue Officer', 'Social Welfare Officer'];
  return Array.from({ length: 30 }, (_, i) => ({
    id: `gov-${String(i + 1).padStart(3, '0')}`,
    userId: `gov-${String(i + 1).padStart(3, '0')}`,
    department: pick(['Revenue', 'Social Welfare', 'Municipal Administration', 'Health', 'Education', 'Rural Development']),
    designation: pick(designations),
    district: TN_DISTRICTS[i % TN_DISTRICTS.length],
    state: 'Tamil Nadu',
    jurisdictionLevel: pick(['state', 'district', 'taluk', 'ward', 'municipality'] as const),
    jurisdictionName: TN_DISTRICTS[i % TN_DISTRICTS.length],
    officialId: `GOV-TN-${String(i + 1).padStart(4, '0')}`,
    phone: `9${rand(8000000000, 9999999999)}`,
    email: `official${i + 1}@tn.gov.in`,
    verified: true,
  }));
};

// ============================================
// MOCK DISTRICTS
// ============================================

const generateDistricts = (): District[] => {
  return TN_DISTRICTS.map((name, i) => ({
    id: `dist-${String(i + 1).padStart(3, '0')}`,
    name,
    state: 'Tamil Nadu',
    population: rand(500000, 12000000),
    area_sq_km: rand(1000, 15000),
    totalNGOs: rand(5, 80),
    totalDonations: rand(100, 5000),
    totalMealsServed: rand(1000, 100000),
    hungerRiskScore: rand(15, 90),
    foodWasteKg: rand(500, 20000),
    carbonSavedKg: rand(1000, 100000),
    biogasCentres: rand(0, 5),
    fertilizerCentres: rand(0, 8),
    municipalities: [`${name} Corporation`, `${name} Municipality`],
    taluks: [`${name} North`, `${name} South`, `${name} East`, `${name} West`],
  }));
};

// ============================================
// MOCK WARDS
// ============================================

const generateWards = (): Ward[] => {
  const wards: Ward[] = [];
  TN_DISTRICTS.slice(0, 15).forEach((district, di) => {
    for (let w = 1; w <= 5; w++) {
      wards.push({
        id: `ward-${String(di * 5 + w).padStart(3, '0')}`,
        name: `${district} Ward ${w}`,
        districtId: `dist-${String(di + 1).padStart(3, '0')}`,
        taluk: `${district} ${pick(['North', 'South', 'East', 'West', 'Central'])}`,
        municipality: `${district} Municipality`,
        population: rand(10000, 200000),
        totalDonations: rand(10, 500),
        totalNGOs: rand(1, 15),
        hungerRiskScore: rand(15, 90),
        foodWasteKg: rand(50, 2000),
        weeklyGrowthRate: randFloat(-5, 15),
        lat: 8.0 + Math.random() * 4.5,
        lng: 76.0 + Math.random() * 4.5,
      });
    }
  });
  return wards;
};

// ============================================
// MOCK EMERGENCY EVENTS
// ============================================

const generateEmergencyEvents = (): EmergencyEvent[] => {
  const events: EmergencyEvent[] = [];
  const types: EmergencyEvent['type'][] = ['flood', 'cyclone', 'drought', 'earthquake', 'pandemic', 'fire', 'industrial'];
  for (let i = 0; i < 25; i++) {
    const type = types[i % types.length];
    const district = pick(TN_DISTRICTS);
    const lat = 8.0 + Math.random() * 4.5;
    const lng = 76.0 + Math.random() * 4.5;
    const mealsRequired = rand(1000, 100000);
    events.push({
      id: `emergency-${String(i + 1).padStart(3, '0')}`,
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Relief in ${district}`,
      description: `Emergency ${type} situation affecting ${district} district. Immediate food redistribution required for affected populations.`,
      district,
      severity: pick(['low', 'medium', 'high', 'critical'] as const),
      status: pick(['active', 'contained', 'resolved'] as const),
      startDate: randomDate(30),
      affectedPopulation: rand(1000, 500000),
      mealsRequired,
      mealsDelivered: rand(0, mealsRequired),
      activeVolunteers: rand(5, 200),
      activeNGOs: rand(2, 30),
      lat,
      lng,
      radius: randFloat(5, 50),
    });
  }
  return events;
};

// ============================================
// MOCK CERTIFICATES
// ============================================

const generateCertificates = (): Certificate[] => {
  const certs: Certificate[] = [];
  for (let i = 0; i < 200; i++) {
    const type = pick(['donation', 'volunteer', 'ngo', 'corporate', 'achievement', 'carbon'] as const);
    certs.push({
      id: `cert-${String(i + 1).padStart(4, '0')}`,
      userId: `donor-${String(rand(1, 50)).padStart(3, '0')}`,
      userName: pick(VOLUNTEER_FIRST_NAMES) + ' ' + pick(VOLUNTEER_LAST_NAMES),
      type,
      title: `Certificate of ${type === 'donation' ? 'Donation' : type === 'volunteer' ? 'Volunteer Service' : type === 'carbon' ? 'Carbon Offset' : 'Achievement'}`,
      description: `Awarded for outstanding contribution to food redistribution and hunger alleviation in Tamil Nadu.`,
      issuedDate: randomDate(365),
      issuedBy: 'Achayapathra Foundation',
      qrCode: `CERT-${Math.random().toString(36).substr(2, 12).toUpperCase()}`,
      verificationUrl: `https://achayapathra.gov.in/verify/${Math.random().toString(36).substr(2, 12)}`,
      validUntil: futureDate(365 * 2),
    });
  }
  return certs;
};

// ============================================
// MOCK BADGES
// ============================================

const generateBadges = (): Badge[] => [
  { id: 'first_donation', name: 'First Steps', description: 'Made your first food donation', icon: '🎁', color: '#FF6B35', category: 'donation', requirement: 'Donate food once', xpReward: 100 },
  { id: 'generous_donor', name: 'Generous Heart', description: 'Donated 10 times', icon: '❤️', color: '#E91E63', category: 'donation', requirement: '10 donations', xpReward: 500 },
  { id: 'food_hero', name: 'Food Hero', description: 'Donated 50 times', icon: '🦸', color: '#9C27B0', category: 'donation', requirement: '50 donations', xpReward: 2500 },
  { id: 'hunger_hero', name: 'Hunger Hero', description: 'Donated 100 times', icon: '🏆', color: '#FFD700', category: 'donation', requirement: '100 donations', xpReward: 10000 },
  { id: 'million_meals', name: 'Million Meals', description: 'Helped serve 1 million meals', icon: '🌟', color: '#FF6B35', category: 'special', requirement: '1M meals milestone', xpReward: 50000 },
  { id: 'first_delivery', name: 'First Delivery', description: 'Completed your first delivery', icon: '🚗', color: '#4CAF50', category: 'volunteer', requirement: '1 delivery', xpReward: 100 },
  { id: 'road_warrior', name: 'Road Warrior', description: 'Completed 25 deliveries', icon: '🏍️', color: '#2196F3', category: 'volunteer', requirement: '25 deliveries', xpReward: 1000 },
  { id: 'verified_ngo', name: 'Verified NGO', description: 'NGO verification completed', icon: '✅', color: '#4CAF50', category: 'ngo', requirement: 'NGO verified', xpReward: 2000 },
  { id: 'community_pillar', name: 'Community Pillar', description: 'Served 1000+ meals', icon: '🏛️', color: '#795548', category: 'ngo', requirement: '1000 meals served', xpReward: 5000 },
  { id: 'hunger_warrior', name: 'Hunger Warrior', description: 'Active for 365 days', icon: '⚔️', color: '#F44336', category: 'ngo', requirement: '365 day streak', xpReward: 10000 },
  { id: 'csr_partner', name: 'CSR Partner', description: 'Registered corporate partner', icon: '🏢', color: '#607D8B', category: 'corporate', requirement: 'CSR registration', xpReward: 3000 },
  { id: 'esg_champion', name: 'ESG Champion', description: 'ESG score above 80', icon: '🌱', color: '#8BC34A', category: 'corporate', requirement: 'ESG > 80', xpReward: 5000 },
  { id: 'super_admin', name: 'Super Admin', description: 'Platform administrator', icon: '👑', color: '#FFD700', category: 'special', requirement: 'Admin role', xpReward: 0 },
  { id: 'founding_member', name: 'Founding Member', description: 'Early platform adopter', icon: '⭐', color: '#FF9800', category: 'special', requirement: 'Joined early', xpReward: 500 },
  { id: 'streak_7', name: '7-Day Streak', description: 'Active for 7 consecutive days', icon: '🔥', color: '#FF5722', category: 'streak', requirement: '7 day streak', xpReward: 200 },
  { id: 'streak_30', name: '30-Day Streak', description: 'Active for 30 consecutive days', icon: '💫', color: '#E91E63', category: 'streak', requirement: '30 day streak', xpReward: 1000 },
  { id: 'streak_100', name: '100-Day Streak', description: 'Active for 100 consecutive days', icon: '🌟', color: '#9C27B0', category: 'streak', requirement: '100 day streak', xpReward: 5000 },
  { id: 'carbon_saver', name: 'Carbon Saver', description: 'Saved 1000kg CO₂', icon: '🌍', color: '#00BCD4', category: 'special', requirement: '1000kg CO₂ saved', xpReward: 3000 },
];

// ============================================
// MOCK REWARDS
// ============================================

const generateRewards = (): Reward[] => [
  { id: 'rw-001', name: 'Free Movie Ticket', description: 'Enjoy a free movie at PVR Cinemas', pointsRequired: 500, category: 'voucher', partner: 'PVR Cinemas', validUntil: futureDate(365), stock: 100 },
  { id: 'rw-002', name: '₹100 Amazon Voucher', description: '₹100 Amazon gift card', pointsRequired: 1000, category: 'voucher', partner: 'Amazon India', validUntil: futureDate(365), stock: 200 },
  { id: 'rw-003', name: 'Achayapathra T-Shirt', description: 'Premium organic cotton T-shirt', pointsRequired: 2000, category: 'gift', partner: 'Achayapathra', validUntil: futureDate(180), stock: 50 },
  { id: 'rw-004', name: 'Coffee Voucher', description: 'Free coffee at CCD', pointsRequired: 300, category: 'discount', partner: 'Cafe Coffee Day', validUntil: futureDate(90), stock: 300 },
  { id: 'rw-005', name: 'Certificate of Impact', description: 'Personalized impact certificate', pointsRequired: 750, category: 'recognition', partner: 'Achayapathra', validUntil: undefined, stock: 999 },
  { id: 'rw-006', name: '₹500 Flipkart Voucher', description: '₹500 Flipkart gift card', pointsRequired: 5000, category: 'voucher', partner: 'Flipkart', validUntil: futureDate(365), stock: 100 },
  { id: 'rw-007', name: 'Plant a Tree', description: 'We plant a tree in your name', pointsRequired: 1500, category: 'recognition', partner: 'Green TN Foundation', validUntil: futureDate(365), stock: 999 },
  { id: 'rw-008', name: 'Fitness Band', description: 'Mi Smart Band 7', pointsRequired: 10000, category: 'gift', partner: 'Xiaomi', validUntil: futureDate(180), stock: 20 },
];

// ============================================
// MOCK COMPLAINTS
// ============================================

const generateComplaints = (): Complaint[] => {
  const complaints: Complaint[] = [];
  for (let i = 0; i < 75; i++) {
    complaints.push({
      id: `comp-${String(i + 1).padStart(3, '0')}`,
      userId: `user-${String(rand(1, 200)).padStart(3, '0')}`,
      userName: pick(VOLUNTEER_FIRST_NAMES) + ' ' + pick(VOLUNTEER_LAST_NAMES),
      type: pick(['food_quality', 'delivery', 'service', 'safety', 'other'] as const),
      subject: pick([
        'Food quality issue', 'Late delivery', 'Wrong quantity', 'Cold food delivered',
        'Rude behavior', 'Missing items', 'Contaminated food', 'Driver issue',
        'App not working', 'GPS not accurate', 'Certificate not received', 'Points not updated'
      ]),
      description: pick([
        'The food delivered was cold and stale.',
        'Delivery was 2 hours late.',
        'Quantity received was less than promised.',
        'Food was contaminated.',
        'Volunteer was unprofessional.',
        'Items were missing from the delivery.',
        'The app crashed during tracking.',
        'GPS showed wrong location.',
      ]),
      status: pick(['open', 'in_progress', 'resolved', 'closed'] as const),
      priority: pick(['low', 'medium', 'high'] as const),
      createdAt: randomDate(60),
      resolvedAt: Math.random() > 0.5 ? randomDate(30) : undefined,
      donationId: Math.random() > 0.5 ? `don-${String(rand(1, 550)).padStart(4, '0')}` : undefined,
    });
  }
  return complaints;
};

// ============================================
// MOCK NOTIFICATIONS
// ============================================

const generateNotifications = (): Notification[] => {
  const notifs: Notification[] = [];
  for (let i = 0; i < 200; i++) {
    const type = pick(['donation', 'match', 'delivery', 'emergency', 'achievement', 'system', 'certificate'] as const);
    notifs.push({
      id: `notif-${String(i + 1).padStart(4, '0')}`,
      userId: `user-${String(rand(1, 200)).padStart(3, '0')}`,
      type,
      title: pick([
        'New donation available near you!',
        'Your donation has been matched!',
        'Delivery completed successfully!',
        'Emergency alert in your area',
        'New achievement unlocked!',
        'System maintenance scheduled',
        'Certificate generated',
        'Donation claimed by volunteer',
        'NGO accepted your donation',
        'Carbon milestone reached!',
      ]),
      message: pick([
        'A new food donation of 50 meals is available in Chennai.',
        'AI has matched your donation to Hope Foundation.',
        'Volunteer Arjun has delivered the food successfully.',
        'Cyclone warning issued for coastal Tamil Nadu.',
        'You earned the "7-Day Streak" badge!',
        'Platform will be under maintenance tonight.',
        'Your donation certificate is ready for download.',
      ]),
      read: Math.random() > 0.4,
      createdAt: randomDate(30),
      actionUrl: `/donations/${String(rand(1, 550)).padStart(4, '0')}`,
    });
  }
  return notifs;
};

// ============================================
// MOCK BIOGAS PLANTS & FERTILIZER CENTRES
// ============================================

const generateBiogasPlants = (): BiogasPlant[] => [
  { id: 'bio-001', name: 'Chennai Central Biogas Plant', address: 'Industrial Estate, Ambattur, Chennai', district: 'Chennai', lat: 13.11, lng: 80.23, capacity: 5000, currentInput: 2300, energyOutputKwh: 850, operational: true, contactPerson: 'Rajan Kumar', phone: '9840012345' },
  { id: 'bio-002', name: 'Coimbatore Green Energy', address: 'PECHI Nagar, Coimbatore', district: 'Coimbatore', lat: 11.00, lng: 76.95, capacity: 3000, currentInput: 1800, energyOutputKwh: 520, operational: true, contactPerson: 'Mohan Raj', phone: '9841123456' },
  { id: 'bio-003', name: 'Madurai Waste to Energy', address: 'Thiruparankundram, Madurai', district: 'Madurai', lat: 9.92, lng: 78.11, capacity: 4000, currentInput: 1200, energyOutputKwh: 380, operational: true, contactPerson: 'Suresh Babu', phone: '9842234567' },
  { id: 'bio-004', name: 'Trichy Bio Energy', address: 'Srirangam, Tiruchirappalli', district: 'Tiruchirappalli', lat: 10.79, lng: 78.70, capacity: 2500, currentInput: 900, energyOutputKwh: 280, operational: true, contactPerson: 'Kumaravel', phone: '9843345678' },
  { id: 'bio-005', name: 'Salem Biogas Cooperative', address: 'Attur Road, Salem', district: 'Salem', lat: 11.66, lng: 78.14, capacity: 2000, currentInput: 600, energyOutputKwh: 190, operational: false, contactPerson: 'Ganesh', phone: '9844456789' },
];

const generateFertilizerCentres = (): FertilizerCentre[] => [
  { id: 'fert-001', name: 'Chennai Organic Fertilizer', address: 'Maraimalai Nagar, Chennai', district: 'Chennai', lat: 12.78, lng: 80.03, capacity: 8000, currentInput: 3500, compostOutputKg: 2800, operational: true, contactPerson: 'Lakshmi Devi', phone: '9845567890' },
  { id: 'fert-002', name: 'Coimbatore Agro Compost', address: 'Pollachi, Coimbatore', district: 'Coimbatore', lat: 10.65, lng: 76.99, capacity: 6000, currentInput: 2200, compostOutputKg: 1700, operational: true, contactPerson: 'Palanisamy', phone: '9846678901' },
  { id: 'fert-003', name: 'Madurai Green Compost', address: 'Melur, Madurai', district: 'Madurai', lat: 10.05, lng: 78.33, capacity: 5000, currentInput: 1800, compostOutputKg: 1400, operational: true, contactPerson: 'Velayutham', phone: '9847789012' },
  { id: 'fert-004', name: 'Trichy Soil Care', address: 'Lalgudi, Tiruchirappalli', district: 'Tiruchirappalli', lat: 10.87, lng: 78.82, capacity: 3000, currentInput: 900, compostOutputKg: 700, operational: true, contactPerson: 'Muthusamy', phone: '9848890123' },
];

// ============================================
// MOCK DEMAND PREDICTIONS
// ============================================

const generateDemandPredictions = (): DemandPrediction[] => {
  return TN_CITIES.slice(0, 15).map((city, i) => ({
    zoneId: `hz-${String(i + 1).padStart(3, '0')}`,
    zoneName: `${city} Central`,
    predictedDemand: rand(200, 2000),
    currentDemand: rand(100, 1500),
    trend: pick(['increasing', 'decreasing', 'stable'] as const),
    confidence: randFloat(0.7, 0.98),
    factors: pick([
      ['Weekend spike', 'Festival season', 'Monsoon impact'],
      ['School reopening', 'Industrial area demand', 'Temperature rise'],
      ['Population growth', 'NGO expansion', 'Festival preparation'],
    ]),
    date: new Date().toISOString().split('T')[0],
  }));
};

// ============================================
// MOCK AUDIT LOGS
// ============================================

const generateAuditLogs = (): AuditLog[] => {
  const logs: AuditLog[] = [];
  const actions = ['create', 'update', 'delete', 'view', 'export', 'login', 'logout', 'match', 'deliver'];
  const resources = ['donation', 'user', 'ngo', 'volunteer', 'certificate', 'settings', 'report'];
  for (let i = 0; i < 500; i++) {
    logs.push({
      id: `log-${String(i + 1).padStart(5, '0')}`,
      userId: `user-${String(rand(1, 200)).padStart(3, '0')}`,
      action: pick(actions),
      resource: pick(resources),
      resourceId: `${pick(resources)}-${String(rand(1, 100)).padStart(3, '0')}`,
      timestamp: randomDate(90),
      details: { action: pick(actions), resource: pick(resources) },
    });
  }
  return logs;
};

// ============================================
// MOCK CIRCULAR ECONOMY DATA
// ============================================

const circularEconomyData: CircularEconomyData[] = Array.from({ length: 100 }, (_, i) => ({
  stage: pick(['biogas', 'fertilizer', 'composting', 'animal_feed'] as any),
  redirectedTo: pick(['BioGas Plant Chennai', 'Fertilizer Centre Coimbatore', 'Composting Unit Madurai', 'Animal Feed Centre Salem']),
  redirectType: pick(['biogas_plant', 'fertilizer_centre', 'composting', 'animal_feed'] as const),
  energyGeneratedKwh: randFloat(5, 100),
  compostProducedKg: randFloat(10, 200),
  carbonOffsetKg: randFloat(5, 150),
}));

// ============================================
// MOCK PLATFORM ANALYTICS
// ============================================

const platformAnalytics = {
  totalUsers: 1250,
  totalDonations: 5500,
  totalNGOs: 100,
  totalVolunteers: 1000,
  totalCorporates: 50,
  totalMealsServed: 285000,
  totalKgRescued: 125000,
  totalCO2Saved: 312500,
  totalBiogasRedirected: 8500,
  totalFertilizerRedirected: 12000,
  avgMatchTime: 14.2,
  avgDeliveryTime: 22,
  matchSuccessRate: 94.8,
  dailyActiveUsers: 342,
  monthlyGrowth: 12.4,
};

// ============================================
// EXPORTS
// ============================================

export const mockUsers: UserProfile[] = generateUsers();
export const mockDonations: Donation[] = generateDonations();
export const mockHungerZones: HungerZone[] = generateHungerZones();
export const mockNGOs: NGODetails[] = generateNGOs();
export const mockCorporates: CorporateProfile[] = generateCorporates();
export const mockGovernmentProfiles: GovernmentProfile[] = generateGovernmentProfiles();
export const mockDistricts: District[] = generateDistricts();
export const mockWards: Ward[] = generateWards();
export const mockEmergencyEvents: EmergencyEvent[] = generateEmergencyEvents();
export const mockCertificates: Certificate[] = generateCertificates();
export const mockBadges: Badge[] = generateBadges();
export const mockRewards: Reward[] = generateRewards();
export const mockComplaints: Complaint[] = generateComplaints();
export const mockNotifications: Notification[] = generateNotifications();
export const mockBiogasPlants: BiogasPlant[] = generateBiogasPlants();
export const mockFertilizerCentres: FertilizerCentre[] = generateFertilizerCentres();
export const mockDemandPredictions: DemandPrediction[] = generateDemandPredictions();
export const mockAuditLogs: AuditLog[] = generateAuditLogs();
export const mockCircularEconomyData: CircularEconomyData[] = circularEconomyData;
export const mockPlatformAnalytics = platformAnalytics;

export const mockCities = [
  { name: 'Chennai', impact: 4500, rescued: 1200, lat: 13.08, lng: 80.27, population: 11500000, ngos: 45, volunteers: 180 },
  { name: 'Coimbatore', impact: 3200, rescued: 850, lat: 11.01, lng: 76.96, population: 3200000, ngos: 32, volunteers: 120 },
  { name: 'Madurai', impact: 2800, rescued: 720, lat: 9.92, lng: 78.12, population: 1800000, ngos: 28, volunteers: 95 },
  { name: 'Tiruchirappalli', impact: 2100, rescued: 540, lat: 10.79, lng: 78.70, population: 1100000, ngos: 22, volunteers: 80 },
  { name: 'Salem', impact: 1500, rescued: 410, lat: 11.66, lng: 78.14, population: 900000, ngos: 18, volunteers: 65 },
  { name: 'Tirunelveli', impact: 1200, rescued: 320, lat: 8.71, lng: 77.75, population: 500000, ngos: 15, volunteers: 50 },
  { name: 'Erode', impact: 1100, rescued: 290, lat: 11.34, lng: 77.72, population: 500000, ngos: 14, volunteers: 45 },
  { name: 'Vellore', impact: 980, rescued: 260, lat: 12.91, lng: 79.13, population: 500000, ngos: 12, volunteers: 40 },
  { name: 'Thoothukudi', impact: 870, rescued: 230, lat: 8.76, lng: 78.13, population: 400000, ngos: 10, volunteers: 35 },
  { name: 'Dindigul', impact: 760, rescued: 200, lat: 10.35, lng: 77.95, population: 300000, ngos: 8, volunteers: 30 },
];

export const mockDonorStats = {
  totalDonations: 5500,
  totalMealsServed: 285000,
  totalKgRescued: 125000,
  totalCO2Saved: 312500,
  avgMatchTime: 14.2,
  avgDeliveryTime: 22,
  matchSuccessRate: 94.8,
  activeNGOs: 87,
  activeVolunteers: 650,
  weeklyGrowth: 8.5,
  monthlyGrowth: 12.4,
  yearlyGrowth: 45.2,
};

export const mockImpactStats = {
  mealsServed: 285000,
  peopleServed: 95000,
  kgRescued: 125000,
  co2Saved: 312500,
  waterSaved: 5000000,
  treesEquivalent: 14500,
  energySaved: 250000,
  methaneAvoided: 45000,
  biogasEnergy: 2240,
  compostProduced: 18500,
  daysActive: 456,
  verifiedNGOs: 87,
  activeVolunteers: 650,
  citiesCovered: 30,
  districtsCovered: 30,
};
