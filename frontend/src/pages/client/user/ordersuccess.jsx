import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaBicycle, FaCalendarAlt, FaReceipt, FaPaypal, FaShareAlt, FaFilePdf, FaFileWord, FaWhatsapp, FaFacebook } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { MdEmail } from 'react-icons/md';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';

export default function OrderSuccess() {
    const location = useLocation();
    const navigate = useNavigate();
    const order = location.state?.order;

    // Fallback if user navigates here directly
    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--main-background)]">
                <div className="text-center space-y-4">
                    <p className="text-gray-500 text-lg">No order data found.</p>
                    <button
                        onClick={() => navigate('/find-bikes')}
                        className="px-6 py-2 rounded-lg text-white font-semibold"
                        style={{ background: 'var(--primary-orange)' }}
                    >
                        Browse Bikes
                    </button>
                </div>
            </div>
        );
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const formatCurrency = (amount) =>
        `Rs. ${Number(amount || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const statusColor = (status) => {
        const map = {
            paid: 'bg-green-100 text-green-700 border-green-300',
            pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
            failed: 'bg-red-100 text-red-700 border-red-300',
            confirmed: 'bg-blue-100 text-blue-700 border-blue-300',
        };
        return map[status] || 'bg-gray-100 text-gray-600 border-gray-300';
    };

    const shareText = `My bike rental order ${order.orderid} is confirmed. Total: ${formatCurrency(order.finalTotal)}. Rental: ${formatDate(order.startDate)} to ${formatDate(order.endDate)}.`;
    const shareUrl = `${window.location.origin}/my-bookings`;

    const openShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: `Order ${order.orderid}`,
                    text: shareText,
                    url: shareUrl
                });
                return;
            }

            await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
            toast.success('Order details copied to clipboard');
        } catch (error) {
            if (error?.name !== 'AbortError') {
                toast.error('Unable to share right now');
            }
        }
    };

    const shareToSocial = (platform) => {
        const encodedText = encodeURIComponent(shareText);
        const encodedUrl = encodeURIComponent(shareUrl);
        const links = {
            whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
            x: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
        };

        const targetUrl = links[platform];
        if (targetUrl) {
            window.open(targetUrl, '_blank', 'noopener,noreferrer');
        }
    };

    const downloadAsDoc = () => {
        const docContent = `
           <!DOCTYPE html>
<html>
<head>
    <title>Order ${order.orderid}</title>
    <style>
        /* Base Reset & Typography */
        body {
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f3f4f6;
            margin: 0;
            padding: 40px 20px;
            color: #374151;
            line-height: 1.6;
        }

        /* Main Container */
        .receipt-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            overflow: hidden;
        }

        /* Header Segment */
        .header {
            background-color: #10b981; /* Vibrant eco-friendly green */
            color: #ffffff;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
            letter-spacing: 0.5px;
        }
        .header p {
            margin: 5px 0 0;
            color: #d1fae5;
            font-size: 14px;
        }

        /* Content Sections */
        .content {
            padding: 30px;
        }
        .section-title {
            font-size: 12px;
            text-transform: uppercase;
            color: #6b7280;
            font-weight: 700;
            letter-spacing: 1px;
            margin-bottom: 15px;
            border-bottom: 2px solid #f3f4f6;
            padding-bottom: 5px;
        }

        /* Flexbox Data Rows */
        .row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            font-size: 15px;
        }
        .row .label {
            color: #6b7280;
        }
        .row .value {
            font-weight: 500;
            color: #111827;
            text-align: right;
        }

        /* Status Badges */
        .badge {
            background-color: #e0e7ff;
            color: #3730a3;
            padding: 4px 10px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 600;
            text-transform: capitalize;
        }

        /* Financial Breakdown */
        .summary-box {
            background-color: #f9fafb;
            border-radius: 8px;
            padding: 20px;
            margin-top: 25px;
        }
        .summary-box .row.divider {
            border-top: 1px solid #e5e7eb;
            padding-top: 12px;
            margin-top: 8px;
        }
        .summary-box .row.total {
            font-size: 18px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 0;
        }

        /* Footer */
        .footer {
            text-align: center;
            padding: 20px;
            background-color: #f9fafb;
            color: #9ca3af;
            font-size: 13px;
            border-top: 1px solid #e5e7eb;
        }
    </style>
