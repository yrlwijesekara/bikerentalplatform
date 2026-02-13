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
        <div className="w-full h-screen overflow-hidden flex justify-center items-center"> 
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
                        <div className="bg-gray-50 p-4 rounded-lg">
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
                                {bike.lastServiceDate && (
                                    <div>
                                        <span className="text-gray-600">Last Service:</span>
                                        <span className="ml-2 font-medium">{new Date(bike.lastServiceDate).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Location Information */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-3 text-gray-800">Location & Contact</h3>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="text-gray-600">City:</span>
                                    <span className="ml-2 font-medium">{bike.city}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Contact:</span>
                                    <span className="ml-2 font-medium">{bike.phoneNumber}</span>
                                </div>
                                {bike.mapUrl && (
                                    <div>
                                        <a 
                                            href={bike.mapUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 underline"
                                        >
                                            View on Map
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="bg-green-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-2 text-gray-800">Rental Price</h3>
                            <div className="text-2xl font-bold text-green-600">
                                Rs. {bike.pricePerDay ? bike.pricePerDay.toFixed(2) : '0.00'} / day
                            </div>
                        </div>
                        <div className="w-full mt-2 sm:mt-4">
                            <button 
                                className="w-full bg-blue-500 border-2 text-white py-2 sm:py-3 text-sm sm:text-base rounded hover:bg-white hover:text-blue-600 transition-colors duration-300 cursor-pointer"
                                onClick={() => {
                                    addToCart(bike, 1);
                                    toast.success("Product added to cart");
                                    console.log(getCart());
                                }}
                            >
                                Add to cart 
                            </button>
                            <button 
                                className="w-full mt-2 bg-green-500 border-2 text-white py-2 sm:py-3 text-sm sm:text-base rounded hover:bg-white hover:text-green-600 transition-colors duration-300 cursor-pointer"
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