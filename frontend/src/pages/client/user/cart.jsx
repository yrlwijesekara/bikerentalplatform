
import React, { useState, useEffect } from 'react';
import { getCart, removeFromCart, getCartTotal, clearCart, updateCartRentalDays } from '../../../utils/cart';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FaTrash} from 'react-icons/fa';
import { FaOpencart } from 'react-icons/fa';
import { CiLocationOn } from 'react-icons/ci';
import Loader from '../../../components/loader';
import Footer from '../../../components/footer';



export default function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadCartItems();
        
        // Listen for cart updates
        const handleCartUpdate = () => {
            loadCartItems();
        };
        
        window.addEventListener('cartUpdated', handleCartUpdate);
        return () => {
            window.removeEventListener('cartUpdated', handleCartUpdate);
        };
    }, []);

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

    const handleUpdateRentalDays = (productId, newRentalDays) => {
        if (newRentalDays < 1) return;
        
        try {
            // Update ALL bikes in cart to have the same rental days
            cartItems.forEach(item => {
                updateCartRentalDays(item.productId, newRentalDays);
            });
            
            // Update local state
            setCartItems(prevItems => 
                prevItems.map(item => ({ ...item, rentalDays: newRentalDays }))
            );
            
            toast.success(`All bikes updated to ${newRentalDays} day${newRentalDays > 1 ? 's' : ''}`);
            // Dispatch event for navbar and total update
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (error) {
            console.error('Error updating rental days:', error);
            toast.error('Failed to update rental days');
        }
    };

    const handleRemoveItem = (productId, productName) => {
        try {
            removeFromCart(productId);
            setCartItems(prevItems => prevItems.filter(item => item.productId !== productId));
            toast.success(`${productName} removed from cart`);
            // Dispatch event for navbar update
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (error) {
            console.error('Error removing item:', error);
            toast.error('Failed to remove item');
        }
    };

    const handleClearCart = () => {
        try {
            clearCart();
            setCartItems([]);
            toast.success('Cart cleared successfully');
            // Dispatch event for navbar update
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (error) {
            console.error('Error clearing cart:', error);
            toast.error('Failed to clear cart');
        }
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            toast.error('Your cart is empty');
            return;
        }
        navigate('/checkout', { 
            state: { 
                items: cartItems,
                subtotal: cartTotal,
                serviceFee: serviceFee,
                total: finalTotal
            } 
        });
    };

    const cartTotal = getCartTotal();
    const serviceFee = cartTotal * 0.10; // 10% service fee
    const finalTotal = cartTotal + serviceFee;

    if (loading) {
        return (
           <div className="flex justify-center items-center min-h-[50vh]">
                       <Loader />
                     </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
        <div className="container mx-auto px-4 py-6 max-w-6xl" style={{ backgroundColor: 'var(--main-background)' }}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="flex items-center gap-3 mb-4 sm:mb-0">
                    <FaOpencart className="h-6 w-6" style={{ color: 'var(--brand-primary)' }} />
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Your Cart</h1>
                    <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--button-primary-disabled)', color: 'var(--brand-primary)' }}>
                        {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                    </span>
                </div>
                
                {cartItems.length > 0 && (
                    <button
                        onClick={handleClearCart}
                        className="font-medium text-sm px-4 py-2 border rounded-md transition-colors duration-200"
                        style={{ color: 'var(--brand-warning)', borderColor: 'var(--brand-warning)' }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#FFEAEA';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                        }}
                    >
                        Clear All
                    </button>
                )}
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
                                                        <span className="text-sm text-gray-500">Rental Days (All Items):</span>
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => handleUpdateRentalDays(item.productId, (item.rentalDays || 1) - 1)}
                                                                disabled={(item.rentalDays || 1) <= 1}
                                                                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 disabled:cursor-not-allowed"
                                                                style={{ 
                                                                    backgroundColor: (item.rentalDays || 1) <= 1 ? '#F0F0F0' : 'var(--button-primary-disabled)',
                                                                    color: (item.rentalDays || 1) <= 1 ? '#A0A0A0' : 'var(--brand-primary)'
                                                                }}
                                                                title="Decrease rental days for all bikes"
                                                            >
                                                                -
                                                            </button>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max="30"
                                                                value={item.rentalDays || 1}
                                                                onChange={(e) => {
                                                                    const days = parseInt(e.target.value);
                                                                    if (days >= 1 && days <= 30) {
                                                                        handleUpdateRentalDays(item.productId, days);
                                                                    }
                                                                }}
                                                                className="w-16 px-2 py-1 text-center border border-gray-300 rounded text-sm font-medium focus:outline-none focus:ring-2"
                                                                style={{ 
                                                                    focusRingColor: 'var(--brand-primary)',
                                                                    borderColor: 'var(--section-divider)'
                                                                }}
                                                                title="Set rental days for all bikes"
                                                            />
                                                            <button
                                                                onClick={() => handleUpdateRentalDays(item.productId, (item.rentalDays || 1) + 1)}
                                                                disabled={(item.rentalDays || 1) >= 30}
                                                                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 disabled:cursor-not-allowed"
                                                                style={{ 
                                                                    backgroundColor: (item.rentalDays || 1) >= 30 ? '#F0F0F0' : 'var(--button-primary-disabled)',
                                                                    color: (item.rentalDays || 1) >= 30 ? '#A0A0A0' : 'var(--brand-primary)'
                                                                }}
                                                                title="Increase rental days for all bikes"
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
                                                    
                                                    <button
                                                        onClick={() => handleRemoveItem(item.productId, item.name)}
                                                        className="p-2 rounded-md transition-colors duration-200 flex items-center gap-1"
                                                        style={{ 
                                                            backgroundColor: '#FFEAEA',
                                                            color: 'var(--brand-warning)'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.target.style.backgroundColor = '#FFD6D6';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.target.style.backgroundColor = '#FFEAEA';
                                                        }}
                                                        title="Remove from cart"
                                                    >
                                                        <FaTrash className="h-4 w-4" />
                                                        <span className="hidden sm:inline text-sm">Remove</span>
                                                    </button>
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
                            
                            <button
                                onClick={handleCheckout }
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
                                Proceed to Checkout
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
        <Footer />
        </div>
    );
}