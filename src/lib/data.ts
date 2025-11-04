
import { Donation, User } from './types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Priya Kumari',
    email: 'priya@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    points: 1250,
    address: '123 Maple St, Springfield',
    phone: '555-1234',
  },
  {
    id: '2',
    name: 'Arjun Selvam',
    email: 'arjun@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705d',
    points: 850,
    address: '456 Oak Ave, Springfield',
    phone: '555-5678',
  },
  {
    id: '3',
    name: 'Anandhi Sharma',
    email: 'anandhi@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026706d',
    points: 1500,
    address: '789 Pine Ln, Springfield',
    phone: '555-9012',
  },
  {
    id: '4',
    name: 'Vikram Singh',
    email: 'vikram@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026707d',
    points: 700,
    address: '321 Birch Rd, Springfield',
    phone: '555-3456',
  },
  {
    id: '5',
    name: 'Meera Krishnan',
    email: 'meera@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026708d',
    points: 2100,
    address: '654 Elm St, Springfield',
    phone: '555-7890',
  },
];

export const mockDonations: Donation[] = [
  {
    id: 'd1',
    foodName: 'Fresh Vegetable Curry',
    status: 'Available',
    quantity: 'Feeds 10 people',
    location: 'Saravanampatti',
    expires: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    donor: mockUsers[0],
    lat: 11.08,
    lng: 77.01,
  },
  {
    id: 'd2',
    foodName: 'Homemade Bread',
    status: 'Claimed',
    quantity: '20 loaves',
    location: 'Gandhipuram',
    expires: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    donor: mockUsers[1],
    lat: 11.01,
    lng: 76.95,
  },
  {
    id: 'd3',
    foodName: 'Canned Beans',
    status: 'Delivered',
    quantity: '50 cans',
    location: 'R.S. Puram',
    expires: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000), // 1 month from now
    donor: mockUsers[2],
    lat: 11.00,
    lng: 76.94,
  },
  {
    id: 'd4',
    foodName: 'Birthday Cake',
    status: 'Available',
    quantity: '1 large cake',
    location: 'Saibaba Colony',
    expires: new Date(new Date().getTime() + 12 * 60 * 60 * 1000), // 12 hours from now
    donor: mockUsers[0],
    lat: 11.02,
    lng: 76.94,
  },
   {
    id: 'd5',
    foodName: 'Leftover Wedding Feast',
    status: 'Pending',
    quantity: 'Feeds 50+ people',
    location: 'Peelamedu',
    expires: new Date(new Date().getTime() + 8 * 60 * 60 * 1000), // 8 hours from now
    donor: mockUsers[3],
    lat: 11.03,
    lng: 77.03,
  },
];
