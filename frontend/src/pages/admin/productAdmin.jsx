import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { IoEyeOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/loader.jsx";
const sampleProducts = [];

export default function ProductAdminPage() {
  const PRODUCTS_PER_PAGE = 10;
  const navigate = useNavigate();
  const [product, setProduct] = useState(sampleProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [filterApproval, setFilterApproval] = useState("");
  const [filterAvailability, setFilterAvailability] = useState("");
  const [editingNote, setEditingNote] = useState(null);
  const [tempNote, setTempNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Handle approval status change
  const handleApprovalChange = async (
    productId,
    newApprovalStatus,
    note = undefined,
  ) => {
    try {
      const token = localStorage.getItem("token");
      const requestData = { isApproved: newApprovalStatus };
      if (note !== undefined) {
        requestData.note = note;
      }

      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/products/admin/${productId}/approve`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Update local state
      setProduct((prevProducts) =>
        prevProducts.map((prod) => {
          if (prod._id === productId) {
            const updated = { ...prod, isApproved: newApprovalStatus };
            if (note !== undefined) {
              updated.note = note;
            }
            return updated;
          }
          return prod;
        }),
      );

      toast.success(
        `Product ${newApprovalStatus ? "approved" : "rejected"} successfully`,
      );
    } catch (error) {
      console.error("Failed to update approval status:", error);
      toast.error("Failed to update approval status");
    }
  };

  // Handle note update
  const handleNoteUpdate = async (productId) => {
    await handleApprovalChange(
      productId,
      product.find((p) => p._id === productId)?.isApproved,
      tempNote,
    );
    setEditingNote(null);
    setTempNote("");
  };

  // Filter products based on search term and filters
  const filteredProducts = product.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      item._id?.toLowerCase().includes(searchLower) ||
      item.bikeName?.toLowerCase().includes(searchLower) ||
      item.bikeType?.toLowerCase().includes(searchLower) ||
      item.city?.toLowerCase().includes(searchLower);
    
    const matchesType = !selectedType || item.bikeType?.toLowerCase() === selectedType.toLowerCase();
    const matchesCity = !selectedCity || item.city?.toLowerCase().includes(selectedCity.toLowerCase());
    const matchesPrice = !maxPrice || item.pricePerDay <= parseFloat(maxPrice);
    const matchesApproval = !filterApproval || 
      (filterApproval === "approved" && item.isApproved) ||
      (filterApproval === "pending" && !item.isApproved);
    const matchesAvailability = !filterAvailability ||
      (filterAvailability === "available" && item.isAvailable) ||
      (filterAvailability === "unavailable" && !item.isAvailable);

    return matchesSearch && matchesType && matchesCity && matchesPrice && matchesApproval && matchesAvailability;
  });

  // Get unique bike types and cities for filter dropdowns
  const getBikeTypes = () => {
    const types = product.map(bike => bike.bikeType).filter(Boolean);
    return [...new Set(types)];
  };

  const getCities = () => {
    const cities = product.map(bike => bike.city).filter(Boolean);
    return [...new Set(cities)];
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setSelectedCity('');
    setMaxPrice('');
    setFilterApproval('');
    setFilterAvailability('');
    setCurrentPage(1);
  };

  useEffect(() => {
    const pages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
    if (currentPage > pages) {
      setCurrentPage(pages);
    }
  }, [filteredProducts, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

  const getPaginationItems = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [1];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) pages.push("left-ellipsis");
    for (let p = start; p <= end; p += 1) {
      pages.push(p);
    }
    if (end < totalPages - 1) pages.push("right-ellipsis");

    pages.push(totalPages);
    return pages;
  };
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        console.log(
          "Fetching from:",
          `${import.meta.env.VITE_BACKEND_URL}/products`,
        );
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/products`,
        );
        console.log("Response:", response.data);
        setProduct(response.data.products || response.data);
        toast.success("Products fetched successfully.");
      } catch (error) {
        console.error("Failed to fetch products:", error);
        console.error("Error details:", error.response?.data);
        toast.error("Failed to fetch products.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="w-full p-4 md:p-6">
      <div className="w-full max-w-[98vw] xl:max-w-[1800px] 2xl:max-w-[2000px] mx-auto ">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Motor Bike Administration
        </h1>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader />
            <p className="text-gray-600 mt-4">Loading products...</p>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <div className="text-sm text-gray-600 mt-2">
                Total: {product.length} product{product.length !== 1 ? 's' : ''} | 
                Showing: {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Search and Filter Section */}
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
                  {/* Search by Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Search by Name/ID</label>
                    <input
                      type="text"
                      placeholder="Enter bike name or ID..."
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
                    <label className="block text-sm font-medium text-gray-700">Filter by City</label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="">All Cities</option>
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

                  {/* Filter by Approval Status */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Approval Status</label>
                    <select
                      value={filterApproval}
                      onChange={(e) => setFilterApproval(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="">All Status</option>
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>

                  {/* Filter by Availability */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Availability</label>
                    <select
                      value={filterAvailability}
                      onChange={(e) => setFilterAvailability(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="">All</option>
                      <option value="available">Available</option>
                      <option value="unavailable">Unavailable</option>
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
                {(searchTerm || selectedType || selectedCity || maxPrice || filterApproval || filterAvailability) && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                      Found {filteredProducts.length} product(s) matching your criteria
                    </p>
                  </div>
                )}
              </div>
            </div>
        <div className="bg-white  shadow-lg overflow-hidden ">
          <div className="overflow-x-auto show-scrollbar">
           
            
            <table className="w-full border-collapse min-w-[1500px] ">
              <thead className="bg-gray-100 ">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">
                    ID
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">
                    Bike Name
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">
                    Type
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">
                    Price/Day
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">
                    City
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">
                    Availability
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">
                    Approved
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">
                    Note
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">
                    Image
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts && filteredProducts.length > 0 ? (
                  paginatedProducts.map((products, index) => (
                    <tr
                      key={products._id || index}
                      className="hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 border border-gray-300 text-sm whitespace-nowrap">
                        {products._id}
                      </td>
                      <td className="py-3 px-4 border border-gray-300 font-medium whitespace-nowrap min-w-[200px]">
                        {products.bikeName}
                      </td>
                      <td className="py-3 px-4 border border-gray-300 whitespace-nowrap">
                        {products.bikeType}
                      </td>
                      <td className="py-3 px-4 border border-gray-300 font-semibold text-green-600 whitespace-nowrap">
                        {products.pricePerDay}
                      </td>
                      <td className="py-3 px-4 border border-gray-300 whitespace-nowrap">
                        {products.city}
                      </td>
                      <td className="py-3 px-4 border border-gray-300 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            products.isAvailable
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {products.isAvailable ? "Available" : "Not Available"}
                        </span>
                      </td>
                      <td className="py-3 px-3 border border-gray-300 whitespace-nowrap">
                        <select
                          value={products.isApproved ? "approved" : "pending"}
                          onChange={(e) =>
                            handleApprovalChange(
                              products._id,
                              e.target.value === "approved",
                            )
                          }
                          className={`px-2 py-1 rounded-md text-xs font-medium border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            products.isApproved
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 border border-gray-300 min-w-[150px]">
                        {editingNote === products._id ? (
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center space-x-1">
                              <input
                                type="text"
                                value={tempNote}
                                maxLength={25}
                                onChange={(e) => setTempNote(e.target.value)}
                                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Add note..."
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    handleNoteUpdate(products._id);
                                  }
                                }}
                              />
                              <button
                                onClick={() => handleNoteUpdate(products._id)}
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
                              {tempNote.length}/25 characters
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              setEditingNote(products._id);
                              setTempNote(products.note || "");
                            }}
                            className="text-xs p-2 rounded border border-gray-200 cursor-pointer hover:bg-gray-50 min-h-[2rem] flex items-center"
                            title="Click to edit note"
                          >
                            {products.note && products.note !== "none"
                              ? products.note
                              : "Click to add note..."}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 border border-gray-300">
                        {products.images && products.images.length > 0 ? (
                          <img
                            src={products.images[0]}
                            alt={products.bikeName}
                            className="w-16 h-16 object-cover rounded-md border border-gray-200"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs">
                            No Image
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 border border-gray-300 whitespace-nowrap ">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => navigate(`/admin/view-product/${products._id}`)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md transition-colors duration-200 flex justify-center"
                            title="View Product Details"
                          >
                            <IoEyeOutline className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : product.length > 0 ? (
                  <tr>
                    <td
                      colSpan="10"
                      className="py-8 px-4 text-center text-gray-500 border border-gray-300"
                    >
                      <div className="flex flex-col items-center">
                        <div className="text-4xl mb-2">🔍</div>
                        <div className="font-medium">
                          No products match your search criteria
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
                      colSpan="10"
                      className="py-8 px-4 text-center text-gray-500 border border-gray-300"
                    >
                      <div className="flex flex-col items-center">
                        <div className="text-4xl mb-2">📦</div>
                        <div className="font-medium">No products found</div>
                        <div className="text-sm">Add some products to get started</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredProducts.length > 0 && (
            <div className="px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1}-{Math.min(startIndex + PRODUCTS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} bikes
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
                    if (typeof item === "string") {
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
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
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
          </>
        )}
      </div>
    </div>
  );
}