</head>
<body>

    <div class="receipt-container">
        <div class="header">
            <h1>Smart Bike Rental</h1>
            <p>Order Confirmation</p>
        </div>

        <div class="content">
            
            <div class="section-title">Order Details</div>
            <div class="row">
                <span class="label">Order ID</span>
                <span class="value">#${order.orderid}</span>
            </div>
            <div class="row">
                <span class="label">Payment Status</span>
                <span class="value"><span class="badge">${order.paymentStatus}</span></span>
            </div>
            <div class="row">
                <span class="label">Order Status</span>
                <span class="value">${order.orderStatus}</span>
            </div>
            <div class="row">
                <span class="label">Payment Method</span>
                <span class="value">${order.paymentMethod}</span>
            </div>

            <br>

            <div class="section-title">Rental Information</div>
            <div class="row">
                <span class="label">Duration</span>
                <span class="value">${formatDate(order.startDate)} — ${formatDate(order.endDate)}</span>
            </div>
            <div class="row">
                <span class="label">Total Days</span>
                <span class="value">${order.totalDays} Days</span>
            </div>

            <div class="summary-box">
                <div class="row">
                    <span class="label">Subtotal</span>
                    <span class="value">${formatCurrency(order.totalAmount)}</span>
                </div>
                <div class="row">
                    <span class="label">Service Fee</span>
                    <span class="value">${formatCurrency(order.serviceFee)}</span>
                </div>
                <div class="row divider total">
                    <span class="label" style="color: #111827;">Final Total</span>
                    <span class="value">${formatCurrency(order.finalTotal)}</span>
                </div>
            </div>

        </div>

        <div class="footer">
            Thank you for riding with us! Have a safe and wonderful trip.
        </div>
    </div>

