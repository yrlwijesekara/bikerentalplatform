
import React, { useState, useEffect } from 'react';

import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCartTotal } from '../../../utils/cart.js';
import { FaTrash} from 'react-icons/fa';
import { FaOpencart } from 'react-icons/fa';
import { CiLocationOn } from 'react-icons/ci';
import Loader from '../../../components/loader';




export default function Checkout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState(location.state.items || []);
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card');
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
                                                        <span className="text-sm font-medium text-gray-800">
                                                            {item.rentalDays || 1} day{(item.rentalDays || 1) > 1 ? 's' : ''}
                                                        </span>
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
                            
                            {/* Payment Method Selection */}
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Method
                                </label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    style={{ borderColor: 'var(--section-divider)' }}
                                >
                                    <option value="card">Credit/Debit Card</option>
                                    <option value="bank_slip">Bank Slip/online Bank</option>
                                </select>
                            </div>
                            
                            <button
                               
                                className="w-full text-white font-semibold py-3 px-4 rounded-lg mt-6 transition-colors duration-200 flex items-center justify-center gap-2"
                                style={{ backgroundColor: 'var(--button-primary-bg)' }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = 'var(--button-primary-hover)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'var(--button-primary-bg)';
                                }}
                            >
                                <FaOpencart className="h-5 w-5" />
                                Place order
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
            )}
        </div>
    );
}