import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../../../components/footer';
import { SlCalender } from "react-icons/sl";
import Loader from '../../../components/loader';
import { GiTakeMyMoney } from "react-icons/gi";
import { IoMdDoneAll } from "react-icons/io";
import { RiMotorbikeFill } from "react-icons/ri";
import { FaPlus } from "react-icons/fa";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";



export default function Dashboard() {
  const PIE_COLORS = ['#f59e0b', '#22c55e', '#1d4ed8'];

  const [dashboardData, setDashboardData] = useState({
    totalEarnings: 0,
    monthlyEarnings: [],
    totalBikes: 0,
    activeBookings: 0,
    completedBookings: 0,
    bikes: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch earnings data
      const earningsResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/orders/vendor/earnings`, {
        headers
      });
      
      // Fetch vendor bikes
      const bikesResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/products/vender`, {
        headers
      });

      // Fetch booking stats
      const bookingsResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/orders/vendor/stats`, {
        headers
      });

      if (earningsResponse.ok && bikesResponse.ok && bookingsResponse.ok) {
        const earnings = await earningsResponse.json();
        const bikesData = await bikesResponse.json();
        const bookingStats = await bookingsResponse.json();

        setDashboardData({
          totalEarnings: earnings.total || 0,
          monthlyEarnings: earnings.monthly || [],
          bikes: bikesData.products || [],
          totalBikes: bikesData.products?.length || 0,
          activeBookings: bookingStats.active || 0,
          completedBookings: bookingStats.completed || 0
        });
      } else {
        throw new Error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const monthlyChartData = (() => {
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthToAmount = new Map();

    (dashboardData.monthlyEarnings || []).forEach((entry) => {
      if (entry && Number.isFinite(entry.month)) {
        monthToAmount.set(entry.month, Number(entry.amount || 0));
      }
    });

    return monthLabels.map((label, index) => ({
      month: label,
      amount: monthToAmount.get(index + 1) || 0,
    }));
  })();

  const bookingPieData = [
    { name: 'Active', value: Math.max(Number(dashboardData.activeBookings || 0), 0) },
    { name: 'Completed', value: Math.max(Number(dashboardData.completedBookings || 0), 0) },
    {
      name: 'Available',
      value: Math.max(
        Number(dashboardData.totalBikes || 0) - Number(dashboardData.activeBookings || 0),
        0,
      ),
    },
  ];

  const hasBookingData = bookingPieData.some((item) => item.value > 0);

  // Recharts bar chart component
  const EarningsChart = ({ data }) => {
    if (!data || !Array.isArray(data)) {
      return (
        <div className="bg-[var(--card-background)] rounded-lg p-6 shadow-lg border border-[var(--section-divider)]">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Earnings</h3>
          <div className="h-72 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-500">No earnings data available yet</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-[var(--card-background)] rounded-lg p-6 shadow-lg border border-[var(--section-divider)]">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Earnings</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`₨${Number(value).toLocaleString()}`, 'Earnings']} />
              <Legend />
              <Bar dataKey="amount" fill="#1d4ed8" name="Earnings" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Recharts pie chart component for booking status distribution
  const BookingsPieChart = ({ data }) => {
    if (!data || !Array.isArray(data) || !hasBookingData) {
      return (
        <div className="bg-[var(--card-background)] rounded-lg p-6 shadow-lg border border-[var(--section-divider)]">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Booking Status</h3>
          <div className="h-72 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-500">No booking data available</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-[var(--card-background)] rounded-lg p-6 shadow-lg border border-[var(--section-divider)]">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Booking Status</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                innerRadius={55}
                label
              >
                {data.map((entry, index) => (
                  <Cell key={`${entry.name}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[var(--main-background)] flex items-center justify-center">
       <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-[var(--main-background)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-[var(--brand-primary)] text-white rounded hover:bg-[var(--brand-secondary)]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
    <div className="w-full min-h-screen bg-[var(--main-background)] p-6 ">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Vendor Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your bike rental business and track performance
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[var(--card-background)] rounded-lg p-6 shadow-lg border border-[var(--section-divider)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Earnings</p>
                <p className="text-2xl font-bold text-[var(--brand-success)]">₨{dashboardData.totalEarnings.toLocaleString()}</p>
              </div>
              <div className="text-[var(--brand-success)]"><GiTakeMyMoney /></div>
            </div>
          </div>

          <div className="bg-[var(--card-background)] rounded-lg p-6 shadow-lg border border-[var(--section-divider)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Bikes</p>
                <p className="text-2xl font-bold text-[var(--brand-primary)]">{dashboardData.totalBikes}</p>
              </div>
              <div className="text-[var(--brand-primary)]"><RiMotorbikeFill /></div>
            </div>
          </div>

          <div className="bg-[var(--card-background)] rounded-lg p-6 shadow-lg border border-[var(--section-divider)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Bookings</p>
                <p className="text-2xl font-bold text-[var(--brand-secondary)]">{dashboardData.activeBookings}</p>
              </div>
              <div className="text-[var(--brand-secondary)]"><SlCalender /></div>
            </div>
          </div>

          <div className="bg-[var(--card-background)] rounded-lg p-6 shadow-lg border border-[var(--section-divider)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-2xl font-bold text-[var(--brand-success)]">{dashboardData.completedBookings}</p>
              </div>
              <div className="text-[var(--brand-success)]"><IoMdDoneAll /></div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bar Chart */}
          <EarningsChart data={monthlyChartData} />
          
          {/* Pie Chart */}
          <BookingsPieChart data={bookingPieData} />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          <Link
            to="/vendor/add-bike"
            className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white p-6 rounded-lg hover:shadow-lg transition-all border border-[var(--section-divider)]"
          >
            <div className="text-center">
              <div className="text-3xl mb-3"><FaPlus /></div>
              <h3 className="text-lg font-semibold">Add New Bike</h3>
              <p className="text-sm opacity-90">List a new bike for rental</p>
            </div>
          </Link>

          <Link
            to="/vendor/bookings"
            className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--navbar-active)] text-white p-6 rounded-lg hover:shadow-lg transition-all border border-[var(--section-divider)]"
          >
            <div className="text-center">
              <div className="text-3xl mb-3"><SlCalender /></div>
              <h3 className="text-lg font-semibold">View Bookings</h3>
              <p className="text-sm opacity-90">Manage your rental bookings</p>
            </div>
          </Link>

          <Link
            to="/vendor/earning"
            className="bg-gradient-to-r from-[var(--brand-success)] to-[var(--brand-secondary)] text-white p-6 rounded-lg hover:shadow-lg transition-all border border-[var(--section-divider)]"
          >
            <div className="text-center">
              <div className="text-3xl mb-3"><IoMdDoneAll /></div>
              <h3 className="text-lg font-semibold">Earnings Report</h3>
              <p className="text-sm opacity-90">Detailed financial analytics</p>
            </div>
          </Link>
        </div>

       
      </div>
      
    </div>
    <Footer />
    </div>
  );
}

