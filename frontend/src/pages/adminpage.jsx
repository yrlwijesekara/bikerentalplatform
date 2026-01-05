import { Routes, Route , Link as Links } from "react-router-dom";
import { RiMotorbikeFill } from "react-icons/ri";
import { VscGraph } from "react-icons/vsc";
import { FaUserAlt } from "react-icons/fa";
import { TiVendorAndroid } from "react-icons/ti";
import { FaBookmark } from "react-icons/fa6";
import { VscCodeReview } from "react-icons/vsc";



export default function Adminpage() {
    return (
        <div className="w-full h-screen flex">
            <div className="w-[400px] h-full bg-amber-900 flex flex-col items-center">
                
                <div className="w-full m-6 p-6 ">
                <h1 className="text-white text-4xl font-bold m-4">Admin Panel</h1>
                     <Links to="/admin" className="w-full block p-4 text-white border-b border-amber-700 text-2xl">
                    <VscGraph className="inline-block mr-2" /> Dashboard</Links>
                <Links to="/admin/products" className="block p-4 text-white border-b border-amber-700 text-2xl" >
                    <RiMotorbikeFill className="inline-block mr-2" /> Products</Links>
                <Links to="/admin/users" className="block p-4 text-white border-b border-amber-700 text-2xl">
                    <FaUserAlt className="inline-block mr-2" /> Users</Links>
                <Links to="/admin/vendors" className="block p-4 text-white border-b border-amber-700 text-2xl">
                    <TiVendorAndroid className="inline-block mr-2" /> Vendors</Links>
                <Links to="/admin/bookings" className="block p-4 text-white border-b border-amber-700 text-2xl">
                    <FaBookmark className="inline-block mr-2" /> Bookings</Links>
                <Links to="/admin/reviews" className="block p-4 text-white border-b border-amber-700 text-2xl">
                    <VscCodeReview className="inline-block mr-2" /> Reviews</Links></div>
           
            </div>
            <div className="w-[calc(100%-400px)] h-full flex justify-center items-center bg-amber-100">
                <Routes>
                    <Route path="/" element={<h1 className="text-black">Admin Dashboard</h1>} />
                    <Route path="products" element={<h1 className="text-black">Manage Products</h1>} />
                    <Route path="users" element={<h1 className="text-black">Manage Users</h1>} />
                    <Route path="vendors" element={<h1 className="text-black">Manage Vendors</h1>} />
                    <Route path="bookings" element={<h1 className="text-black">Manage Bookings</h1>} />
                    <Route path="reviews" element={<h1 className="text-black">Manage Reviews</h1>} />
                </Routes>
            </div>
        </div>
    );
}

