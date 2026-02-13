import axios from "axios";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Loader from "../../../components/loader";
import ImageSlider from "../../../components/imagesilder";

export default function BikeOverview()   {

    const params = useParams();
    const navigate = useNavigate();
    const [bike, setBike] = useState(null);
    const [status, setStatus] = useState("loading");

    // Simple cart functions for this component
    const addToCart = (product, quantity) => {
        // Add your cart logic here
        console.log('Adding to cart:', product, quantity);
    };

    const getCart = () => {
        // Add your get cart logic here
        return [];
    };

    useEffect(() => {
        if(status === "loading") {
            axios.get(import.meta.env.VITE_BACKEND_URL + `/products/${params.bikeid}`)
            .then(response => {
                setBike(response.data.product);
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

                        {/* Pricing */}
                        <div className="p-4 rounded-lg shadow-md" style={{ backgroundColor: 'var(--card-background)', boxShadow: '0 2px 8px var(--shadow-color)' }}>
                            <h3 className="text-lg font-semibold mb-2 text-gray-800">Rental Price</h3>
                            <div className="text-2xl font-bold" style={{ color: 'var(--brand-success)' }}>
                                Rs. {bike.pricePerDay ? bike.pricePerDay.toFixed(2) : '0.00'} / day
                            </div>
                        </div>
                        <div className="w-full mt-2 sm:mt-4">
                            <button 
                                className="w-full border-2 py-2 sm:py-3 text-sm sm:text-base rounded transition-colors duration-300 cursor-pointer"
                                style={{ 
                                    backgroundColor: 'var(--button-primary-bg)', 
                                    color: 'var(--button-primary-text)',
                                    borderColor: 'var(--button-primary-bg)'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = 'var(--button-primary-hover)';
                                    e.target.style.borderColor = 'var(--button-primary-hover)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'var(--button-primary-bg)';
                                    e.target.style.borderColor = 'var(--button-primary-bg)';
                                }}
                                onClick={() => {
                                    addToCart(bike, 1);
                                    toast.success("Product added to cart");
                                    console.log(getCart());
                                }}
                            >
                                Add to cart 
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
                                    addToCart(bike, 1);
                                    navigate('/checkout', { state: { items: getCart() } });
                                }}
                            >
                                Buy Now
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