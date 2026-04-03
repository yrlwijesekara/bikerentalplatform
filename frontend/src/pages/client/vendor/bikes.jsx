import { useState, useEffect } from "react";
import { BiPlus } from "react-icons/bi";
import { Link, useNavigate } from "react-router-dom";
import { MdOutlineEdit, MdDelete } from "react-icons/md";
import { IoIosEye } from "react-icons/io";

import axios from "axios";
import toast from "react-hot-toast";
import Loader from "../../../components/loader";
import Footer from "../../../components/footer";


export default function Bikes() {
  const BIKES_PER_PAGE = 5;
   
  const navigate = useNavigate();
  const [bikes, setBikes] = useState([]);
  const [filteredBikes, setFilteredBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  

  // Fetch bikes from database
  useEffect(() => {
    fetchBikes();
  }, []);

  // Filter bikes based on search criteria
  useEffect(() => {
    let filtered = bikes;

    if (searchTerm) {
      filtered = filtered.filter(bike => 
        bike.bikeName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType) {
      filtered = filtered.filter(bike => 
        bike.bikeType.toLowerCase() === selectedType.toLowerCase()
      );
    }

    if (selectedCity) {
      filtered = filtered.filter(bike => 
        bike.city.toLowerCase().includes(selectedCity.toLowerCase())
      );
    }

    setFilteredBikes(filtered);
  }, [bikes, searchTerm, selectedType, selectedCity]);

  useEffect(() => {
    const pages = Math.max(1, Math.ceil(filteredBikes.length / BIKES_PER_PAGE));
    if (currentPage > pages) {
      setCurrentPage(pages);
    }
  }, [filteredBikes, currentPage]);

  // Get unique bike types and cities for filter dropdowns
  const getBikeTypes = () => {
    const types = bikes.map(bike => bike.bikeType).filter(Boolean);
    return [...new Set(types)];
  };

  const getCities = () => {
    const cities = bikes.map(bike => bike.city).filter(Boolean);
    return [...new Set(cities)];
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setSelectedCity('');
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filteredBikes.length / BIKES_PER_PAGE));
  const startIndex = (currentPage - 1) * BIKES_PER_PAGE;
  const paginatedBikes = filteredBikes.slice(startIndex, startIndex + BIKES_PER_PAGE);

  const getPaginationItems = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [1];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) pages.push('left-ellipsis');
    for (let p = start; p <= end; p += 1) {
      pages.push(p);
    }
    if (end < totalPages - 1) pages.push('right-ellipsis');

    pages.push(totalPages);
    return pages;
  };

  const fetchBikes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        toast.error("Please login to view your bikes");
        return;
      }

      const response = await axios.get(
        import.meta.env.VITE_BACKEND_URL + "/products/vender",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBikes(response.data.products || []);
      setFilteredBikes(response.data.products || []);
      setError(null);
    } catch (error) {
      console.error("Error fetching bikes:", error);
      setError("Failed to fetch bikes");
      toast.error("Failed to fetch bikes");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bikeId) => {
    try {
      const token = localStorage.getItem("token");
      
      await axios.delete(
        import.meta.env.VITE_BACKEND_URL + `/products/${bikeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Bike deleted successfully!");
      fetchBikes(); // Refresh the list
    } catch (error) {
      console.error("Error deleting bike:", error);
      // Display specific backend error message, fallback to generic message
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to delete bike";
      toast.error(errorMessage);
    }
  };

  const BikeCard = ({ bike }) => (
    <div className="w-full bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200 hover:scale-[1.02]">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        {/* Bike Image */}
        <div className="w-full lg:w-48 h-32 shrink-0">
          <img 
            src={bike.images?.[0] || "https://via.placeholder.com/300x200?text=No+Image"} 
            alt={bike.bikeName}
            className="w-full h-full object-cover rounded-md"
          />
        </div>
        
        {/* Bike Details */}
        <div className="flex-1 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="text-xl font-bold text-gray-900">{bike.bikeName}</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              bike.isApproved 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {bike.isApproved ? 'Approved' : 'Pending Approval'}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
            <p><span className="font-medium">Type:</span> {bike.bikeType}</p>
            <p><span className="font-medium">Price:</span> Rs.{bike.pricePerDay}/day</p>
            <p><span className="font-medium">Year:</span> {bike.manufacturingYear}</p>
            <p><span className="font-medium">Engine:</span> {bike.engineCC}CC</p>
            <p><span className="font-medium">Fuel:</span> {bike.fuelType}</p>
            <p><span className="font-medium">City:</span> {bike.city}</p>
          </div>
          
          {bike.note && (
            <p className="text-sm text-gray-700 italic">
              <span className="font-medium">Note:</span> {bike.note}
            </p>
          )}
          
          <div className={`inline-flex px-2 py-1 rounded text-sm ${
            bike.isAvailable 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {bike.isAvailable ? 'Available' : 'Not Available'}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex lg:flex-col gap-2 justify-end">
          
          <button 
            onClick={() => navigate(`/vendor/update-bike`, { state: { bike } })}
            className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors duration-200"
            title="Edit Bike"
          >
            <MdOutlineEdit size={18} />
          </button>
          <button 
            onClick={() => handleDelete(bike._id)}
            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
            title="Delete Bike"
          >
            <MdDelete size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-100px)] ">
        <Loader />
        <p className="text-lg text-gray-600">Loading your rental bikes...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-80px)] bg-(--main-background) overflow-y-auto scrollbar-hide"
         style={{
           scrollbarWidth: 'none', /* Firefox */
           msOverflowStyle: 'none', /* Internet Explorer 10+ */
         }}>
      <style>{`
        div::-webkit-scrollbar {
          display: none; /* Safari and Chrome */
        }
      `}</style>
      <div className="p-6">
        {/* Page Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-3xl font-bold text-gray-900">My Rental Bikes</h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="text-sm text-gray-600 text-right">
                Total: {bikes.length} bike{bikes.length !== 1 ? 's' : ''} | 
                Showing: {filteredBikes.length} bike{filteredBikes.length !== 1 ? 's' : ''}
              </div>
              <Link 
                to="/vendor/add-bike" 
                className="flex items-center gap-2 px-4 py-2 bg-(--button-primary-bg) text-(--button-primary-text) font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 hover:bg-(--button-primary-hover) cursor-pointer whitespace-nowrap"
              >
                <BiPlus size={20} /> Add New Bike
              </Link>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search by Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Search by Name</label>
                <input
                  type="text"
                  placeholder="Enter bike name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter by Type */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Filter by Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  {getBikeTypes().map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Filter by City */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Filter by City</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Cities</option>
                  {getCities().map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Clear Filters Button */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 invisible">Clear</label>
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200 font-medium"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bikes List */}
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
              <button 
                onClick={fetchBikes}
                className="mt-2 text-red-600 hover:text-red-800 underline"
              >
                Try Again
              </button>
            </div>
          )}

          {filteredBikes.length === 0 && bikes.length > 0 && !loading && !error ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No bikes match your search criteria</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search terms or clear the filters</p>
                <button 
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors duration-200"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          ) : bikes.length === 0 && !loading && !error ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <BiPlus className="mx-auto text-6xl text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No bikes added yet</h3>
              <p className="text-gray-600 mb-6">Start by adding your first bike to the rental platform</p>
              <Link 
                to="/vendor/add-bike"
                className="inline-flex items-center gap-2 px-6 py-3 bg-(--button-primary-bg) text-(--button-primary-text) font-semibold rounded-lg hover:bg-(--button-primary-hover) transition-colors duration-200"
              >
                <BiPlus size={20} /> Add Your First Bike
              </Link>
            </div>
          ) : (
            <div className="space-y-6 pb-24">
              {paginatedBikes.map((bike) => (
                <BikeCard key={bike._id} bike={bike} />
              ))}

              {filteredBikes.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-2">
                  <div className="text-sm text-gray-500">
                    Showing {startIndex + 1}-{Math.min(startIndex + BIKES_PER_PAGE, filteredBikes.length)} of {filteredBikes.length} bikes
                  </div>

                  {totalPages > 1 && (
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Prev
                      </button>

                      {getPaginationItems().map((item, idx) => {
                        if (typeof item === 'string') {
                          return <span key={`${item}-${idx}`} className="px-2 text-gray-500">...</span>;
                        }

                        const isActive = item === currentPage;
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setCurrentPage(item)}
                            className={`px-3 py-1 rounded-md border transition-colors duration-200 ${
                              isActive
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            {item}
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
