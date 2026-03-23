import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "../../components/loader.jsx";

const REVIEWS_PER_PAGE = 12;

function renderStars(rating) {
    const value = Number(rating) || 0;
    return "★".repeat(Math.max(0, Math.min(5, Math.round(value))));
}

export default function ReviewManagement() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRating, setSelectedRating] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalReviews, setTotalReviews] = useState(0);

    useEffect(() => {
        const fetchAdminReviews = async () => {
            try {
                setLoading(true);
                setError(null);

                const token = localStorage.getItem("token");
                if (!token) {
                    setError("Please login first");
                    return;
                }

                const response = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/reviews/admin/all?page=${currentPage}&limit=${REVIEWS_PER_PAGE}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );

                setReviews(response.data?.reviews || []);
                setTotalPages(Math.max(1, response.data?.totalPages || 1));
                setTotalReviews(response.data?.total || 0);
            } catch (err) {
                const message = err.response?.data?.error || "Failed to fetch reviews";
                setError(message);
                toast.error(message);
            } finally {
                setLoading(false);
            }
        };

        fetchAdminReviews();
    }, [currentPage]);

    const filteredReviews = useMemo(() => {
        return reviews.filter((review) => {
            const loweredSearch = searchTerm.toLowerCase();
            const userName = review.user?.name || "";
            const userEmail = review.user?.email || "";
            const bikeName = review.product?.bikeName || "";
            const bikeType = review.product?.bikeType || "";
            const city = review.product?.city || "";
            const comment = review.comment || "";

            const matchesSearch =
                !searchTerm ||
                userName.toLowerCase().includes(loweredSearch) ||
                userEmail.toLowerCase().includes(loweredSearch) ||
                bikeName.toLowerCase().includes(loweredSearch) ||
                bikeType.toLowerCase().includes(loweredSearch) ||
                city.toLowerCase().includes(loweredSearch) ||
                comment.toLowerCase().includes(loweredSearch);

            const matchesRating = !selectedRating || String(review.rating) === selectedRating;
            const matchesStatus =
                !selectedStatus || (review.order?.orderStatus || "").toLowerCase() === selectedStatus.toLowerCase();

            return matchesSearch && matchesRating && matchesStatus;
        });
    }, [reviews, searchTerm, selectedRating, selectedStatus]);

    const ratingOptions = useMemo(() => {
        const ratings = reviews.map((review) => String(review.rating)).filter(Boolean);
        return [...new Set(ratings)].sort((a, b) => Number(b) - Number(a));
    }, [reviews]);

    const statusOptions = useMemo(() => {
        const statuses = reviews
            .map((review) => review.order?.orderStatus)
            .filter(Boolean)
            .map((status) => status.toLowerCase());
        return [...new Set(statuses)];
    }, [reviews]);

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedRating("");
        setSelectedStatus("");
    };

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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-100">
                <Loader />
                <p className="text-gray-600 mt-4">Loading reviews...</p>
            </div>
        );
    }

    return (
        <div className="w-full p-4 md:p-6">
            <div className="w-full max-w-[98vw] xl:max-w-400 mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Review Management</h1>

                <div className="mb-6 text-center text-sm text-gray-600">
                    Total: {totalReviews} review{totalReviews !== 1 ? "s" : ""} |
                    Showing: {filteredReviews.length} review{filteredReviews.length !== 1 ? "s" : ""} (page {currentPage})
                </div>

                <div className="mb-8">
                    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Search Review</label>
                                <input
                                    type="text"
                                    placeholder="Bike, customer, city, comment..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Filter by Rating</label>
                                <select
                                    value={selectedRating}
                                    onChange={(e) => setSelectedRating(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                >
                                    <option value="">All Ratings</option>
                                    {ratingOptions.map((rating) => (
                                        <option key={rating} value={rating}>{rating} Stars</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Filter by Order Status</label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                >
                                    <option value="">All Statuses</option>
                                    {statusOptions.map((status) => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>

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
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {error ? (
                        <div className="p-6 text-center text-red-600">{error}</div>
                    ) : reviews.length === 0 ? (
                        <div className="p-6 text-center text-gray-600">No reviews found.</div>
                    ) : filteredReviews.length === 0 ? (
                        <div className="p-6 text-center text-gray-600">No reviews match your filters for this page.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse min-w-237.5">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">Reviewer</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">Bike</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">Rating</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">Comment</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">Order Status</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">Reviewed On</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredReviews.map((review) => (
                                        <tr key={review.id} className="hover:bg-gray-50 align-top">
                                            <td className="py-3 px-4 border border-gray-300">
                                                <p className="font-medium text-gray-900">{review.user?.name || "Unknown"}</p>
                                                <p className="text-xs text-gray-500">{review.user?.email || "No email"}</p>
                                            </td>
                                            <td className="py-3 px-4 border border-gray-300">
                                                <p className="font-medium text-gray-900">{review.product?.bikeName || "Unknown bike"}</p>
                                                <p className="text-xs text-gray-500">
                                                    {review.product?.bikeType || "N/A"}
                                                    {review.product?.city ? ` | ${review.product.city}` : ""}
                                                </p>
                                            </td>
                                            <td className="py-3 px-4 border border-gray-300">
                                                <div className="text-yellow-600 font-semibold">{renderStars(review.rating)}</div>
                                                <div className="text-sm text-gray-700">{review.rating}/5</div>
                                            </td>
                                            <td className="py-3 px-4 border border-gray-300 text-gray-700 max-w-[320px]">
                                                {review.comment?.trim() ? review.comment : "No comment provided."}
                                            </td>
                                            <td className="py-3 px-4 border border-gray-300">
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {review.order?.orderStatus || "N/A"}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 border border-gray-300 text-gray-700">
                                                {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "N/A"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {!error && totalPages > 1 && (
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    className={`px-3 py-2 rounded-md border transition-colors duration-200 ${
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