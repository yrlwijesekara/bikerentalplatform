# 🏍️ Bike Rental Platform

A comprehensive full-stack bike rental platform that connects bike owners (vendors) with customers looking to rent bikes. The platform supports multiple user roles, multi-vendor bookings, real-time order management, and provides a seamless experience for bike rentals with advanced analytics and mobile-responsive design.

## ✨ Key Features

### 🔐 Multi-role Authentication & Authorization
- **Three User Types**: Customers, Vendors, and Admins with role-based permissions
- **Secure Admin Panel**: Backend-verified authorization preventing unauthorized access
- **JWT Authentication**: Secure token-based authentication with proper validation
- **Protected Routes**: Role-based access control for all sensitive areas

### 🚴‍♂️ Advanced Booking System
- **Multi-vendor Orders**: Single order can contain bikes from multiple vendors
- **Bike-level Status Tracking**: Individual status management for each bike in an order
- **Real-time Order Management**: Vendors can update bike statuses independently
- **Smart Order Status**: Automatic order status calculation based on individual bike statuses
- **Payment Integration**: Secure card payment processing with automatic bike availability updates

### 📊 Vendor Analytics & Management
- **Earnings Dashboard**: Comprehensive revenue analytics with date filtering
- **Monthly Revenue Charts**: Visual representation of earnings trends
- **Order Statistics**: Average order value, completion rates, and performance metrics
- **Vendor Booking Management**: Dedicated interface for managing customer bookings
- **Customer Information Display**: Easy access to customer contact details and bike assignments

### 📱 Mobile-First Responsive Design
- **Hybrid Interactions**: Desktop hover tooltips + mobile expandable sections
- **Touch-Friendly Interface**: Optimized for mobile devices and touch interactions
- **Responsive Bike Status Display**: Different behaviors for desktop and mobile users
- **Mobile-Optimized Vendor Info**: Clean layout for vendor contact information

### 🛒 Shopping & Checkout Experience
- **Shopping Cart**: Add multiple bikes from different vendors to cart
- **Smart Checkout**: Handle multi-vendor orders with proper vendor assignment
- **Service Fee Calculation**: Automatic 10% service fee with transparent pricing
- **Order Summary**: Detailed breakdown of costs and rental periods

## 🛠️ Tech Stack

### Frontend
- **React 19.2.0** - Modern frontend library with latest features
- **Vite** - Lightning-fast build tool and development server
- **Tailwind CSS 4.1.18** - Utility-first CSS framework for responsive design
- **React Router DOM 7.11.0** - Client-side routing with protected routes
- **Axios** - HTTP client for API communications
- **React Hot Toast** - Beautiful toast notifications for user feedback
- **React Icons** - Comprehensive icon library

### Backend
- **Node.js with Express 5.2.1** - Robust web framework
- **MongoDB with Mongoose 9.0.2** - NoSQL database with object modeling
- **JWT** - JSON Web Tokens for secure authentication
- **bcrypt** - Industry-standard password hashing
- **CORS** - Cross-origin resource sharing configuration

## 📁 Updated Project Structure

```
bikerentalplatform/
├── backend/
│   ├── index.js                 # Main server with middleware setup
│   ├── package.json             # Backend dependencies
│   ├── controllers/             # Business logic controllers
│   │   ├── orderController.js   # Order management & bike status tracking
│   │   ├── placeController.js   # Places management
│   │   ├── productController.js # Bike inventory management
│   │   └── userController.js    # User authentication & management
│   ├── model/                   # MongoDB schemas
│   │   ├── order.js            # Order schema with bike-level status
│   │   ├── places.js           # Tourist places model
│   │   ├── product.js          # Bike/product model
│   │   └── user.js             # User model with vendor details
│   └── routes/                  # API route definitions
│       ├── orderRouter.js       # Order management routes
│       ├── placeRouter.js       # Places API routes
│       ├── productRouter.js     # Product/bike routes
│       └── userRouter.js        # User authentication routes
└── frontend/
    ├── package.json             # Frontend dependencies
    ├── index.html              # Main HTML template
    ├── vite.config.js          # Vite build configuration
    ├── public/                 # Static assets
    └── src/
        ├── App.jsx             # Main application component
        ├── main.jsx            # Application entry point
        ├── components/         # Reusable UI components
        │   ├── footer.jsx
        │   ├── header.jsx
        │   ├── imageslider.jsx
        │   ├── loader.jsx
        │   ├── PaymentDetails.jsx
        │   ├── productcard.jsx
        │   ├── ProtectedRoute.jsx  # Role-based route protection
        │   ├── PublicNavbar.jsx
        │   ├── UserNavbar.jsx
        │   └── VendorNavbar.jsx
        ├── pages/              # Page components
        │   ├── homepage.jsx
        │   ├── loginpage.jsx
        │   ├── registrationpage.jsx
        │   ├── adminpage.jsx      # Secure admin panel
        │   ├── notfound.jsx
        │   ├── admin/
        │   │   └── productAdmin.jsx
        │   └── client/
        │       ├── clientpage.jsx
        │       ├── user/          # Customer pages
        │       │   ├── bikeoverview.jsx
        │       │   ├── cart.jsx         # Shopping cart
        │       │   ├── checkout.jsx     # Payment & checkout
        │       │   ├── findbike.jsx     # Bike search & filter
        │       │   └── mybooking.jsx    # Order history with status
        │       └── vendor/        # Vendor dashboard pages
        │           ├── addbikePage.jsx
        │           ├── bikes.jsx
        │           ├── updatebikePage.jsx
        │           ├── vendorbooking.jsx # Booking management
        │           └── earning.jsx      # Analytics dashboard
        └── utils/
            ├── cart.js             # Cart management utilities
            └── mediaupload.jsx     # File upload utilities
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bikerentalplatform
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration**
   
   Create a `.env` file in the backend directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/bikerental
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=5000
   NODE_ENV=development
   ```
   
   Create a `.env` file in the frontend directory:
   ```env
   VITE_BACKEND_URL=http://localhost:5000
   ```

