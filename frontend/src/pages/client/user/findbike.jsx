import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Loader from '../../../components/loader';
import ProductCard from '../../../components/productcard';
import Footer from '../../../components/footer';
export default function Findbike() {

  const [bikes, setBikes] = useState([]);
  const [filteredBikes, setFilteredBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    if (loading) {
      axios.get(import.meta.env.VITE_BACKEND_URL + '/products/available')
        .then(response => {
          const bikesData = response.data.products || [];
          setBikes(bikesData);
          setFilteredBikes(bikesData);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching bikes:', error);
          setBikes([]);
          setFilteredBikes([]);
          setLoading(false);
        })
    }
  }, [loading]);

  // Filter bikes based on search criteria
  useEffect(() => {
    let filtered = bikes;

    if (searchTerm) {
      filtered = filtered.filter(bike => 
        bike.bikeName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType) {
      filtered = filtered.filter(bike => 
        bike.bikeType?.toLowerCase() === selectedType.toLowerCase()
      );
    }

    if (selectedCity) {
      filtered = filtered.filter(bike => 
        bike.city?.toLowerCase().includes(selectedCity.toLowerCase())
      );
    }

    if (maxPrice) {
      filtered = filtered.filter(bike => 
        bike.pricePerDay <= parseFloat(maxPrice)
      );
    }

    setFilteredBikes(filtered);
  }, [bikes, searchTerm, selectedType, selectedCity, maxPrice]);

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
    setMaxPrice('');
  };
  return (
    <div className="w-full h-[calc(100vh-80px)] overflow-y-auto"
         style={{
           scrollbarWidth: 'none',
           msOverflowStyle: 'none',
         }}>
      <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="pt-4 pb-16">
      {
        loading ? (
          <div className="flex justify-center items-center min-h-[50vh]">
            <Loader />
          </div>
        ) : (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6 text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                Find Your Perfect Bike
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Discover amazing bikes available for rent
              </p>
              <div className="text-sm text-gray-600 mt-2">
                Total: {bikes.length} bike{bikes.length !== 1 ? 's' : ''} | 
                Showing: {filteredBikes.length} bike{filteredBikes.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Search and Filter Section */}
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Search by Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Search by Name</label>
                    <input
                      type="text"
                      placeholder="Enter bike name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>

                  {/* Filter by Type */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Filter by Type</label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="">All Types</option>
                      {getBikeTypes().map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filter by City */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Filter by Location</label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="">All Locations</option>
                      {getCities().map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filter by Max Price */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Max Price/Day</label>
                    <input
                      type="number"
                      placeholder="Max price..."
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>

                  {/* Clear Filters Button */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 invisible">Clear</label>
                    <button
                      onClick={clearFilters}
                      className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200 font-medium text-sm"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 justify-items-center">
              {
                filteredBikes.length > 0 ? (
                  filteredBikes.map((bike) => (
                    <div key={bike._id} className="w-full max-w-sm">
                      <ProductCard bike={bike} />
                    </div>
                  ))
                ) : bikes.length > 0 ? (
                  <div className="col-span-full text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bikes match your search criteria</h3>
                    <p className="text-gray-500 mb-4">Try adjusting your search terms or clear the filters</p>
                    <button 
                      onClick={clearFilters}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="col-span-full text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bikes available</h3>
                    <p className="text-gray-500">Check back later for new listings.</p>
                  </div>
                )
              }
            </div>
          </div>
        )
      }
      </div>
       <Footer />
    </div>
  )
}