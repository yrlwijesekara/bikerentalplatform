import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import NotificationBell from "./NotificationBell";

const VendorNavbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    sessionStorage.clear();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      {/* Desktop Navigation - Hidden on small screens */}
      <nav className="hidden lg:flex items-center gap-6">
        <Link to="/vendor/dashboard" className="hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] px-3 py-2 rounded transition-all font-medium">
          Dashboard
        </Link>
        
        <Link to="/vendor/bikes" className="hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] px-3 py-2 rounded transition-all font-medium">
          My Bikes
        </Link>
        
        <Link to="/vendor/bookings" className="hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] px-3 py-2 rounded transition-all font-medium">
          Bookings
        </Link>
        
        <Link to="/vendor/earning" className="hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] px-3 py-2 rounded transition-all font-medium">
          Earnings
        </Link>
        
        <Link to="/vendor/reviews" className="hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] px-3 py-2 rounded transition-all font-medium">
          Reviews
        </Link>
        
        {/* Notification Bell */}
        <NotificationBell className="hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)]" />
        
        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-[var(--brand-warning)] rounded-md hover:bg-red-600 transition-colors duration-200 font-medium text-white"
        >
          Logout
        </button>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden flex items-center gap-2">
        {/* Notification Bell for mobile */}
        <NotificationBell className="hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)]" />
        
        {/* Hamburger Button */}
        <button
          onClick={toggleMenu}
          className="p-2 rounded-md hover:bg-[var(--navbar-hover)] transition-colors duration-200"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <HiX className="h-6 w-6 text-[var(--navbar-text)]" />
          ) : (
            <HiMenu className="h-6 w-6 text-[var(--navbar-text)]" />
          )}
        </button>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="absolute top-12 right-0 w-64 bg-[var(--navbar-bg)] border border-[var(--navbar-border)] rounded-lg shadow-xl z-50">
            <div className="flex flex-col py-2">
              <Link 
                to="/vendor/dashboard" 
                className="block px-4 py-3 hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] transition-all font-medium border-b border-[var(--navbar-border)] last:border-b-0"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              
              <Link 
                to="/vendor/bikes" 
                className="block px-4 py-3 hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] transition-all font-medium border-b border-[var(--navbar-border)] last:border-b-0"
                onClick={() => setIsMenuOpen(false)}
              >
                My Bikes
              </Link>
              
              <Link 
                to="/vendor/bookings" 
                className="block px-4 py-3 hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] transition-all font-medium border-b border-[var(--navbar-border)] last:border-b-0"
                onClick={() => setIsMenuOpen(false)}
              >
                Bookings
              </Link>
              
              <Link 
                to="/vendor/earning" 
                className="block px-4 py-3 hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] transition-all font-medium border-b border-[var(--navbar-border)] last:border-b-0"
                onClick={() => setIsMenuOpen(false)}
              >
                Earnings
              </Link>
              
              <Link 
                to="/vendor/reviews" 
                className="block px-4 py-3 hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] transition-all font-medium border-b border-[var(--navbar-border)] last:border-b-0"
                onClick={() => setIsMenuOpen(false)}
              >
                Reviews
              </Link>
              
              <button 
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="block mx-4 my-3 px-4 py-2 bg-[var(--brand-warning)] rounded-md hover:bg-red-600 transition-colors duration-200 font-medium text-white text-center"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default VendorNavbar;