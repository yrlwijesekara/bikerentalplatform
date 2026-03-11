import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";
import MediaUpload from "../../utils/mediaupload.jsx";
import { IoIosStar } from "react-icons/io";

export default function AddPlaces() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        city: "",
        district: "Southern Province",
        category: "",
        image: "",
        mapUrl: "",
        openingHours: "",
        entranceFee: "",
        isFeatured: false,
        status: "active",
        note: ""
    });
    const [images, setImages] = useState([]);

    const categories = ["Beach", "Mountain", "Historical", "Waterfall", "Wildlife", "Religious", "Scenic"];

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim()) {
            toast.error("Place name is required");
            return;
        }
        if (!formData.description.trim()) {
            toast.error("Description is required");
            return;
        }
        if (!formData.city.trim()) {
            toast.error("City is required");
            return;
        }
        if (!formData.category) {
            toast.error("Category is required");
            return;
        }
        if (images.length === 0 && !formData.image.trim()) {
            toast.error("Please upload at least one image or provide an image URL");
            return;
        }
        if (formData.note.length > 50) {
            toast.error("Note cannot exceed 50 characters");
            return;
        }

        setIsLoading(true);

        try {
            // Handle image upload to Supabase if files are selected
            let finalImageUrl = formData.image; // Use URL if provided
            
            if (images && images.length > 0) {
                try {
                    toast.loading("Uploading images...");
                    const uploadPromises = Array.from(images).map((file) =>
                        MediaUpload(file)
                    );
                    const imageUrls = await Promise.all(uploadPromises);
                    toast.dismiss();
                    toast.success(`${imageUrls.length} image(s) uploaded successfully!`);
                    finalImageUrl = imageUrls[0]; // Use first uploaded image as main image
                    console.log("Uploaded image URLs:", imageUrls);
                } catch (error) {
                    toast.dismiss();
                    toast.error("Failed to upload images: " + error.message);
                    setIsLoading(false);
                    return;
                }
            }

            const placeData = {
                ...formData,
                image: finalImageUrl
            };

            const token = localStorage.getItem("token");
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/places`,
                placeData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 201 || response.status === 200) {
                toast.success("Place added successfully!");
                navigate("/admin/places");
            }
        } catch (error) {
            console.error("Error adding place:", error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Failed to add place. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6 ">
                
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Add New Place</h1>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-lg shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Place Name */}
                        <div className="md:col-span-2">
                            <label className="block text-gray-700 font-semibold mb-2" htmlFor="name">
                                Place Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter place name"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                            <label className="block text-gray-700 font-semibold mb-2" htmlFor="description">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                                placeholder="Enter place description"
                                required
                            />
                        </div>

                        {/* City */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2" htmlFor="city">
                                City <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter city name"
                                required
                            />
                        </div>

                        {/* District */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2" htmlFor="district">
                                District
                            </label>
                            <input
                                type="text"
                                id="district"
                                name="district"
                                value={formData.district}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter district name"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2" htmlFor="category">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">Select a category</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2" htmlFor="status">
                                Status
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        {/* Image Upload & URL */}
                        <div className="md:col-span-2">
                            <label className="block text-gray-700 font-semibold mb-2">
                                Place Images
                            </label>
                            
                            {/* File Upload */}
                            <div className="mb-4">
                                <label className="block text-sm text-gray-600 mb-2">
                                    Upload Images (Recommended)
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => setImages(e.target.files)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {images.length > 0 && (
                                    <p className="text-sm text-green-600 mt-1">
                                        {images.length} image(s) selected
                                    </p>
                                )}
                            </div>

                          

                         
                        </div>

                        {/* Map URL */}
                        <div className="md:col-span-2">
                            <label className="block text-gray-700 font-semibold mb-2" htmlFor="mapUrl">
                                Google Maps URL
                            </label>
                            <input
                                type="url"
                                id="mapUrl"
                                name="mapUrl"
                                value={formData.mapUrl}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="https://maps.google.com/..."
                            />
                        </div>

                        {/* Opening Hours */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2" htmlFor="openingHours">
                                Opening Hours
                            </label>
                            <input
                                type="text"
                                id="openingHours"
                                name="openingHours"
                                value={formData.openingHours}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g. 9:00 AM - 5:00 PM"
                            />
                        </div>

                        {/* Entrance Fee */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2" htmlFor="entranceFee">
                                Entrance Fee
                            </label>
                            <input
                                type="text"
                                id="entranceFee"
                                name="entranceFee"
                                value={formData.entranceFee}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g. Free, $10, Rs.500"
                            />
                        </div>

                        {/* Note */}
                        <div className="md:col-span-2">
                            <label className="block text-gray-700 font-semibold mb-2" htmlFor="note">
                                Note
                                <span className="text-gray-500 text-sm font-normal ml-1">
                                    ({formData.note.length}/50 characters)
                                </span>
                            </label>
                            <input
                                type="text"
                                id="note"
                                name="note"
                                value={formData.note}
                                onChange={handleInputChange}
                                maxLength="50"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Additional notes (max 50 characters)"
                            />
                        </div>

                        {/* Featured Checkbox */}
                        <div className="md:col-span-2">
                            <label className="inline-flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    name="isFeatured"
                                    checked={formData.isFeatured}
                                    onChange={handleInputChange}
                                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-gray-700 font-semibold flex items-center gap-1">
                                    <IoIosStar className="text-yellow-500" /> Set as Featured Place
                                </span>
                            </label>
                            <p className="text-gray-500 text-sm mt-1 ml-8">
                                Featured places will be highlighted and shown prominently
                            </p>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end mt-8 gap-4">
                        <button
                            type="button"
                            onClick={() => navigate("/admin/places")}
                            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Adding Place...
                                </>
                            ) : (
                                "Add Place"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}