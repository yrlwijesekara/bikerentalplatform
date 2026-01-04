import { Routes, Route } from "react-router-dom";

export default function Adminpage() {
    return (
        <div className="w-full h-screen flex bg-amber-800">
            <div className="w-[400px] h-full bg-amber-500"></div>
            <div className="w-[calc(100%-400px)] h-full">
                <Routes>
                    <Route path="/" element={<h1 className="text-white">Admin Dashboard</h1>} />
                    <Route path="products" element={<h1 className="text-white">Manage Products</h1>} />
                    <Route path="users" element={<h1 className="text-white">Manage Users</h1>} />
                    <Route path="vendors" element={<h1 className="text-white">Manage Vendors</h1>} />
                    <Route path="bookings" element={<h1 className="text-white">Manage Bookings</h1>} />
                    <Route path="reviews" element={<h1 className="text-white">Manage Reviews</h1>} />
                </Routes>
            </div>
        </div>
    );
}

