import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";
import { RiMotorbikeFill } from "react-icons/ri";
import { TbReportMoney } from "react-icons/tb";
import { BsFileEarmarkImageFill } from "react-icons/bs";
import Loader from "../../components/loader.jsx";

export default function ViewProduct() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [productData, setProductData] = useState({
        bikeName: "",
        bikeType: "",
        manufacturingYear: "",
        engineCC: "",
        lastServiceDate: "",
        fuelType: "",
        suitableTerrain: "",
        pricePerDay: "",
        city: "",
        mapUrl: "",
        phoneNumber: "",
        images: [],
        isAvailable: false,
        vendor: null,
        vendorName: "",
        vendorPhone: "",
        isApproved: false,
        adminNote: "",
        recommendedprice: ""
    });

    // Fetch product data
    useEffect(() => {
        const fetchProductData = async () => {
            try {
                setIsLoading(true);
                const token = localStorage.getItem("token");
                
                if (!token) {
                    toast.error("No authentication token found. Please login again.");
                    navigate("/login");
                    return;
                }

                console.log("Token exists:", !!token); // Debug log
                
                const response = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/products/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                
                const product = response.data.product;
                const vendorName = product.vendor && typeof product.vendor === 'object'
                    ? `${product.vendor.firstname || ''} ${product.vendor.lastname || ''}`.trim()
                    : "";
                const vendorPhone = product.vendor && typeof product.vendor === 'object'
                    ? (product.vendor.phone || "")
                    : "";

                setProductData({
                    bikeName: product.bikeName || "",
                    bikeType: product.bikeType || "",
                    manufacturingYear: product.manufacturingYear || "",
                    engineCC: product.engineCC || "",
                    lastServiceDate: product.lastServiceDate ? product.lastServiceDate.split('T')[0] : "",
                    fuelType: product.fuelType || "",
                    suitableTerrain: product.suitableTerrain || "",
                    pricePerDay: product.pricePerDay || "",
                    city: product.city || "",
                    mapUrl: product.mapUrl || "",
                    phoneNumber: product.phoneNumber || "",
                    images: product.images || [],
                    isAvailable: product.isAvailable || false,
                    vendor: product.vendor || null,
                    vendorName,
                    vendorPhone,
                    isApproved: product.isApproved || false,
                    adminNote: product.adminNote || "",
                    recommendedprice: product.recommendedprice || ""
                });
                
            } catch (error) {
                console.error("Error fetching product data:", error);
                
                if (error.response?.status === 401) {
                    toast.error("Authentication failed. Please login again.");
                    localStorage.removeItem("token");
                    localStorage.removeItem("role");
                    navigate("/login");
                } else if (error.response?.status === 403) {
                    toast.error("Access denied. Admin privileges required.");
                    navigate("/admin/products");
                } else if (error.response?.status === 404) {
                    toast.error("Product not found.");
                    navigate("/admin/products");
                } else {
                    toast.error("Failed to load product data. Please try again.");
                    navigate("/admin/products");
                }
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchProductData();
        }
    }, [id, navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader />
                    <p className="text-gray-600 mt-4">Loading product details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6 justify-center">
                    
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Product Details</h1>
                        <p className="text-gray-600 text-sm">View product information</p>
                    </div>
                </div>

                {/* Approval Status Card */}
                <div className="bg-white p-4 rounded-lg shadow-lg mb-6">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Approval Status
                            </label>
                            <div className={`px-3 py-2 rounded-md text-sm font-medium ${
                                productData.isApproved ? 'bg-green-100 text-green-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                                {productData.isApproved ? 'Approved' : 'Pending'}
                            </div>
                        </div>
                        {productData.adminNote && (
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Admin Note
                                </label>
                                <div className="px-3 py-2 bg-gray-50 rounded-md text-sm">
                                    {productData.adminNote}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Product Details Form */}
                <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Basic Information Section */}
                        <div className="md:col-span-2">
                            <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2 flex items-center gap-2">
                                <RiMotorbikeFill />
                                Basic Information
                            </h3>
                        </div>

                        {/* Bike Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Bike Name
                            </label>
                            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
                                {productData.bikeName || "Not specified"}
                            </div>
                        </div>

                        {/* Bike Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Bike Type
                            </label>
                            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
                                {productData.bikeType || "Not specified"}
                            </div>
                        </div>

                        {/* Manufacturing Year */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Manufacturing Year
                            </label>
                            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
                                {productData.manufacturingYear || "Not specified"}
                            </div>
                        </div>

                        {/* Engine CC */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Engine CC
                            </label>
                            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
                                {productData.engineCC ? `${productData.engineCC} CC` : "Not specified"}
                            </div>
                        </div>

                        {/* Last Service Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Last Service Date
                            </label>
                            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
                                {productData.lastServiceDate ? new Date(productData.lastServiceDate).toLocaleDateString() : "Not specified"}
                            </div>
                        </div>

                        {/* Fuel Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fuel Type
                            </label>
                            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
                                {productData.fuelType || "Not specified"}
                            </div>
                        </div>

                        {/* Suitable Terrain */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Suitable Terrain
                            </label>
                            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
                                {productData.suitableTerrain ? productData.suitableTerrain.charAt(0).toUpperCase() + productData.suitableTerrain.slice(1) : "Not specified"}
                            </div>
                        </div>

                        {/* Pricing & Location Section */}
                        <div className="md:col-span-2 mt-6">
                            <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2 flex items-center gap-2">
                                <TbReportMoney />
                                Pricing & Location
                            </h3>
                        </div>

                        {/* Price Per Day */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price Per Day
                            </label>
                            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
                                {productData.pricePerDay ? `Rs. ${productData.pricePerDay}` : "Not specified"}
                            </div>
                        </div>

                        {/* City */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                City
                            </label>
                            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
                                {productData.city || "Not specified"}
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contact Phone
                            </label>
                            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
                                {productData.phoneNumber || "Not specified"}
                            </div>
                        </div>

                        {/* Recommended Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                AI Recommended Price
                            </label>
                            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
                                {productData.recommendedprice ? `Rs. ${productData.recommendedprice}` : "Not available"}
                            </div>
                        </div>

                        {/* Map URL */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Google Maps URL
                            </label>
                            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
                                {productData.mapUrl ? (
                                    <a 
                                        href={productData.mapUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 underline"
                                    >
                                        {productData.mapUrl}
                                    </a>
                                ) : "Not specified"}
                            </div>
                        </div>

                        {/* Vendor Information Section */}
                        <div className="md:col-span-2 mt-6">
                            <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">
                                Vendor Information
                            </h3>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Vendor Name
                            </label>
                            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
                                {productData.vendorName || "Not specified"}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Vendor Telephone
                            </label>
                            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
                                {productData.vendorPhone || "Not specified"}
                            </div>
                        </div>

                        {/* Images Section */}
                        <div className="md:col-span-2 mt-6">
                            <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2 flex items-center gap-2">
                                <BsFileEarmarkImageFill />
                                Product Images
                            </h3>
                            {productData.images && productData.images.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {productData.images.map((imageUrl, index) => (
                                        <div key={index} className="relative">
                                            <img 
                                                src={imageUrl} 
                                                alt={`Product ${index + 1}`} 
                                                className="w-full h-32 object-cover rounded-md border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                                onClick={() => window.open(imageUrl, '_blank')}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-md border border-gray-200">
                                    No images uploaded
                                </div>
                            )}
                        </div>

                        {/* Availability Status */}
                        <div className="md:col-span-2 mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Availability Status
                            </label>
                            <div className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                                productData.isAvailable 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {productData.isAvailable ? '✓ Available for Rent' : '✗ Not Available'}
                            </div>
                        </div>
                    </div>

                    {/* Back Button */}
                    <div className="flex justify-end mt-8">
                        <button
                            onClick={() => navigate("/admin/products")}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Back to Products
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}