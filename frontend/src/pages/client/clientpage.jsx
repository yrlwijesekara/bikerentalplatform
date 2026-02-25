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
                <h1 className="text-black">User Profile Page</h1>
              </ProtectedRoute>
            } />
            <Route path="/bookings" element={
              <ProtectedRoute requiredRole="user">
                <h1 className="text-black">Bookings Page</h1>
              </ProtectedRoute>
            } />
            <Route path="/vendor/dashboard" element={
              <ProtectedRoute requiredRole="vendor">
                <h1 className="text-black">Vendor Dashboard</h1>
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
                <h1 className="text-black">Vendor Bookings Page</h1>
              </ProtectedRoute>
            } />
            <Route path="/vendor/earnings" element={
              <ProtectedRoute requiredRole="vendor">
                <h1 className="text-black">Vendor Earnings Page</h1>
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
            <Route path="/about-sri-lanka" element={<h1 className="text-black">About Sri Lanka Travel Page</h1>} />
           
            <Route path="/*" element={<Notfoundpage />} />
            <Route path="/bikeoverview/:bikeid" element={<BikeOverview />} />
        </Routes>
       
    </div>
  );
}