# 🏍️ Bike Rental Platform

A comprehensive full-stack bike rental platform that connects bike owners (vendors) with customers looking to rent bikes. The platform supports multiple user roles and provides a seamless experience for bike rentals.

## ✨ Features

- **Multi-role Authentication**: Support for Users, Vendors, and Admins
- **Bike Management**: Vendors can list their bikes with detailed specifications
- **Places Management**: Admins can manage tourist places and destinations
- **User-friendly Interface**: Clean, modern UI built with React and Tailwind CSS
- **Real-time Location**: Geolocation support for bike and place listings
- **Role-based Access Control**: Granular permissions for different user types
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **Admin Panel**: Comprehensive administrative controls for platform management
- **Responsive Design**: Mobile-first, responsive design

## 🛠️ Tech Stack

### Frontend
- **React 19.2.0** - Modern frontend library
- **Vite** - Fast build tool and development server
- **Tailwind CSS 4.1.18** - Utility-first CSS framework
- **React Router DOM 7.11.0** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Beautiful notifications
- **React Icons** - Icon components
- **Supabase** - Backend as a Service integration

### Backend
- **Node.js** with **Express 5.2.1** - Web framework
- **MongoDB** with **Mongoose 9.0.2** - Database and ODM
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 📁 Project Structure

```
bikerentalplatform/
├── backend/
│   ├── index.js              # Main server file
│   ├── package.json          # Backend dependencies
│   ├── controllers/          # Business logic
│   │   ├── placecontroller.js   # Places management
│   │   ├── productcontroller.js # Bike management
│   │   └── usercontroller.js    # User management & auth
│   ├── model/               # Database schemas
│   │   ├── places.js        # Places model
│   │   ├── product.js       # Bike model
│   │   └── user.js         # User model
│   └── routes/             # API routes
│       ├── placeRouter.js   # Places routes
│       ├── productRouter.js # Product routes
│       └── userRouter.js    # User routes
└── frontend/
    ├── package.json         # Frontend dependencies
    ├── index.html          # Main HTML file
    ├── vite.config.js      # Vite configuration
    ├── public/             # Static assets
    └── src/
        ├── App.jsx         # Main App component
        ├── main.jsx        # Entry point
        ├── components/     # Reusable components
        │   ├── footer.jsx
        │   ├── header.jsx
        │   ├── loader.jsx
        │   ├── productcard.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── PublicNavbar.jsx
        │   ├── UserNavbar.jsx
        │   └── VendorNavbar.jsx
        ├── pages/          # Page components
        │   ├── homepage.jsx
        │   ├── loginpage.jsx
        │   ├── registrationpage.jsx
        │   ├── adminpage.jsx
        │   ├── notfound.jsx
        │   ├── admin/
        │   │   └── productAdmin.jsx
        │   └── client/
        │       ├── clientpage.jsx
        │       ├── user/
        │       │   ├── bikeoverview.jsx
        │       │   └── findbike.jsx
        │       └── vendor/
        │           ├── addbikePage.jsx
        │           ├── bikes.jsx
        │           └── updatebikePage.jsx
        └── utils/
            └── mediaupload.jsx
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
   JWT_SECRET=your-secret-key
   PORT=5000
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

## 🔐 User Roles

### Customer (User)
- Browse available bikes and places
- Search and filter bikes by location, type, and specifications
- View active tourist places and destinations
- Book bikes for rental
- Manage rental history

### Vendor
- List bikes for rental
- Manage bike inventory
- Set rental prices and availability
- View rental requests and bookings
- Access vendor-specific dashboard

### Admin
- **Full Platform Control**: Oversee all platform operations
- **User Management**: Create, manage, and block user accounts
- **Places Management**: Create, update, and delete tourist places
- **Bike Oversight**: Monitor and approve bike listings
- **Admin-only Features**: Only admins can create other admin accounts
- **Content Moderation**: Control visibility of places (active/inactive status)

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

### API Endpoints

#### Authentication & Users
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User authentication
- `POST /api/users/create-admin` - Admin-only user creation

#### Bikes/Products
- `GET /api/products` - Get all bikes
- `POST /api/products` - Create bike (vendor only)
- `PUT /api/products/:id` - Update bike (vendor only)
- `DELETE /api/products/:id` - Delete bike (vendor only)

#### Places
- `GET /api/places` - Get all places (active only for users/vendors)
- `GET /api/places/:id` - Get specific place
- `POST /api/places` - Create place (admin only)
- `PUT /api/places/:id` - Update place (admin only)
- `DELETE /api/places/:id` - Delete place (admin only)

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

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation and sanitization
- Protected routes for different user roles

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🐛 Known Issues

- Environment configuration may need adjustment based on deployment setup
- Some features may require additional testing across different browsers

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

---

Built with ❤️ for the bike rental community