### 🏃‍♂️ Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   npm start
   ```
   Server runs on `http://localhost:5000`

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   Application runs on `http://localhost:5173`

## 🔐 User Roles & Permissions

### 👤 Customer (User)
- **Browse & Search**: Explore available bikes with advanced filtering
- **Multi-vendor Cart**: Add bikes from different vendors to shopping cart
- **Secure Booking**: Complete orders with card payment integration
- **Order Tracking**: Real-time status updates for each rented bike
- **Booking History**: View past rentals with detailed order information
- **Responsive Interface**: Mobile-optimized bike status display
- **Vendor Contact**: Access vendor information for each booked bike

### 🏪 Vendor
- **Inventory Management**: List and manage bike rental inventory
- **Dynamic Pricing**: Set flexible rental rates and availability
- **Order Management**: Handle multi-vendor bookings with bike-level control
- **Status Tracking**: Update individual bike statuses (pending → confirmed → ongoing → completed)
- **Customer Communication**: Access customer contact information
- **Analytics Dashboard**: Comprehensive earnings analysis with visual charts
- **Revenue Insights**: Monthly earnings breakdown and performance metrics
- **Smart Filtering**: Filter bookings by date, status, and customer

### 🛡️ Admin
- **Platform Oversight**: Complete administrative control with enhanced security
- **Backend Authorization**: Secure admin panel with server-side role verification
- **User Management**: Create, manage, and block accounts across all user types
- **Places Management**: Full CRUD operations for tourist destinations
- **Content Moderation**: Control platform content and user permissions
- **System Security**: Protected from unauthorized access via URL manipulation
- **Order Oversight**: Monitor all platform transactions and status changes

## 🏍️ Platform Features

### Bike Management
The platform supports detailed bike specifications including:
- **Bike Type**: Scooter, Gear Bike
- **Engine Capacity**: CC specifications
- **Fuel Type**: Petrol, Electric, etc.
- **Service History**: Last service date tracking
- **Location**: GPS coordinates for accurate positioning
- **Pricing**: Flexible pricing models
- **Availability**: Real-time availability status

### Places Management
Tourist destinations and places with comprehensive details:
- **Categories**: Beach, Mountain, Historical, Waterfall, Wildlife, Religious, Scenic
- **Location Information**: City, district, and precise coordinates
- **Visitor Information**: Opening hours, entrance fees, and descriptions
- **Featured Places**: Highlight popular destinations
- **Status Control**: Active/Inactive visibility for users

### 🔌 API Endpoints

#### 🔐 Authentication & Users
- `POST /api/users/register` - User registration with role assignment
- `POST /api/users/login` - JWT-based authentication
- `GET /api/users` - Get authenticated user info (role verification)
- `POST /api/users/create-admin` - Admin-only user creation

#### 🚴‍♂️ Bikes/Products
- `GET /api/products` - Get all bikes with vendor info
- `GET /api/products/:id` - Get specific bike details
- `POST /api/products` - Create bike listing (vendor only)
- `PUT /api/products/:id` - Update bike information (vendor only)
- `DELETE /api/products/:id` - Remove bike listing (vendor only)

#### 📦 Order Management (New)
- `POST /api/orders` - Create multi-vendor order with payment processing
- `GET /api/orders/my-orders` - Get customer order history
- `GET /api/orders/vendor-orders` - Get vendor-specific orders with filtering
- `PUT /api/orders/:orderId/status` - Update order/bike status
  - Supports `orderStatus` for admin-level changes
  - Supports `bikeId` & `bikeStatus` for vendor bike-level updates
  - Supports `paymentStatus` for payment management
