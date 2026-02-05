import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { IoEyeOutline } from "react-icons/io5";
import Loader from "../../components/loader.jsx";
const sampleProducts = [];

export default function ProductAdminPage() {
  const [product, setProduct] = useState(sampleProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingNote, setEditingNote] = useState(null);
  const [tempNote, setTempNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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

  // Filter products based on search term
  const filteredProducts = product.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item._id?.toLowerCase().includes(searchLower) ||
      item.bikeName?.toLowerCase().includes(searchLower) ||
      item.bikeType?.toLowerCase().includes(searchLower)
    );
  });
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
      <div className="w-full max-w-[98vw] xl:max-w-[1800px] 2xl:max-w-[2000px] mx-auto">
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
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search by ID, Bike Name, or Type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
          {searchTerm && (
            <p className="text-center text-sm text-gray-500 mt-2">
              Found {filteredProducts.length} product(s) matching "{searchTerm}"
            </p>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
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
            <table className="w-full border-collapse min-w-[1600px]">
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
                  filteredProducts.map((products, index) => (
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
                      <td className="py-3 px-4 border border-gray-300 whitespace-nowrap">
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
                      <td className="py-3 px-4 border border-gray-300">
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
                      <td className="py-3 px-4 border border-gray-300 whitespace-nowrap ">
                        <div className="flex space-x-2">
                          <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md transition-colors duration-200 flex items-center">
                            <IoEyeOutline className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="10"
                      className="py-8 px-4 text-center text-gray-500 border border-gray-300"
                    >
                      <div className="flex flex-col items-center">
                        <div className="text-4xl mb-2">
                          {searchTerm ? "🔍" : "📦"}
                        </div>
                        <div className="font-medium">
                          {searchTerm
                            ? `No products found matching "${searchTerm}"`
                            : "No products found"}
                        </div>
                        <div className="text-sm">
                          {searchTerm
                            ? "Try adjusting your search terms"
                            : "Add some products to get started"}
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
      </div>
    </div>
  );
}
