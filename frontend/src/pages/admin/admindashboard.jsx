import { useEffect, useState } from "react";
import axios from "axios";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import Loader from "../../components/loader.jsx";

const PIE_COLORS = ["#1d4ed8", "#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [overview, setOverview] = useState({
        customerCount: 0,
        vendorCount: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalReviews: 0,
        totalRevenue: 0,
    });
    const [charts, setCharts] = useState({
        monthlyOrders: [],
        orderStatusDistribution: [],
        userRoleDistribution: [],
        ratingsDistribution: [],
        availabilityDistribution: [],
    });

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                setLoading(true);
                setError(null);

                const token = localStorage.getItem("token");
                if (!token) {
                    setError("Please login first");
                    return;
                }

                const response = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/orders/admin/dashboard-stats`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );

                setOverview(response.data?.overview || {});
                setCharts(response.data?.charts || {});
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardStats();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-100">
                <Loader />
                <p className="text-gray-600 mt-4">Loading dashboard analytics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-2 text-gray-800 text">Admin Dashboard</h1>
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6">
            <div className="max-w-[98vw] xl:max-w-400 mx-auto space-y-6 text-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Admin Analytics Dashboard</h1>
                    <p className="text-gray-600 mt-1">Live overview of customers, vendors, orders, products and reviews.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
                        <p className="text-sm text-gray-500">Customers</p>
                        <p className="text-3xl font-bold text-blue-700 mt-1">{overview.customerCount || 0}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
                        <p className="text-sm text-gray-500">Vendors</p>
                        <p className="text-3xl font-bold text-indigo-700 mt-1">{overview.vendorCount || 0}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
                        <p className="text-sm text-gray-500">Orders</p>
                        <p className="text-3xl font-bold text-amber-600 mt-1">{overview.totalOrders || 0}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
                        <p className="text-sm text-gray-500">Products</p>
                        <p className="text-3xl font-bold text-emerald-600 mt-1">{overview.totalProducts || 0}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
                        <p className="text-sm text-gray-500">Reviews</p>
                        <p className="text-3xl font-bold text-fuchsia-600 mt-1">{overview.totalReviews || 0}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
                        <p className="text-sm text-gray-500">Total Revenue</p>
                        <p className="text-3xl font-bold text-green-700 mt-1">Rs. {Number(overview.totalRevenue || 0).toLocaleString()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Orders and Revenue (Last 6 Months)</h2>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={charts.monthlyOrders || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="orders" fill="#2563eb" name="Orders" />
                                    <Bar dataKey="revenue" fill="#16a34a" name="Revenue (LKR)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">User Role Distribution</h2>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={charts.userRoleDistribution || []}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={110}
                                        label
                                    >
                                        {(charts.userRoleDistribution || []).map((entry, index) => (
                                            <Cell key={`${entry.name}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Status Distribution</h2>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={charts.orderStatusDistribution || []}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={110}
                                        label
                                    >
                                        {(charts.orderStatusDistribution || []).map((entry, index) => (
                                            <Cell key={`${entry.name}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Review Ratings Distribution</h2>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={charts.ratingsDistribution || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="rating" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill="#8b5cf6" name="Reviews" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}