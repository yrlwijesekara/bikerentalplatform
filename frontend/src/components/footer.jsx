import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { GiFullMotorcycleHelmet } from "react-icons/gi";
import { BsTwitterX } from "react-icons/bs";
import { FaInstagram } from "react-icons/fa";
import { FaFacebookF } from "react-icons/fa";
import { IoCall } from "react-icons/io5";
import { MdEmail } from "react-icons/md";
import { FaLocationDot } from "react-icons/fa6";
import { MdOutlineMoreTime } from "react-icons/md";



export default function Footer() {
  const [userRole, setUserRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    setIsLoggedIn(!!token);
    setUserRole(role);
    
    // Debug log to see what role is being detected
    console.log('Footer - Token:', !!token, 'Role:', role);
  }, []);

  // Dynamic Quick Links based on user role
  const getQuickLinks = () => {
    if (!isLoggedIn) {
      // Public user links
      return [
        { to: "/", text: "Home" },
        { to: "/find-bikes", text: "Find Bikes" },
        { to: "/about-sri-lanka", text: "About Sri Lanka Travel" },
        { to: "/login", text: "Login" }
      ];
    }

    if (userRole === 'vendor') {
      // Vendor specific links
      return [
        { to: "/vendor/dashboard", text: "Dashboard" },
        { to: "/vendor/bikes", text: "My Bikes" },
        { to: "/vendor/bookings", text: "Bookings" },
        { to: "/vendor/earning", text: "Earnings" },
        { to: "/vendor/reviews", text: "Reviews" }
      ];
    }

    if (userRole === 'customer' || userRole === 'user') {
      // User/Customer specific links - matching UserNavbar exactly
      return [
        { to: "/", text: "Home" },
        { to: "/find-bikes", text: "Find Bikes" },
        { to: "/ai-suggestions", text: "AI Suggestions" },
        { to: "/my-bookings", text: "My Bookings" },
        { to: "/routes", text: "Routes & Safety" },
        { to: "/profile", text: "Profile" }
      ];
    }

    // If logged in but role not recognized, show basic user links
    if (isLoggedIn) {
      return [
        { to: "/", text: "Home" },
        { to: "/find-bikes", text: "Find Bikes" },
        { to: "/my-bookings", text: "My Bookings" },
        { to: "/profile", text: "Profile" }
      ];
    }

    // Default fallback
    return [
      { to: "/", text: "Home" },
      { to: "/find-bikes", text: "Find Bikes" }
    ];
  };

  return (
    <footer className="w-full bg-[var(--navbar-bg)] text-[var(--navbar-text)] border-t border-[var(--navbar-border)]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold hover:text-[var(--navbar-active)] transition-colors">
              <GiFullMotorcycleHelmet className="pt-0.5"/>
              RideLanka
            </Link>
            <p className="text-sm text-gray-300 leading-relaxed">
              {userRole === 'vendor' 
                ? "Manage your bike rental business with confidence. Join Sri Lanka's premier motorcycle rental network."
                : userRole === 'customer'
                ? "Your trusted partner for motorcycle adventures across Sri Lanka. Explore with confidence and style."
                : "Your trusted partner for motorcycle and scooter rentals across Sri Lanka. Explore the beautiful island on two wheels."
              }
            </p>
            <div className="flex gap-4 text-sm">
              <a 
                href="#" 
                className="hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] px-2 py-3 rounded transition-all"
              >
                <FaFacebookF />
              </a>
              <a 
                href="#" 
                className="hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] px-2 py-3 rounded transition-all"
              >
                <FaInstagram />
              </a>
              <a 
                href="#" 
                className="hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] px-2 py-3 rounded transition-all"
              >
                <BsTwitterX />
              </a>
            </div>
          </div>

          {/* Dynamic Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--navbar-active)]">
              {userRole === 'vendor' ? 'Vendor Tools' : userRole === 'customer' ? 'Your Account' : 'Quick Links'}
            </h3>
            <nav className="flex flex-col space-y-2">
              {getQuickLinks().map((link) => (
                <Link 
                  key={link.to}
                  to={link.to} 
                  className="text-sm hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] px-3 py-2 rounded transition-all font-medium w-fit"
                >
                  {link.text}
                </Link>
              ))}
            </nav>
          </div>

          {/* Dynamic Support Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--navbar-active)]">
              {userRole === 'vendor' ? 'Business Support' : 'Support'}
            </h3>
            <nav className="flex flex-col space-y-2">
              {userRole === 'vendor' ? (
                <>
                  <a 
                    href="#" 
                    className="text-sm hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] px-3 py-2 rounded transition-all font-medium w-fit"
                  >
                    Vendor Guidelines
                  </a>
                  <a 
                    href="#" 
                    className="text-sm hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] px-3 py-2 rounded transition-all font-medium w-fit"
                  >
                    Business Tools
                  </a>
                  <a 
                    href="#" 
                    className="text-sm hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] px-3 py-2 rounded transition-all font-medium w-fit"
                  >
                    Partner Support
                  </a>
                  <a 
                    href="#" 
                    className="text-sm hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] px-3 py-2 rounded transition-all font-medium w-fit"
                  >
                    Revenue Management
                  </a>
                </>
              ) : userRole === 'customer' ? (
                <>
                  <a 
                    href="#" 
                    className="text-sm hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] px-3 py-2 rounded transition-all font-medium w-fit"
                  >
                    Booking Support
                  </a>
                  <a 
                    href="#" 
                    className="text-sm hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] px-3 py-2 rounded transition-all font-medium w-fit"
                  >
                    Travel Insurance
                  </a>
                  <a 
                    href="#" 
                    className="text-sm hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] px-3 py-2 rounded transition-all font-medium w-fit"
                  >
                    Safety Guidelines
                  </a>
                  <a 
                    href="#" 
                    className="text-sm hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] px-3 py-2 rounded transition-all font-medium w-fit"
                  >
                    Trip Planning
                  </a>
                </>
              ) : (
                <>
                  <a 
                    href="#" 
                    className="text-sm hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] px-3 py-2 rounded transition-all font-medium w-fit"
                  >
                    Help Center
                  </a>
                  <a 
                    href="#" 
                    className="text-sm hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] px-3 py-2 rounded transition-all font-medium w-fit"
                  >
                    Safety Guidelines
                  </a>
                  <a 
                    href="#" 
                    className="text-sm hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] px-3 py-2 rounded transition-all font-medium w-fit"
                  >
                    Terms & Conditions
                  </a>
                  <a 
                    href="#" 
                    className="text-sm hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] px-3 py-2 rounded transition-all font-medium w-fit"
                  >
                    Privacy Policy
                  </a>
                </>
              )}
            </nav>
          </div>

          {/* Contact Info & Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--navbar-active)]">
              {userRole === 'vendor' ? 'Partner Support' : 'Contact Us'}
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <IoCall />
                <span>{userRole === 'vendor' ? '+94 11 123 4567 (Business)' : '+94 11 123 4567'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MdEmail />
                <span>
                  {userRole === 'vendor' ? 'vendor@ridelanka.com' : userRole === 'customer' ? 'support@ridelanka.com' : 'info@ridelanka.com'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FaLocationDot />
                <span>Southern Province, Sri Lanka</span>
              </div>
              {userRole === 'vendor' && (
                <div className="flex items-center gap-2">
                  <MdOutlineMoreTime />
                  <span>Business Hours: 24/7 Support</span>
                </div>
              )}
            </div>
            
            {/* Newsletter Signup */}
            <div className="pt-4 border-t border-[var(--navbar-border)]">
              <h4 className="text-sm font-medium mb-2">
                {userRole === 'vendor' ? 'Business Updates' : 'Stay Updated'}
              </h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder={userRole === 'vendor' ? 'Business email' : 'Your email'}
                  className="flex-1 px-3 py-2 text-sm bg-[var(--navbar-hover)] border border-[var(--navbar-border)] rounded text-[var(--navbar-text)] placeholder-gray-400 focus:outline-none focus:border-[var(--navbar-active)] transition-colors"
                />
                <button className="px-4 py-2 bg-[var(--navbar-active)] text-white rounded hover:bg-[var(--brand-secondary)] transition-colors duration-200 text-sm font-medium">
                 <MdEmail />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[var(--navbar-border)] mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-300">
              © 2026 RideLanka Tourism Platform. All rights reserved.
              {userRole === 'vendor' && ' | Business Partner Platform'}
              {userRole === 'customer' && ' | Premium Member Access'}
            </div>
            <div className="flex gap-6 text-sm">
              <a 
                href="#" 
                className="hover:text-[var(--navbar-active)] transition-colors"
              >
                Terms of Service
              </a>
              <a 
                href="#" 
                className="hover:text-[var(--navbar-active)] transition-colors"
              >
                Privacy Policy
              </a>
              {userRole === 'vendor' && (
                <a 
                  href="#" 
                  className="hover:text-[var(--navbar-active)] transition-colors"
                >
                  Partner Agreement
                </a>
              )}
              <a 
                href="#" 
                className="hover:text-[var(--navbar-active)] transition-colors"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
