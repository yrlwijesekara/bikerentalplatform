import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from 'axios';
import Loader from '../../../components/loader';
import ImageSlider from "../../../components/imagesilder";
import { FaMapMarkerAlt, FaClock, FaMoneyBillWave, FaTag, FaUmbrellaBeach, FaMountain, FaMonument, FaWater, FaPaw, FaChurch, FaExternalLinkAlt } from "react-icons/fa";
import { CiStar } from "react-icons/ci";

export default function PlaceOverview() {
    const params = useParams();
    const navigate = useNavigate();
    const [place, setPlace] = useState(null);
    const [status, setStatus] = useState("loading");

    useEffect(() => {
        if (status === 'loading' && params.placeid) {
            axios.get(import.meta.env.VITE_BACKEND_URL + '/places/' + params.placeid)
                .then(response => {
                    setPlace(response.data);
                    setStatus('success');
                })
                .catch(error => {
                    console.error('Error fetching place:', error);
                    setStatus('error');
                });
        }
    }, [status, params.placeid]);

    // Get category icon
    const getCategoryIcon = (category) => {
        if (!category) return <FaMapMarkerAlt />;
    
    switch (category) {
      case "Beach": return <FaUmbrellaBeach />;
      case "Mountain": return <FaMountain />;
      case "Historical": return <FaMonument />;
      case "Waterfall": return <FaWater />;
      case "Wildlife": return <FaPaw />;
      case "Religious": return <FaChurch />;
      case "Scenic": return <FaMountain />;
      default: return <FaMapMarkerAlt />;
    }
    };

    return (
        <div className="w-full h-screen overflow-hidden flex justify-center items-center" style={{ backgroundColor: 'var(--main-background)' }}>
            {status === 'loading' && <Loader />}
            {status === 'success' && place && (
                <div className="max-w-7xl w-full h-full overflow-y-auto flex flex-col p-4 sm:p-6 md:p-8">
                    {/* Place Title for Mobile */}
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center lg:hidden mb-4 flex items-center justify-center gap-3">
                        {getCategoryIcon(place.category)}
                        <div>
                            {place.name}
                            <span className="block text-lg text-gray-600 mt-1">{place.category}</span>
                            {place.isFeatured && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-2">
                                    <CiStar className="mr-1" /> Featured Destination
                                </span>
                            )}
                        </div>
                    </h1>

                    {/* Place Title for Desktop */}
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center hidden lg:flex items-center justify-center gap-3 mb-6">
                        {getCategoryIcon(place.category)}
                        <div>
                            {place.name}
                            <span className="block text-lg text-gray-600 mt-1">{place.category}</span>
                            {place.isFeatured && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-2">
                                    <CiStar className="mr-1" /> Featured Destination
                                </span>
                            )}
                        </div>
                    </h1>

                    {/* Description Section */}
                    {place.description && (
                        <div className="mb-2 w-full">
                            <div className="p-4 " >
                                <h3 className="text-lg font-semibold mb-3 text-gray-800">About This Place</h3>
                                <div className=" overflow-y-auto text-justify">
                                    <p className="text-gray-700 leading-relaxed">{place.description}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="flex-1 flex flex-col lg:flex-row gap-6 lg:gap-8 items-start justify-center">
                        <div className="w-full lg:w-1/2 max-w-lg flex justify-center items-center mt-4 p-4">
                            <ImageSlider images={place.image || []} />
                        </div>
                        
                        <div className="w-full lg:w-1/2 max-w-lg flex flex-col gap-3 sm:gap-4 px-2 sm:px-4">
                            {/* Place Information */}
                            <div className="p-4 rounded-lg shadow-md" style={{ backgroundColor: 'var(--card-background)', boxShadow: '0 2px 8px var(--shadow-color)' }}>
                                <h3 className="text-lg font-semibold mb-3 text-gray-800">Place Information</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <FaTag className="text-blue-500" size={14} />
                                        <span className="text-gray-600">Category:</span>
                                        <span className="font-medium">{place.category}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FaMapMarkerAlt className="text-red-500" size={14} />
                                        <span className="text-gray-600">District:</span>
                                        <span className="font-medium">{place.district}</span>
                                    </div>
                                    {place.openingHours && (
                                        <div className="flex items-center gap-2">
                                            <FaClock className="text-green-500" size={14} />
                                            <span className="text-gray-600">Opening Hours:</span>
                                            <span className="font-medium">{place.openingHours}</span>
                                        </div>
                                    )}
                                    {place.entranceFee && (
                                        <div className="flex items-center gap-2">
                                            <FaMoneyBillWave className="text-yellow-500" size={14} />
                                            <span className="text-gray-600">Entrance Fee:</span>
                                            <span className="font-medium">{place.entranceFee}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600">Status:</span>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            place.status === 'active' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {place.status === 'active' ? 'Open to Visitors' : 'Temporarily Closed'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Location & Directions */}
                            <div className="p-4 rounded-lg shadow-md" style={{ backgroundColor: 'var(--card-background)', boxShadow: '0 2px 8px var(--shadow-color)' }}>
                                <h3 className="text-lg font-semibold mb-3 text-gray-800">Location & Directions</h3>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <span className="text-gray-600">City:</span>
                                        <span className="ml-2 font-medium">{place.city}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">District:</span>
                                        <span className="ml-2 font-medium">{place.district}</span>
                                    </div>
                                    
                                    {/* Map Section */}
                                    {place.mapUrl ? (
                                        <div className="mt-3">
                                            <div className="w-full h-48 rounded-lg overflow-hidden border border-gray-300 mb-2">
                                                <iframe
                                                    src={place.mapUrl.includes('embed') 
                                                        ? place.mapUrl 
                                                        : `https://maps.google.com/maps?q=${encodeURIComponent(place.city + ', ' + place.district)}&output=embed`
                                                    }
                                                    width="100%"
                                                    height="100%"
                                                    style={{ border: 0 }}
                                                    allowFullScreen=""
                                                    loading="lazy"
                                                    referrerPolicy="no-referrer-when-downgrade"
                                                    title="Place Location Map"
                                                />
                                            </div>
                                            <a 
                                                href={place.mapUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 underline text-sm hover:text-blue-600 transition-colors"
                                                style={{ color: 'var(--brand-primary)' }}
                                            >
                                                <FaExternalLinkAlt size={12} />
                                                View in Google Maps
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="mt-3">
                                            <div className="w-full h-48 rounded-lg overflow-hidden border border-gray-300 mb-2">
                                                <iframe
                                                    src={`https://maps.google.com/maps?q=${encodeURIComponent(place.city + ', ' + place.district)}&output=embed`}
                                                    width="100%"
                                                    height="100%"
                                                    style={{ border: 0 }}
                                                    allowFullScreen=""
                                                    loading="lazy"
                                                    referrerPolicy="no-referrer-when-downgrade"
                                                    title="Place Location Map"
                                                />
                                            </div>
                                            <p className="text-gray-600 text-sm">
                                                Approximate location: {place.city}, {place.district}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Visitor Information */}
                            {(place.openingHours || place.entranceFee) && (
                                <div className="p-4 rounded-lg shadow-md" style={{ backgroundColor: 'var(--card-background)', boxShadow: '0 2px 8px var(--shadow-color)' }}>
                                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Visitor Information</h3>
                                    <div className="space-y-3">
                                        {place.openingHours && (
                                            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                                                <FaClock className="text-green-500 mt-1" size={16} />
                                                <div>
                                                    <span className="font-medium text-green-800">Opening Hours</span>
                                                    <p className="text-green-700 text-sm mt-1">{place.openingHours}</p>
                                                </div>
                                            </div>
                                        )}
                                        {place.entranceFee && (
                                            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                                                <FaMoneyBillWave className="text-yellow-500 mt-1" size={16} />
                                                <div>
                                                    <span className="font-medium text-yellow-800">Entrance Fee</span>
                                                    <p className="text-yellow-700 text-sm mt-1">{place.entranceFee}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="w-full mt-2 sm:mt-4 space-y-3">
                                <button 
                                    className="w-full py-3 text-base rounded-lg transition-colors duration-300 font-medium"
                                    style={{ 
                                        backgroundColor: 'var(--button-primary-bg)',
                                        color: 'var(--button-primary-text)',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = 'var(--button-primary-hover)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'var(--button-primary-bg)';
                                    }}
                                    onClick={() => navigate('/destinations')}
                                >
                                    ← Back to Destinations
                                </button>
                                
                               
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {status === 'error' && (
                <div className="text-center">
                    <div className="text-red-500 mb-4">Error loading place details.</div>
                    <button 
                        onClick={() => navigate('/destinations')}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        ← Back to Destinations
                    </button>
                </div>
            )}
        </div>
    );
}
