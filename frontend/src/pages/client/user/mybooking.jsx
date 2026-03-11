import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaCalendarAlt, FaMotorcycle, FaMoneyBillWave, FaMapMarkerAlt, FaExternalLinkAlt } from "react-icons/fa";
import { MdPayment, MdPending, MdCheckCircle, MdCancel } from "react-icons/md";
import { BiReceipt } from "react-icons/bi";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "../../../components/loader";
import { FaPhone } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import { FaEnvelope } from "react-icons/fa";
import Footer from "../../../components/footer";

export default function Mybooking() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPaymentDate, setSelectedPaymentDate] = useState('');
  const [expandedBikeStatus, setExpandedBikeStatus] = useState({});

  // Fetch bookings from database
  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter bookings based on search criteria
  useEffect(() => {
    let filtered = bookings;

    if (searchTerm) {
      filtered = filtered.filter(booking => 
        booking.orderid.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.bikes.some(bike => 
          bike.bike.bikeName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (selectedStatus) {
      filtered = filtered.filter(booking => 
        booking.orderStatus.toLowerCase() === selectedStatus.toLowerCase()
      );
    }

    if (selectedPaymentDate) {
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.createdAt).toDateString();
        const filterDate = new Date(selectedPaymentDate).toDateString();
        return bookingDate === filterDate;
      });
    }

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, selectedStatus, selectedPaymentDate]);

  // Get unique statuses for filter dropdowns
  const getOrderStatuses = () => {
    const statuses = bookings.map(booking => booking.orderStatus).filter(Boolean);
    return [...new Set(statuses)];
  };

  const getPaymentDates = () => {
    const dates = bookings.map(booking => new Date(booking.createdAt).toDateString()).filter(Boolean);
    return [...new Set(dates)].sort((a, b) => new Date(b) - new Date(a));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedPaymentDate('');
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        toast.error("Please login to view your bookings");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/orders/my-orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBookings(response.data.orders || []);
      setFilteredBookings(response.data.orders || []);
      setError(null);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError("Failed to fetch bookings");
      toast.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <MdCheckCircle className="text-green-500" size={20} />;
      case 'cancelled':
        return <MdCancel className="text-red-500" size={20} />;
      case 'confirmed':
        return <MdCheckCircle className="text-blue-500" size={20} />;
      case 'ongoing':
        return <FaMotorcycle className="text-orange-500" size={20} />;
      default:
        return <MdPending className="text-yellow-500" size={20} />;
    }
  };

  const getPaymentStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return <MdCheckCircle className="text-green-500" size={20} />;
      case 'failed':
        return <MdCancel className="text-red-500" size={20} />;
      case 'refunded':
        return <MdPayment className="text-blue-500" size={20} />;
      default:
        return <MdPending className="text-yellow-500" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const BookingCard = ({ booking }) => (
    <div className="w-full bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200 hover:scale-[1.02]">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Booking Header */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div className="flex items-center gap-3">
              <BiReceipt className="text-blue-500 text-2xl" />
              <div>
                <h3 className="text-xl font-bold text-gray-900">Order #{booking.orderid}</h3>
                <p className="text-sm text-gray-500">
                  Booked on {new Date(booking.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div 
                className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(booking.orderStatus)} sm:cursor-help md:cursor-help sm:relative group`}
                onClick={() => window.innerWidth < 640 && setExpandedBikeStatus(prev => ({ ...prev, [booking._id]: !prev[booking._id] }))}
                title="View individual bike statuses"
              >
                {getStatusIcon(booking.orderStatus)}
                {booking.orderStatus}
                
                {/* Mobile Arrow - Only visible on small screens */}
                <span className="text-xs ml-1 sm:hidden">
                  {expandedBikeStatus[booking._id] ? '▲' : '▼'}
                </span>
                
                {/* Desktop Hover Tooltip - Only visible on medium screens and above */}
                <div className="invisible group-hover:visible absolute top-full left-0 mt-2 bg-black text-white text-xs rounded p-2 whitespace-nowrap z-10 shadow-lg hidden sm:block">
                  <div className="font-semibold mb-1">Individual Bike Statuses:</div>
                  {booking.bikes && booking.bikes.map((bikeItem, idx) => (
                    <div key={idx} className="flex items-center gap-1 py-0.5">
                      {getStatusIcon(bikeItem.bikeStatus || 'pending')}
                      <span className="truncate max-w-32">{bikeItem.bike?.bikeName || 'Unknown Bike'}</span>
                      <span className="text-gray-300">:</span>
                      <span className="capitalize">{bikeItem.bikeStatus || 'pending'}</span>
                    </div>
                  ))}
                  <div className="absolute bottom-full left-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-black"></div>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(booking.paymentStatus)}`}>
                {getPaymentStatusIcon(booking.paymentStatus)}
                {booking.paymentStatus}
              </div>
            </div>
            
            {/* Mobile Expandable Section - Only visible on small screens */}
            {expandedBikeStatus[booking._id] && (
              <div className="mt-3 p-3 bg-gray-100 rounded-lg border border-gray-200 sm:hidden">
                <div className="text-xs font-semibold text-gray-700 mb-2">Individual Bike Statuses:</div>
                <div className="space-y-2">
                  {booking.bikes && booking.bikes.map((bikeItem, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 py-1">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {getStatusIcon(bikeItem.bikeStatus || 'pending')}
                        <span className="text-xs text-gray-800 truncate font-medium">{bikeItem.bike?.bikeName || 'Unknown Bike'}</span>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(bikeItem.bikeStatus || 'pending')}`}>
                        {bikeItem.bikeStatus || 'pending'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Rental Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FaCalendarAlt className="text-blue-500" />
              <div>
                <p className="font-medium">Start Date</p>
                <p>{new Date(booking.startDate).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FaCalendarAlt className="text-red-500" />
              <div>
                <p className="font-medium">End Date</p>
                <p>{new Date(booking.endDate).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FaMotorcycle className="text-green-500" />
              <div>
                <p className="font-medium">Duration</p>
                <p>{booking.totalDays} day{booking.totalDays > 1 ? 's' : ''}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FaMoneyBillWave className="text-yellow-500" />
              <div>
                <p className="font-medium">Subtotal</p>
                <p>Rs. {booking.totalAmount.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FaMoneyBillWave className="text-blue-500" />
              <div>
                <p className="font-medium">Service Fee</p>
                <p>Rs. {(booking.serviceFee || 0).toFixed(2)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FaMoneyBillWave className="text-green-500" />
              <div>
                <p className="font-medium">Final Total</p>
                <p className="font-bold text-lg">Rs. {(booking.finalTotal || booking.totalAmount).toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Bikes List */}
          <div>
            <p className="font-medium text-gray-700 mb-2">
              Bikes ({booking.totalBikes} bike{booking.totalBikes > 1 ? 's' : ''})
            </p>
            <div className="space-y-2">
              {booking.bikes.map((bikeItem, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 flex-shrink-0">
                    <img 
                      src={bikeItem.bike?.images?.[0] || "https://via.placeholder.com/64x64?text=Bike"} 
                      alt={bikeItem.bike?.bikeName || 'Unknown Bike'}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{bikeItem.bike?.bikeName || 'Unknown Bike'}</h4>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <span>Type: {bikeItem.bike?.bikeType || 'Unknown'}</span>
                      <span>Qty: {bikeItem.quantity}</span>
                      {bikeItem.rentalDays && (
                        <span>Duration: {bikeItem.rentalDays} day{bikeItem.rentalDays > 1 ? 's' : ''}</span>
                      )}
                      <span>Rs. {bikeItem.pricePerDay}/day</span>
                      <span className="font-medium text-blue-600">
                        Subtotal: Rs. {bikeItem.subtotal.toFixed(2)}
                      </span>
                    </div>
                    
                    {/* Location Information */}
                    {(bikeItem.bike?.city || bikeItem.bike?.mapUrl) && (
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-1">
                        {bikeItem.bike?.city && (
                          <div className="flex items-center gap-1">
                            <FaMapMarkerAlt className="text-red-500" size={12} />
                            <span>Location: {bikeItem.bike.city}</span>
                          </div>
                        )}
                        {bikeItem.bike?.mapUrl && (
                          <a
                            href={bikeItem.bike.mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 hover:text-blue-800 rounded-full transition-colors duration-200 text-xs font-medium"
                          >
                            <FaExternalLinkAlt size={10} />
                            View on Map
                          </a>
                        )}
                      </div>
                    )}
                    {bikeItem.startDate && bikeItem.endDate && (
                      <div className="mt-1 text-xs text-gray-500">
                        <span>Rental: {new Date(bikeItem.startDate).toLocaleDateString()} - {new Date(bikeItem.endDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vendor Information */}
          {booking.vendors && booking.vendors.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="font-medium text-gray-700 mb-2">Vendor Information</p>
              <div className="space-y-3">
                {booking.vendors.map((vendor, index) => {
                  // Filter bikes belonging to this vendor
                  const vendorBikes = booking.bikes.filter(bikeItem => 
                    bikeItem.vendor && bikeItem.vendor._id === vendor._id
                  );
                  
                  return (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-2">
                          <FaUser className="text-gray-500 flex-shrink-0" size={14} />
                          <span className="font-medium">{vendor.firstname} {vendor.lastname}</span>
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <FaEnvelope className="text-gray-500 flex-shrink-0" size={14} />
                          <span className="truncate">{vendor.email}</span>
                        </div>
                        {vendor.phone && (
                          <div className="flex items-center gap-2">
                            <FaPhone className="text-gray-500 flex-shrink-0" size={14} />
                            <span>{vendor.phone}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Vendor's Bikes */}
                      {vendorBikes.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="text-xs font-medium text-gray-600 mb-1">
                            Bikes from this vendor:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {vendorBikes.map((bikeItem, bikeIndex) => (
                              <span 
                                key={bikeIndex} 
                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                <FaMotorcycle size={10} />
                                {bikeItem.bike?.bikeName || 'Unknown Bike'}
                                {bikeItem.quantity > 1 && (
                                  <span className="text-blue-600 font-medium">x{bikeItem.quantity}</span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-100px)]">
        <Loader />
        <p className="text-lg text-gray-600">Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-80px)] bg-[var(--main-background)] overflow-y-auto scrollbar-hide"
         style={{
           scrollbarWidth: 'none', /* Firefox */
           msOverflowStyle: 'none', /* Internet Explorer 10+ */
         }}>
      <style>{`
        div::-webkit-scrollbar {
          display: none; /* Safari and Chrome */
        }
      `}</style>
      <div className="p-6">
        {/* Page Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <div className="text-sm text-gray-600">
              Total: {bookings.length} booking{bookings.length !== 1 ? 's' : ''} | 
              Showing: {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Search Orders</label>
                <input
                  type="text"
                  placeholder="Order ID or bike name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Order Status Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Order Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  {getOrderStatuses().map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* Payment Date Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Payment Date</label>
                <input
                  type="date"
                  value={selectedPaymentDate}
                  onChange={(e) => setSelectedPaymentDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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

        {/* Bookings List */}
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
              <button 
                onClick={fetchBookings}
                className="mt-2 text-red-600 hover:text-red-800 underline"
              >
                Try Again
              </button>
            </div>
          )}

          {filteredBookings.length === 0 && bookings.length > 0 && !loading && !error ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings match your search criteria</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search terms or clear the filters</p>
                <button 
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors duration-200"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          ) : bookings.length === 0 && !loading && !error ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <BiReceipt className="mx-auto text-6xl text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-600 mb-6">Start by finding and renting your first bike</p>
              <Link 
                to="/find-bikes"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] font-semibold rounded-lg hover:bg-[var(--button-primary-hover)] transition-colors duration-200"
              >
                <FaMotorcycle size={20} /> Find Bikes to Rent
              </Link>
            </div>
          ) : (
            <div className="space-y-6 pb-24">
              {filteredBookings.map((booking) => (
                <BookingCard key={booking._id} booking={booking} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}