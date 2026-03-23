# Bike Rental Platform

A full-stack bike rental web app for customers, vendors, and admins.

Customers can discover bikes, place bookings, and leave reviews. Vendors manage inventory and bookings with analytics. Admins manage users, products, places, orders, reviews, and platform-level analytics.

## Features

### Authentication and Roles
- JWT-based authentication
- Roles: `user`, `vendor`, `admin`
- Role-based route protection in frontend and backend
- Google login support

### Booking and Orders
- Multi-bike order flow
- Bike-level status tracking in orders
- Order status transition validation
- Payment support: card and PayPal
- Vendor and customer order views

### Reviews
- Create single or multiple reviews per completed order
- Duplicate review prevention per user/order/product
- Product review listing with average rating
- Admin review management
- Featured reviews support for homepage

### Admin Capabilities
- Manage users
- Manage products (approval flow)
- Manage places (including featured places)
- View all orders with full order details
- Manage featured reviews
- Dashboard analytics with charts

### Vendor Capabilities
- Manage own bikes
- Track bookings and status updates
- View earnings and booking stats dashboard with charts

### Homepage Enhancements
- Rotating featured bikes
- Featured destinations
- Featured review slider

### Notifications
- Real-time notifications with Socket.IO
- Notification center UI
- Email notifications for key events

## Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS 4
- React Router DOM 7
- Axios
- React Hot Toast
- React Icons
- Recharts
- Socket.IO Client

### Backend
- Node.js + Express 5
- MongoDB + Mongoose
- JWT + bcrypt
- Socket.IO
- Nodemailer

## Project Structure

```text
bikerentalplatform/
   backend/
      controllers/
      model/
      routes/
      services/
      index.js
   frontend/
      src/
         components/
         contexts/
         pages/
         utils/
      package.json
   README.md
   NOTIFICATION_SETUP.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or cloud)

### 1. Install Dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure Environment Variables

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/bikerentalplatform
JWT_SECRET=your_jwt_secret

# Frontend URL for CORS and socket
FRONTEND_URL=http://localhost:5173

# PayPal
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_CURRENCY=USD
PAYPAL_LKR_PER_USD=300

# Email
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

Create `frontend/.env`:

```env
VITE_BACKEND_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 3. Run the App

Backend:

```bash
cd backend
npm start
```

Frontend:

```bash
cd frontend
npm run dev
```

## Scripts

### Backend
- `npm start` start API server with nodemon

### Frontend
- `npm run dev` run dev server
- `npm run build` build production bundle
- `npm run preview` preview production build
- `npm run lint` run ESLint

## Core API Endpoints

### Users
- `POST /api/users` create user
- `POST /api/users/login` login
- `POST /api/users/google-login` google login
- `GET /api/users` get current user from token
- `GET /api/users/all` admin list users
- `GET /api/users/profile` get profile
- `PUT /api/users/profile` update profile

### Products
- `GET /api/products` list products
- `GET /api/products/available` list available and approved products
- `GET /api/products/vender` vendor products (route name kept for compatibility)
- `GET /api/products/:id` product details
- `POST /api/products` create product
- `PUT /api/products/:id` update product
- `DELETE /api/products/:id` delete product
- `PUT /api/products/admin/:id/approve` admin approval update

### Orders
- `POST /api/orders` create order
- `GET /api/orders/my-orders` customer orders
- `GET /api/orders/vendor-orders` vendor orders
- `GET /api/orders/admin/all` admin all orders
- `GET /api/orders/admin/dashboard-stats` admin dashboard analytics
- `GET /api/orders/:orderId` get single order
- `PUT /api/orders/:orderId/status` update order or bike status
- `GET /api/orders/vendor/earnings` vendor earnings stats
- `GET /api/orders/vendor/stats` vendor booking stats

### Reviews
- `POST /api/reviews` create review
- `POST /api/reviews/submit-multiple` create multiple reviews
- `GET /api/reviews/product/:productId` product reviews and average
- `GET /api/reviews/featured` featured reviews for homepage
- `GET /api/reviews/admin/all` admin all reviews
- `PATCH /api/reviews/admin/:reviewId/featured` set featured review

### Places
- `GET /api/places`
- `GET /api/places/:id`
- `POST /api/places`
- `PUT /api/places/:id`
- `DELETE /api/places/:id`

## Dashboards

### Admin Dashboard
- Customer count
- Vendor count
- Product, order, review totals
- Revenue total
- Chart analytics:
   - Monthly orders and revenue
   - Order status distribution
   - User role distribution
   - Review ratings distribution

### Vendor Dashboard
- Total earnings
- Total bikes
- Active and completed bookings
- Monthly earnings bar chart
- Booking status pie chart

## Notes

- Notification setup and email workflow are documented in `NOTIFICATION_SETUP.md`.
- Some older route names are kept for backward compatibility (example: `/products/vender`).

