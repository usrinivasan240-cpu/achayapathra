
import { Donation, User } from './types';
import { PlaceHolderImages } from './placeholder-images';

const findImage = (id: string) => PlaceHolderImages.find((img) => img.id === id)?.imageUrl || '';

export const mockUsers: User[] = [
  { id: '1', name: 'Olivia Martin', email: 'olivia.martin@email.com', points: 1250, avatarUrl: findImage('user-avatar-1'), phone: '+91 98765 43210' },
  { id: '2', name: 'Jackson Lee', email: 'jackson.lee@email.com', points: 1100, avatarUrl: findImage('user-avatar-2'), phone: '+91 98765 43211' },
  { id: '3', name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', points: 980, avatarUrl: findImage('user-avatar-3'), phone: '+91 98765 43212' },
  { id: '4', name: 'William Kim', email: 'william.kim@email.com', points: 950, avatarUrl: findImage('user-avatar-4'), phone: '+91 98765 43213' },
  { id: '5', name: 'Sofia Davis', email: 'sofia.davis@email.com', points: 870, avatarUrl: findImage('user-avatar-5'), phone: '+91 98765 43214' },
];

export const mockDonations: Donation[] = [
  {
    id: 'DON001',
    foodName: 'Sambar Rice',
    quantity: '50 plates',
    status: 'Available',
    expires: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    donor: mockUsers[0],
    location: '123, Gandhi Road, T. Nagar, Chennai'
  },
  {
    id: 'DON002',
    foodName: 'Idli with Chutney',
    quantity: '50 plates',
    status: 'Claimed',
    expires: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    donor: mockUsers[1],
    location: '45, Big Bazaar Street, Coimbatore'
  },
  {
    id: 'DON003',
    foodName: 'Lemon Rice',
    quantity: '30 plates',
    status: 'Available',
    expires: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    donor: mockUsers[2],
    location: '789, West Masi Street, Madurai'
  },
  {
    id: 'DON004',
    foodName: 'Vegetable Biryani',
    quantity: '40 plates',
    status: 'Delivered',
    expires: new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    donor: mockUsers[3],
    location: '10, NSB Road, Trichy'
  },
  {
    id: 'DON005',
    foodName: 'Pongal',
    quantity: '20 plates',
    status: 'Pending',
    expires: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    donor: mockUsers[4],
    location: '22, Main Road, Salem'
  },
];
