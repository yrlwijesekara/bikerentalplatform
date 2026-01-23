import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { IoEyeOutline } from "react-icons/io5";
import { FaPen } from "react-icons/fa";
const sampleProducts = []
  

export default function ProductAdminPage() {

    const [product , setProduct] = useState(sampleProducts);    const [searchTerm, setSearchTerm] = useState("");

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
                console.log("Fetching from:", `${import.meta.env.VITE_BACKEND_URL}/products`);
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/products`);
                console.log("Response:", response.data);
                setProduct(response.data.products || response.data);
                toast.success("Products fetched successfully.");
            } catch (error) {
                console.error("Failed to fetch products:", error);
                console.error("Error details:", error.response?.data);
                toast.error("Failed to fetch products.");
            }
        };
        fetchProducts();
    }, []);

  return (
    <div className="w-full h-full flex justify-center items-start min-h-screen bg-amber-100 p-4 md:p-6">
      <div className="w-full max-w-[95vw] xl:max-w-[1400px] 2xl:max-w-[1600px]">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Product Administration</h1>        
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
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
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
          {searchTerm && (
            <p className="text-center text-sm text-gray-500 mt-2">
              Found {filteredProducts.length} product(s) matching "{searchTerm}"
            </p>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[1200px]">
            <thead className="bg-gray-100 ">
                <tr>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">ID</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">Bike Name</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">Type</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">Price/Day</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">City</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">Availability</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">Approved</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">Image</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">Actions</th>
                </tr>
            </thead>
            <tbody>
                {filteredProducts && filteredProducts.length > 0 ? filteredProducts.map((products, index) => (
                    <tr key={products._id || index} className="hover:bg-gray-50">
                        <td className="py-3 px-4 border border-gray-300 text-sm whitespace-nowrap">{products._id}</td>
                        <td className="py-3 px-4 border border-gray-300 font-medium whitespace-nowrap min-w-[200px]">{products.bikeName}</td>
                        <td className="py-3 px-4 border border-gray-300 whitespace-nowrap">{products.bikeType}</td>
                        <td className="py-3 px-4 border border-gray-300 font-semibold text-green-600 whitespace-nowrap">{products.pricePerDay}</td>
                        <td className="py-3 px-4 border border-gray-300 whitespace-nowrap">{products.city}</td>
                        <td className="py-3 px-4 border border-gray-300 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                products.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                                {products.isAvailable ? "Available" : "Not Available"}
                            </span>
                        </td>
                        <td className="py-3 px-4 border border-gray-300 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                products.isApproved ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                                {products.isApproved ? "Approved" : "Pending"}
                            </span>
                        </td>
                        <td className="py-3 px-4 border border-gray-300">
                            {products.images && products.images.length > 0 ? (
                                <img src={products.images[0]} alt={products.bikeName} className="w-16 h-16 object-cover rounded-md border border-gray-200" />
                            ) : (
                                <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs">
                                    No Image
                                </div>
                            )}
                        </td>
                        <td className="py-3 px-4 border border-gray-300 whitespace-nowrap ">
                            <div className="flex space-x-2">
                                <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md transition-colors duration-200 flex items-center">
                                    <FaPen className="w-3 h-3" />
                                </button>
                                <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md transition-colors duration-200 flex items-center">
                                    <IoEyeOutline className="w-4 h-4" />
                                </button>
                            </div>
                        </td>
                    </tr>
                )) : (
                    <tr>
                        <td colSpan="9" className="py-8 px-4 text-center text-gray-500 border border-gray-300">
                            <div className="flex flex-col items-center">
                                <div className="text-4xl mb-2">{searchTerm ? "🔍" : "📦"}</div>
                                <div className="font-medium">
                                    {searchTerm ? `No products found matching "${searchTerm}"` : "No products found"}
                                </div>
                                <div className="text-sm">
                                    {searchTerm ? "Try adjusting your search terms" : "Add some products to get started"}
                                </div>
                            </div>
                        </td>
                    </tr>
                )}
            </tbody>
          </table>
        </div>
        </div>
      </div>
    </div>
  );
}
