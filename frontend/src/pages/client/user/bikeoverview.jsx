import axios from "axios";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Loader from "../../../components/loader";
import ImageSlider from "../../../components/imagesilder";
import { addToCart, getCart, isProductInCart } from "../../../utils/cart";

export default function BikeOverview()   {

    const params = useParams();
    const navigate = useNavigate();
    const [bike, setBike] = useState(null);
    const [status, setStatus] = useState("loading");
    const [isInCart, setIsInCart] = useState(false);
    const [rentalDays, setRentalDays] = useState(1);

    useEffect(() => {
        if(status === "loading") {
            axios.get(import.meta.env.VITE_BACKEND_URL + `/products/${params.bikeid}`)
            .then(response => {
                setBike(response.data.product);
                // Check if bike is already in cart
                setIsInCart(isProductInCart(response.data.product._id));
                toast.success("Bike details fetched successfully");
                setStatus("success");
            })
            .catch(error => {
                toast.error("Error fetching bike details");
                console.error("Error fetching bike details:", error);
                setStatus("error");
            });

        }
    }, [status, params.bikeid]);

    // Listen for cart updates to refresh isInCart status
    useEffect(() => {
        const handleCartUpdate = () => {
            if (bike) {
                setIsInCart(isProductInCart(bike._id));
            }
        };

        window.addEventListener('cartUpdated', handleCartUpdate);
        return () => {
            window.removeEventListener('cartUpdated', handleCartUpdate);
        };
    }, [bike]);

    return (
        <div className="w-full h-screen overflow-hidden flex justify-center items-center" style={{ backgroundColor: 'var(--main-background)' }}> 
            {status === 'loading' && <Loader />} 
            {status === 'success' && bike && (
                <div className="max-w-7xl w-full h-full overflow-y-auto flex flex-col p-4 sm:p-6 md:p-8">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center lg:hidden mb-4">
                        {bike.bikeName || bike.name}
                        <span className="block text-lg text-gray-600 mt-1">{bike.bikeType}</span>
                    </h1>
                    
                    <div className="flex-1 flex flex-col lg:flex-row gap-6 lg:gap-8 items-center">
                        <div className="w-full lg:w-1/2 h-full flex justify-center items-center">
                            <ImageSlider images={bike.images || []} />
                        </div>
                        <div className="w-full lg:w-1/2 h-full flex flex-col justify-center gap-3 sm:gap-4 px-2 sm:px-4">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold hidden md:block">
                            {bike.bikeName || bike.name}
                            <span className="block text-lg text-gray-600 mt-1">{bike.bikeType}</span>
                        </h1>

                        {/* Bike Specifications */}
                        <div className="p-4 rounded-lg shadow-md" style={{ backgroundColor: 'var(--card-background)', boxShadow: '0 2px 8px var(--shadow-color)' }}>
                            <h3 className="text-lg font-semibold mb-3 text-gray-800">Specifications</h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-gray-600">Manufacturing Year:</span>
                                    <span className="ml-2 font-medium">{bike.manufacturingYear}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Engine CC:</span>
                                    <span className="ml-2 font-medium">{bike.engineCC} CC</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Fuel Type:</span>
                                    <span className="ml-2 font-medium">{bike.fuelType}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Suitable Terrain:</span>
                                    <span className="ml-2 font-medium capitalize">{bike.suitableTerrain}</span>
                                </div>
                                {bike.lastServiceDate && (
                                    <div>
                                        <span className="text-gray-600">Last Service:</span>
                                        <span className="ml-2 font-medium">{new Date(bike.lastServiceDate).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Location Information */}
                        <div className="p-4 rounded-lg shadow-md" style={{ backgroundColor: 'var(--card-background)', boxShadow: '0 2px 8px var(--shadow-color)' }}>
                            <h3 className="text-lg font-semibold mb-3 text-gray-800">Location & Contact</h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <span className="text-gray-600">City:</span>
                                    <span className="ml-2 font-medium">{bike.city}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Contact:</span>
                                    <span className="ml-2 font-medium">{bike.phoneNumber}</span>
                                </div>
                                
                                {/* Map Display */}
                                {bike.mapUrl ? (
                                    <div className="mt-3">
                                        <div className="w-full h-48 rounded-lg overflow-hidden border border-gray-300 mb-2">
                                            <iframe
                                                src={bike.mapUrl.includes('embed') 
                                                    ? bike.mapUrl 
                                                    : `https://maps.google.com/maps?q=${encodeURIComponent(bike.city)}&output=embed`
                                                }
                                                width="100%"
                                                height="100%"
                                                style={{ border: 0 }}
                                                allowFullScreen=""
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                                title="Bike Location Map"
                                            />
                                        </div>
                                        <a 
                                            href={bike.mapUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="underline text-sm"
                                            style={{ color: 'var(--brand-primary)' }}
                                        >
                                            View in Google Maps
                                        </a>
                                    </div>
                                ) : (
                                    <div className="mt-3">
                                        <div className="w-full h-48 rounded-lg overflow-hidden border border-gray-300 mb-2">
                                            <iframe
                                                src={`https://maps.google.com/maps?q=${encodeURIComponent(bike.city)}&output=embed`}
                                                width="100%"
                                                height="100%"
                                                style={{ border: 0 }}
                                                allowFullScreen=""
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                                title="Bike Location Map"
                                            />
                                        </div>
                                        <p className="text-gray-600 text-sm">
                                            Approximate location: {bike.city}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pricing and Rental Days */}
                        <div className="p-4 rounded-lg shadow-md" style={{ backgroundColor: 'var(--card-background)', boxShadow: '0 2px 8px var(--shadow-color)' }}>
                            <h3 className="text-lg font-semibold mb-3 text-gray-800">Rental Details</h3>
                            
                            {/* Rental Days Selector */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Number of Rental Days:
                                </label>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setRentalDays(Math.max(1, rentalDays - 1))}
                                        disabled={rentalDays <= 1}
                                        className="bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200"
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        min="1"
                                        max="30"
                                        value={rentalDays}
                                        onChange={(e) => {
                                            const days = parseInt(e.target.value);
                                            if (days >= 1 && days <= 30) {
                                                setRentalDays(days);
                                            }
                                        }}
                                        className="w-20 px-3 py-2 text-center border border-gray-300 rounded-lg text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        onClick={() => setRentalDays(Math.min(30, rentalDays + 1))}
                                        disabled={rentalDays >= 30}
                                        className="bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200"
                                    >
                                        +
                                    </button>
                                    <span className="text-sm text-gray-600">
                                        day{rentalDays > 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Price Display */}
                            <div className="border-t pt-3">
                                <div className="text-sm text-gray-600 mb-1">
                                    Rs. {bike.pricePerDay ? bike.pricePerDay.toFixed(2) : '0.00'} per day
                                </div>
                                <div className="text-2xl font-bold" style={{ color: 'var(--brand-success)' }}>
                                    Total: Rs. {bike.pricePerDay ? (bike.pricePerDay * rentalDays).toFixed(2) : '0.00'}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                    Rs. {bike.pricePerDay ? bike.pricePerDay.toFixed(2) : '0.00'} × {rentalDays} day{rentalDays > 1 ? 's' : ''}
                                </div>
                            </div>
                        </div>
                        <div className="w-full mt-2 sm:mt-4">
                            <button 
                                className="w-full border-2 py-2 sm:py-3 text-sm sm:text-base rounded transition-colors duration-300"
                                disabled={isInCart}
                                style={{ 
                                    backgroundColor: isInCart ? '#95a5a6' : 'var(--button-primary-bg)', 
                                    color: isInCart ? '#7f8c8d' : 'var(--button-primary-text)',
                                    borderColor: isInCart ? '#95a5a6' : 'var(--button-primary-bg)',
                                    cursor: isInCart ? 'not-allowed' : 'pointer',
                                    opacity: isInCart ? 0.7 : 1
                                }}
                                onMouseEnter={(e) => {
                                    if (!isInCart) {
                                        e.target.style.backgroundColor = 'var(--button-primary-hover)';
                                        e.target.style.borderColor = 'var(--button-primary-hover)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isInCart) {
                                        e.target.style.backgroundColor = 'var(--button-primary-bg)';
                                        e.target.style.borderColor = 'var(--button-primary-bg)';
                                    }
                                }}
                                onClick={() => {
                                    if (isInCart) return; // Prevent action if already in cart
                                    const result = addToCart(bike, rentalDays);
                                    if (result.success) {
                                        toast.success(result.message);
                                        setIsInCart(true);
                                        // Dispatch custom event to update cart count in navbar
                                        window.dispatchEvent(new Event('cartUpdated'));
                                    } else {
                                        toast.warning(result.message);
                                    }
                                }}
                            >
                                {isInCart ? "Already in Cart" : "Add to cart"}
                            </button>
                            <button 
                                className="w-full mt-2 border-2 py-2 sm:py-3 text-sm sm:text-base rounded transition-colors duration-300 cursor-pointer"
                                style={{ 
                                    backgroundColor: 'var(--brand-success)', 
                                    color: 'white',
                                    borderColor: 'var(--brand-success)'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#27AE60';
                                    e.target.style.borderColor = '#27AE60';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'var(--brand-success)';
                                    e.target.style.borderColor = 'var(--brand-success)';
                                }}
                                onClick={() => {
                                    if (isInCart) {
                                        // If already in cart, just go to checkout
                                        navigate('/checkout', { state: { items: getCart() } });
                                        return;
                                    }
                                    
                                    const result = addToCart(bike, rentalDays);
                                    if (result.success) {
                                        // Dispatch custom event to update cart count in navbar
                                        window.dispatchEvent(new Event('cartUpdated'));
                                        navigate('/checkout', { state: { items: getCart() } });
                                    } else {
                                        // If already in cart, just go to checkout
                                        navigate('/checkout', { state: { items: getCart() } });
                                    }
                                }}
                            >
                                {isInCart ? "Go to Checkout" : "Rent Now"}
                            </button>
                        </div>
                    </div>
                </div>
                </div>
            )}
            {status === 'error' && <div className="text-red-500 flex justify-center">Error loading product.</div>}
        </div>
    );
}