
import { Donation, User } from './types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'பிரியா குமாரி',
    email: 'priya@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    points: 1250,
    address: '123 மாப்பிள் தெரு, ஸ்பிரிங்ஃபீல்டு',
    phone: '555-1234',
  },
  {
    id: '2',
    name: 'அர்ஜுன் செல்வம்',
    email: 'arjun@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705d',
    points: 850,
    address: '456 ஓக் அவென்யூ, ஸ்பிரிங்ஃபீல்டு',
    phone: '555-5678',
  },
  {
    id: '3',
    name: 'ஆனந்தி சர்மா',
    email: 'anandhi@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026706d',
    points: 1500,
    address: '789 பைன் லேன், ஸ்பிரிங்ஃபீல்டு',
    phone: '555-9012',
  },
  {
    id: '4',
    name: 'விக்ரம் சிங்',
    email: 'vikram@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026707d',
    points: 700,
    address: '321 பிர்ச் சாலை, ஸ்பிரிங்ஃபீல்டு',
    phone: '555-3456',
  },
  {
    id: '5',
    name: 'மீரா கிருஷ்ணன்',
    email: 'meera@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026708d',
    points: 2100,
    address: '654 எல்ம் தெரு, ஸ்பிரிங்ஃபீல்டு',
    phone: '555-7890',
  },
];

export const mockDonations: Donation[] = [
  {
    id: 'd1',
    foodName: 'புதிய காய்கறி கறி',
    status: 'Available',
    quantity: '10 பேருக்கு உணவளிக்கும்',
    location: 'சரவணம்பட்டி',
    expires: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    donor: mockUsers[0],
    lat: 11.08,
    lng: 77.01,
  },
  {
    id: 'd2',
    foodName: 'வீட்டில் தயாரிக்கப்பட்ட ரொட்டி',
    status: 'Claimed',
    quantity: '20 ரொட்டிகள்',
    location: 'காந்திபுரம்',
    expires: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    donor: mockUsers[1],
    lat: 11.01,
    lng: 76.95,
  },
  {
    id: 'd3',
    foodName: 'பதிவு செய்யப்பட்ட பீன்ஸ் வகை',
    status: 'Delivered',
    quantity: '50 கேன்கள்',
    location: 'ஆர்.எஸ். புரம்',
    expires: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000), // 1 month from now
    donor: mockUsers[2],
    lat: 11.00,
    lng: 76.94,
  },
  {
    id: 'd4',
    foodName: 'பிறந்தநாள் கேக்',
    status: 'Available',
    quantity: '1 பெரிய கேக்',
    location: 'சாய்பாபா காலனி',
    expires: new Date(new Date().getTime() + 12 * 60 * 60 * 1000), // 12 hours from now
    donor: mockUsers[0],
    lat: 11.02,
    lng: 76.94,
  },
   {
    id: 'd5',
    foodName: 'மீதமுள்ள திருமண விருந்து உணவு',
    status: 'Pending',
    quantity: '50+ பேருக்கு உணவளிக்கும்',
    location: 'பீளமேடு',
    expires: new Date(new Date().getTime() + 8 * 60 * 60 * 1000), // 8 hours from now
    donor: mockUsers[3],
    lat: 11.03,
    lng: 77.03,
  },
];
