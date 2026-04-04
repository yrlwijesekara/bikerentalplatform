import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";

const PublicNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handlePointerDown = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isMenuOpen]);

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
        
        <Link to="/destinations" className="hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] px-3 py-2 rounded transition-all font-medium">
          Destinations
        </Link>
        
        <Link to="/login" className="px-4 py-2 bg-[var(--navbar-active)] rounded-md hover:bg-[var(--navbar-hover)] transition-colors duration-200 font-medium text-white">
          Login
        </Link>
      </nav>

      {/* Mobile Navigation */}
      <div ref={mobileMenuRef} className="lg:hidden">
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
                to="/destinations" 
                className="block px-4 py-3 hover:text-[var(--navbar-active)] hover:bg-[var(--navbar-hover)] transition-all font-medium border-b border-[var(--navbar-border)] last:border-b-0"
                onClick={() => setIsMenuOpen(false)}
              >
               Destinations
              </Link>
              
              <Link 
                to="/login" 
                className="block mx-4 my-3 px-4 py-2 bg-[var(--navbar-active)] rounded-md hover:bg-[var(--navbar-hover)] transition-colors duration-200 font-medium text-white text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PublicNavbar;