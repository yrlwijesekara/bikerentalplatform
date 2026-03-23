import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../../components/loader.jsx";

export default function ViewOrder() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [isLoading, setIsLoading] = useState(true);
    const [order, setOrder] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setIsLoading(true);
                const token = localStorage.getItem("token");

                if (!token) {
                    toast.error("No authentication token found. Please login again.");
                    navigate("/login");
                    return;
                }

                const response = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/orders/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );

                setOrder(response.data?.order || null);
            } catch (error) {
                console.error("Error fetching order:", error);

                if (error.response?.status === 401) {
                    toast.error("Authentication failed. Please login again.");
                    localStorage.removeItem("token");
                    localStorage.removeItem("role");
                    navigate("/login");
                } else if (error.response?.status === 403) {
                    toast.error("Access denied. Admin privileges required.");
                    navigate("/admin/orders");
                } else if (error.response?.status === 404) {
                    toast.error("Order not found.");
                    navigate("/admin/orders");
                } else {
                    toast.error("Failed to load order data. Please try again.");
                    navigate("/admin/orders");
                }
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchOrder();
        }
    }, [id, navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader />
                    <p className="text-gray-600 mt-4">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-700">Order not found.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 border-b pb-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Full Order Details</h1>
                            <p className="text-gray-600 text-sm">Order ID: {order.orderid || order._id}</p>
                        </div>
                        <button
                            onClick={() => navigate("/admin/orders")}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Back to Orders
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <p className="text-xs text-gray-500">Order Status</p>
                            <p className="text-sm font-semibold text-gray-900 mt-1">{order.orderStatus || "N/A"}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <p className="text-xs text-gray-500">Payment</p>
                            <p className="text-sm font-semibold text-gray-900 mt-1">{order.paymentMethod || "N/A"} / {order.paymentStatus || "N/A"}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <p className="text-xs text-gray-500">Total Bikes</p>
                            <p className="text-sm font-semibold text-gray-900 mt-1">{order.totalBikes || order.bikes?.length || 0}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <p className="text-xs text-gray-500">Final Total</p>
                            <p className="text-sm font-semibold text-green-700 mt-1">Rs. {Number(order.finalTotal || 0).toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-gray-800 mb-3">Customer</h2>
                        <div className="bg-gray-50 p-4 rounded-lg border text-sm text-gray-700 space-y-1">
                            <p><span className="font-medium">Name:</span> {order.user ? `${order.user.firstname || ""} ${order.user.lastname || ""}`.trim() : "N/A"}</p>
                            <p><span className="font-medium">Email:</span> {order.user?.email || "N/A"}</p>
                            <p><span className="font-medium">Phone:</span> {order.user?.phone || "N/A"}</p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-gray-800 mb-3">Order Timeline</h2>
                        <div className="bg-gray-50 p-4 rounded-lg border text-sm text-gray-700 space-y-1">
                            <p><span className="font-medium">Start Date:</span> {order.startDate ? new Date(order.startDate).toLocaleDateString() : "N/A"}</p>
                            <p><span className="font-medium">End Date:</span> {order.endDate ? new Date(order.endDate).toLocaleDateString() : "N/A"}</p>
                            <p><span className="font-medium">Total Days:</span> {order.totalDays || 0}</p>
                            <p><span className="font-medium">Created At:</span> {order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}</p>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-3">Bikes in this Order</h2>
                        <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full border-collapse min-w-300">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">Bike</th>
                                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">Vendor</th>
                                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">Qty</th>
                                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">Days</th>
                                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">Price/Day</th>
                                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">Subtotal</th>
                                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">Bike Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(order.bikes || []).map((item, index) => (
                                        <tr key={`${item.bike?._id || index}-${index}`} className="hover:bg-gray-50">
                                            <td className="py-3 px-4 border-b text-sm text-gray-800">
                                                {item.bike?.bikeName || "Unknown Bike"}
                                                <p className="text-xs text-gray-500">{item.bike?.bikeType || "N/A"} {item.bike?.city ? `| ${item.bike.city}` : ""}</p>
                                            </td>
                                            <td className="py-3 px-4 border-b text-sm text-gray-800">
                                                {item.vendor ? `${item.vendor.firstname || ""} ${item.vendor.lastname || ""}`.trim() : "Unknown Vendor"}
                                            </td>
                                            <td className="py-3 px-4 border-b text-sm text-gray-800">{item.quantity || 0}</td>
                                            <td className="py-3 px-4 border-b text-sm text-gray-800">{item.rentalDays || 0}</td>
                                            <td className="py-3 px-4 border-b text-sm text-gray-800">Rs. {Number(item.pricePerDay || 0).toLocaleString()}</td>
                                            <td className="py-3 px-4 border-b text-sm text-gray-800">Rs. {Number(item.subtotal || 0).toLocaleString()}</td>
                                            <td className="py-3 px-4 border-b text-sm text-gray-800">{item.bikeStatus || "N/A"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
