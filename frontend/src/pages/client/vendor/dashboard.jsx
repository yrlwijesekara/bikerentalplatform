import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../../components/productcard';
import Footer from '../../../components/footer';
import { SlCalender } from "react-icons/sl";
import Loader from '../../../components/loader';
import { GiTakeMyMoney } from "react-icons/gi";
import { IoMdDoneAll } from "react-icons/io";
import { RiMotorbikeFill } from "react-icons/ri";
import { FaPlus } from "react-icons/fa";



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
        
        // Debug log the data
        console.log('Dashboard data loaded:', {
          earnings: earnings,
          bikesData: bikesData,
          bookingStats: bookingStats
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
    // Debug logging
    console.log('Chart data:', data);
    
    // Handle empty or invalid data
    if (!data || !Array.isArray(data) || data.length === 0) {
      return (
        <div className="bg-[var(--card-background)] rounded-lg p-6 shadow-lg border border-[var(--section-divider)]">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Monthly Earnings - Bar Chart</h3>
          <div className="h-48 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-500">No earnings data available yet</p>
          </div>
        </div>
      );
    }
    
    const maxValue = Math.max(...data.map(d => d.amount || 0), 1);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return (
      <div className="bg-[var(--card-background)] rounded-lg p-6 shadow-lg border border-[var(--section-divider)]">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Monthly Earnings - Bar Chart</h3>
        <div className="flex items-end justify-between h-48 gap-2">
          {months.slice(0, 6).map((month, index) => {
            const monthData = data.find(d => d.month === index + 1);
            const amount = monthData ? (monthData.amount || 0) : 0;
            const height = maxValue > 0 ? (amount / maxValue) * 100 : 5;
            
            return (
              <div key={month} className="flex flex-col items-center flex-1">
                <div className="w-full h-full relative flex items-end">
                  <div className="w-full bg-gray-200 rounded-t" style={{ height: '100%' }}>
                    <div 
                      className="bg-gradient-to-t from-[var(--brand-primary)] to-[var(--brand-secondary)] rounded-t transition-all duration-500 w-full hover:from-[var(--brand-secondary)] hover:to-[var(--brand-primary)] cursor-pointer"
                      style={{ 
                        height: `${Math.max(height, 5)}%`,
                        minHeight: '4px'
                      }}
                      title={`${month}: ₨${amount.toLocaleString()}`}
                    ></div>
                  </div>
                </div>
                <span className="text-xs text-gray-600 mt-2">{month}</span>
                <span className="text-xs font-semibold text-gray-800">₨{amount.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
        {maxValue > 0 && (
          <div className="mt-4 flex justify-between text-xs text-gray-500">
            <span>Max: ₨{maxValue.toLocaleString()}</span>
            <span>Total: ₨{data.reduce((sum, d) => sum + (d.amount || 0), 0).toLocaleString()}</span>
          </div>
        )}
      </div>
    );
  };

  // Pie Chart Component for Booking Status Distribution
  const BookingsPieChart = ({ activeBookings, completedBookings, totalBikes }) => {
    const availableBikes = Math.max(totalBikes - activeBookings, 0);
    const total = activeBookings + completedBookings + availableBikes;
    
    if (total === 0) {
      return (
        <div className="bg-[var(--card-background)] rounded-lg p-6 shadow-lg border border-[var(--section-divider)]">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🥧 Booking Status - Pie Chart</h3>
          <div className="h-48 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-500">No booking data available</p>
          </div>
        </div>
      );
    }

    const activePercent = (activeBookings / total) * 100;
    const completedPercent = (completedBookings / total) * 100;
    const availablePercent = (availableBikes / total) * 100;

    // Calculate pie slice paths
    const radius = 80;
    const centerX = 100;
    const centerY = 100;
    
    const createPath = (startAngle, endAngle) => {
      const start = (startAngle * Math.PI) / 180;
      const end = (endAngle * Math.PI) / 180;
      
      const x1 = centerX + radius * Math.cos(start);
      const y1 = centerY + radius * Math.sin(start);
      const x2 = centerX + radius * Math.cos(end);
      const y2 = centerY + radius * Math.sin(end);
      
      const largeArc = endAngle - startAngle > 180 ? 1 : 0;
      
      return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    };

    let currentAngle = 0;
    const activeEndAngle = currentAngle + (activePercent * 360) / 100;
    const activePath = createPath(currentAngle, activeEndAngle);
    
    currentAngle = activeEndAngle;
    const completedEndAngle = currentAngle + (completedPercent * 360) / 100;
    const completedPath = createPath(currentAngle, completedEndAngle);
    
    currentAngle = completedEndAngle;
    const availableEndAngle = currentAngle + (availablePercent * 360) / 100;
    const availablePath = createPath(currentAngle, availableEndAngle);

    return (
      <div className="bg-[var(--card-background)] rounded-lg p-6 shadow-lg border border-[var(--section-divider)]">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🥧 Booking Status - Pie Chart</h3>
        <div className="flex items-center justify-between">
          <div className="w-48 h-48">
            <svg width="200" height="200" viewBox="0 0 200 200">
              {activePercent > 0 && (
                <path 
                  d={activePath} 
                  fill="var(--brand-secondary)" 
                  stroke="white" 
                  strokeWidth="2"
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              )}
              {completedPercent > 0 && (
                <path 
                  d={completedPath} 
                  fill="var(--brand-success)" 
                  stroke="white" 
                  strokeWidth="2"
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              )}
              {availablePercent > 0 && (
                <path 
                  d={availablePath} 
                  fill="var(--brand-primary)" 
                  stroke="white" 
                  strokeWidth="2"
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              )}
              {/* Center circle for donut effect */}
              <circle 
                cx={centerX} 
                cy={centerY} 
                r="30" 
                fill="var(--card-background)" 
                stroke="var(--section-divider)" 
                strokeWidth="1"
              />
              <text x={centerX} y={centerY-5} textAnchor="middle" className="text-sm font-semibold fill-gray-700">
                {total}
              </text>
              <text x={centerX} y={centerY+15} textAnchor="middle" className="text-xs fill-gray-500">
                Total
              </text>
            </svg>
          </div>
          
          {/* Legend */}
          <div className="flex-1 ml-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded" style={{backgroundColor: 'var(--brand-secondary)'}}></div>
              <div>
                <p className="text-sm font-medium text-gray-700">Active Bookings</p>
                <p className="text-xs text-gray-500">{activeBookings} bikes ({activePercent.toFixed(1)}%)</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded" style={{backgroundColor: 'var(--brand-success)'}}></div>
              <div>
                <p className="text-sm font-medium text-gray-700">Completed</p>
                <p className="text-xs text-gray-500">{completedBookings} bookings ({completedPercent.toFixed(1)}%)</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded" style={{backgroundColor: 'var(--brand-primary)'}}></div>
              <div>
                <p className="text-sm font-medium text-gray-700">Available</p>
                <p className="text-xs text-gray-500">{availableBikes} bikes ({availablePercent.toFixed(1)}%)</p>
              </div>
            </div>
          </div>
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
          <EarningsChart data={dashboardData.monthlyEarnings} />
          
          {/* Pie Chart */}
          <BookingsPieChart 
            activeBookings={dashboardData.activeBookings}
            completedBookings={dashboardData.completedBookings}
            totalBikes={dashboardData.totalBikes}
          />
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

