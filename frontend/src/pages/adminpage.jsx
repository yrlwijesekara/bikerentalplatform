import { Routes, Route, Link as Links, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { RiMotorbikeFill, RiDashboardLine } from "react-icons/ri";
import { FaUserAlt } from "react-icons/fa";
import { TiVendorAndroid } from "react-icons/ti";
import { FaBookmark } from "react-icons/fa6";
import { VscCodeReview } from "react-icons/vsc";
import { FiLogOut, FiSettings } from "react-icons/fi";
import { HiMenu, HiX, HiBell } from "react-icons/hi";
import ProductAdminPage from "./admin/productAdmin.jsx";
import PlacesAdminPage from "./admin/places.jsx";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "../components/loader";
import AddPlacesPage from "./admin/addplaces.jsx";

export default function Adminpage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAuthorizing, setIsAuthorizing] = useState(true);
    const [userInfo, setUserInfo] = useState(null);

    // Check authorization on component mount
    useEffect(() => {
        checkAdminAuthorization();
    }, []);

    const checkAdminAuthorization = async () => {
        try {
            const token = localStorage.getItem("token");
            
            if (!token) {
                toast.error("Please login to access admin panel");
                navigate("/login");
                return;
            }

            // First check JWT token locally for quick validation
            try {
                const tokenPayload = JSON.parse(atob(token.split('.')[1]));
                console.log("Token payload:", tokenPayload); // Debug log
                
                // If token shows admin role, allow immediate access
                if (tokenPayload.role === "admin") {
                    setUserInfo(tokenPayload);
                    localStorage.setItem("role", tokenPayload.role);
                    setIsAuthorizing(false);
                    return;
                }
            } catch (jwtError) {
                console.warn("Could not parse JWT token:", jwtError);
            }

            // Verify user role from backend as secondary check
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/users`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const user = response.data.user; // Fix: Access the user property
            console.log("Backend user verification:", user); // Debug log
            
            // Check if user has admin role
            if (!user || user.role !== "admin") {
                toast.error("Access denied. Admin privileges required.");
                
                // Redirect based on actual user role
                switch (user?.role) {
                    case "vendor":
                        navigate("/vendor/dashboard");
                        break;
                    case "user":
                        navigate("/find-bikes");
                        break;
                    default:
                        localStorage.removeItem("token");
                        localStorage.removeItem("role");
                        navigate("/login");
                        break;
                }
                return;
            }

            // User is authorized admin
            setUserInfo(user);
            localStorage.setItem("role", user.role);
            
        } catch (error) {
            console.error("Authorization check failed:", error);
            toast.error("Authorization failed. Please login again.");
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            navigate("/login");
        } finally {
            setIsAuthorizing(false);
        }
    };

    // Navigation items configuration
    const navigationItems = [
        {
            path: "/admin",
            icon: RiDashboardLine,
            label: "Dashboard",
            exact: true
        },
        {
            path: "/admin/products",
            icon: RiMotorbikeFill,
            label: "Products"
        },
        {
            path: "/admin/users",
            icon: FaUserAlt,
            label: "Users"
        },
        {
            path: "/admin/vendors",
            icon: TiVendorAndroid,
            label: "Vendors"
        },
        {
            path: "/admin/places",
            icon: FaBookmark,
            label: "Places"
        },
        {
            path: "/admin/reviews",
            icon: VscCodeReview,
            label: "Reviews"
        }
    ];

    // Check if current path is active
    const isActivePath = (path, exact = false) => {
        if (exact) {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    const handleLogout = () => {
        // Clear authentication data
        localStorage.removeItem('adminToken');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('role');
        sessionStorage.clear();
        
        toast.success("Logged out successfully");
        
        // Redirect to login page
        navigate('/login');
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    // Show loading screen while checking authorization
    if (isAuthorizing) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
                <Loader />
                <p className="text-lg text-gray-600 mt-4">Verifying admin access...</p>
            </div>
        );
    }

    // Don't render admin content if user is not authorized (failsafe)
    if (!userInfo || userInfo.role !== "admin") {
        return null;
    }

    return (
        <div className="w-full h-screen flex relative bg-gray-50 overflow-hidden">
            <style jsx>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .admin-layout {
                    height: 100vh;
                    display: flex;
                    overflow: hidden;
                }
                .sidebar-container {
                    height: 100vh;
                    position: sticky;
                    top: 0;
                }
            `}</style>
            {/* Mobile Header with Hamburger Menu */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-amber-900 border-b border-amber-700 px-4 py-3 flex justify-between items-center shadow-lg">
                <div className="flex items-center space-x-3">
                    <h1 className="text-white text-xl font-bold">Admin Panel</h1>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="p-2 text-white hover:bg-amber-800 rounded-lg transition-colors">
                        <HiBell className="h-5 w-5" />
                    </button>
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-md hover:bg-amber-800 transition-colors duration-200"
                        aria-label="Toggle sidebar"
                    >
                        {isSidebarOpen ? (
                            <HiX className="h-6 w-6 text-white" />
                        ) : (
                            <HiMenu className="h-6 w-6 text-white" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div 
                    className="lg:hidden fixed inset-0 z-40 backdrop-blur-sm transition-opacity"
                    onClick={closeSidebar}
                ></div>
            )}

            {/* Sidebar */}
            <div className={`
                fixed lg:sticky inset-y-0 left-0 z-50 lg:top-0
                w-[300px] lg:w-[280px] bg-amber-900 
                transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                flex flex-col shadow-xl
                h-screen
            `}>
                {/* Sidebar Header */}
                <div className="p-6 border-b border-amber-800">
                    <h1 className="hidden lg:block text-white text-2xl font-bold text-center">
                        🚴‍♂️ Bike Rental Admin
                    </h1>
                    <div className="lg:hidden h-4"></div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-hide">
                    {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActivePath(item.path, item.exact);
                        
                        return (
                            <Links 
                                key={item.path}
                                to={item.path} 
                                className={`
                                    flex items-center px-4 py-3 rounded-lg transition-all duration-200
                                    ${active 
                                        ? 'bg-amber-800 text-white shadow-md transform scale-105' 
                                        : 'text-amber-100 hover:bg-amber-800 hover:text-white hover:shadow-md hover:transform hover:scale-105'
                                    }
                                `}
                                onClick={closeSidebar}
                            >
                                <Icon className="text-xl mr-3 flex-shrink-0" />
                                <span className="font-medium truncate">{item.label}</span>
                            </Links>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-amber-800 space-y-2">
                    <button className="w-full flex items-center px-4 py-3 text-amber-100 hover:bg-amber-800 hover:text-white rounded-lg transition-all duration-200">
                        <FiSettings className="text-xl mr-3" />
                        <span className="font-medium">Settings</span>
                    </button>
                    
                    <button 
                        onClick={() => {
                            handleLogout();
                            closeSidebar();
                        }}
                        className="w-full flex items-center px-4 py-3 text-amber-100 hover:bg-red-600 hover:text-white rounded-lg transition-all duration-200"
                    >
                        <FiLogOut className="text-xl mr-3" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen pt-16 lg:pt-0 overflow-hidden">
                {/* Desktop Header */}
                <div className="hidden lg:flex bg-white border-b border-gray-200 px-6 py-4 justify-between items-center shadow-sm flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            {navigationItems.find(item => isActivePath(item.path, item.exact))?.label || 'Admin Panel'}
                        </h2>
                        <p className="text-sm text-gray-500">Manage your bike rental platform</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <HiBell className="h-5 w-5" />
                        </button>
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-amber-900 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                    {userInfo?.firstname?.[0]?.toUpperCase() || 'A'}
                                </span>
                            </div>
                            <span className="text-gray-700 font-medium">
                                {userInfo?.firstname ? `${userInfo.firstname} ${userInfo.lastname}` : 'Admin'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    <Routes>
                        <Route path="/" element={<div className="p-8"><h1 className="text-2xl font-bold text-gray-800">Dashboard - To be implemented</h1></div>} />
                        <Route path="products" element={<ProductAdminPage />} />
                        <Route path="places" element={<PlacesAdminPage />} />
                        <Route path="users" element={<div className="p-8"><h1 className="text-2xl font-bold text-gray-800">Users - To be implemented</h1></div>} />
                        <Route path="vendors" element={<div className="p-8"><h1 className="text-2xl font-bold text-gray-800">Vendors - To be implemented</h1></div>} />
                        <Route path="bookings" element={<div className="p-8"><h1 className="text-2xl font-bold text-gray-800">Bookings - To be implemented</h1></div>} />
                        <Route path="reviews" element={<div className="p-8"><h1 className="text-2xl font-bold text-gray-800">Reviews - To be implemented</h1></div>} />
                        <Route path="add-places" element={<AddPlacesPage />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
}

