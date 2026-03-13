import { Routes } from "react-router-dom";
import Header from "../../components/header";
import { Route } from "react-router-dom";
import Notfoundpage from "../notfound.jsx";
import Footer from "../../components/footer.jsx";
import Findbike from "./user/findbike.jsx";
import Bikes from "./vendor/bikes.jsx";
import AddbikePage from "./vendor/addbikePage.jsx";
import ProtectedRoute from "../../components/ProtectedRoute.jsx";
import UpdatebikePage from "./vendor/updatebikepage.jsx";
import BikeOverview from "./user/bikeoverview.jsx";
import Cart from "./user/cart.jsx";
import Checkout from "./user/checkout.jsx";
import Mybooking from "./user/mybooking.jsx";
import VendorBooking from "./vendor/vendorbooking.jsx";
import EarningsPage from "./vendor/earning.jsx";
import Dashboard from "./vendor/dashboard.jsx";
import Profile from "./user/profile.jsx";
import PlaceOverview from "./user/placeoverview.jsx";
import Destinations from "./user/destinations.jsx";
import OrderSuccess from './user/ordersuccess.jsx';
export default function Clientpage() {
  return (
    <div className="w-full min-h-screen bg-[var(--main-background)] flex flex-col overflow-hidden">
        <Header />
        <Routes>
            <Route path="/find-bikes" element={<Findbike />} />
            <Route path="/ai-suggestions" element={<h1 className="text-black">AI Suggestions Page</h1>} />
            <Route path="/my-bookings" element={
              <ProtectedRoute requiredRole="user">
                <Mybooking />
              </ProtectedRoute>
            } />
            <Route path="/routes" element={<h1 className="text-black">Routes & Safety Page</h1>} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/bookings" element={
              <ProtectedRoute requiredRole="user">
                <h1 className="text-black">Bookings Page</h1>
              </ProtectedRoute>
            } />
            <Route path="/vendor/dashboard" element={
              <ProtectedRoute requiredRole="vendor">
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/vendor/bikes" element={
              <ProtectedRoute requiredRole="vendor">
                <Bikes />
              </ProtectedRoute>
            } />
            <Route path="/vendor/add-bike" element={
              <ProtectedRoute requiredRole="vendor">
                <AddbikePage />
              </ProtectedRoute>
            } />
            
            <Route path="/vendor/bookings" element={
              <ProtectedRoute requiredRole="vendor">
                <VendorBooking />
              </ProtectedRoute>
            } />
            <Route path="/vendor/earning" element={
              <ProtectedRoute requiredRole="vendor">
                <EarningsPage />
              </ProtectedRoute>
            } />
            <Route path="/vendor/reviews" element={
              <ProtectedRoute requiredRole="vendor">
                <h1 className="text-black">Vendor Reviews Page</h1>
              </ProtectedRoute>
            } />
            <Route path="/vendor/update-bike" element={
              <ProtectedRoute requiredRole="vendor">
                <UpdatebikePage />
              </ProtectedRoute>
            } />
            <Route path="/cart" element={
              <ProtectedRoute requiredRole="user">
                <Cart />
              </ProtectedRoute>
            } />
             <Route path="/checkout" element={
              <ProtectedRoute requiredRole="user">
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="/destinations" element={<Destinations/>} />
            <Route path="/order-success" element={
              <ProtectedRoute requiredRole="user">
                <OrderSuccess />
              </ProtectedRoute>
            } />
           
            <Route path="/*" element={<Notfoundpage />} />
            <Route path="/bikeoverview/:bikeid" element={<BikeOverview />} />
            <Route path="/placeoverview/:placeid" element={<PlaceOverview />} />
        </Routes>
       
    </div>
  );
}