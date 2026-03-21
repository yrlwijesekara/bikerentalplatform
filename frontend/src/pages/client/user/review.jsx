import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function Review() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reviewData, setReviewData] = useState({});
  const [reviewedProductIds, setReviewedProductIds] = useState([]);

  const token = useMemo(() => localStorage.getItem("token"), []);

  const getProductId = (bikeItem) => {
    const rawBike = bikeItem?.bike;
    if (!rawBike) return null;
    if (typeof rawBike === "string") return rawBike;
    if (typeof rawBike === "object") {
      if (typeof rawBike._id === "string") return rawBike._id;
      if (rawBike._id && typeof rawBike._id.toString === "function") return rawBike._id.toString();
      if (typeof rawBike.id === "string") return rawBike.id;
    }
    return null;
  };

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        toast.error("Invalid review link");
        setLoading(false);
        return;
      }

      if (!token) {
        toast.error("Please login first");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [orderResponse, reviewedResponse] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/orders/${orderId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          ),
          axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/reviews/my-order/${orderId}/reviewed-products`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          ),
        ]);

        const fetchedOrder = orderResponse.data?.order;
        setOrder(fetchedOrder);
        setReviewedProductIds(reviewedResponse.data?.reviewedProductIds || []);

        const initialReviewState = {};
        (fetchedOrder?.bikes || []).forEach((bikeItem) => {
          const bikeId = getProductId(bikeItem);
          if (bikeId) {
            initialReviewState[bikeId] = {
              rating: 5,
              comment: "",
            };
          }
        });
        setReviewData(initialReviewState);
      } catch (error) {
        const message = error.response?.data?.message || "Failed to load order details";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, token]);

  const updateReviewField = (bikeId, field, value) => {
    setReviewData((prev) => ({
      ...prev,
      [bikeId]: {
        ...(prev[bikeId] || { rating: 5, comment: "" }),
        [field]: value,
      },
    }));
  };

  const submitReviews = async () => {
    if (!order || !Array.isArray(order.bikes) || order.bikes.length === 0) {
      toast.error("No bikes found for this order");
      return;
    }

    if ((order.orderStatus || "").toLowerCase() !== "completed") {
      toast.error("You can only review completed orders");
      return;
    }

    const reviewedSet = new Set(reviewedProductIds);
    const pendingReviews = order.bikes
      .map((bikeItem) => {
        const productId = getProductId(bikeItem);
        if (!productId || reviewedSet.has(productId)) {
          return null;
        }

        const bikeReview = reviewData[productId] || { rating: 5, comment: "" };
        return {
          productId,
          rating: Number(bikeReview.rating),
          comment: bikeReview.comment?.trim() || "",
        };
      })
      .filter(Boolean);

    if (pendingReviews.length === 0) {
      toast.error("No valid bikes found to review");
      return;
    }

    try {
      setSubmitting(true);

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/reviews/submit-multiple`,
        {
          orderId: order._id,
          reviews: pendingReviews,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const createdCount = response.data?.createdCount || 0;
      const skippedCount = response.data?.skippedCount || 0;
      const createdProductIds = response.data?.createdProductIds || [];
      const skippedProductIds = response.data?.skippedProductIds || [];
      const processedProductIds = [...new Set([...createdProductIds, ...skippedProductIds])];

      if (createdCount > 0) {
        toast.success(`Submitted ${createdCount} review${createdCount > 1 ? "s" : ""} successfully`);
      }

      if (createdCount === 0 && skippedCount > 0) {
        toast("All selected bikes are already reviewed");
      }

      if (processedProductIds.length > 0) {
        setReviewedProductIds((prev) => [...new Set([...prev, ...processedProductIds])]);
      }

      if ((response.data?.invalidCount || 0) > 0) {
        toast.error("Some review items were invalid and were not saved");
      }
    } catch (error) {
      const message = error.response?.data?.details || error.response?.data?.error || "Failed to submit reviews";
      const status = error.response?.status;
      const invalidItems = error.response?.data?.invalidItems;

      if (status && status < 500) {
        if (Array.isArray(invalidItems) && invalidItems.length > 0) {
          const firstInvalid = invalidItems[0];
          toast.error(firstInvalid?.reason || message);
        } else {
          toast.error(message);
        }
        return;
      }

      try {
        const fallbackResults = await Promise.allSettled(
          pendingReviews.map((item) =>
            axios.post(
              `${import.meta.env.VITE_BACKEND_URL}/reviews`,
              {
                productId: item.productId,
                orderId: order._id,
                rating: item.rating,
                comment: item.comment,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            ),
          ),
        );

        const fallbackSuccess = fallbackResults.filter((r) => r.status === "fulfilled").length;
        const fallbackFailed = fallbackResults.length - fallbackSuccess;

        if (fallbackSuccess > 0) {
          toast.success(`Submitted ${fallbackSuccess} review${fallbackSuccess > 1 ? "s" : ""} successfully`);
          const submittedProductIds = fallbackResults
            .map((result, index) => (result.status === "fulfilled" ? pendingReviews[index]?.productId : null))
            .filter(Boolean);
          setReviewedProductIds((prev) => [...new Set([...prev, ...submittedProductIds])]);
        }

        if (fallbackFailed > 0) {
          toast.error(message);
        }
      } catch {
        toast.error(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-[calc(100vh-80px)] flex items-center justify-center text-gray-700">
        Loading review page...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="w-full min-h-[calc(100vh-80px)] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Order Not Found</h1>
        <p className="text-gray-600">We could not load this order for review.</p>
        <Link
          to="/my-bookings"
          className="px-5 py-2 rounded-lg bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] transition-colors"
        >
          Back to My Bookings
        </Link>
      </div>
    );
  }

  const canReview = (order.orderStatus || "").toLowerCase() === "completed";
  const reviewedSet = new Set(reviewedProductIds);
  const pendingBikes = (order.bikes || []).filter((bikeItem) => {
    const bikeId = getProductId(bikeItem);
    return bikeId && !reviewedSet.has(bikeId);
  });

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-[var(--main-background)] py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-xl border border-gray-200 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Write Reviews</h1>
          <p className="text-gray-600 mt-1">
            Order #{order.orderid} | {order.bikes?.length || 0} bike{(order.bikes?.length || 0) > 1 ? "s" : ""}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Pending reviews: {pendingBikes.length} | Already reviewed: {(order.bikes?.length || 0) - pendingBikes.length}
          </p>
          {!canReview && (
            <p className="mt-2 text-sm text-red-600">
              Reviews are available only when order status is completed.
            </p>
          )}
        </div>

        <div className="space-y-5">
          {pendingBikes.map((bikeItem, index) => {
            const bikeId = getProductId(bikeItem);
            const bikeName = bikeItem?.bike?.bikeName || `Bike ${index + 1}`;
            const currentReview = reviewData[bikeId] || { rating: 5, comment: "" };

            return (
              <div key={`${bikeId || "bike"}-${index}`} className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={bikeItem?.bike?.images?.[0] || "https://via.placeholder.com/80x80?text=Bike"}
                    alt={bikeName}
                    className="w-16 h-16 rounded-md object-cover"
                  />
                  <div>
                    <h2 className="font-semibold text-gray-900">{bikeName}</h2>
                    <p className="text-sm text-gray-600">Qty: {bikeItem?.quantity || 1}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                    <select
                      value={currentReview.rating}
                      disabled={!canReview || submitting}
                      onChange={(e) => updateReviewField(bikeId, "rating", Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={5}>5 - Excellent</option>
                      <option value={4}>4 - Good</option>
                      <option value={3}>3 - Average</option>
                      <option value={2}>2 - Poor</option>
                      <option value={1}>1 - Very Bad</option>
                    </select>
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                    <textarea
                      rows={3}
                      placeholder="Share your experience with this bike..."
                      value={currentReview.comment}
                      disabled={!canReview || submitting}
                      onChange={(e) => updateReviewField(bikeId, "comment", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {pendingBikes.length === 0 && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 text-sm">
              All bikes in this order are already reviewed.
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={submitReviews}
            disabled={!canReview || submitting || pendingBikes.length === 0}
            className="px-6 py-2 rounded-lg bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Submit All Reviews"}
          </button>

          <Link
            to="/my-bookings"
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors text-center"
          >
            Back to My Bookings
          </Link>
        </div>
      </div>
    </div>
  );
}