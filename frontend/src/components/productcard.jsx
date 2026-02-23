
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { addToCart, getCart } from "../utils/cart";

export default function ProductCard(props) {
  const bike = props.bike;
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    };

    // Initial check
    checkAuthStatus();

    // Listen for storage changes (login/logout from other tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Periodic check for changes in the same tab
    const interval = setInterval(checkAuthStatus, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);
  return (
    <div className="w-full max-w-[400px] h-auto min-h-[450px] rounded-xl shadow-lg border border-gray-200 p-4 flex flex-col bg-white hover:shadow-xl hover:scale-102 transition-all duration-300 overflow-hidden gap-2">
      <img
        src={
          bike.images && bike.images[0]
            ? bike.images[0]
            : "/placeholder-image.jpg"
        }
        className="w-full h-48 sm:h-56 lg:h-64 object-cover rounded-lg mb-3"
        onClick={() => {
          navigate(`/bikeoverview`+`/${bike._id}`);
          
        }}
      />
      <div className="flex-1 flex flex-col justify-between">
        <h2 className="text-lg sm:text-xl font-bold mb-2 text-gray-900 line-clamp-2">
          {bike.bikeName || "Unnamed Bike"}
        </h2>
        
        <div className="space-y-2 mb-3">
          <p className="text-gray-700 text-sm sm:text-base">
            <span className="font-medium">Type:</span> {bike.bikeType || "Unknown"}
          </p>
          <p className="text-gray-700 text-sm sm:text-base">
            <span className="font-medium">Location:</span> {bike.city || "Unknown"}
          </p>
          <p className="text-gray-700 text-sm sm:text-base">
            <span className="font-medium">Contact:</span> {bike.phoneNumber || "N/A"}
          </p>
        </div>
        
        <div className="mt-auto">
          <p className="text-xl font-bold text-green-600 mb-3">
            {bike.pricePerDay.toLocaleString("en-LK", {style: "currency", currency: "LKR", minimumFractionDigits: 2})} <span className="text-sm font-normal text-gray-600">per day</span>
          </p>
          <button 
            className="w-full font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            disabled={!isLoggedIn}
            style={{
              backgroundColor: !isLoggedIn ? '#95a5a6' : 'var(--button-primary-bg)',
              color: !isLoggedIn ? '#7f8c8d' : 'var(--button-primary-text)',
              cursor: !isLoggedIn ? 'not-allowed' : 'pointer',
              opacity: !isLoggedIn ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (isLoggedIn) {
                e.target.style.backgroundColor = 'var(--button-primary-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (isLoggedIn) {
                e.target.style.backgroundColor = 'var(--button-primary-bg)';
              }
            }}
            onClick={() => {
              if (!isLoggedIn) {
                toast.error('Please login first to rent a bike');
                navigate('/login');
                return;
              }
              
              // Add bike to cart first
              const result = addToCart(bike, 1); // Default 1 day rental
              
              if (result.success) {
                // Get updated cart items
                const cartItems = getCart();
                
                // Calculate totals
                const cartTotal = cartItems.reduce((total, item) => {
                  return total + (item.price * (item.rentalDays || 1));
                }, 0);
                const serviceFee = cartTotal * 0.10;
                const finalTotal = cartTotal + serviceFee;
                
                // Navigate to checkout with cart data
                navigate('/checkout', { 
                  state: { 
                    items: cartItems,
                    subtotal: cartTotal,
                    serviceFee: serviceFee,
                    total: finalTotal
                  } 
                });
                toast.success('Bike added to cart! Proceeding to checkout.');
              } else {
                toast.error(result.message);
              }
            }}
          >
            {!isLoggedIn ? "Login to Rent" : "Rent Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
