export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  points: number;
  address: string;
  phone: string;
};

export type Donation = {
  id: string;
  foodName: string;
  status: 'Available' | 'Claimed' | 'Delivered' | 'Pending';
  quantity: string;
  location: string;
  expires: Date;
  donor: User;
  lat: number;
  lng: number;
};
