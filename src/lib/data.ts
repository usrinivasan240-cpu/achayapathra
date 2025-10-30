import { Donation, User } from './types';
import { PlaceHolderImages } from './placeholder-images';

const findImage = (id: string) => PlaceHolderImages.find((img) => img.id === id)?.imageUrl || '';

export const mockUsers: User[] = [
  { id: '1', name: 'Olivia Martin', email: 'olivia.martin@email.com', points: 1250, avatarUrl: findImage('user-avatar-1') },
  { id: '2', name: 'Jackson Lee', email: 'jackson.lee@email.com', points: 1100, avatarUrl: findImage('user-avatar-2') },
  { id: '3', name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', points: 980, avatarUrl: findImage('user-avatar-3') },
  { id: '4', name: 'William Kim', email: 'william.kim@email.com', points: 950, avatarUrl: findImage('user-avatar-4') },
  { id: '5', name: 'Sofia Davis', email: 'sofia.davis@email.com', points: 870, avatarUrl: findImage('user-avatar-5') },
];

export const mockDonations: Donation[] = [
  {
    id: 'DON001',
    foodName: 'Homemade Vegetable Soup',
    quantity: '10 Liters',
    status: 'Available',
    expires: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    donor: mockUsers[0],
    location: 'Greenwood Community Center'
  },
  {
    id: 'DON002',
    foodName: 'Assorted Sandwiches',
    quantity: '50 units',
    status: 'Claimed',
    expires: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    donor: mockUsers[1],
    location: 'Downtown Shelter'
  },
  {
    id: 'DON003',
    foodName: 'Fresh Garden Salads',
    quantity: '30 portions',
    status: 'Available',
    expires: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    donor: mockUsers[2],
    location: 'Eastside Clinic'
  },
  {
    id: 'DON004',
    foodName: 'Baked Pasta Casserole',
    quantity: '5 large trays',
    status: 'Delivered',
    expires: new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    donor: mockUsers[3],
    location: 'Northside Family Hub'
  },
  {
    id: 'DON005',
    foodName: 'Fruit Baskets',
    quantity: '20 baskets',
    status: 'Pending',
    expires: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    donor: mockUsers[4],
    location: 'Westend Mobile Kitchen'
  },
];