- `GET /api/orders/:orderId` - Get detailed order information

#### 🗺️ Places
- `GET /api/places` - Get places (active only for users/vendors, all for admin)
- `GET /api/places/:id` - Get specific place details
- `POST /api/places` - Create tourist place (admin only)
- `PUT /api/places/:id` - Update place information (admin only)
- `DELETE /api/places/:id` - Remove place (admin only)

## 📱 Pages & Components

- **Homepage**: Main landing page with bike listings
- **Login/Registration**: User authentication
- **Admin Panel**: Administrative dashboard
- **Product Management**: Add/edit bike listings
- **User Profile**: Profile management
- **404 Page**: Custom not found page

## 🔧 Development Scripts

### Frontend
```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

### Backend
```bash
npm start         # Start server with nodemon
npm test          # Run tests (configured)
```

## 🛡️ Security Features

### 🔒 Authentication & Authorization
- **JWT Authentication**: Secure token-based user authentication
- **Role-based Access Control**: Granular permissions for different user types
- **Backend Role Verification**: Server-side role validation prevents privilege escalation
- **Protected Admin Panel**: Multi-layer security preventing unauthorized admin access
- **Session Management**: Proper token handling with automatic cleanup

### 🔐 Data Protection
- **Password Hashing**: bcrypt with salt for secure password storage
- **Input Validation**: Comprehensive request validation and sanitization
- **CORS Configuration**: Controlled cross-origin resource sharing
- **Environment Variables**: Secure configuration management
- **Error Handling**: Safe error messages without information leakage

### 🚫 Access Control
- **URL Manipulation Protection**: Backend verification prevents unauthorized page access
- **Token Validation**: Real-time token verification for all sensitive operations
- **Role Redirection**: Smart redirection based on actual user permissions
- **Admin Verification**: Multi-step admin access validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## � Advanced Features

### 📊 Analytics & Reporting
- **Vendor Earnings Dashboard**: Real-time revenue tracking with visual charts
- **Date-based Filtering**: Analyze earnings by specific dates, months, or years
- **Performance Metrics**: Average order value and completion rate analysis
- **Monthly Revenue Charts**: Interactive bar charts showing earnings trends

### 🔄 Real-time Order Management
- **Bike-level Status Tracking**: Individual status for each bike in multi-vendor orders
- **Automatic Status Calculation**: Smart order status based on individual bike statuses
- **Vendor Independence**: Each vendor manages only their bikes in shared orders
- **Customer Notifications**: Real-time updates on booking status changes

### 📱 Mobile Experience
- **Responsive Design**: Mobile-first approach with touch-optimized interfaces
- **Hybrid Interactions**: Desktop hover tooltips + mobile expandable sections
- **Touch-friendly Controls**: Optimized buttons and navigation for mobile devices
- **Progressive Web App Ready**: Fast loading and offline capabilities

## 🔧 Development & Deployment

### 🛠️ Development Workflow
```bash
# Install dependencies
npm install # in both frontend and backend directories

# Start development servers
npm run dev    # Frontend (Vite dev server)
npm start      # Backend (with nodemon)

# Build for production
npm run build  # Frontend production build
```

### 🚀 Deployment Considerations
- **Environment Variables**: Ensure proper configuration for production
- **Database**: MongoDB Atlas recommended for production
- **File Uploads**: Configure media storage solution
- **CORS**: Update allowed origins for production domains
- **SSL**: Enable HTTPS for secure token transmission

## 📝 License

This project is licensed under the ISC License.

## 🐛 Troubleshooting

### Common Issues
- **Authentication Errors**: Verify JWT secret consistency between environments
- **Database Connection**: Check MongoDB URI and network connectivity
- **CORS Issues**: Ensure frontend URL is in backend CORS configuration
- **File Upload**: Verify media upload paths and permissions
- **Mobile Responsiveness**: Test on actual devices for touch interactions

### Performance Optimization
- **Database Indexing**: Proper indexes on frequently queried fields
- **Image Optimization**: Compress images before upload
- **Lazy Loading**: Implement lazy loading for bike listings
- **Caching**: Consider Redis for session and frequently accessed data

## 📞 Support & Contributing

### 🤝 How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Implement your feature with proper testing
4. Commit changes with descriptive messages
5. Push to your branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request with detailed description

### 💬 Getting Help
- **Issues**: Create detailed GitHub issues for bugs or feature requests
- **Documentation**: Refer to inline code comments for implementation details
- **Security**: Report security vulnerabilities privately to maintainers

---

🏍️ **Built with passion for the bike rental community** ❤️  
*Connecting bike owners with adventure seekers through technology*