import { Link } from "react-router-dom";

const PublicNavbar = () => (
  <nav className="flex items-center gap-6">
    <Link to="/" className="hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] px-3 py-2 rounded transition-all font-medium">
      Home
    </Link>
    
    <Link to="/browse-bikes" className="hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] px-3 py-2 rounded transition-all font-medium">
      Find Bikes
    </Link>
    
    <Link to="/about-sri-lanka" className="hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] px-3 py-2 rounded transition-all font-medium">
      About Sri Lanka Travel
    </Link>
    
    <Link to="/login" className="px-4 py-2 bg-[var(--navbar-active)] rounded-md hover:bg-[var(--navbar-hover)] transition-colors duration-200 font-medium text-white">
      Login
    </Link>
  </nav>
);

export default PublicNavbar;