import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import { FaOpencart } from "react-icons/fa";
import { getCartItemCount } from "../utils/cart";
import NotificationBell from "./NotificationBell";

const UserNavbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      setCartItemCount(getCartItemCount());
    };
    
    updateCartCount();
    
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cartUpdated', updateCartCount);
    
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

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
        <Link to="/" className="hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] px-3 py-2 rounded transition-all font-medium">
          Home
        </Link>
        
        <Link to="/find-bikes" className="hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] px-3 py-2 rounded transition-all font-medium">
          Find Bikes
        </Link>
        
        <Link to="/ai-suggestions" className="hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] px-3 py-2 rounded transition-all font-medium">
          AI Suggestions
        </Link>
        
        <Link to="/my-bookings" className="hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] px-3 py-2 rounded transition-all font-medium">
          My Bookings
        </Link>
        
        <Link to="/routes" className="hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] px-3 py-2 rounded transition-all font-medium">
          Routes & Safety
        </Link>
        <Link to="/destinations" className="hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] px-3 py-2 rounded transition-all font-medium">
         Destinations
        </Link>
        
        <Link to="/profile" className="hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] px-3 py-2 rounded transition-all font-medium">
          Profile
        </Link>
        <Link to="/user/review/:orderId" className="hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] px-3 py-2 rounded transition-all font-medium hidden">
          Review
        </Link>
        
        
        {/* Notification Bell */}
        <NotificationBell className="hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)]" />
        
        <Link to="/cart" className="hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] px-3 py-2 rounded transition-all font-medium flex items-center gap-1 relative">
          <FaOpencart className="h-5 w-5" />
         
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
              {cartItemCount > 99 ? '99+' : cartItemCount}
            </span>
          )}
        </Link>
        
        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-[var(--brand-warning)] rounded-md hover:bg-red-600 transition-colors duration-200 font-medium text-white"
        >
          Logout
        </button>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden flex items-center gap-3">
        {/* Notification Bell for mobile */}
        <NotificationBell className="hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)]" />
        
        {/* Hamburger Button */}
        <button
          onClick={toggleMenu}
          className="p-2  rounded-md hover:bg-[var(--navbar-hover)] transition-colors duration-200"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <HiX className="h-6 w-6 text-[var(--navbar-text)]" />
          ) : (
            <HiMenu className="h-8 w-7 text-[var(--navbar-text)]" />
          )}
        </button>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="absolute top-12 right-0 w-64 bg-[var(--navbar-bg)] border border-[var(--navbar-border)] rounded-lg shadow-xl z-50">
            <div className="flex flex-col py-2">
              <Link 
                to="/" 
                className="block px-4 py-3 hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] transition-all font-medium border-b border-[var(--navbar-border)] last:border-b-0"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              
              <Link 
                to="/find-bikes" 
                className="block px-4 py-3 hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] transition-all font-medium border-b border-[var(--navbar-border)] last:border-b-0"
                onClick={() => setIsMenuOpen(false)}
              >
                Find Bikes
              </Link>
              
              <Link 
                to="/ai-suggestions" 
                className="block px-4 py-3 hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] transition-all font-medium border-b border-[var(--navbar-border)] last:border-b-0"
                onClick={() => setIsMenuOpen(false)}
              >
                AI Suggestions
              </Link>
              
              <Link 
                to="/my-bookings" 
                className="block px-4 py-3 hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] transition-all font-medium border-b border-[var(--navbar-border)] last:border-b-0"
                onClick={() => setIsMenuOpen(false)}
              >
                My Bookings
              </Link>
              
              <Link 
                to="/routes" 
                className="block px-4 py-3 hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] transition-all font-medium border-b border-[var(--navbar-border)] last:border-b-0"
                onClick={() => setIsMenuOpen(false)}
              >
                Routes & Safety
              </Link>
              <Link 
                to="/destinations" 
                className="block px-4 py-3 hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] transition-all font-medium border-b border-[var(--navbar-border)] last:border-b-0"
                onClick={() => setIsMenuOpen(false)}
              >
                Destinations
              </Link>
              
              <Link 
                to="/profile" 
                className="block px-4 py-3 hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] transition-all font-medium border-b border-[var(--navbar-border)] last:border-b-0"
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
              <Link 
                to="/review" 
                className="block px-4 py-3 hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] transition-all font-medium border-b border-[var(--navbar-border)] last:border-b-0 hidden"
                onClick={() => setIsMenuOpen(false)}
              >
                Review
              </Link>
              
              <Link 
                to="/cart" 
                className="block px-4 py-3 hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] transition-all font-medium border-b border-[var(--navbar-border)] last:border-b-0 flex items-center gap-2 relative"
                onClick={() => setIsMenuOpen(false)}
              >
                <FaOpencart className="h-5 w-5" />
              
                {cartItemCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold ml-auto">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
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

export default UserNavbar;