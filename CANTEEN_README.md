# Canteen Ordering System - MERN Stack

A comprehensive MERN stack application for managing canteen food ordering with real-time order tracking and admin dashboard.

## Features

### User Features
- ✅ User authentication (Signup/Login)
- ✅ Browse food items by category (Breakfast, Lunch, Snacks, Beverages)
- ✅ Add items to cart
- ✅ Apply coupon codes for discounts
- ✅ Real-time billing calculation (GST 5% + ₹2 service charge per item)
- ✅ Place orders with payment simulation
- ✅ Receive token number (e.g., TN102)
- ✅ Real-time order status tracking
- ✅ View order history

### Admin Features
- ✅ Admin dashboard with sales analytics
- ✅ Add/Edit/Delete menu items
- ✅ View all orders
- ✅ Update order status (Pending → Cooking → Ready → Delivered)
- ✅ Daily and monthly sales reports
- ✅ Revenue calculations
- ✅ Order statistics

### Technical Features
- JWT authentication with password hashing
- Responsive design with TailwindCSS
- Dark mode support
- Confetti animation on order placement
- Real-time order updates
- Form validation with Zod

## Tech Stack

- **Frontend**: Next.js 14, React 18, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcryptjs
- **UI Components**: Radix UI
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **State Management**: React Hooks + localStorage

## Project Structure

```
src/
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── menu/           # Menu management
│   │   ├── orders/         # Order management
│   │   ├── reports/        # Sales reports
│   │   └── coupons/        # Coupon validation
│   ├── canteen/            # User pages
│   │   ├── home/          # Food listing
│   │   ├── cart/          # Shopping cart
│   │   ├── checkout/      # Checkout page
│   │   └── orders/        # Order tracking
│   ├── admin/             # Admin pages
│   │   ├── dashboard/     # Admin dashboard
│   │   ├── orders/        # Order management
│   │   ├── menu/          # Menu management
│   │   ├── reports/       # Sales reports
│   │   └── settings/      # Settings
│   └── globals.css
├── components/
│   ├── ui/               # UI components
│   └── FoodCard.tsx      # Food item card
├── hooks/
│   ├── useAuth.ts        # Authentication hook
│   └── useCart.ts        # Cart management hook
└── lib/
    ├── models/           # Mongoose models
    ├── auth/            # Auth utilities
    ├── validations/     # Zod schemas
    ├── db.ts            # Database connection
    └── utils.ts
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Environment Setup

1. Clone the repository
```bash
git clone <repository-url>
cd canteen-ordering
```

2. Install dependencies
```bash
npm install
```

3. Create `.env.local` file (copy from `.env.example`)
```bash
cp .env.example .env.local
```

4. Update environment variables in `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/canteen-ordering
JWT_SECRET=your-super-secret-key-here
NODE_ENV=development
```

### Running Locally

1. Start MongoDB
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (update MONGODB_URI in .env.local)
```

2. Start the development server
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Menu Items
- `GET /api/menu` - Get all menu items (with filters)
- `POST /api/menu/add` - Add menu item (admin only)
- `PUT /api/menu/[id]` - Update menu item (admin only)
- `DELETE /api/menu/[id]` - Delete menu item (admin only)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get orders (user gets own, admin gets all)
- `GET /api/orders/[id]` - Get order details
- `PUT /api/orders/[id]` - Update order status (admin only)

### Reports
- `GET /api/reports/daily` - Get daily sales report
- `GET /api/reports/monthly` - Get monthly sales report

### Coupons
- `POST /api/coupons/validate` - Validate coupon code

## User Roles

### Student/User
- Browse and order food items
- Manage shopping cart
- Track orders in real-time
- View order history

### Canteen Admin
- Manage menu items
- View and process orders
- Update order status
- View daily/monthly reports
- Configure canteen settings

### Super Admin (Optional)
- Manage multiple canteens
- Add/remove admin users
- View platform-wide analytics

## Billing Example

For an order with:
- Item 1: ₹100 × 2 = ₹200
- Item 2: ₹50 × 1 = ₹50
- Total Items: 3

Calculation:
```
Subtotal: ₹250
GST (5%): ₹12.50
Service Charge (₹2 × 3): ₹6
Subtotal with charges: ₹268.50

If Coupon "FIRST10" (10% off) applied:
Discount: ₹26.85
Final Total: ₹241.65
```

## Default Test Credentials

### User Account
- Email: user@test.com
- Password: password123

### Admin Account
- Email: admin@test.com
- Password: admin123

## Deployment

### Vercel (Frontend)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### MongoDB Atlas (Database)
1. Create account at mongodb.com/atlas
2. Create cluster and database
3. Get connection string
4. Add to `MONGODB_URI` environment variable

### Backend Deployment (Render/Railway)
1. Deploy Next.js app to Render or Railway
2. Set environment variables
3. Configure MongoDB connection

## Future Enhancements

- [ ] WebSocket integration for real-time updates
- [ ] Push notifications when order is ready
- [ ] QR code generation for token numbers
- [ ] Review and rating system
- [ ] Favorite items management
- [ ] Offer banners
- [ ] Feedback form
- [ ] Multiple canteen support
- [ ] Admin inventory management
- [ ] Staff management system

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions, please open an issue on GitHub.
