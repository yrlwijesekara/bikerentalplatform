import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
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
    <div className="w-full h-full ">
        <table className="min-w-full bg-white border border-gray-300">
            <thead>
                <tr>
                    <th className="py-2 px-4 border-b border-gray-300">ID</th>
                    <th className="py-2 px-4 border-b border-gray-300">Bike Name</th>
                    <th className="py-2 px-4 border-b border-gray-300">Type</th>
                    <th className="py-2 px-4 border-b border-gray-300">Price/Day</th>
                    <th className="py-2 px-4 border-b border-gray-300">City</th>
                    <th className="py-2 px-4 border-b border-gray-300">Availability</th>
                    <th className="py-2 px-4 border-b border-gray-300">isapproved</th>
                    <th className="py-2 px-4 border-b border-gray-300">Image</th>
                    <th className="py-2 px-4 border-b border-gray-300">Actions</th>
                </tr>
            </thead>
            <tbody>
                {product && product.length > 0 ? product.map((products, index) => (
                    <tr key={products._id || index}>
                        <td className="py-2 px-4 border-b border-gray-300">{products._id}</td>
                        <td className="py-2 px-4 border-b border-gray-300">{products.bikeName}</td>
                        <td className="py-2 px-4 border-b border-gray-300">{products.bikeType}</td>
                        <td className="py-2 px-4 border-b border-gray-300">{products.pricePerDay}</td>
                        <td className="py-2 px-4 border-b border-gray-300">{products.city}</td>
                        <td className="py-2 px-4 border-b border-gray-300">{products.isAvailable ? "Available" : "Not Available"}</td>
                        <td className="py-2 px-4 border-b border-gray-300">{products.isApproved ? "Approved" : "Not Approved"}</td>
                        <td className="py-2 px-4 border-b border-gray-300">
                            {products.images && products.images.length > 0 && (
                                <img src={products.images[0]} alt={products.bikeName} className="w-16 h-16 object-cover" />
                            )}
                        </td>
                        <td className="py-2 px-4 border-b border-gray-300">
                            
                            <button className="bg-blue-500 text-white px-2 py-1 rounded mr-2">Edit</button>
                            <button className="bg-red-500 text-white px-2 py-1 rounded">View</button>
                        </td>
                    </tr>
                )) : (
                    <tr>
                        <td colSpan="8" className="py-4 px-4 text-center text-gray-500">
                            No products found
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
           

          
    </div>
  );
}
