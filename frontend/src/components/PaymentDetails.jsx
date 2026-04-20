import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FaCheckCircle } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';

function isProvided(value) {
    const normalized = String(value || '').trim().toLowerCase();
    return Boolean(normalized) && normalized !== 'not provided' && normalized !== 'n/a';
}

function isProfileComplete(profile) {
    const requiredFields = ['firstname', 'lastname', 'email', 'phone', 'address', 'city'];
    return requiredFields.every((field) => isProvided(profile?.[field]));
}

export default function PaymentDetails({
    paymentMethod,
    setPaymentMethod,
    onPaymentDataChange,
    totalAmount
}) {
    const navigate = useNavigate();
    const location = useLocation();
    const initialized = useRef(false);
    const paypalButtonsRef = useRef(null);

    const [paypalClientId, setPaypalClientId] = useState('');
    const [paypalCurrency, setPaypalCurrency] = useState('USD');
    const [baseCurrency, setBaseCurrency] = useState('LKR');
    const [lkrPerUsd, setLkrPerUsd] = useState(300);
    const [sdkReady, setSdkReady] = useState(false);

    useEffect(() => {
        if (!initialized.current) {
            if (setPaymentMethod && !paymentMethod) {
                setPaymentMethod('paypal');
            }
            initialized.current = true;
        }
    }, [paymentMethod, setPaymentMethod]);

    useEffect(() => {
        if (!onPaymentDataChange) {
            return;
        }

        // PayPal is the only method — reset to incomplete until capture succeeds
        onPaymentDataChange({
            paymentMethod: 'paypal',
            isCompleted: false
        });
    }, [paymentMethod, onPaymentDataChange]);

    useEffect(() => {
        if (paymentMethod !== 'paypal') {
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Please login to use PayPal');
            return;
        }

        const loadClientIdAndSdk = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/orders/paypal/client-id`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to load PayPal settings');
                }

                const clientId = data.clientId;
                const currency = data.currency || 'USD';
                setPaypalClientId(clientId);
                setPaypalCurrency(currency);
                setBaseCurrency(data.baseCurrency || 'LKR');
                setLkrPerUsd(Number(data.lkrPerUsd) || 300);

                const scriptId = 'paypal-sdk-script';
                const existingScript = document.getElementById(scriptId);

                if (window.paypal && existingScript) {
                    setSdkReady(true);
                    return;
                }

                if (existingScript) {
                    existingScript.remove();
                }

                const script = document.createElement('script');
                script.id = scriptId;
                script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&intent=capture`;
                script.async = true;
                script.onload = () => setSdkReady(true);
                script.onerror = () => {
                    setSdkReady(false);
                    toast.error('Failed to load PayPal SDK');
                };
                document.body.appendChild(script);
            } catch (error) {
                console.error('Error loading PayPal SDK:', error);
                toast.error(error.message || 'Unable to initialize PayPal');
            }
        };

        loadClientIdAndSdk();
    }, [paymentMethod]);

    useEffect(() => {
        if (paymentMethod !== 'paypal' || !sdkReady || !window.paypal || !paypalButtonsRef.current) {
            return;
        }

        paypalButtonsRef.current.innerHTML = '';

        window.paypal.Buttons({
            style: {
                shape: 'rect',
                layout: 'vertical',
                color: 'gold',
                label: 'paypal'
            },
            createOrder: async () => {
                const token = localStorage.getItem('token');

                const profileResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!profileResponse.ok) {
                    throw new Error('Please login and complete your profile before using PayPal');
                }

                const profileData = await profileResponse.json();
                if (!isProfileComplete(profileData)) {
                    onPaymentDataChange?.({
                        paymentMethod: 'paypal',
                        isCompleted: false
                    });

                    toast.error('Please complete your profile details before purchasing');
                    navigate('/profile?returnTo=/checkout', {
                        state: { returnTo: `${location.pathname}${location.search || ''}` }
                    });
                    throw new Error('PROFILE_INCOMPLETE_REDIRECT');
                }

                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/orders/paypal/create-order`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ amount: totalAmount })
                });

                const data = await response.json();
                if (!response.ok || !data.paypalOrderId) {
                    const errorMsg = data?.description || data?.message || 'Failed to create PayPal order';
                    throw new Error(errorMsg);
                }

                return data.paypalOrderId;
            },
            onApprove: async (data) => {
                const token = localStorage.getItem('token');
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/orders/paypal/capture-order`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ paypalOrderId: data.orderID })
                });

                const captureData = await response.json();
                if (!response.ok) {
                    const errorMsg = captureData?.description || captureData?.message || 'Failed to capture PayPal payment';
                    throw new Error(errorMsg);
                }

                onPaymentDataChange?.({
                    paymentMethod: 'paypal',
                    isCompleted: true,
                    paypalOrderId: captureData.paypalOrderId,
                    paypalCaptureId: captureData.paypalCaptureId,
                    payerEmail: captureData.payerEmail
                });

                toast.success('PayPal payment completed. You can now place your order.');
            },
            onCancel: () => {
                onPaymentDataChange?.({
                    paymentMethod: 'paypal',
                    isCompleted: false
                });
                toast.error('PayPal payment was cancelled');
            },
            onError: (error) => {
                console.error('PayPal button error:', error);
                onPaymentDataChange?.({
                    paymentMethod: 'paypal',
                    isCompleted: false
                });
                if (error?.message === 'PROFILE_INCOMPLETE_REDIRECT') {
                    return;
                }
                toast.error(error?.message || 'PayPal payment failed');
            }
        }).render(paypalButtonsRef.current);
    }, [paymentMethod, sdkReady, totalAmount, onPaymentDataChange]);

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Payment Details</h2>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method *
                </label>
                <select
                    value={paymentMethod || 'paypal'}
                    onChange={(e) => setPaymentMethod?.(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none"
                    style={{ borderColor: 'var(--section-divider)' }}
                >
                    <option value="paypal">PayPal</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                    Pay securely via PayPal.
                </p>
            </div>

            {paymentMethod === 'paypal' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
                    <div className="text-sm text-yellow-800">
                        Complete PayPal payment first, then click <strong>Place Order</strong>.
                    </div>
                    {paypalClientId ? (
                        <div className="text-xs text-gray-600">
                            PayPal currency: <strong>{paypalCurrency}</strong>
                        </div>
                    ) : null}
                    {paypalCurrency === 'USD' && (
                        <div className="text-xs text-gray-600">
                            Checkout total is in {baseCurrency}. PayPal charges are converted to USD at approx 1 USD = {lkrPerUsd} {baseCurrency}.
                        </div>
                    )}
                    {!sdkReady && (
                        <div className="text-sm text-gray-600">Loading PayPal...</div>
                    )}
                    <div ref={paypalButtonsRef}></div>
                </div>
            )}
        </div>
    );
}
