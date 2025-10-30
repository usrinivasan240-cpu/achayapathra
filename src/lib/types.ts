export type Donation = {
  id: string;
  foodName: string;
  quantity: string;
  status: 'Available' | 'Claimed' | 'Delivered' | 'Pending';
  expires: Date;
  donor: {
    name: string;
    avatarUrl: string;
  };
  location: string;
};

export type User = {
  id: string;
  name:string;
  email: string;
  points: number;
  avatarUrl: string;
};
