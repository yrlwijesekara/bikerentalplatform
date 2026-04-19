import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/loader.jsx";

const ORDERS_PER_PAGE = 10;

export default function OrderManagement() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedOrderStatus, setSelectedOrderStatus] = useState("");
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("");
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [exportStartDate, setExportStartDate] = useState("");
    const [exportEndDate, setExportEndDate] = useState("");
    const [exportingFormat, setExportingFormat] = useState("");

    useEffect(() => {
        const fetchAllOrders = async () => {
            try {
                setLoading(true);
                setError(null);

                const token = localStorage.getItem("token");
                if (!token) {
                    setError("Please login first");
                    return;
                }

                const response = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/orders/admin/all`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );
                toast.success("Orders fetched successfully");

                setOrders(response.data?.orders || []);
            } catch (err) {
                const message = err.response?.data?.message || "Failed to fetch orders";
                setError(message);
                toast.error(message);
            } finally {
                setLoading(false);
            }
        };

        fetchAllOrders();
    }, []);

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const loweredSearch = searchTerm.toLowerCase();
            const customerName = `${order.user?.firstname || ""} ${order.user?.lastname || ""}`.trim();
            const customerEmail = order.user?.email || "";
            const orderId = order.orderid || "";
            const dbId = order._id || "";

            const matchesSearch =
                !searchTerm ||
                customerName.toLowerCase().includes(loweredSearch) ||
                customerEmail.toLowerCase().includes(loweredSearch) ||
                orderId.toLowerCase().includes(loweredSearch) ||
                dbId.toLowerCase().includes(loweredSearch);

            const matchesOrderStatus =
                !selectedOrderStatus ||
                (order.orderStatus || "").toLowerCase() === selectedOrderStatus.toLowerCase();

            const matchesPaymentStatus =
                !selectedPaymentStatus ||
                (order.paymentStatus || "").toLowerCase() === selectedPaymentStatus.toLowerCase();

            const matchesPaymentMethod =
                !selectedPaymentMethod ||
                (order.paymentMethod || "").toLowerCase() === selectedPaymentMethod.toLowerCase();

            return matchesSearch && matchesOrderStatus && matchesPaymentStatus && matchesPaymentMethod;
        });
    }, [orders, searchTerm, selectedOrderStatus, selectedPaymentStatus, selectedPaymentMethod]);

    const orderStatusOptions = useMemo(() => {
        return [...new Set(orders.map((o) => o.orderStatus).filter(Boolean))];
    }, [orders]);

    const paymentStatusOptions = useMemo(() => {
        return [...new Set(orders.map((o) => o.paymentStatus).filter(Boolean))];
    }, [orders]);

    const paymentMethodOptions = useMemo(() => {
        return [...new Set(orders.map((o) => o.paymentMethod).filter(Boolean))];
    }, [orders]);

    useEffect(() => {
        const pages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
        if (currentPage > pages) {
            setCurrentPage(pages);
        }
    }, [filteredOrders, currentPage]);

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedOrderStatus("");
        setSelectedPaymentStatus("");
        setSelectedPaymentMethod("");
        setCurrentPage(1);
    };

    const handleExport = async (format) => {
        try {
            if (!format) return;

            if (exportStartDate && exportEndDate && exportStartDate > exportEndDate) {
                toast.error("Start date cannot be later than end date.");
                return;
            }

            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Please login first");
                return;
            }

            setExportingFormat(format);

            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/orders/admin/export`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: {
                        format,
                        startDate: exportStartDate || undefined,
                        endDate: exportEndDate || undefined,
                    },
                    responseType: "blob",
                },
            );

            const blob = new Blob([response.data], {
                type: response.headers["content-type"] || "application/octet-stream",
            });

            const disposition = response.headers["content-disposition"] || "";
            const matchedFilename = disposition.match(/filename=([^;]+)/i);
            const fallbackName = `order_history.${format}`;
            const filename = matchedFilename
                ? matchedFilename[1].replaceAll('"', "")
                : fallbackName;

            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(downloadUrl);

            toast.success(`Order history exported as ${format.toUpperCase()}.`);
        } catch (err) {
            const fallback = `Failed to export ${format.toUpperCase()} report.`;
            const apiMessage = err.response?.data?.message;
            toast.error(apiMessage || fallback);
        } finally {
            setExportingFormat("");
        }
    };

    const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
    const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
    const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ORDERS_PER_PAGE);

    const getPaginationItems = () => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const pages = [1];
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        if (start > 2) pages.push("left-ellipsis");
        for (let p = start; p <= end; p += 1) pages.push(p);
        if (end < totalPages - 1) pages.push("right-ellipsis");

        pages.push(totalPages);
        return pages;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-100">
                <Loader />
                <p className="text-gray-600 mt-4">Loading orders...</p>
            </div>
        );
    }

    return (
        <div className="w-full p-4 md:p-6">
            <div className="w-full max-w-[98vw] xl:max-w-400 mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Order Management</h1>

                <div className="mb-6 text-center text-sm text-gray-600">
                    Total: {orders.length} order{orders.length !== 1 ? "s" : ""} |
                    Showing: {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}
                </div>

                <div className="mb-8">
                    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Search Order</label>
                                <input
                                    type="text"
                                    placeholder="Order ID, customer, email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Order Status</label>
                                <select
                                    value={selectedOrderStatus}
                                    onChange={(e) => setSelectedOrderStatus(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                    <option value="">All Status</option>
                                    {orderStatusOptions.map((status) => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Payment Status</label>
                                <select
                                    value={selectedPaymentStatus}
                                    onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                    <option value="">All Payment Status</option>
                                    {paymentStatusOptions.map((status) => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                                <select
                                    value={selectedPaymentMethod}
                                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                    <option value="">All Methods</option>
                                    {paymentMethodOptions.map((method) => (
                                        <option key={method} value={method}>{method}</option>
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

                        <div className="mt-5 pt-4 border-t border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-800 mb-3">Export Order History</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">From Date</label>
                                    <input
                                        type="date"
                                        value={exportStartDate}
                                        onChange={(e) => setExportStartDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">To Date</label>
                                    <input
                                        type="date"
                                        value={exportEndDate}
                                        onChange={(e) => setExportEndDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 invisible">Export PDF</label>
                                    <button
                                        type="button"
                                        onClick={() => handleExport("pdf")}
                                        disabled={exportingFormat !== ""}
                                        className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {exportingFormat === "pdf" ? "Exporting PDF..." : "Export PDF"}
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 invisible">Export DOC</label>
                                    <button
                                        type="button"
                                        onClick={() => handleExport("doc")}
                                        disabled={exportingFormat !== ""}
                                        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {exportingFormat === "doc" ? "Exporting DOC..." : "Export DOC"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {error ? (
                        <div className="p-6 text-center text-red-600">{error}</div>
                    ) : orders.length === 0 ? (
                        <div className="p-6 text-center text-gray-600">No orders found.</div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="p-6 text-center text-gray-600">No orders match your filters.</div>
                    ) : (
                        <div className="overflow-x-auto show-scrollbar">
                            <table className="w-full border-collapse min-w-300">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">Order ID</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">Customer</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">Bikes</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">Total</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">Payment</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">Order Status</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">Created</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedOrders.map((order) => (
                                        <tr key={order._id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4 border border-gray-300 font-medium">{order.orderid || "N/A"}</td>
                                            <td className="py-3 px-4 border border-gray-300">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {order.user ? `${order.user.firstname || ""} ${order.user.lastname || ""}`.trim() : "Unknown"}
                                                </p>
                                                <p className="text-xs text-gray-500">{order.user?.email || "N/A"}</p>
                                            </td>
                                            <td className="py-3 px-4 border border-gray-300">{order.totalBikes || order.bikes?.length || 0}</td>
                                            <td className="py-3 px-4 border border-gray-300 text-green-700 font-semibold">
                                                Rs. {Number(order.finalTotal || 0).toLocaleString()}
                                            </td>
                                            <td className="py-3 px-4 border border-gray-300">
                                                <div className="text-sm">{order.paymentMethod || "N/A"}</div>
                                                <div className="text-xs text-gray-500">{order.paymentStatus || "N/A"}</div>
                                            </td>
                                            <td className="py-3 px-4 border border-gray-300">
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {order.orderStatus || "N/A"}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 border border-gray-300 text-sm text-gray-700">
                                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                                            </td>
                                            <td className="py-3 px-4 border border-gray-300">
                                                <button
                                                    onClick={() => navigate(`/admin/view-order/${order._id}`)}
                                                    className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm"
                                                >
                                                    View Full Order
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {filteredOrders.length > 0 && (
                        <div className="px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="text-sm text-gray-500">
                                Showing {startIndex + 1}-{Math.min(startIndex + ORDERS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length} orders
                            </div>

                            {totalPages > 1 && (
                                <div className="flex flex-wrap items-center justify-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                                className={`px-3 py-1 rounded-md border transition-colors duration-200 ${
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
                                        className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}