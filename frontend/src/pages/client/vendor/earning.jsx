import { useState, useEffect } from "react";
import { FaCalendarAlt, FaMoneyBillWave, FaChartLine, FaFileExport } from "react-icons/fa";
import { MdPending, MdCheckCircle, MdTrendingUp, MdDateRange } from "react-icons/md";
import { BiReceipt, BiBarChart } from "react-icons/bi";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "../../../components/loader";
import Footer from "../../../components/footer";

export default function VendorEarning() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());

  // Fetch completed orders from database
  useEffect(() => {
    fetchCompletedOrders();
  }, []);

  // Filter orders based on date criteria
  useEffect(() => {
    let filtered = orders;

    if (dateFilter) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt).toDateString();
        const filterDate = new Date(dateFilter).toDateString();
        return orderDate === filterDate;
      });
    }

    if (monthFilter) {
      filtered = filtered.filter(order => {
        const orderMonth = new Date(order.createdAt).getMonth();
        return orderMonth === parseInt(monthFilter);
      });
    }

    if (yearFilter) {
      filtered = filtered.filter(order => {
        const orderYear = new Date(order.createdAt).getFullYear();
        return orderYear === parseInt(yearFilter);
      });
    }

    setFilteredOrders(filtered);
  }, [orders, dateFilter, monthFilter, yearFilter]);

  const fetchCompletedOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        toast.error("Please login to view your earnings");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/orders/vendor-orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Filter only completed orders for earnings calculation
      const completedOrders = (response.data.orders || []).filter(
        order => order.orderStatus?.toLowerCase() === 'completed'
      );

      setOrders(completedOrders);
      setFilteredOrders(completedOrders);
      setError(null);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to fetch earnings data");
      toast.error("Failed to fetch earnings data");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setDateFilter('');
    setMonthFilter('');
    setYearFilter(new Date().getFullYear().toString());
  };

  // Calculate earnings statistics
  const calculateEarnings = () => {
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const averageOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;
    const totalOrders = filteredOrders.length;
    
    return { totalRevenue, averageOrderValue, totalOrders };
  };

  // Get monthly earnings data for chart
  const getMonthlyEarnings = () => {
    const monthlyData = {};
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    // Initialize all months to 0
    months.forEach((month, index) => {
      monthlyData[index] = { month, revenue: 0, orders: 0 };
    });

    // Calculate earnings per month
    filteredOrders.forEach(order => {
      const month = new Date(order.createdAt).getMonth();
      monthlyData[month].revenue += (order.totalAmount || 0);
      monthlyData[month].orders += 1;
    });

    return Object.values(monthlyData);
  };

  // Get available years for filter
  const getAvailableYears = () => {
    const years = orders.map(order => new Date(order.createdAt).getFullYear());
    return [...new Set(years)].sort((a, b) => b - a);
  };

  const earnings = calculateEarnings();
  const monthlyEarnings = getMonthlyEarnings();

  const formatCurrency = (amount) => `Rs. ${amount.toFixed(2)}`;

  // Simple bar chart component (since we can't install external libraries easily)
  const SimpleBarChart = ({ data }) => {
    const maxRevenue = Math.max(...data.map(item => item.revenue));
    
    return (
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-8 text-xs text-gray-600">{item.month}</div>
            <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
                style={{ 
                  width: maxRevenue > 0 ? `${(item.revenue / maxRevenue) * 100}%` : '0%',
                  minWidth: item.revenue > 0 ? '40px' : '0px'
                }}
              >
                {item.revenue > 0 && (
                  <span className="text-white text-xs font-medium">
                    {formatCurrency(item.revenue)}
                  </span>
                )}
              </div>
            </div>
            <div className="w-12 text-xs text-gray-600">{item.orders}x</div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-100px)]">
        <Loader />
        <p className="text-lg text-gray-600">Loading earnings data...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-80px)] bg-[var(--main-background)] overflow-y-auto scrollbar-hide"
         style={{
           scrollbarWidth: 'none',
           msOverflowStyle: 'none',
         }}>
      <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="p-6">
        {/* Page Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FaChartLine className="text-green-500" />
              Earnings Analytics
            </h1>
            <div className="text-sm text-gray-600">
              Completed Orders: {filteredOrders.length} | 
              Total Revenue: {formatCurrency(earnings.totalRevenue)}
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MdDateRange className="text-blue-500" />
              Filter Earnings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Specific Date Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Specific Date</label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Month Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Month</label>
                <select
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Months</option>
                  <option value="0">January</option>
                  <option value="1">February</option>
                  <option value="2">March</option>
                  <option value="3">April</option>
                  <option value="4">May</option>
                  <option value="5">June</option>
                  <option value="6">July</option>
                  <option value="7">August</option>
                  <option value="8">September</option>
                  <option value="9">October</option>
                  <option value="10">November</option>
                  <option value="11">December</option>
                </select>
              </div>

              {/* Year Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Year</label>
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {getAvailableYears().map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
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

        {/* Statistics Cards */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Revenue */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-600">{formatCurrency(earnings.totalRevenue)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <FaMoneyBillWave className="text-green-600" size={24} />
                </div>
              </div>
            </div>

            {/* Total Orders */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed Orders</p>
                  <p className="text-3xl font-bold text-blue-600">{earnings.totalOrders}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <MdCheckCircle className="text-blue-600" size={24} />
                </div>
              </div>
            </div>

            {/* Average Order Value */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Order Value</p>
                  <p className="text-3xl font-bold text-purple-600">{formatCurrency(earnings.averageOrderValue)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <MdTrendingUp className="text-purple-600" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Earnings Chart */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <BiBarChart className="text-blue-500" />
              Monthly Revenue Analysis
            </h3>
            
            {monthlyEarnings.some(month => month.revenue > 0) ? (
              <SimpleBarChart data={monthlyEarnings} />
            ) : (
              <div className="text-center py-8">
                <BiBarChart className="mx-auto text-4xl text-gray-400 mb-4" />
                <p className="text-gray-600">No completed orders found for the selected period</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Completed Orders */}
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <BiReceipt className="text-green-500" />
              Recent Completed Orders
            </h3>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">{error}</p>
                <button 
                  onClick={fetchCompletedOrders}
                  className="mt-2 text-red-600 hover:text-red-800 underline"
                >
                  Try Again
                </button>
              </div>
            )}

            {filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <BiReceipt className="mx-auto text-4xl text-gray-400 mb-4" />
                <p className="text-gray-600">No completed orders found</p>
                <p className="text-gray-500 text-sm mt-2">Complete orders will appear here for earnings calculation</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bikes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.slice(0, 10).map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.orderid}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.customer?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.totalBikes} bike{order.totalBikes > 1 ? 's' : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {formatCurrency(order.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredOrders.length > 10 && (
                  <div className="text-center py-4 text-sm text-gray-500">
                    Showing 10 of {filteredOrders.length} completed orders
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
