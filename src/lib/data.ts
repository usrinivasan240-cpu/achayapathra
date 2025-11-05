import { Timestamp } from 'firebase/firestore';
import { Donation, User } from './types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Priya Kumari',
    email: 'priya@example.com',
    photoURL: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    points: 1250,
    address: '123 Maple St, Springfield',
    phone: '555-1234',
  },
  {
    id: '2',
    name: 'Arjun Selvam',
    email: 'arjun@example.com',
    photoURL: 'https://i.pravatar.cc/150?u=a042581f4e29026705d',
    points: 850,
    address: '456 Oak Ave, Springfield',
    phone: '555-5678',
  },
  {
    id: '3',
    name: 'Anandhi Sharma',
    email: 'anandhi@example.com',
    photoURL: 'https://i.pravatar.cc/150?u=a042581f4e29026706d',
    points: 1500,
    address: '789 Pine Ln, Springfield',
    phone: '555-9012',
  },
  {
    id: '4',
    name: 'Vikram Singh',
    email: 'vikram@example.com',
    photoURL: 'https://i.pravatar.cc/150?u=a042581f4e29026707d',
    points: 700,
    address: '321 Birch Rd, Springfield',
    phone: '555-3456',
  },
  {
    id: '5',
    name: 'Meera Krishnan',
    email: 'meera@example.com',
    photoURL: 'https://i.pravatar.cc/150?u=a042581f4e29026708d',
    points: 2100,
    address: '654 Elm St, Springfield',
    phone: '555-7890',
  },
];

// Helper to create a Firestore-like Timestamp object from a Date
const dateToTimestamp = (date: Date): Timestamp => {
  return new Timestamp(Math.floor(date.getTime() / 1000), 0);
};

