import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";
import MediaUpload from "../../utils/mediaupload.jsx";
import { IoIosStar } from "react-icons/io";
import Loader from "../../components/loader.jsx";

export default function UpdatePlaces() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        city: "",
        district: "Southern Province",
        category: "",
        image: [],
        mapUrl: "",
        openingHours: "",
        entranceFee: "",
        isFeatured: false,
        status: "active",
        note: ""
    });
    const [images, setImages] = useState([]);
    const [currentImages, setCurrentImages] = useState([]);

    const categories = ["Beach", "Mountain", "Historical", "Waterfall", "Wildlife", "Religious", "Scenic"];

    // Fetch existing place data
    useEffect(() => {
        const fetchPlaceData = async () => {
            try {
                setIsFetchingData(true);
                const token = localStorage.getItem("token");
                const response = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/places/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                
                const placeData = response.data;
                setFormData({
                    name: placeData.name || "",
                    description: placeData.description || "",
                    city: placeData.city || "",
                    district: placeData.district || "Southern Province",
                    category: placeData.category || "",
                    image: Array.isArray(placeData.image) ? placeData.image : (placeData.image ? [placeData.image] : []),
                    mapUrl: placeData.mapUrl || "",
                    openingHours: placeData.openingHours || "",
                    entranceFee: placeData.entranceFee || "",
                    isFeatured: placeData.isFeatured || false,
                    status: placeData.status || "active",
                    note: placeData.note || ""
                });
                setCurrentImages(Array.isArray(placeData.image) ? placeData.image : (placeData.image ? [placeData.image] : []));
                toast.success("Place data loaded successfully");
            } catch (error) {
                console.error("Error fetching place data:", error);
                toast.error("Failed to load place data");
                navigate("/admin/places");
            } finally {
                setIsFetchingData(false);
            }
        };

        if (id) {
            fetchPlaceData();
        }
    }, [id, navigate]);

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
        if (formData.note.length > 50) {
            toast.error("Note cannot exceed 50 characters");
            return;
        }

        setIsLoading(true);

        try {
            // Handle new image upload to Supabase if files are selected
            let finalImages = [...formData.image]; // Use existing images
            
            if (images && images.length > 0) {
                try {
                    toast.loading("Uploading new images...");
                    const uploadPromises = Array.from(images).map((file) =>
                        MediaUpload(file)
                    );
                    const imageUrls = await Promise.all(uploadPromises);
                    toast.dismiss();
                    toast.success(`${imageUrls.length} new image(s) uploaded successfully!`);
                    finalImages = [...finalImages, ...imageUrls]; // Add new images to existing ones
                    console.log("Uploaded new image URLs:", imageUrls);
                } catch (error) {
                    toast.dismiss();
                    toast.error("Failed to upload images: " + error.message);
                    setIsLoading(false);
                    return;
                }
            }

            const placeData = {
                ...formData,
                image: finalImages
            };

            console.log("Final images array:", finalImages);
            console.log("Update place data being sent:", placeData);

            const token = localStorage.getItem("token");
            const response = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/places/${id}`,
                placeData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200) {
                toast.success("Place updated successfully!");
                navigate("/admin/places");
            }
        } catch (error) {
            console.error("Error updating place:", error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Failed to update place. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetchingData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader />
                    <p className="text-gray-600 mt-4">Loading place data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6 justify-center">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Update Place</h1>
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

                        {/* Current Images & Upload New */}
                        <div className="md:col-span-2">
                            <label className="block text-gray-700 font-semibold mb-2">
                                Place Images
                            </label>
                            
                            {/* Current Images Display */}
                            {currentImages.length > 0 && (
                                <div className="mb-4">
                                    <label className="block text-sm text-gray-600 mb-2">
                                        Current Images
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {currentImages.map((imageUrl, index) => (
                                            <div key={index} className="relative">
                                                <img 
                                                    src={imageUrl} 
                                                    alt={`Place ${index + 1}`} 
                                                    className="w-full h-24 object-cover rounded-md border border-gray-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newImages = currentImages.filter((_, i) => i !== index);
                                                        setCurrentImages(newImages);
                                                        setFormData(prev => ({ ...prev, image: newImages }));
                                                    }}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* File Upload for New Images */}
                            <div className="mb-4">
                                <label className="block text-sm text-gray-600 mb-2">
                                    Upload Additional Images (Optional)
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
                                        {images.length} new image(s) selected
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
                                    Updating Place...
                                </>
                            ) : (
                                "Update Place"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
