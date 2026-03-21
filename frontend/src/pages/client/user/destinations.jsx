import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Loader from '../../../components/loader';
import PlaceCard from '../../../components/placecard';
import Footer from '../../../components/footer';

export default function Destinations() {
  const PLACES_PER_PAGE = 12;

  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (loading) {
      axios.get(import.meta.env.VITE_BACKEND_URL + '/places')
        .then(response => {
          const placesData = response.data || [];
          setPlaces(placesData);
          setFilteredPlaces(placesData);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching places:', error);
          setPlaces([]);
          setFilteredPlaces([]);
          setLoading(false);
        })
    }
  }, [loading]);

  // Filter places based on search criteria
  useEffect(() => {
    let filtered = places;

    if (searchTerm) {
      filtered = filtered.filter(place => 
        place.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        place.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(place => 
        place.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (selectedCity) {
      filtered = filtered.filter(place => 
        place.city?.toLowerCase().includes(selectedCity.toLowerCase())
      );
    }

    if (featuredOnly) {
      filtered = filtered.filter(place => place.isFeatured === true);
    }

    setFilteredPlaces(filtered);
  }, [places, searchTerm, selectedCategory, selectedCity, featuredOnly]);

  useEffect(() => {
    const pages = Math.max(1, Math.ceil(filteredPlaces.length / PLACES_PER_PAGE));
    if (currentPage > pages) {
      setCurrentPage(pages);
    }
  }, [filteredPlaces, currentPage]);

  // Get unique categories and cities for filter dropdowns
  const getCategories = () => {
    const categories = places.map(place => place.category).filter(Boolean);
    return [...new Set(categories)];
  };

  const getCities = () => {
    const cities = places.map(place => place.city).filter(Boolean);
    return [...new Set(cities)];
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedCity('');
    setFeaturedOnly(false);
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filteredPlaces.length / PLACES_PER_PAGE));
  const startIndex = (currentPage - 1) * PLACES_PER_PAGE;
  const paginatedPlaces = filteredPlaces.slice(startIndex, startIndex + PLACES_PER_PAGE);

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
                Discover Sri Lanka's Hidden Gems
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Explore the most beautiful destinations across the island
              </p>
              <div className="text-sm text-gray-600 mt-2">
                Total: {places.length} destination{places.length !== 1 ? 's' : ''} | 
                Showing: {filteredPlaces.length} destination{filteredPlaces.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Search and Filter Section */}
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Search by Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Search Places</label>
                    <input
                      type="text"
                      placeholder="Enter place name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>

                  {/* Filter by Category */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Filter by Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="">All Categories</option>
                      {getCategories().map((category) => (
                        <option key={category} value={category}>{category}</option>
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

                  {/* Featured Only Toggle */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Show Featured</label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="featuredOnly"
                        checked={featuredOnly}
                        onChange={(e) => setFeaturedOnly(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="featuredOnly" className="ml-2 text-sm text-gray-700">
                        Featured only
                      </label>
                    </div>
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
                filteredPlaces.length > 0 ? (
                  paginatedPlaces.map((place) => (
                    <div key={place._id} className="w-full max-w-sm">
                      <PlaceCard place={place} />
                    </div>
                  ))
                ) : places.length > 0 ? (
                  <div className="col-span-full text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No destinations match your search criteria</h3>
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No destinations available</h3>
                    <p className="text-gray-500">Check back later for new destinations.</p>
                  </div>
                )
              }
            </div>

            {filteredPlaces.length > 0 && (
              <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-sm text-gray-500">
                  Showing {startIndex + 1}-{Math.min(startIndex + PLACES_PER_PAGE, filteredPlaces.length)} of {filteredPlaces.length} destinations
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
        )
      }
      </div>
       <Footer />
    </div>
  )
}


             