export const mockDonations: Donation[] = [
  {
    id: 'd1',
    foodName: 'Fresh Vegetable Curry',
    status: 'Available',
    quantity: 'Feeds 10 people',
    location: 'Saravanampatti',
    pickupBy: dateToTimestamp(new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000)), // 2 days from now
    donor: {
      id: mockUsers[0].id,
      name: mockUsers[0].name,
      email: mockUsers[0].email,
      photoURL: mockUsers[0].photoURL,
    },
    donorId: mockUsers[0].id,
    lat: 11.08,
    lng: 77.01,
  },
  {
    id: 'd2',
    foodName: 'Homemade Bread',
    status: 'Claimed',
    quantity: '20 loaves',
    location: 'Gandhipuram',
    pickupBy: dateToTimestamp(new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000)), // 1 day from now
    donor: {
      id: mockUsers[1].id,
      name: mockUsers[1].name,
      email: mockUsers[1].email,
      photoURL: mockUsers[1].photoURL,
    },
    donorId: mockUsers[1].id,
    lat: 11.01,
    lng: 76.95,
  },
  {
    id: 'd3',
    foodName: 'Canned Beans',
    status: 'Delivered',
    quantity: '50 cans',
    location: 'R.S. Puram',
    pickupBy: dateToTimestamp(new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)), // 1 month from now
    donor: {
      id: mockUsers[2].id,
      name: mockUsers[2].name,
      email: mockUsers[2].email,
      photoURL: mockUsers[2].photoURL,
    },
    donorId: mockUsers[2].id,
    lat: 11.00,
    lng: 76.94,
  },
  {
    id: 'd4',
    foodName: 'Birthday Cake',
    status: 'Available',
    quantity: '1 large cake',
    location: 'Saibaba Colony',
    pickupBy: dateToTimestamp(new Date(new Date().getTime() + 12 * 60 * 60 * 1000)), // 12 hours from now
    donor: {
      id: mockUsers[0].id,
      name: mockUsers[0].name,
      email: mockUsers[0].email,
      photoURL: mockUsers[0].photoURL,
    },
    donorId: mockUsers[0].id,
    lat: 11.02,
    lng: 76.94,
  },
   {
    id: 'd5',
    foodName: 'Leftover Wedding Feast',
    status: 'Pending',
    quantity: 'Feeds 50+ people',
    location: 'Peelamedu',
    pickupBy: dateToTimestamp(new Date(new Date().getTime() + 8 * 60 * 60 * 1000)), // 8 hours from now
    donor: {
      id: mockUsers[3].id,
      name: mockUsers[3].name,
      email: mockUsers[3].email,
      photoURL: mockUsers[3].photoURL,
    },
    donorId: mockUsers[3].id,
    lat: 11.03,
    lng: 77.03,
  },
  {
    id: 'd6',
    foodName: 'Idli & Sambar',
    status: 'Available',
    quantity: '50 pieces',
    location: 'Ukkadam',
    pickupBy: dateToTimestamp(new Date(new Date().getTime() + 6 * 60 * 60 * 1000)), // 6 hours from now
    donor: {
      id: mockUsers[4].id,
      name: mockUsers[4].name,
      email: mockUsers[4].email,
      photoURL: mockUsers[4].photoURL,
    },
    donorId: mockUsers[4].id,
    lat: 10.99,
    lng: 76.96,
  },
  {
    id: 'd7',
    foodName: 'Fresh Bananas',
    status: 'Available',
    quantity: '5 dozen',
    location: 'Singanallur',
    pickupBy: dateToTimestamp(new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000)), // 3 days from now
    donor: {
      id: mockUsers[1].id,
      name: mockUsers[1].name,
      email: mockUsers[1].email,
      photoURL: mockUsers[1].photoURL,
    },
    donorId: mockUsers[1].id,
    lat: 11.00,
    lng: 77.02,
  },
  {
    id: 'd8',
    foodName: 'Biscuits & Cookies',
    status: 'Delivered',
    quantity: '100 packs',
    location: 'Vadavalli',
    pickupBy: dateToTimestamp(new Date(new Date().getTime() + 60 * 24 * 60 * 60 * 1000)), // 2 months from now
    donor: {
      id: mockUsers[2].id,
      name: mockUsers[2].name,
      email: mockUsers[2].email,
      photoURL: mockUsers[2].photoURL,
    },
    donorId: mockUsers[2].id,
    lat: 11.03,
    lng: 76.90,
  },
  {
    id: 'd9',
    foodName: 'Packed Lunch Boxes',
    status: 'Available',
    quantity: '30 boxes',
    location: 'Thudiyalur',
    pickupBy: dateToTimestamp(new Date(new Date().getTime() + 4 * 60 * 60 * 1000)), // 4 hours from now
    donor: {
      id: mockUsers[3].id,
      name: mockUsers[3].name,
      email: mockUsers[3].email,
      photoURL: mockUsers[3].photoURL,
    },
    donorId: mockUsers[3].id,
    lat: 11.10,
    lng: 76.94,
  },
  {
    id: 'd10',
    foodName: 'Fresh Milk',
    status: 'Claimed',
    quantity: '10 Liters',
    location: 'Ramanathapuram',
    pickupBy: dateToTimestamp(new Date(new Date().getTime() + 18 * 60 * 60 * 1000)), // 18 hours from now
    donor: {
      id: mockUsers[0].id,
      name: mockUsers[0].name,
      email: mockUsers[0].email,
      photoURL: mockUsers[0].photoURL,
    },
    donorId: mockUsers[0].id,
    lat: 10.99,
    lng: 76.99,
  },
  {
    id: 'd11',
    foodName: 'Chapathi with Dal',
    status: 'Available',
    quantity: '25 sets',
    location: 'Saravanampatti',
    pickupBy: dateToTimestamp(new Date(new Date().getTime() + 5 * 60 * 60 * 1000)), // 5 hours from now
    donor: {
      id: mockUsers[4].id,
      name: mockUsers[4].name,
      email: mockUsers[4].email,
      photoURL: mockUsers[4].photoURL,
    },
    donorId: mockUsers[4].id,
    lat: 11.08,
    lng: 77.01,
  },
  {
    id: 'd12',
    foodName: 'Apples',
    status: 'Available',
    quantity: '10 kg',
    location: 'Town Hall',
    pickupBy: dateToTimestamp(new Date(new Date().getTime() + 4 * 24 * 60 * 60 * 1000)), // 4 days from now
    donor: {
      id: mockUsers[1].id,
      name: mockUsers[1].name,
      email: mockUsers[1].email,
      photoURL: mockUsers[1].photoURL,
    },
    donorId: mockUsers[1].id,
    lat: 10.99,
    lng: 76.97,
  },
  {
    id: 'd13',
    foodName: 'Rice and Sambar',
    status: 'Available',
    quantity: 'Feeds 15 people',
    location: 'Kovaipudur',
    pickupBy: dateToTimestamp(new Date(new Date().getTime() + 7 * 60 * 60 * 1000)), // 7 hours from now
    donor: {
      id: mockUsers[2].id,
      name: mockUsers[2].name,
      email: mockUsers[2].email,
      photoURL: mockUsers[2].photoURL,
    },
    donorId: mockUsers[2].id,
    lat: 10.95,
    lng: 76.93,
  },
  {
    id: 'd14',
    foodName: 'Pulao',
    status: 'Available',
    quantity: 'Feeds 20 people',
    location: 'Edayarpalayam',
    pickupBy: dateToTimestamp(new Date(new Date().getTime() + 9 * 60 * 60 * 1000)), // 9 hours from now
    donor: {
      id: mockUsers[0].id,
      name: mockUsers[0].name,
      email: mockUsers[0].email,
      photoURL: mockUsers[0].photoURL,
    },
    donorId: mockUsers[0].id,
    lat: 11.04,
    lng: 76.92,
  },
  {
    id: 'd15',
    foodName: 'Oranges',
    status: 'Available',
    quantity: '5 kg',
    location: 'Cheran ma Nagar',
    pickupBy: dateToTimestamp(new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000)), // 5 days from now
    donor: {
      id: mockUsers[3].id,
      name: mockUsers[3].name,
      email: mockUsers[3].email,
      photoURL: mockUsers[3].photoURL,
    },
    donorId: mockUsers[3].id,
    lat: 11.07,
    lng: 77.04,
  },
];
