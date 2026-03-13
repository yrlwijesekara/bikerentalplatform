
import React, { useState, useEffect, useCallback } from 'react';

import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCartTotal, updateCartRentalDays, getCart } from '../../../utils/cart.js';
import { FaTrash} from 'react-icons/fa';
import { FaOpencart } from 'react-icons/fa';
import { CiLocationOn } from 'react-icons/ci';
import Loader from '../../../components/loader';
import PaymentDetails from '../../../components/PaymentDetails.jsx';




export default function Checkout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState(location.state.items || []);
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [paymentData, setPaymentData] = useState({
        paymentMethod: 'card'
    });
    const [isPaymentComplete, setIsPaymentComplete] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderPaymentStatus, setOrderPaymentStatus] = useState(null);
    if(location.state.items == null) {
        toast.error('please add items to cart before checkout');
        navigate('/find-bikes');
    }

    function gettotal() {
        let total = 0;
        cartItems.forEach(item => {
            total += item.price * item.rentalDays;
        });
        return total;
    }

    // Calculate totals for checkout
    const cartTotal = gettotal();
    const serviceFee = cartTotal * 0.10; // 10% service fee
    const finalTotal = cartTotal + serviceFee;

    // Calculate rental period info for display
    const getRentalPeriodInfo = () => {
        if (cartItems.length === 0) return { minDays: 1, maxDays: 1, startDate: new Date(), endDate: new Date() };
        
        const rentalDays = cartItems.map(item => item.rentalDays || 1);
        const minDays = Math.min(...rentalDays);
        const maxDays = Math.max(...rentalDays);
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + maxDays);
        
        return { minDays, maxDays, startDate, endDate };
    };
    
    const rentalInfo = getRentalPeriodInfo();

    
    const loadCartItems = () => {
        try {
            const items = getCart();
            setCartItems(items);
        } catch (error) {
            console.error('Error loading cart:', error);
            toast.error('Failed to load cart items');
        } finally {
            setLoading(false);
        }
    };

    // Update rental days for a specific item
    const handleRentalDaysChange = (productId, newRentalDays) => {
        try {
            const updatedCart = updateCartRentalDays(productId, newRentalDays);
            setCartItems(updatedCart);
            if (newRentalDays <= 0) {
                toast.success('Item removed from cart');
            } else {
                toast.success('Rental days updated');
            }
        } catch (error) {
            console.error('Error updating rental days:', error);
            toast.error('Failed to update rental days');
        }
    };

    const incrementRentalDays = (item) => {
        const newRentalDays = (item.rentalDays || 1) + 1;
        if (newRentalDays <= 30) {
            handleRentalDaysChange(item.productId, newRentalDays);
        }
    };

    const decrementRentalDays = (item) => {
        const newRentalDays = (item.rentalDays || 1) - 1;
        if (newRentalDays >= 1) {
            handleRentalDaysChange(item.productId, newRentalDays);
        }
    };

    const handleDirectRentalDaysChange = (item, value) => {
        const newRentalDays = Math.max(1, Math.min(30, parseInt(value) || 1));
        handleRentalDaysChange(item.productId, newRentalDays);
    };

    // Handle payment data changes from PaymentDetails component
    const handlePaymentDataChange = useCallback((data) => {
        setPaymentData(data);

        // For card, details are instantly complete. For PayPal, completion is set after capture.
        setIsPaymentComplete(Boolean(data?.isCompleted));
    }, []);

    // Create order function
    const handlePlaceOrder = async () => {
        try {
            // Validate inputs
            if (cartItems.length === 0) {
                toast.error('Your cart is empty');
                return;
            }

            if (!paymentData?.paymentMethod) {
                toast.error('Please select a payment method');
                return;
            }

            if (paymentData.paymentMethod === 'paypal' && !paymentData?.paypalOrderId) {
                toast.error('Complete PayPal payment before placing the order');
                return;
            }

            setLoading(true);

            // Get token for authentication
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to place order');
                navigate('/login');
                return;
            }

            // Format cart items for API
            const bikes = cartItems.map(item => ({
                bikeId: item.productId,
                quantity: 1, // For bike rentals, quantity is always 1
                pricePerDay: item.price,
                rentalDays: item.rentalDays || 1
            }));

            // Calculate dates from rental days
            const startDate = new Date();
            
            // Create order data
            const orderData = {
                bikes,
                startDate: startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
                paymentMethod: paymentData.paymentMethod,
                paypalOrderId: paymentData.paypalOrderId || null,
                paypalCaptureId: paymentData.paypalCaptureId || null
            };

            // Call order API
            const response = await fetch( 
                (import.meta.env.VITE_BACKEND_URL) + "/orders/",
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                body: JSON.stringify(orderData)
            });

            let result;
            try {
                result = await response.json();
            } catch (jsonError) {
                console.error('Failed to parse JSON response:', jsonError);
                throw new Error('Server error - invalid response format');
            }

            if (response.ok) {
                setOrderSuccess(true);
                
                // Handle different payment statuses
                const order = result.order;
                const paymentStatus = order.paymentStatus;
                setOrderPaymentStatus(paymentStatus);
                
                if (paymentStatus === "paid") {
                    toast.success('Order created successfully! Your rental has started.');
                } else if (paymentStatus === "pending") {
                    toast.success('Order created successfully! Rental will start after payment verification.');
                } else {
                    toast.success('Order created successfully!');
                }
                
                // Show success message for a moment before navigating
                setTimeout(() => {
                    // Clear cart after successful order
                    localStorage.setItem('cart', '[]');
                    window.dispatchEvent(new Event('cartUpdated'));
                    
                    // Navigate to order confirmation or orders page
                    navigate('/client-page');
                }, 3000); // Extended timeout for users to read payment status
            } else {
                toast.error(result.message || 'Failed to create order');
            }

        } catch (error) {
            console.error('Error placing order:', error);
            
            if (error.message === 'Server error - invalid response format') {
                toast.error('Backend server is not running or wrong port. Check if backend is running on port 5000.');
            } else if (error.message.includes('fetch')) {
                toast.error('Cannot connect to server. Make sure the backend is running on port 5000.');
            } else {
                toast.error('Failed to place order. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

 
    




    

    

    

  

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                        <Loader />
                      </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-6xl" style={{ backgroundColor: 'var(--main-background)' }}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="flex items-center gap-3 mb-4 sm:mb-0">
                    <FaOpencart className="h-6 w-6" style={{ color: 'var(--brand-primary)' }} />
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Checkout</h1>
                    <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--button-primary-disabled)', color: 'var(--brand-primary)' }}>
                        {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                    </span>
                </div>
            </div>

            {cartItems.length === 0 ? (
                /* Empty Cart State */
                <div className="text-center py-16">
                    <FaOpencart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
                    <h2 className="text-2xl font-semibold text-gray-600 mb-4">Your cart is empty</h2>
                    <p className="text-gray-500 mb-8">Discover our amazing bikes and start your adventure!</p>
                    <button
                        onClick={() => navigate('/find-bikes')}
                        className="font-semibold px-8 py-3 rounded-lg transition-colors duration-200 inline-flex items-center gap-2 text-white"
                        style={{ backgroundColor: 'var(--button-primary-bg)' }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = 'var(--button-primary-hover)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'var(--button-primary-bg)';
                        }}
                    >
                        <FaOpencart className="h-5 w-5" />
                        Start Shopping
                    </button>
                </div>
            ) : (
                /* Cart Items */
                <div className="flex flex-col xl:flex-row gap-8">
                    {/* Cart Items List */}
                    <div className="xl:w-2/3">
                        <div className="space-y-4">
                            {cartItems.map((item) => (
                                <div
                                    key={item.productId}
                                    className="rounded-lg shadow-md p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200"
                                    style={{ backgroundColor: 'var(--card-background)', boxShadow: '0 2px 8px var(--shadow-color)' }}
                                >
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        {/* Product Image */}
                                        <div className="w-full sm:w-32 h-32 flex-shrink-0">
                                            <img
                                                src={item.image || '/placeholder-bike.jpg'}
                                                alt={item.name}
                                                className="w-full h-32 object-cover rounded-md bg-gray-100" 
                                                onError={(e) => {
                                                    e.target.src = '/placeholder-bike.jpg';
                                                }}
                                            />
                                        </div>
                                        
                                        {/* Product Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">
                                                        {item.name || 'Unknown Bike'}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        {item.bikeType && <span className="inline-block bg-gray-100 px-2 py-1 rounded mr-2">{item.bikeType}</span>}
                                                        {item.city && <span className="text-gray-500 flex items-center gap-1 mt-1"><CiLocationOn className="h-4 w-4" /> {item.city}</span>}
                                                    </p>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-sm text-gray-500">Rental Days:</span>
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => decrementRentalDays(item)}
                                                                disabled={(item.rentalDays || 1) <= 1}
                                                                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 disabled:cursor-not-allowed"
                                                                style={{ 
                                                                    backgroundColor: (item.rentalDays || 1) <= 1 ? '#F0F0F0' : 'var(--button-primary-disabled)',
                                                                    color: (item.rentalDays || 1) <= 1 ? '#A0A0A0' : 'var(--brand-primary)'
                                                                }}
                                                            >
                                                                -
                                                            </button>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max="30"
                                                                value={item.rentalDays || 1}
                                                                onChange={(e) => handleDirectRentalDaysChange(item, e.target.value)}
                                                                className="w-16 px-2 py-1 text-center border border-gray-300 rounded text-sm font-medium focus:outline-none focus:ring-2"
                                                                style={{ 
                                                                    focusRingColor: 'var(--brand-primary)',
                                                                    borderColor: 'var(--section-divider)'
                                                                }}
                                                            />
                                                            <button
                                                                onClick={() => incrementRentalDays(item)}
                                                                disabled={(item.rentalDays || 1) >= 30}
                                                                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 disabled:cursor-not-allowed"
                                                                style={{ 
                                                                    backgroundColor: (item.rentalDays || 1) >= 30 ? '#F0F0F0' : 'var(--button-primary-disabled)',
                                                                    color: (item.rentalDays || 1) >= 30 ? '#A0A0A0' : 'var(--brand-primary)'
                                                                }}
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                        <span className="text-xs text-gray-400">days</span>
                                                    </div>
                                                </div>
                                                
                                                {/* Price and Actions */}
                                                <div className="flex flex-col items-end gap-3">
                                                    <div className="text-right">
                                                        <div className="text-xl font-bold" style={{ color: 'var(--brand-success)' }}>
                                                            Rs. {(item.price * (item.rentalDays || 1)).toFixed(2)}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            Rs. {item.price?.toFixed(2) || '0.00'} × {item.rentalDays || 1} day{(item.rentalDays || 1) > 1 ? 's' : ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Cart Summary */}
                    <div className="xl:w-1/3">
                        <div className="rounded-lg shadow-md p-6 border border-gray-200 sticky top-6" style={{ backgroundColor: 'var(--card-background)', boxShadow: '0 2px 8px var(--shadow-color)' }}>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Items ({cartItems.length}):</span>
                                    <span className="font-medium">Rs. {cartTotal.toFixed(2)}</span>
                                </div>
                                
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Service Fee (10%):</span>
                                    <span className="font-medium">Rs. {serviceFee.toFixed(2)}</span>
                                </div>
                                <div className="text-xs text-gray-500 italic">
                                    * A service fee is applied to cover platform maintenance and support. It helps us continue providing you with the best bike rental experience.
                                </div>
                                
                                <hr style={{ borderColor: 'var(--section-divider)' }} />
                                
                                <div className="flex justify-between text-lg font-semibold">
                                    <span>Total:</span>
                                    <span style={{ color: 'var(--brand-success)' }}>Rs. {finalTotal.toFixed(2)}</span>
                                </div>
                            </div>
                            
                            {/* Rental Period Info */}
                            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Rental Period</h3>
                                <div className="text-sm text-blue-800">
                                    <p><strong>Start Date:</strong> {rentalInfo.startDate.toLocaleDateString()} (Today)</p>
                                    <p><strong>Latest End Date:</strong> {rentalInfo.endDate.toLocaleDateString()}</p>
                                    <p><strong>Duration Range:</strong> 
                                        {rentalInfo.minDays === rentalInfo.maxDays 
                                            ? `${rentalInfo.maxDays} day${rentalInfo.maxDays > 1 ? 's' : ''}` 
                                            : `${rentalInfo.minDays}-${rentalInfo.maxDays} days`}
                                    </p>
                                </div>
                                    <p className="text-xs text-blue-600 mt-2">
                                        * Rental period will start after payment processing.
                                    </p>
                                </div>
                            
                            {/* Payment Details Component */}
                            <div className="mt-6">
                                <PaymentDetails 
                                    paymentMethod={paymentMethod}
                                    setPaymentMethod={setPaymentMethod}
                                    onPaymentDataChange={handlePaymentDataChange}
                                    totalAmount={finalTotal}
                                />
                            </div>
                            
                            {/* Order Success Indicator */}
                            {orderSuccess && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                                    <div className="flex items-center gap-2">
                                        <FaOpencart className="h-5 w-5 text-green-500" />
                                        <span className="text-green-700 font-medium">
                                            {orderPaymentStatus === "paid" ? "Rental Started Successfully!" : 
                                             orderPaymentStatus === "pending" ? "Order Placed - Pending Payment" :
                                             "Order Placed Successfully!"}
                                        </span>
                                    </div>
                                    <p className="text-sm text-green-600 mt-1">
                                        {orderPaymentStatus === "paid" ? "Your bikes are now reserved and rental period has begun." :
                                         orderPaymentStatus === "pending" ? "Your rental will begin once payment is verified." :
                                         "Redirecting to your orders page..."}
                                    </p>
                                    <div className="text-xs text-gray-600 mt-2">
                                        <p><strong>Rental Period:</strong> {rentalInfo.startDate.toLocaleDateString()} to {rentalInfo.endDate.toLocaleDateString()}</p>
                                        <p><strong>Status:</strong> {orderPaymentStatus === "paid" ? "Active" : "Pending Payment Verification"}</p>
                                    </div>
                                </div>
                            )}

                            {/* Progress Indicator */}
                            {!orderSuccess && (
                                <div className="bg-gray-50 p-3 rounded-lg mt-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Order Progress:</h4>
                                    <div className="space-y-1">
                                        <div className={`flex items-center gap-2 text-sm text-green-600`}>
                                            <FaOpencart className="h-3 w-3" />
                                            Cart items ready ({cartItems.length} bikes)
                                        </div>
                                        <div className={`flex items-center gap-2 text-sm ${isPaymentComplete ? 'text-green-600' : 'text-gray-500'}`}>
                                            {isPaymentComplete ? <FaOpencart className="h-3 w-3" /> : <div className="h-3 w-3 border border-gray-300 rounded-full"></div>}
                                            Complete payment details
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <button
                                onClick={handlePlaceOrder}
                                disabled={loading || !isPaymentComplete || orderSuccess}
                                className={`w-full font-semibold py-3 px-4 rounded-lg mt-6 transition-colors duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed ${
                                    orderSuccess ? 'bg-green-500 text-white' : 
                                    isPaymentComplete ? 'bg-blue-500 hover:bg-blue-600 text-white' : 
                                    'bg-gray-300 text-gray-500'
                                }`}
                            >
                                <FaOpencart className="h-5 w-5" />
                                {orderSuccess ? 
                                    (orderPaymentStatus === "paid" ? 'Rental Started!' : 
                                     orderPaymentStatus === "pending" ? 'Order Created - Pending Payment' : 
                                     'Order Placed Successfully!') :
                                 loading ? 'Processing...' : 
                                 !isPaymentComplete ? 'Complete Payment Details' :
                                 'Place Order'}
                            </button>
                            
                            <button
                                onClick={() => navigate('/find-bikes')}
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg mt-3 transition-colors duration-200"
                            >
                                Continue renting
                            </button>
                        </div>
                    </div>
                </div>
            )
            }
        </div>
    )
}