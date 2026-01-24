import { Link, useNavigate } from "react-router-dom";

const VendorNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="flex items-center gap-6">
      <Link to="/vendor/dashboard" className="hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] px-3 py-2 rounded transition-all font-medium">
        Dashboard
      </Link>
      
      <Link to="/vendor/bikes" className="hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] px-3 py-2 rounded transition-all font-medium">
        My Bikes
      </Link>
      
      <Link to="/vendor/bookings" className="hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] px-3 py-2 rounded transition-all font-medium">
        Bookings
      </Link>
      
      <Link to="/vendor/earnings" className="hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] px-3 py-2 rounded transition-all font-medium">
        Earnings
      </Link>
      
      <Link to="/vendor/reviews" className="hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] px-3 py-2 rounded transition-all font-medium">
        Reviews
      </Link>
      
      <button 
        onClick={handleLogout}
        className="px-4 py-2 bg-[var(--brand-warning)] rounded-md hover:bg-red-600 transition-colors duration-200 font-medium text-white"
      >
        Logout
      </button>
    </nav>
  );
};

export default VendorNavbar;