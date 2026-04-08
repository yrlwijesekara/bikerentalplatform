import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import NotificationBell from "./NotificationBell";

const VendorNavbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    sessionStorage.clear();
    navigate("/");
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

  const linkClass = "hover:text-(--navbar-active) hover:bg-(--navbar-hover) px-3 py-2 rounded transition-all font-medium";
  const mobileLinkClass = "block px-4 py-3 hover:text-(--navbar-active) hover:bg-(--navbar-hover) transition-all font-medium border-b border-(--navbar-border) last:border-b-0";

  return (
    <>
      <nav className="hidden lg:flex items-center gap-6">
        <Link to="/vendor/dashboard" className={linkClass}>Dashboard</Link>
        <Link to="/vendor/bikes" className={linkClass}>My Bikes</Link>
        <Link to="/vendor/bookings" className={linkClass}>Bookings</Link>
        <Link to="/vendor/earning" className={linkClass}>Earnings</Link>
        <Link to="/vendor/reviews" className={linkClass}>Reviews</Link>
        <Link to="/vendor/vendor-profile" className={linkClass}>Profile</Link>

        <NotificationBell className="hover:text-(--navbar-active) hover:bg-(--navbar-hover)" />

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-(--brand-warning) rounded-md hover:bg-red-600 transition-colors duration-200 font-medium text-white"
        >
          Logout
        </button>
      </nav>

      <div ref={mobileMenuRef} className="lg:hidden flex items-center gap-2">
        <NotificationBell className="hover:text-(--navbar-active) hover:bg-(--navbar-hover)" />

        <button
          onClick={() => setIsMenuOpen((open) => !open)}
          className="p-2 rounded-md hover:bg-(--navbar-hover) transition-colors duration-200"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <HiX className="h-6 w-6 text-(--navbar-text)" />
          ) : (
            <HiMenu className="h-6 w-6 text-(--navbar-text)" />
          )}
        </button>

        {isMenuOpen && (
          <div className="absolute top-12 right-0 w-64 bg-(--navbar-bg) border border-(--navbar-border) rounded-lg shadow-xl z-50">
            <div className="flex flex-col py-2">
              <Link to="/vendor/dashboard" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
              <Link to="/vendor/bikes" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>My Bikes</Link>
              <Link to="/vendor/bookings" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>Bookings</Link>
              <Link to="/vendor/earning" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>Earnings</Link>
              <Link to="/vendor/reviews" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>Reviews</Link>
              <Link to="/vendor/vendor-profile" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>Profile</Link>

              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="block mx-4 my-3 px-4 py-2 bg-(--brand-warning) rounded-md hover:bg-red-600 transition-colors duration-200 font-medium text-white text-center"
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