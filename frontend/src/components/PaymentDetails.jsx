import React, { useEffect, useCallback, useRef } from 'react';
import { FaCheckCircle } from 'react-icons/fa';

export default function PaymentDetails({ 
    paymentMethod, 
    setPaymentMethod, 
    onPaymentDataChange,
    totalAmount 
}) {
    const initialized = useRef(false);

    // Initialize payment data only once when component mounts
    useEffect(() => {
        if (!initialized.current) {
            // Set payment method to card
            if (setPaymentMethod && paymentMethod !== 'card') {
                setPaymentMethod('card');
            }
            
            // Notify parent of payment data
            if (onPaymentDataChange) {
                onPaymentDataChange({
                    paymentMethod: 'card',
                    isCompleted: true
                });
            }
            
            initialized.current = true;
        }
    }, []); // Empty dependency array - only run once on mount

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Payment Details</h2>

            {/* Payment Method Selection - Only Card Available */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method *
                </label>
                <select
                    value="card"
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed focus:outline-none"
                    style={{ borderColor: 'var(--section-divider)' }}
                >
                    <option value="card">Credit/Debit Card</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                    Only card payments are currently supported.
                </p>
            </div>

            {/* Card Payment Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                    <FaCheckCircle className="h-5 w-5 text-blue-500" />
                    <span className="text-blue-700 font-medium">Card Payment Selected</span>
                </div>
                <p className="text-sm text-blue-600 mt-1">
                    Your payment of <strong>Rs. {totalAmount.toFixed(2)}</strong> will be processed securely when you place the order.
                </p>
            </div>
        </div>
    );
}