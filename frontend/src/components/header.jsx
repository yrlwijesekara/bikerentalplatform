import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import PublicNavbar from "./PublicNavbar";
import UserNavbar from "./UserNavbar";
import VendorNavbar from "./VendorNavbar";
import { GiFullMotorcycleHelmet } from "react-icons/gi";

export default function Header() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));

  useEffect(() => {
    // Listen for storage changes
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token"));
      setRole(localStorage.getItem("role"));
    };

    // Listen for storage events
    window.addEventListener('storage', handleStorageChange);
    
    // Also check for changes on component mount and periodically
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem("token");
      const currentRole = localStorage.getItem("role");
      if (currentToken !== token || currentRole !== role) {
        setToken(currentToken);
        setRole(currentRole);
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [token, role]);

  const renderNavbar = () => {
    if (!token) {
      return <PublicNavbar />;
    }

    if (role === "user") {
      return <UserNavbar />;
    }

    if (role === "vendor") {
      return <VendorNavbar />;
    }

    // Admin users don't get navbar in main header - they use admin panel only
    if (role === "admin") {
      return null;
    }

    return <PublicNavbar />;
  };

  return (
    <header className="w-full h-[80px] bg-[var(--navbar-bg)] text-[var(--navbar-text)] flex items-center justify-between px-6 shadow-lg border-b border-[var(--navbar-border)] relative">
      <Link to="/" className="text-2xl font-bold text-[var(--navbar-text)] hover:text-[var(--navbar-active)] transition-colors flex items-center gap-2">
      <GiFullMotorcycleHelmet className="pt-0.5"/>
      
        RideLanka
      </Link>
      
      <div className="relative">
        {renderNavbar()}
      </div>
    </header>
  );
}