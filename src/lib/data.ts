
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
    location: '123, Gandhi Road, T. Nagar, Chennai',
    lat: 13.0474, 
    lng: 80.2404
  },
  {
    id: 'DON002',
    foodName: 'Idli with Chutney',
    quantity: '50 plates',
    status: 'Claimed',
    expires: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    donor: mockUsers[1],
    location: '45, Big Bazaar Street, Coimbatore',
    lat: 11.0002, 
    lng: 76.9558
  },
  {
    id: 'DON003',
    foodName: 'Lemon Rice',
    quantity: '30 plates',
    status: 'Available',
    expires: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    donor: mockUsers[2],
    location: '789, West Masi Street, Madurai',
    lat: 9.9189,
    lng: 78.1105
  },
  {
    id: 'DON004',
    foodName: 'Vegetable Biryani',
    quantity: '40 plates',
    status: 'Delivered',
    expires: new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    donor: mockUsers[3],
    location: '10, NSB Road, Trichy',
    lat: 10.8279,
    lng: 78.6885
  },
  {
    id: 'DON005',
    foodName: 'Pongal',
    quantity: '20 plates',
    status: 'Pending',
    expires: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    donor: mockUsers[4],
    location: '22, Main Road, Salem',
    lat: 11.6643,
    lng: 78.1460
  },
  {
    id: 'DON006',
    foodName: 'Rasam',
    quantity: '60 plates',
    status: 'Available',
    expires: new Date(new Date().getTime() + 4 * 24 * 60 * 60 * 1000),
    donor: mockUsers[0],
    location: '34, Anna Salai, Erode',
    lat: 11.3410,
    lng: 77.7172
  },
  {
    id: 'DON007',
    foodName: 'Masala Dosa',
    quantity: '45 plates',
    status: 'Available',
    expires: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000),
    donor: mockUsers[1],
    location: '56, Cross-Cut Road, Tiruppur',
    lat: 11.1085,
    lng: 77.3411
  },
  {
    id: 'DON008',
    foodName: 'Upma',
    quantity: '25 plates',
    status: 'Claimed',
    expires: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000),
    donor: mockUsers[2],
    location: '78, VOC Street, Vellore',
    lat: 12.9165,
    lng: 79.1325
  },
  {
    id: 'DON009',
    foodName: 'Medu Vada',
    quantity: '100 plates',
    status: 'Available',
    expires: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000),
    donor: mockUsers[3],
    location: '90, Beach Road, Thoothukudi',
    lat: 8.7642,
    lng: 78.1348
  },
  {
    id: 'DON010',
    foodName: 'Kuzhi Paniyaram',
    quantity: '80 plates',
    status: 'Delivered',
    expires: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000),
    donor: mockUsers[4],
    location: '12, Bypass Road, Thanjavur',
    lat: 10.7870,
    lng: 79.1378
  },
  {
    id: 'DON011',
    foodName: 'Tomato Rice',
    quantity: '35 plates',
    status: 'Available',
    expires: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000),
    donor: mockUsers[0],
    location: '34, Palayamkottai Road, Tirunelveli',
    lat: 8.7139,
    lng: 77.7567
  },
  {
    id: 'DON012',
    foodName: 'Coconut Rice',
    quantity: '40 plates',
    status: 'Pending',
    expires: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000),
    donor: mockUsers[1],
    location: '56, Railway Station Road, Dindigul',
    lat: 10.3673,
    lng: 77.9803
  },
  {
    id: 'DON013',
    foodName: 'Curd Rice',
    quantity: '70 plates',
    status: 'Available',
    expires: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000),
    donor: mockUsers[2],
    location: '78, Bus Stand Road, Nagercoil',
    lat: 8.1833,
    lng: 77.4333
  },
  {
    id: 'DON014',
    foodName: 'Parotta with Salna',
    quantity: '55 plates',
    status: 'Claimed',
    expires: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000),
    donor: mockUsers[3],
    location: '90, Court Road, Pollachi',
    lat: 10.6622,
    lng: 77.0125
  },
  {
    id: 'DON015',
    foodName: 'Adai',
    quantity: '30 plates',
    status: 'Available',
    expires: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000),
    donor: mockUsers[4],
    location: '12, New Scheme Road, Karaikudi',
    lat: 10.0701,
    lng: 78.7778
  }
];
