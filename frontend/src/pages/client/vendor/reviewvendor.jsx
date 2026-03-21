import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function Reviewvendor() {
    const PAGE_SIZE = 6;
    const [reviews, setReviews] = useState([]);
    const [filteredReviews, setFilteredReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRating, setSelectedRating] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalReviews, setTotalReviews] = useState(0);

    useEffect(() => {
        let filtered = reviews;

        if (searchTerm) {
            const loweredSearch = searchTerm.toLowerCase();
            filtered = filtered.filter((review) =>
                (review.product?.bikeName || '').toLowerCase().includes(loweredSearch) ||
                (review.user?.name || '').toLowerCase().includes(loweredSearch) ||
                (review.comment || '').toLowerCase().includes(loweredSearch)
            );
        }

        if (selectedRating) {
            filtered = filtered.filter((review) => String(review.rating) === selectedRating);
        }

        if (selectedCity) {
            filtered = filtered.filter((review) =>
                (review.product?.city || '').toLowerCase().includes(selectedCity.toLowerCase())
            );
        }

        setFilteredReviews(filtered);
    }, [reviews, searchTerm, selectedRating, selectedCity]);

    const getRatings = () => {
        const ratings = reviews.map((review) => String(review.rating)).filter(Boolean);
        return [...new Set(ratings)].sort((a, b) => Number(b) - Number(a));
    };

    const getCities = () => {
        const cities = reviews.map((review) => review.product?.city).filter(Boolean);
        return [...new Set(cities)].sort((a, b) => a.localeCompare(b));
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedRating('');
        setSelectedCity('');
    };

    const getPaginationItems = () => {
        if (totalPages <= 10) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const pages = [1];
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        if (start > 2) pages.push('left-ellipsis');
        for (let p = start; p <= end; p += 1) {
            pages.push(p);
        }
        if (end < totalPages - 1) pages.push('right-ellipsis');

        pages.push(totalPages);
        return pages;
    };

    useEffect(() => {
        const fetchVendorReviews = async () => {
            try {
                setLoading(true);
                setError(null);

                const token = localStorage.getItem("token");
                if (!token) {
                    setError("Please login first");
                    return;
                }

                const response = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/reviews/vendor/my-products?page=${currentPage}&limit=${PAGE_SIZE}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );

                setReviews(response.data?.reviews || []);
                setFilteredReviews(response.data?.reviews || []);
                setTotalPages(response.data?.totalPages || 1);
                setTotalReviews(response.data?.total || 0);
            } catch (err) {
                const message = err.response?.data?.error || "Failed to fetch vendor reviews";
                setError(message);
                toast.error(message);
            } finally {
                setLoading(false);
            }
        };

        fetchVendorReviews();
    }, [currentPage]);

    return (
        <div className="w-full min-h-screen bg-[var(--main-background)] flex flex-col overflow-y-auto p-4 sm:p-6">
            <h1 className="text-black text-3xl font-bold mt-4 mb-2 text-center"> Reviews</h1>
            <p className="text-gray-700 text-center mb-6">Only reviews for your bikes are shown here.</p>

            <div className="w-full max-w-7xl mx-auto mb-6">
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Search Reviews</label>
                            <input
                                type="text"
                                placeholder="Bike, customer, comment..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Filter by Rating</label>
                            <select
                                value={selectedRating}
                                onChange={(e) => setSelectedRating(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Ratings</option>
                                {getRatings().map((rating) => (
                                    <option key={rating} value={rating}>{rating} Stars</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Filter by City</label>
                            <select
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Cities</option>
                                {getCities().map((city) => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 invisible">Clear</label>
                            <button
                                onClick={clearFilters}
                                className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200 font-medium"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-7xl mx-auto bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6">
                {!loading && !error && (
                    <div className="text-sm text-gray-600 mb-4">
                        Total: {totalReviews} review{totalReviews !== 1 ? 's' : ''} |
                        Showing: {filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''}
                    </div>
                )}

                {loading && (
                    <p className="text-gray-500 text-center py-6">Loading reviews...</p>
                )}

                {!loading && error && (
                    <div className="text-center py-6">
                        <p className="text-red-600">{error}</p>
                    </div>
                )}

                {!loading && !error && reviews.length === 0 && (
                    <p className="text-gray-600 text-center py-6">No reviews found for your bikes yet.</p>
                )}

                {!loading && !error && filteredReviews.length === 0 && reviews.length > 0 && (
                    <div className="text-center py-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews match your filters</h3>
                        <p className="text-gray-600 mb-4">Try changing search terms or clear the filters.</p>
                        <button
                            onClick={clearFilters}
                            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}

                {!loading && !error && filteredReviews.length > 0 && (
                    <div className="space-y-4">
                        {filteredReviews.map((review) => (
                            <div
                                key={review.id}
                                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        {review.product?.bikeName || "Unknown Bike"}
                                    </h2>
                                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium">
                                        Rating: {review.rating}/5
                                    </span>
                                </div>

                                <div className="text-sm text-gray-600 mb-2">
                                    <span className="font-medium">Customer:</span> {review.user?.name || "Unknown"}
                                </div>

                                <div className="text-sm text-gray-600 mb-2">
                                    <span className="font-medium">Bike Type:</span> {review.product?.bikeType || "N/A"}
                                    {review.product?.city ? ` | ${review.product.city}` : ""}
                                </div>

                                <p className="text-gray-800">
                                    {review.comment?.trim() ? review.comment : "No comment provided."}
                                </p>

                                <p className="text-xs text-gray-500 mt-3">
                                    Reviewed on {new Date(review.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && !error && totalPages > 1 && (
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Prev
                        </button>

                        {getPaginationItems().map((item, idx) => {
                            if (typeof item === 'string') {
                                return (
                                    <span key={`${item}-${idx}`} className="px-2 text-gray-500">...</span>
                                );
                            }

                            const isActive = item === currentPage;
                            return (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => setCurrentPage(item)}
                                    className={`px-3 py-2 rounded-md border transition-colors duration-200 ${
                                        isActive
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
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
                            className="px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}