</body>
</html>
        `;

        const blob = new Blob([docContent], { type: 'application/msword' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `order-${order.orderid}.doc`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(link.href);
    };

    const downloadAsPdf = () => {
        const doc = new jsPDF();
        const startY = 18;
        let y = startY;

        doc.setFontSize(18);
        doc.text('RideLanka - Order Confirmation', 14, y);
        y += 10;

        doc.setFontSize(11);
        const lines = [
            `Order ID: ${order.orderid || 'N/A'}`,
            `Payment Status: ${order.paymentStatus || 'N/A'}`,
            `Order Status: ${order.orderStatus || 'N/A'}`,
            `Payment Method: ${order.paymentMethod || 'N/A'}`,
            `Rental: ${formatDate(order.startDate)} - ${formatDate(order.endDate)}`,
            `Total Days: ${order.totalDays || 0}`,
            `Subtotal: ${formatCurrency(order.totalAmount)}`,
            `Service Fee: ${formatCurrency(order.serviceFee)}`,
            `Final Total: ${formatCurrency(order.finalTotal)}`,
            '',
            'Thank you for riding with us.'
        ];

        lines.forEach((line) => {
            doc.text(line, 14, y);
            y += 8;
        });

        doc.save(`order-${order.orderid || 'receipt'}.pdf`);
        toast.success('PDF downloaded successfully.');
    };

    return (
        <div className="min-h-screen bg-[var(--main-background)] py-10 px-4 ">
            <div className="max-w-2xl mx-auto space-y-6 border border-gray-200 rounded-2xl bg-white p-6">

                {/* ── Success Banner ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-green-200 p-8 text-center space-y-3">
                    <div className="flex justify-center">
                        <FaCheckCircle className="text-green-500" style={{ fontSize: '64px' }} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Order Placed Successfully!</h1>
                    <p className="text-gray-500 text-sm">
                        Thank you for your booking. Your order confirmation is below.
                    </p>
                    <div className="inline-block bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Order ID</span>
                        <p className="text-base font-mono font-bold text-gray-800">{order.orderid}</p>
                    </div>
                </div>

                {/* ── Status Badges ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Status
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        <div className={`px-3 py-1 rounded-full border text-xs font-semibold capitalize ${statusColor(order.paymentStatus)}`}>
                            Payment: {order.paymentStatus}
                        </div>
                        <div className={`px-3 py-1 rounded-full border text-xs font-semibold capitalize ${statusColor(order.orderStatus)}`}>
                            Order: {order.orderStatus}
                        </div>
                        {order.paymentMethod === 'paypal' && (
                            <div className="px-3 py-1 rounded-full border text-xs font-semibold bg-blue-50 text-blue-700 border-blue-300 flex items-center gap-1">
                                <FaPaypal /> PayPal
                            </div>
                        )}
                    </div>
                    {order.paypalOrderId && (
                        <p className="text-xs text-gray-400 mt-2 font-mono">
                            PayPal Order: {order.paypalOrderId}
                        </p>
                    )}
                </div>

                {/* ── Rental Dates ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <FaCalendarAlt className="text-orange-400" /> Rental Period
                    </h2>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-xs text-gray-400">Start Date</p>
                            <p className="text-sm font-semibold text-gray-800">{formatDate(order.startDate)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">End Date</p>
                            <p className="text-sm font-semibold text-gray-800">{formatDate(order.endDate)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Total Days</p>
                            <p className="text-sm font-semibold text-gray-800">{order.totalDays} day{order.totalDays !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                </div>

                {/* ── Bikes Ordered ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                        <FaBicycle className="text-orange-400" /> Bikes Booked ({order.bikes?.length || 0})
                    </h2>
                    {order.bikes?.map((item, idx) => (
                        <div key={idx} className="flex gap-4 items-start p-3 rounded-xl bg-gray-50 border border-gray-100">
                            {/* Bike image */}
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                                {item.bike?.images?.[0] ? (
                                    <img
                                        src={item.bike.images[0]}
                                        alt={item.bike.bikeName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <FaBicycle className="text-gray-400 text-2xl" />
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800 text-sm truncate">
                                    {item.bike?.bikeName || 'Bike'}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">{item.bike?.bikeType || ''}</p>
                                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                                    <span>{item.rentalDays} day{item.rentalDays !== 1 ? 's' : ''} × {formatCurrency(item.pricePerDay)}/day</span>
                                    {item.vendor?.firstname && (
                                        <span className="text-gray-400">
                                            Vendor: {item.vendor.firstname} {item.vendor.lastname}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Subtotal */}
                            <div className="text-right flex-shrink-0">
                                <p className="text-sm font-bold text-gray-900">{formatCurrency(item.subtotal)}</p>
                                <span className={`text-xs capitalize px-2 py-0.5 rounded-full border ${statusColor(item.bikeStatus)}`}>
                                    {item.bikeStatus}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Pricing Summary ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <FaReceipt className="text-orange-400" /> Payment Summary
                    </h2>
                    <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>{formatCurrency(order.totalAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Service Fee (10%)</span>
                            <span>{formatCurrency(order.serviceFee)}</span>
                        </div>
                        <div className="border-t border-gray-100 my-2" />
                        <div className="flex justify-between font-bold text-gray-900 text-base">
                            <span>Total Paid</span>
                            <span>{formatCurrency(order.finalTotal)}</span>
                        </div>
                    </div>
                </div>

                {/* ── Contact Note ── */}
                {order.user?.email && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3 text-sm text-blue-700">
                        <MdEmail className="text-blue-400 mt-0.5 flex-shrink-0 text-lg" />
                        <span>
                            A confirmation has been sent to <strong>{order.user.email}</strong>.
                            You can track your booking in <strong>My Bookings</strong>.
                        </span>
                    </div>
                )}

                {/* ── Action Buttons ── */}
                <div className="flex flex-col sm:flex-row gap-3 pb-6">
                    <button
                        onClick={() => navigate('/my-bookings')}
                        className="flex-1 py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90"
                        style={{ background: 'var(--primary-orange)' }}
                    >
                        View My Bookings
                    </button>
                    <button
                        onClick={() => navigate('/find-bikes')}
                        className="flex-1 py-3 rounded-xl font-semibold text-sm border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                        Continue Shopping
                    </button>
                </div>

                {/* ── Share & Download ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Share or Download</h2>
                        <button
                            onClick={openShare}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            <FaShareAlt /> Share
                        </button>
                    </div>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                            onClick={() => shareToSocial('whatsapp')}
                            className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 text-sm font-semibold"
                        >
                            <FaWhatsapp /> WhatsApp
                        </button>
                        <button
                            onClick={() => shareToSocial('facebook')}
                            className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 text-sm font-semibold"
                        >
                            <FaFacebook /> Facebook
                        </button>
                        <button
                            onClick={() => shareToSocial('x')}
                            className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 text-sm font-semibold"
                        >
                            <FaXTwitter /> X
                        </button>
                        <button
                            onClick={downloadAsPdf}
                            className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 text-sm font-semibold"
                        >
                            <FaFilePdf /> Download PDF
                        </button>
                        <button
                            onClick={downloadAsDoc}
                            className="sm:col-span-2 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 text-sm font-semibold"
                        >
                            <FaFileWord /> Download DOC
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
