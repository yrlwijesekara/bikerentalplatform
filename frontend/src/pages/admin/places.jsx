import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { Link } from "react-router-dom";
import { IoEyeOutline, IoLocationOutline, IoMapOutline } from "react-icons/io5";
import { FiEdit3, FiMapPin, FiClock, FiDollarSign } from "react-icons/fi";
import { BiPlus } from "react-icons/bi";
import Loader from "../../components/loader.jsx";
import { FiTrash2 } from "react-icons/fi";

const samplePlaces = [];

export default function PlacesAdminPage() {
  const [places, setPlaces] = useState(samplePlaces);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterFeatured, setFilterFeatured] = useState("");
  const [editingNote, setEditingNote] = useState(null);
  const [tempNote, setTempNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Categories from your model
  const categories = ["Beach", "Mountain", "Historical", "Waterfall", "Wildlife", "Religious", "Scenic"];

  // Handle status change
  const handleStatusChange = async (placeId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/places/admin/${placeId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Update local state
      setPlaces((prevPlaces) =>
        prevPlaces.map((place) => {
          if (place._id === placeId) {
            return { ...place, status: newStatus };
          }
          return place;
        }),
      );

      toast.success(`Place ${newStatus === "active" ? "activated" : "deactivated"} successfully`);
    } catch (error) {
      console.error("Failed to update place status:", error);
      toast.error("Failed to update place status");
    }
  };

  // Handle featured status change
  const handleFeaturedChange = async (placeId, isFeatured) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/places/admin/${placeId}/featured`,
        { isFeatured },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Update local state
      setPlaces((prevPlaces) =>
        prevPlaces.map((place) => {
          if (place._id === placeId) {
            return { ...place, isFeatured };
          }
          return place;
        }),
      );

      toast.success(`Place ${isFeatured ? "featured" : "unfeatured"} successfully`);
    } catch (error) {
      console.error("Failed to update featured status:", error);
      toast.error("Failed to update featured status");
    }
  };

  // Handle note update  
  const handleNoteUpdate = async (placeId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/places/admin/${placeId}/note`,
        { note: tempNote },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Update local state
      setPlaces((prevPlaces) =>
        prevPlaces.map((place) => {
          if (place._id === placeId) {
            return { ...place, note: tempNote };
          }
          return place;
        }),
      );

      toast.success("Note updated successfully");
    } catch (error) {
      console.error("Failed to update note:", error);
      toast.error("Failed to update note");
    }
    
    setEditingNote(null);
    setTempNote("");
  };

  // Handle place deletion
  const handleDeletePlace = async (place) => {
    // Show confirmation dialog
    const isConfirmed = window.confirm(
      `Are you sure you want to delete "${place.name}"?\n\nThis action cannot be undone.`
    );
    
    if (!isConfirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/places/${place._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Remove from local state
      setPlaces((prevPlaces) =>
        prevPlaces.filter((p) => p._id !== place._id)
      );

      toast.success(`Place "${place.name}" deleted successfully`);
    } catch (error) {
      console.error("Failed to delete place:", error);
      if (error.response?.status === 404) {
        toast.error("Place not found");
      } else {
        toast.error("Failed to delete place");
      }
    }
  };

  // Filter places based on search term and filters
  const filteredPlaces = places.filter((place) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      place._id?.toLowerCase().includes(searchLower) ||
      place.name?.toLowerCase().includes(searchLower) ||
      place.city?.toLowerCase().includes(searchLower) ||
      place.category?.toLowerCase().includes(searchLower) ||
      place.description?.toLowerCase().includes(searchLower);
    
    const matchesCategory = !filterCategory || place.category === filterCategory;
    const matchesStatus = !filterStatus || place.status === filterStatus;
    const matchesCity = !filterCity || place.city?.toLowerCase().includes(filterCity.toLowerCase());
    const matchesFeatured = !filterFeatured ||
      (filterFeatured === "featured" && place.isFeatured) ||
      (filterFeatured === "not-featured" && !place.isFeatured);

    return matchesSearch && matchesCategory && matchesStatus && matchesCity && matchesFeatured;
  });

  // Get unique cities for filter dropdown
  const getCities = () => {
    const cities = places.map(place => place.city).filter(Boolean);
    return [...new Set(cities)];
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilterStatus('');
    setFilterCity('');
    setFilterFeatured('');
  };

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        console.log("Fetching places from:", `${import.meta.env.VITE_BACKEND_URL}/places`);
        
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/places`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        console.log("Places response:", response.data);
        setPlaces(response.data.places || response.data);
        toast.success("Places fetched successfully.");
      } catch (error) {
        console.error("Failed to fetch places:", error);
        console.error("Error details:", error.response?.data);
        toast.error("Failed to fetch places.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlaces();
  }, []);

  return (
    <div className="w-full p-2 md:p-4 lg:p-6">
      <div className="w-full max-w-full mx-auto">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 text-center">
          Places Administration
        </h1>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader />
            <p className="text-gray-600 mt-4">Loading places...</p>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <div className="text-sm text-gray-600 mt-2">
                Total: {places.length} place{places.length !== 1 ? 's' : ''} | 
                Showing: {filteredPlaces.length} place{filteredPlaces.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Search and Filter Section */}
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                  {/* Search by Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Search Places</label>
                    <input
                      type="text"
                      placeholder="Search by name, city, category..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>

                  {/* Filter by Category */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filter by City */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <select
                      value={filterCity}
                      onChange={(e) => setFilterCity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="">All Cities</option>
                      {getCities().map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filter by Status */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  {/* Filter by Featured */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Featured</label>
                    <select
                      value={filterFeatured}
                      onChange={(e) => setFilterFeatured(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="">All Places</option>
                      <option value="featured">Featured</option>
                      <option value="not-featured">Not Featured</option>
                    </select>
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

                {/* Filter Results Info */}
                {(searchTerm || filterCategory || filterStatus || filterCity || filterFeatured) && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                      Found {filteredPlaces.length} place(s) matching your criteria
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                
              {/* Mobile scrolling hint */}
              <div className="lg:hidden bg-blue-50 p-2 text-xs text-blue-600 text-center border-b">
                ← Scroll horizontally to see all columns →
              </div>
              
              <div className="overflow-x-auto scrollbar-hide">
                <style jsx>{`
                  .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                  }
                  .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                <table className="w-full border-collapse min-w-[800px] lg:min-w-[1000px] xl:min-w-[1200px]">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-3 px-2 text-left font-semibold text-gray-700 border border-gray-300 w-20 hidden lg:table-cell">ID</th>
                      <th className="py-3 px-3 text-left font-semibold text-gray-700 border border-gray-300 min-w-[150px]">Place Name</th>
                      <th className="py-3 px-2 text-left font-semibold text-gray-700 border border-gray-300 w-24">Category</th>
                      <th className="py-3 px-3 text-left font-semibold text-gray-700 border border-gray-300 max-w-[200px] hidden md:table-cell">Description</th>
                      <th className="py-3 px-2 text-left font-semibold text-gray-700 border border-gray-300 w-20">Status</th>
                      <th className="py-3 px-2 text-left font-semibold text-gray-700 border border-gray-300 w-24 hidden sm:table-cell">Featured</th>
                      <th className="py-3 px-3 text-left font-semibold text-gray-700 border border-gray-300 min-w-[120px]">Note</th>
                      <th className="py-3 px-2 text-left font-semibold text-gray-700 border border-gray-300 w-20">Image</th>
                      <th className="py-3 px-3 text-left font-semibold text-gray-700 border border-gray-300 min-w-[100px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlaces && filteredPlaces.length > 0 ? (
                      filteredPlaces.map((place, index) => (
                        <tr key={place._id || index} className="hover:bg-gray-50">
                          <td className="py-2 px-2 border border-gray-300 text-xs whitespace-nowrap hidden lg:table-cell" title={place._id}>
                            {place._id?.substring(0, 8)}...
                          </td>
                          <td className="py-2 px-3 border border-gray-300 font-medium text-sm">
                            <div className="truncate max-w-[150px]" title={place.name}>
                              {place.name}
                            </div>
                          </td>
                          <td className="py-2 px-2 border border-gray-300">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {place.category}
                            </span>
                          </td>
                          <td className="py-2 px-3 border border-gray-300 max-w-[200px] hidden md:table-cell">
                            <div className="text-xs text-gray-600 line-clamp-2 overflow-hidden" title={place.description}>
                              {place.description}
                            </div>
                          </td>
                          <td className="py-2 px-2 border border-gray-300 whitespace-nowrap">
                            <select
                              value={place.status}
                              onChange={(e) => handleStatusChange(place._id, e.target.value)}
                              className={`px-2 py-1 rounded-md text-xs font-medium border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                place.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </td>
                          <td className="py-2 px-2 border border-gray-300 whitespace-nowrap hidden sm:table-cell">
                            <label className="inline-flex items-center">
                              <input
                                type="checkbox"
                                checked={place.isFeatured}
                                onChange={(e) => handleFeaturedChange(place._id, e.target.checked)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="ml-1 text-xs text-gray-700">
                                {place.isFeatured ? "⭐" : ""}
                              </span>
                            </label>
                          </td>
                          <td className="py-2 px-3 border border-gray-300 min-w-[120px]">
                            {editingNote === place._id ? (
                              <div className="flex flex-col space-y-1">
                                <div className="flex items-center space-x-1">
                                  <input
                                    type="text"
                                    value={tempNote}
                                    maxLength={50}
                                    onChange={(e) => setTempNote(e.target.value)}
                                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="Add note..."
                                    onKeyPress={(e) => {
                                      if (e.key === "Enter") {
                                        handleNoteUpdate(place._id);
                                      }
                                    }}
                                  />
                                  <button
                                    onClick={() => handleNoteUpdate(place._id)}
                                    className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                                  >
                                    ✓
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingNote(null);
                                      setTempNote("");
                                    }}
                                    className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                  >
                                    ✕
                                  </button>
                                </div>
                                <div className="text-xs text-gray-500 text-right">
                                  {tempNote.length}/50
                                </div>
                              </div>
                            ) : (
                              <div
                                onClick={() => {
                                  setEditingNote(place._id);
                                  setTempNote(place.note || "");
                                }}
                                className="text-xs p-1 rounded border border-gray-200 cursor-pointer hover:bg-gray-50 min-h-[2rem] flex items-center truncate"
                                title="Click to edit note"
                              >
                                {place.note && place.note !== "none"
                                  ? place.note
                                  : "Add note..."}
                              </div>
                            )}
                          </td>
                          <td className="py-2 px-2 border border-gray-300">
                            {place.image && (Array.isArray(place.image) ? place.image.length > 0 : true) ? (
                              <img
                                src={Array.isArray(place.image) ? place.image[0] : place.image}
                                alt={place.name}
                                className="w-12 h-12 object-cover rounded-md border border-gray-200"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs">
                                No Img
                              </div>
                            )}
                          </td>
                          <td className="py-2 px-3 border border-gray-300 whitespace-nowrap">
                            <div className="flex space-x-1 justify-center">
                             
                              <Link
                                to={`/admin/update-places/${place._id}`}
                                className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded-md transition-colors duration-200 flex items-center"
                                title="Edit Place"
                              >
                                <FiEdit3 className="w-4 h-4" />
                              </Link>
                              <button 
                                onClick={() => handleDeletePlace(place)}
                                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md transition-colors duration-200 flex items-center"
                                title="Delete Place"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                             
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : places.length > 0 ? (
                      <tr>
                        <td
                          colSpan="9"
                          className="py-8 px-4 text-center text-gray-500 border border-gray-300"
                        >
                          <div className="flex flex-col items-center">
                            <div className="text-4xl mb-2">🔍</div>
                            <div className="font-medium">
                              No places match your search criteria
                            </div>
                            <div className="text-sm mb-4">
                              Try adjusting your search terms or clear the filters
                            </div>
                            <button 
                              onClick={clearFilters}
                              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
                            >
                              Clear Filters
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td
                          colSpan="9"
                          className="py-8 px-4 text-center text-gray-500 border border-gray-300"
                        >
                          <div className="flex flex-col items-center">
                            <div className="text-4xl mb-2">🏞️</div>
                            <div className="font-medium">No places found</div>
                            <div className="text-sm">Add some places to get started</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          
          </>
        )}
        
        {/* Add Places Floating Action Button */}
        <Link 
          to="/admin/add-places" 
          className="fixed bottom-10 right-10 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 hover:bg-blue-700 cursor-pointer z-10"
        >
          <BiPlus size={20} /> Add New Place
        </Link>
      </div>
    </div>
  );
}
