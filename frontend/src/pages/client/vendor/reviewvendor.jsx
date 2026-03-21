import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function Reviewvendor() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                    `${import.meta.env.VITE_BACKEND_URL}/reviews/vendor/my-products`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );

                setReviews(response.data?.reviews || []);
            } catch (err) {
                const message = err.response?.data?.error || "Failed to fetch vendor reviews";
                setError(message);
                toast.error(message);
            } finally {
                setLoading(false);
            }
        };

        fetchVendorReviews();
    }, []);

    return (
        <div className="w-full min-h-screen bg-[var(--main-background)] flex flex-col overflow-y-auto p-4 sm:p-6">
            <h1 className="text-black text-3xl font-bold mt-4 mb-2 text-center"> Reviews</h1>
            <p className="text-gray-700 text-center mb-6">Only reviews for your bikes are shown here.</p>

            <div className="w-full max-w-5xl mx-auto bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6">
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

                {!loading && !error && reviews.length > 0 && (
                    <div className="space-y-4">
                        {reviews.map((review) => (
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
            </div>
        </div>
    );
}