import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { Link } from "react-router-dom";
import { IoEyeOutline, IoLocationOutline, IoMapOutline } from "react-icons/io5";
import { FiEdit3, FiMapPin, FiClock, FiDollarSign } from "react-icons/fi";
import { BiPlus } from "react-icons/bi";
import Loader from "../../components/loader.jsx";

const samplePlaces = [];

export default function PlacesAdminPage() {
  const [places, setPlaces] = useState(samplePlaces);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingNote, setEditingNote] = useState(null);
  const [tempNote, setTempNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

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

    return matchesSearch && matchesCategory && matchesStatus;
  });

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching places from:", `${import.meta.env.VITE_BACKEND_URL}/places`);
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/places`);
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
            {/* Search and Filter Section */}
            <div className="mb-6 space-y-4">
              {/* Search Bar */}
              <div className="relative max-w-md mx-auto">
                <input
                  type="text"
                  placeholder="Search places by name, city, category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <IoLocationOutline className="w-5 h-5 text-gray-400" />
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                {(filterCategory || filterStatus || searchTerm) && (
                  <button
                    onClick={() => {
                      setFilterCategory("");
                      setFilterStatus("");
                      setSearchTerm("");
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              {(searchTerm || filterCategory || filterStatus) && (
                <p className="text-center text-sm text-gray-500">
                  Found {filteredPlaces.length} place(s) matching your criteria
                </p>
              )}
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
                            {place.image ? (
                              <img
                                src={place.image}
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
                            <div className="flex space-x-1">
                              <button 
                                className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md transition-colors duration-200 flex items-center"
                                title="View Details"
                              >
                                <IoEyeOutline className="w-4 h-4" />
                              </button>
                              <button 
                                className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded-md transition-colors duration-200 flex items-center"
                                title="Edit Place"
                              >
                                <FiEdit3 className="w-4 h-4" />
                              </button>
                             
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="9"
                          className="py-8 px-4 text-center text-gray-500 border border-gray-300"
                        >
                          <div className="flex flex-col items-center">
                            <div className="text-4xl mb-2">
                              {searchTerm || filterCategory || filterStatus ? "🔍" : "🏞️"}
                            </div>
                            <div className="font-medium">
                              {searchTerm || filterCategory || filterStatus
                                ? "No places found matching your criteria"
                                : "No places found"}
                            </div>
                            <div className="text-sm">
                              {searchTerm || filterCategory || filterStatus
                                ? "Try adjusting your search or filters"
                                : "Add some places to get started"}
                            </div>
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
          className="fixed bottom-10 right-10 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 hover:bg-blue-700 cursor-pointer z-50"
        >
          <BiPlus size={20} /> Add New Place
        </Link>
      </div>
    </div>
  );
}
