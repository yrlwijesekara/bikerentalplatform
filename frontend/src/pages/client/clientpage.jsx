import { Routes } from "react-router-dom";
import Header from "../../components/header";
import { Route } from "react-router-dom";
import Notfoundpage from "../notfound.jsx";
import Footer from "../../components/footer.jsx";
import Findbike from "./findbike.jsx";
import Bikes from "./vendor/bikes.jsx";

export default function Clientpage() {
  return (
    <div className="w-full h-screen max-h-screen bg-[var(--main-background)] flex flex-col overflow-y-auto">
        <Header />
        <Routes path="/">
            <Route path="/" element={<h1 className="text-black">Client Home Page</h1>} />
            <Route path="/find-bikes" element={<Findbike />} />
            <Route path="/ai-suggestions" element={<h1 className="text-black">AI Suggestions Page</h1>} />
            <Route path="/my-bookings" element={<h1 className="text-black">My Bookings Page</h1>} />
            <Route path="/routes" element={<h1 className="text-black">Routes & Safety Page</h1>} />
            <Route path="/profile" element={<h1 className="text-black">User Profile Page</h1>} />
            <Route path="/bookings" element={<h1 className="text-black">Bookings Page</h1>} />
            <Route path="/vendor/dashboard" element={<h1 className="text-black">Vendor Dashboard</h1>} />
            <Route path="/vendor/bikes" element={<Bikes />} />
            <Route path="/vendor/bookings" element={<h1 className="text-black">Vendor Bookings Page</h1>} />
            <Route path="/vendor/earnings" element={<h1 className="text-black">Vendor Earnings Page</h1>} />
            <Route path="/vendor/reviews" element={<h1 className="text-black">Vendor Reviews Page</h1>} />
            <Route path="/about-sri-lanka" element={<h1 className="text-black">About Sri Lanka Travel Page</h1>} />
           



            
            <Route path="/*" element={<Notfoundpage />} />
            
            
        </Routes>
       
    </div>
  );
}