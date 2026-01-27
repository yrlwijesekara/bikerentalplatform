import { Routes, Route , Link as Links, useNavigate } from "react-router-dom";
import { RiMotorbikeFill } from "react-icons/ri";
import { VscGraph } from "react-icons/vsc";
import { FaUserAlt } from "react-icons/fa";
import { TiVendorAndroid } from "react-icons/ti";
import { FaBookmark } from "react-icons/fa6";
import { VscCodeReview } from "react-icons/vsc";
import { FiLogOut } from "react-icons/fi";
import ProductAdminPage from "./admin/productAdmin.jsx";



export default function Adminpage() {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear authentication data
        localStorage.removeItem('adminToken');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        sessionStorage.clear();
        
        // Redirect to login page
        navigate('/login');
    };

    return (
        <div className="w-full min-h-screen flex">
            <div className="w-[400px] min-h-screen bg-amber-900 flex flex-col items-center">
                
                <div className="w-[400px] m-6 gap-5 flex flex-col fixed">
                <h1 className="text-white text-4xl font-bold m-4 flex justify-center items-center">Admin Panel</h1>
                     <Links to="/admin" className="w-full flex justify-center items-center p-4 text-white border-b border-amber-700 text-2xl transition-all duration-300 hover:cursor-pointer hover:scale-105 hover:bg-amber-800 hover:shadow-lg">
                    <VscGraph className="inline-block mr-2" /> Dashboard</Links>
                <Links to="/admin/products" className="flex justify-center items-center p-4 text-white border-b border-amber-700 text-2xl transition-all duration-300 hover:cursor-pointer hover:scale-105 hover:bg-amber-800 hover:shadow-lg" >
                    <RiMotorbikeFill className="inline-block mr-2" /> Products</Links>
                <Links to="/admin/users" className="flex justify-center items-center p-4 text-white border-b border-amber-700 text-2xl transition-all duration-300 hover:cursor-pointer hover:scale-105 hover:bg-amber-800 hover:shadow-lg">
                    <FaUserAlt className="inline-block mr-2" /> Users</Links>
                <Links to="/admin/vendors" className="flex justify-center items-center p-4 text-white border-b border-amber-700 text-2xl transition-all duration-300 hover:cursor-pointer hover:scale-105 hover:bg-amber-800 hover:shadow-lg">
                    <TiVendorAndroid className="inline-block mr-2" /> Vendors</Links>
                <Links to="/admin/bookings" className="flex justify-center items-center p-4 text-white border-b border-amber-700 text-2xl transition-all duration-300 hover:cursor-pointer hover:scale-105 hover:bg-amber-800 hover:shadow-lg">
                    <FaBookmark className="inline-block mr-2" /> Bookings</Links>
                <Links to="/admin/reviews" className="flex justify-center items-center p-4 text-white border-b border-amber-700 text-2xl transition-all duration-300 hover:cursor-pointer hover:scale-105 hover:bg-amber-800 hover:shadow-lg">
                    <VscCodeReview className="inline-block mr-2" /> Reviews</Links>
                
                {/* Logout Button */}
                <button 
                    onClick={handleLogout} 
                    className="flex justify-center items-center p-4 text-white border-b border-amber-700 text-2xl transition-all duration-300 hover:cursor-pointer hover:scale-105 hover:bg-red-600 hover:shadow-lg mt-4"
                >
                    <FiLogOut className="inline-block mr-2" /> Logout
                </button>
                </div>
           
            </div>
            <div className="w-[calc(100%-400px)] min-h-screen flex justify-center items-center bg-amber-100">
                <Routes>
                    <Route path="/" element={<h1 className="text-black">Admin Dashboard</h1>} />
                    <Route path="products" element={<ProductAdminPage />} />
                    <Route path="users" element={<h1 className="text-black">Manage Users</h1>} />
                    <Route path="vendors" element={<h1 className="text-black">Manage Vendors</h1>} />
                    <Route path="bookings" element={<h1 className="text-black">Manage Bookings</h1>} />
                    <Route path="reviews" element={<h1 className="text-black">Manage Reviews</h1>} />
                </Routes>
            </div>
        </div>
    );
}

