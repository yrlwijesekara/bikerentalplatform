import { Link, useNavigate } from "react-router-dom";

const UserNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="flex items-center gap-6">
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
      
      <Link to="/profile" className="hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] px-3 py-2 rounded transition-all font-medium">
        Profile
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

export default UserNavbar;