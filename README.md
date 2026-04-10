# Bike Rental Platform

A full-stack bike rental platform for customers, vendors, and admins, with a modern React UI, booking workflows, notifications, reviews, and AI-assisted pricing and support.

## Highlights

- Clean, responsive frontend built for vendor and customer workflows.
- AI chatbot for platform help and quick Q&A.
- Route safety prediction for Sri Lankan locations.
- AI price prediction for vendor add and update bike pages.
- Strict booking status validation to prevent invalid transitions.
- Real-time notifications and email review follow-ups.

## Latest Updates

- Added a Flask price prediction backend and connected it to the vendor bike add/update pages.
- Vendor edits now require admin re-approval before a bike goes live again.
- When an admin approves a vendor account, the vendor now receives both an in-app notification and an email alert.
- Notification totals now show in Sri Lankan rupees instead of dollar formatting.
- Added more polished UI actions for AI suggested price on bike forms.
- Expanded AI launcher scripts to include all Python services.
- Improved homepage discovery with rotating bikes and featured destinations.

## Core Features

### Authentication and Access
- JWT-based authentication
- Roles: `user`, `vendor`, `admin`
- Role-based route protection in frontend and backend
- Google login support

### Booking and Orders
- Multi-bike booking flow
- Bike-level status tracking inside orders
- Strict status transition validation
- Payment support: card and PayPal
- Vendor and customer order views

### Reviews and Feedback
- Multi-dimensional reviews for bikes and vendors
- Review eligibility checks for completed bookings
- Duplicate review prevention
- Featured reviews for homepage
- Helpful votes and vendor responses

### Notifications
- Real-time notifications via Socket.IO
- In-app notification center with unread count
- Admin notification center for platform events
- Email notifications for booking lifecycle events
- Vendor approval notifications (in-app + email) on admin approval
- Completion emails include direct review links

### AI Features
- Chatbot API for user support and platform guidance
- Route safety prediction API using model, weather, and geocoding
- Bike price prediction API for vendor pricing suggestions
- Frontend integration for chatbot, route safety, and bike pricing flows

### Dashboards
- Admin analytics: users, products, orders, reviews, revenue
- Vendor analytics: earnings, bookings, bike status, and trends

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
- Gemini API integration for chatbot
- Joblib model inference for route safety and price prediction
- Open-Meteo integration for route safety weather context

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
    bikerecommendationbackend/
      app.py
      requirements.txt
    pricepredictbackend/
      app.py
      requirements.txt
      bike_price_model.joblib
      model_columns.joblib
  README.md
  NOTIFICATION_SETUP.md
```

## Prerequisites

- Node.js 18+
- MongoDB, local or cloud
- Python 3.10+

## Setup

### 1. Install JavaScript Dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Install AI Backend Dependencies

```bash
cd aibackend
py -m venv .venv
.\.venv\Scripts\python -m pip install -r chatbotbackend\requirements.txt
.\.venv\Scripts\python -m pip install -r routesafetybackend\requirements.txt
.\.venv\Scripts\python -m pip install -r bikerecommendationbackend\requirements.txt
.\.venv\Scripts\python -m pip install -r pricepredictbackend\requirements.txt
```

### 3. Configure Environment Variables

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/bikerentalplatform
JWT_SECRET=your_jwt_secret

FRONTEND_URL=http://localhost:5173

PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_CURRENCY=USD
PAYPAL_LKR_PER_USD=300

EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

Create `frontend/.env`:

```env
VITE_BACKEND_URL=http://localhost:5000/api
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_CHATBOT_URL=http://localhost:8000/api/chatbot/chat
VITE_ROUTE_SAFETY_API_URL=http://127.0.0.1:5001
VITE_BIKE_RECOMMENDATION_API_URL=http://127.0.0.1:5002
VITE_PRICE_PREDICT_API_URL=http://127.0.0.1:5003
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

### Terminal 3: AI Backends

From `aibackend`, run one of these:

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
- Bike Recommendation API: http://localhost:5002
- Price Prediction API: http://localhost:5003

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
- `PUT /api/users/vendor/:id/approval` (admin vendor approval action)

### Products
- `GET /api/products/available`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `PUT /api/products/admin/:id/approve`

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
- `POST /api/bike-recommendation/predict` (bike recommendation backend, port 5002)
- `POST /api/price-predict/predict` (price prediction backend, port 5003)

## UI Notes

- The vendor bike add and update forms now include an AI suggested price action.
- Product edits require admin approval again after update.
- Notifications display totals in Sri Lankan rupees.
- The homepage uses featured content and rotating cards for a more dynamic first impression.

## Notes

- Notification setup and advanced examples are documented in `NOTIFICATION_SETUP.md`.
- Some legacy route names are intentionally kept for compatibility, for example `/products/vender`.
- Do not commit real `.env` secrets.
