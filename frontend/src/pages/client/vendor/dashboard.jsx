import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../../components/productcard';
import Footer from '../../../components/footer';
import { SlCalender } from "react-icons/sl";
import Loader from '../../../components/loader';
import { GiTakeMyMoney } from "react-icons/gi";
import { IoMdDoneAll } from "react-icons/io";
import { RiMotorbikeFill } from "react-icons/ri";


export default function Dashboard() {
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

  // Simple bar chart component using CSS
  const EarningsChart = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.amount), 1);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return (
        
      <div className="bg-[var(--card-background)] rounded-lg p-6 shadow-lg border border-[var(--section-divider)]">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Earnings</h3>
        <div className="flex items-end justify-between h-48 gap-2">
          {months.slice(0, 6).map((month, index) => {
            const monthData = data.find(d => d.month === index + 1);
            const amount = monthData ? monthData.amount : 0;
            const height = (amount / maxValue) * 100;
            
            return (
              <div key={month} className="flex flex-col items-center flex-1">
                <div className="w-full bg-gray-200 rounded-t relative">
                  <div 
                    className="bg-gradient-to-t from-[var(--brand-primary)] to-[var(--brand-secondary)] rounded-t transition-all duration-500"
                    style={{ height: `${Math.max(height, 5)}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-600 mt-2">{month}</span>
                <span className="text-xs font-semibold text-gray-800">₨{amount}</span>
              </div>
            );
          })}
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

        {/* Earnings Chart */}
        <div className="mb-8">
          <EarningsChart data={dashboardData.monthlyEarnings} />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/vendor/addbike"
            className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white p-6 rounded-lg hover:shadow-lg transition-all border border-[var(--section-divider)]"
          >
            <div className="text-center">
              <div className="text-3xl mb-3">➕</div>
              <h3 className="text-lg font-semibold">Add New Bike</h3>
              <p className="text-sm opacity-90">List a new bike for rental</p>
            </div>
          </Link>

          <Link
            to="/vendor/bookings"
            className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--navbar-active)] text-white p-6 rounded-lg hover:shadow-lg transition-all border border-[var(--section-divider)]"
          >
            <div className="text-center">
              <div className="text-3xl mb-3">📋</div>
              <h3 className="text-lg font-semibold">View Bookings</h3>
              <p className="text-sm opacity-90">Manage your rental bookings</p>
            </div>
          </Link>

          <Link
            to="/vendor/earning"
            className="bg-gradient-to-r from-[var(--brand-success)] to-[var(--brand-secondary)] text-white p-6 rounded-lg hover:shadow-lg transition-all border border-[var(--section-divider)]"
          >
            <div className="text-center">
              <div className="text-3xl mb-3">💎</div>
              <h3 className="text-lg font-semibold">Earnings Report</h3>
              <p className="text-sm opacity-90">Detailed financial analytics</p>
            </div>
          </Link>
        </div>

        {/* Your Bikes Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Your Bikes</h2>
            <Link
              to="/vendor/bikes"
              className="px-4 py-2 bg-[var(--brand-primary)] text-white rounded hover:bg-[var(--brand-secondary)] transition-colors"
            >
              View All
            </Link>
          </div>

          {dashboardData.bikes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardData.bikes.slice(0, 6).map((bike) => (
                <ProductCard key={bike._id} bike={bike} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-[var(--card-background)] rounded-lg border border-[var(--section-divider)]">
              <div className="text-6xl mb-4">🏍️</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No bikes listed yet</h3>
              <p className="text-gray-500 mb-6">Start by adding your first bike to begin earning!</p>
              <Link
                to="/vendor/addbike"
                className="px-6 py-3 bg-[var(--brand-primary)] text-white rounded-lg hover:bg-[var(--brand-secondary)] transition-colors"
              >
                Add Your First Bike
              </Link>
            </div>
          )}
        </div>
      </div>
      
    </div>
    <Footer />
    </div>
  );
}

