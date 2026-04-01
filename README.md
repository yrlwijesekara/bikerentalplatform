# Bike Rental Platform

A full-stack bike rental web application for customers, vendors, and admins, now extended with AI-powered chatbot support and route-safety risk insights.

## What's New (April 2026)

- Added AI chatbot backend for in-app assistance and platform Q&A.
- Added route safety backend with weather-aware risk prediction for Sri Lanka locations.
- Added unified AI launcher scripts to run chatbot and route safety services together.
- Improved booking status workflow with strict transition validation.
- Enhanced review flow with completion email review links.
- Expanded homepage with rotating bikes, featured destinations, and featured reviews.

## Core Features

### Authentication and Roles
- JWT-based authentication
- Roles: `user`, `vendor`, `admin`
- Role-based route protection in frontend and backend
- Google login support

### Booking and Orders
- Multi-bike order flow
- Bike-level status tracking in orders
- Strict status transition validation
- Payment support: card and PayPal
- Vendor and customer order views

### Reviews
- Multi-dimensional reviews for bikes and vendors
- Review eligibility checks for completed bookings
- Duplicate review prevention
- Featured reviews for homepage
- Helpful votes and vendor responses

### Notifications
- Real-time notifications via Socket.IO
- In-app notification center (bell + unread count)
- Email notifications for booking lifecycle events
- Completion emails include direct review call-to-action links

### AI Features
- Chatbot API for user support and platform guidance
- Route safety prediction API based on model + weather + geocoding
- Frontend integration for chatbot widget and route safety page

### Dashboards
- Admin analytics: users, products, orders, reviews, revenue
- Vendor analytics: earnings, bookings, bike status and trends

## Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS 4
- React Router DOM 7
- Axios
- Recharts
- Socket.IO Client

### Backend
- Node.js + Express 5
- MongoDB + Mongoose
- JWT + bcrypt
- Socket.IO
- Nodemailer

### AI Backends
- Python + Flask
- Gemini API integration (chatbot)
- Joblib model inference (route safety)
- Open-Meteo integration (route safety weather context)

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
  aibackend/
    app.py
    run-ai-backends.ps1
    run-ai-backends.cmd
    chatbotbackend/
      app.py
      requirements.txt
    routesafetybackend/
      app.py
      requirements.txt
  README.md
  NOTIFICATION_SETUP.md
```

## Prerequisites

- Node.js 18+
- MongoDB (local or cloud)
- Python 3.10+

## Setup

### 1. Install JavaScript Dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Install AI Backend Dependencies (One-Time)

```bash
cd aibackend
py -m venv .venv
.\.venv\Scripts\python -m pip install -r chatbotbackend\requirements.txt
.\.venv\Scripts\python -m pip install -r routesafetybackend\requirements.txt
```

### 3. Configure Environment Variables

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/bikerentalplatform
JWT_SECRET=your_jwt_secret

# CORS
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
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_CHATBOT_URL=http://localhost:8000/api/chatbot/chat
VITE_ROUTE_SAFETY_API_URL=http://localhost:5001
```

Create `aibackend/chatbotbackend/.env`:

```env
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-2.5-flash
ALLOW_GENERAL_AI_FALLBACK=false
BACKEND_API_BASE=http://localhost:5000/api
PLACES_CONTEXT_TTL_SECONDS=120
MAX_PLACES_IN_CONTEXT=80
FRONTEND_ORIGIN=http://localhost:5173
MAX_HISTORY_TURNS=8
```

## Run the Full Application

### Terminal 1: Main Backend

```bash
cd backend
npm start
```

### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

### Terminal 3: AI Backends (Both Together)

From `aibackend` run one of:

```bash
python app.py
```

```powershell
.\run-ai-backends.ps1
```

```cmd
run-ai-backends.cmd
```

Services:
- Frontend: http://localhost:5173
- Main API: http://localhost:5000
- Chatbot API: http://localhost:8000
- Route Safety API: http://localhost:5001

## Scripts

### Backend
- `npm start` start API server with nodemon

### Frontend
- `npm run dev` run dev server
- `npm run build` build production bundle
- `npm run preview` preview production build
- `npm run lint` run ESLint

## Key API Endpoints

### Users
- `POST /api/users`
- `POST /api/users/login`
- `POST /api/users/google-login`
- `GET /api/users/profile`
- `PUT /api/users/profile`

### Products
- `GET /api/products/available`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

### Orders
- `POST /api/orders`
- `GET /api/orders/my-orders`
- `GET /api/orders/vendor-orders`
- `PUT /api/orders/:orderId/status`

### Reviews
- `POST /api/reviews/submit-multiple`
- `GET /api/reviews/product/:productId`
- `GET /api/reviews/featured`

### Places
- `GET /api/places`
- `GET /api/places/:id`

### AI Services
- `POST /api/chatbot/chat` (chatbot backend, port 8000)
- `POST /api/route-safety/predict` (route safety backend, port 5001)

## Notes

- Notification setup and advanced examples are documented in `NOTIFICATION_SETUP.md`.
- Some legacy route names are intentionally kept for compatibility (example: `/products/vender`).
- Do not commit real `.env` secrets.
