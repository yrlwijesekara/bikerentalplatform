import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { IoEyeOutline } from "react-icons/io5";
import { FaPen } from "react-icons/fa";
const sampleProducts = []
  

export default function ProductAdminPage() {

    const [product , setProduct] = useState(sampleProducts);

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
    <div className="w-full h-full flex justify-center items-start min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="w-full max-w-[95vw] xl:max-w-[1400px] 2xl:max-w-[1600px]">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Product Administration</h1>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[1200px]">
            <thead className="bg-gray-100">
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
                {product && product.length > 0 ? product.map((products, index) => (
                    <tr key={products._id || index} className="hover:bg-gray-50">
                        <td className="py-3 px-4 border border-gray-300 text-sm whitespace-nowrap">{products._id}</td>
                        <td className="py-3 px-4 border border-gray-300 font-medium whitespace-nowrap min-w-[200px]">{products.bikeName}</td>
                        <td className="py-3 px-4 border border-gray-300 whitespace-nowrap">{products.bikeType}</td>
                        <td className="py-3 px-4 border border-gray-300 font-semibold text-green-600 whitespace-nowrap">₹{products.pricePerDay}</td>
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
                        <td className="py-3 px-4 border border-gray-300 whitespace-nowrap">
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
        </div>
      </div>
    </div>
  );
}
