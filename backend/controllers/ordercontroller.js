import Order from "../model/order.js";
import Product from "../model/product.js"; // Import as Product, not Bike
import User from "../model/user.js";


// Read PayPal config lazily so dotenv has time to populate process.env
function paypalConfig() {
    const lkrPerUsd = Number(process.env.PAYPAL_LKR_PER_USD || 300);
    return {
        baseUrl: process.env.PAYPAL_BASE_URL || "https://api-m.sandbox.paypal.com",
        clientId: process.env.PAYPAL_CLIENT_ID,
        clientSecret: process.env.PAYPAL_CLIENT_SECRET,
        currency: process.env.PAYPAL_CURRENCY || "USD",
        baseCurrency: "LKR",
        lkrPerUsd: Number.isFinite(lkrPerUsd) && lkrPerUsd > 0 ? lkrPerUsd : 300
    };
}

function convertFromLkr(amountLkr, targetCurrency, lkrPerUsd) {
    if (!Number.isFinite(amountLkr) || amountLkr <= 0) {
        throw new Error("Invalid amount in LKR");
    }

    if (targetCurrency === "LKR") {
        return Number(amountLkr.toFixed(2));
    }

    if (targetCurrency === "USD") {
        return Number((amountLkr / lkrPerUsd).toFixed(2));
    }

    throw new Error(`Unsupported PayPal currency conversion target: ${targetCurrency}`);
}

// Status transition validation function
function validateStatusTransition(currentStatus, newStatus) {
    // Define allowed transitions
    const allowedTransitions = {
        'pending': ['confirmed', 'cancelled'], 
        'confirmed': ['ongoing', 'cancelled'], 
        'ongoing': ['completed'], // Once started, can only be completed
        'completed': [], // Final state - no transitions allowed
        'cancelled': [] // Final state - no transitions allowed
    };

    // Same status is allowed (no change)
    if (currentStatus === newStatus) {
        return { valid: true };
    }

    // Check if transition is allowed
    const allowedNext = allowedTransitions[currentStatus.toLowerCase()] || [];
    
    if (!allowedNext.includes(newStatus.toLowerCase())) {
        // Generate helpful error message based on current status
        let message = '';
        
        switch (currentStatus.toLowerCase()) {
            case 'cancelled':
                message = `Cannot change status from 'Cancelled' to '${newStatus}'. Once cancelled, the booking cannot be modified.`;
                break;
            case 'completed':
                message = `Cannot change status from 'Completed' to '${newStatus}'. The booking is already completed.`;
                break;
            case 'confirmed':
                if (newStatus.toLowerCase() === 'pending') {
                    message = `Cannot change status from 'Confirmed' back to 'Pending'. Please cancel or proceed to 'Ongoing' instead.`;
                } else {
                    message = `Invalid status transition from 'Confirmed' to '${newStatus}'. Allowed transitions: Ongoing, Cancelled.`;
                }
                break;
            case 'ongoing':
                if (newStatus.toLowerCase() === 'cancelled') {
                    message = `Cannot cancel a rental that has already started. Once ongoing, the rental can only be completed.`;
                } else if (newStatus.toLowerCase() === 'pending' || newStatus.toLowerCase() === 'confirmed') {
                    message = `Cannot change status from 'Ongoing' to '${newStatus}'. The rental has already started and can only be completed.`;
                } else {
                    message = `Invalid status transition from 'Ongoing' to '${newStatus}'. Once started, rental can only be Completed.`;
                }
                break;
            case 'pending':
                message = `Invalid status transition from 'Pending' to '${newStatus}'. Allowed transitions: Confirmed, Cancelled.`;
                break;
            default:
                message = `Invalid status transition from '${currentStatus}' to '${newStatus}'.`;
        }
        
        return { 
            valid: false, 
            message: message,
            allowedTransitions: allowedNext
        };
    }

    return { valid: true };
}

async function getPayPalAccessToken() {
    const { baseUrl, clientId, clientSecret } = paypalConfig();
    if (!clientId || !clientSecret) {
        throw new Error("PayPal is not configured on the server");
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: "POST",
        headers: {
            "Authorization": `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "grant_type=client_credentials"
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to get PayPal access token: ${errText}`);
    }

    const tokenData = await response.json();
    return tokenData.access_token;
}

async function getPayPalOrderDetails(paypalOrderId) {
    const { baseUrl } = paypalConfig();
    const accessToken = await getPayPalAccessToken();
    const response = await fetch(`${baseUrl}/v2/checkout/orders/${paypalOrderId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to fetch PayPal order details: ${errText}`);
    }

    return response.json();
}

export async function getPayPalClientId(req, res) {
    const { clientId, currency, baseCurrency, lkrPerUsd } = paypalConfig();
    if (!clientId) {
        return res.status(500).json({ message: "PayPal is not configured" });
    }

    return res.status(200).json({ clientId, currency, baseCurrency, lkrPerUsd });
}

export async function createPayPalOrder(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Please login first" });
        }

        const amountValue = Number(req.body.amount); // Amount received from app in LKR
        if (!Number.isFinite(amountValue) || amountValue <= 0) {
            return res.status(400).json({ message: "Invalid amount for PayPal order" });
        }

        const { baseUrl, currency, lkrPerUsd } = paypalConfig();
        const chargedAmount = convertFromLkr(amountValue, currency, lkrPerUsd);
        const accessToken = await getPayPalAccessToken();
        const payload = {
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: currency,
                        value: chargedAmount.toFixed(2)
                    }
                }
            ]
        };

        const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) {
            const issue = data?.details?.[0]?.issue;
            const description = data?.details?.[0]?.description;

            if (issue === "CURRENCY_NOT_SUPPORTED") {
                return res.status(response.status).json({
                    message: `PayPal account does not support currency ${currency}.`,
                    issue,
                    description,
                    details: data
                });
            }

            return res.status(response.status).json({
                message: description || "Failed to create PayPal order",
                issue,
                details: data
            });
        }

        return res.status(200).json({
            paypalOrderId: data.id,
            status: data.status,
            currency,
            chargedAmount,
            sourceAmountLkr: Number(amountValue.toFixed(2))
        });
    } catch (error) {
        console.error("Error creating PayPal order:", error);
        return res.status(500).json({ message: "Error creating PayPal order", error: error.message });
    }
}

export async function capturePayPalOrder(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Please login first" });
        }

        const { paypalOrderId } = req.body;
        if (!paypalOrderId) {
            return res.status(400).json({ message: "paypalOrderId is required" });
        }

        const { baseUrl } = paypalConfig();
        const accessToken = await getPayPalAccessToken();
        const response = await fetch(`${baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();
        if (!response.ok) {
            const issue = data?.details?.[0]?.issue;
            const description = data?.details?.[0]?.description;

            return res.status(response.status).json({
                message: description || "Failed to capture PayPal order",
                issue,
                details: data
            });
        }

        const captureId = data.purchase_units?.[0]?.payments?.captures?.[0]?.id || null;
        const payerEmail = data.payer?.email_address || null;

        return res.status(200).json({
            paypalOrderId,
            paypalCaptureId: captureId,
            payerEmail,
            status: data.status
        });
    } catch (error) {
        console.error("Error capturing PayPal order:", error);
        return res.status(500).json({ message: "Error capturing PayPal order", error: error.message });
    }
}

export async function createOrder(req, res) {
    try {
        if(req.user == null) {
            return res.status(401).json({ message: "Please login first" });
        }

        // Validate bikes array input
        if (!req.body.bikes || !Array.isArray(req.body.bikes) || req.body.bikes.length === 0) {
            return res.status(400).json({ message: "Please provide at least one bike in the order" });
        }

        // Generate unique order ID
        const latestOrder = await Order.findOne().sort({ createdAt: -1 }).limit(1);
        let orderid = "R000220";

        if (latestOrder && latestOrder.orderid) {
            const lastOrderIdString = latestOrder.orderid; // e.g., "R000220"
            const lastOrderIdwithoutPrefix = lastOrderIdString.replace("R", ""); // "000220"
            const lastOrderIdInInteger = parseInt(lastOrderIdwithoutPrefix); // 220
            const newOrderIdInInteger = lastOrderIdInInteger + 1; // 221
            const newOrderIdWithoutPrefix = newOrderIdInInteger.toString().padStart(6, "0"); // "000221"
            orderid = "R" + newOrderIdWithoutPrefix; // "R000221"
        }

        // Calculate rental duration based on individual bike rental days
        const orderStartDate = new Date(req.body.startDate || new Date());
        let minStartDate = orderStartDate;
        let maxEndDate = orderStartDate;

        // Process each bike and validate
        const bikeItems = [];
        const vendorSet = new Set();
        const vendorBikes = new Map(); // Map vendor ID to array of bikes
        let totalAmount = 0;
        let totalBikes = 0;

        for (const bikeRequest of req.body.bikes) {
            // Validate required fields
            if (!bikeRequest.bikeId || !bikeRequest.quantity || bikeRequest.quantity < 1) {
                return res.status(400).json({ 
                    message: "Each bike must have bikeId and quantity (minimum 1)" 
                });
            }

            // Get bike details
            const bike = await Product.findById(bikeRequest.bikeId).populate('vendor');
            if (!bike) {
                return res.status(404).json({ 
                    message: `Bike with ID ${bikeRequest.bikeId} not found` 
                });
            }

            // Check if bike is available
            if (!bike.isAvailable) {
                return res.status(400).json({ 
                    message: `Bike "${bike.bikeName}" is not available for rental` 
                });
            }

            const pricePerDay = bikeRequest.pricePerDay || bike.pricePerDay;
            const quantity = bikeRequest.quantity;
            const rentalDays = bikeRequest.rentalDays || 1;
            const subtotal = pricePerDay * rentalDays * quantity;

            // Calculate individual bike rental period
            const bikeStartDate = new Date(orderStartDate);
            const bikeEndDate = new Date(bikeStartDate);
            bikeEndDate.setDate(bikeStartDate.getDate() + rentalDays);

            // Update order-level date range
            if (bikeStartDate < minStartDate) minStartDate = bikeStartDate;
            if (bikeEndDate > maxEndDate) maxEndDate = bikeEndDate;

            bikeItems.push({
                bike: bike._id,
                vendor: bike.vendor._id || bike.vendor,
                quantity: quantity,
                rentalDays: rentalDays,
                pricePerDay: pricePerDay,
                subtotal: subtotal,
                startDate: bikeStartDate,
                endDate: bikeEndDate
            });

            const vendorId = (bike.vendor._id || bike.vendor).toString();
            vendorSet.add(vendorId);
            
            // Store bike info for notification
            if (!vendorBikes.has(vendorId)) {
                vendorBikes.set(vendorId, []);
            }
            vendorBikes.get(vendorId).push({
                bikeName: bike.bikeName,
                quantity: quantity,
                rentalDays: rentalDays,
                subtotal: subtotal
            });

            totalAmount += subtotal;
            totalBikes += quantity;
        }

        // Calculate order-level total days
        const totalDays = Math.ceil((maxEndDate - minStartDate) / (1000 * 60 * 60 * 24));

        // Calculate service fee (10%)
        const serviceFee = totalAmount * 0.10;
        const finalTotal = totalAmount + serviceFee;

        const paymentMethod = req.body.paymentMethod;
        if (!["card", "paypal"].includes(paymentMethod)) {
            return res.status(400).json({ message: "Invalid payment method" });
        }

        let paymentStatus = "pending";
        let paypalOrderId = null;
        let paypalCaptureId = null;

        if (paymentMethod === "card") {
            paymentStatus = "paid";
        }

        if (paymentMethod === "paypal") {
            paypalOrderId = req.body.paypalOrderId;
            paypalCaptureId = req.body.paypalCaptureId;

            if (!paypalOrderId || !paypalCaptureId) {
                return res.status(400).json({ message: "PayPal order and capture IDs are required" });
            }

            const { currency: expectedCurrency, lkrPerUsd } = paypalConfig();
            const paypalOrder = await getPayPalOrderDetails(paypalOrderId);
            const capture = paypalOrder.purchase_units?.[0]?.payments?.captures?.find((cap) => cap.id === paypalCaptureId);
            const paidAmount = Number(capture?.amount?.value || 0);
            const paidCurrency = capture?.amount?.currency_code;
            const expectedPaidAmount = convertFromLkr(finalTotal, expectedCurrency, lkrPerUsd);

            if (paypalOrder.status !== "COMPLETED" || !capture) {
                return res.status(400).json({ message: "PayPal payment verification failed" });
            }

            if (paidCurrency !== expectedCurrency || Math.abs(paidAmount - expectedPaidAmount) > 0.01) {
                return res.status(400).json({
                    message: "Paid amount does not match order total",
                    details: {
                        paidAmount,
                        paidCurrency,
                        expectedAmount: expectedPaidAmount,
                        expectedCurrency
                    }
                });
            }

            paymentStatus = "paid";
        }

        // Create order object with all required fields
        const order = new Order({
            orderid: orderid,
            user: req.user.id,
            vendors: Array.from(vendorSet), // Convert Set to Array
            bikes: bikeItems,
            startDate: minStartDate,
            endDate: maxEndDate,
            totalDays: totalDays,
            totalAmount: totalAmount,
            serviceFee: serviceFee,
            finalTotal: finalTotal,
            totalBikes: totalBikes,
            paymentMethod: paymentMethod,
            paymentStatus: paymentStatus,
            paypalOrderId: paypalOrderId,
            paypalCaptureId: paypalCaptureId,
            orderStatus: "pending" // default
        });

        // Save the order
        const savedOrder = await order.save();

        // Mark bikes unavailable when payment is confirmed
        if (savedOrder.paymentStatus === "paid") {
            for (const bikeItem of bikeItems) {
                await Product.findByIdAndUpdate(bikeItem.bike, {
                    isAvailable: false,
                    isApproved: false
                });
                console.log(`Bike ${bikeItem.bike} set to unavailable and unapproved due to paid order`);
            }
        }

        // Get customer details for notifications
        const customer = await User.findById(req.user.id);

        // Send notifications to all vendors involved in the order
        const notificationService = req.app.locals.notificationService;
        if (notificationService && customer) {
            for (const [vendorId, bikes] of vendorBikes.entries()) {
                try {
                    const bikeNames = bikes.map(bike => `${bike.bikeName} (${bike.quantity}x)`).join(', ');
                    const vendorTotal = bikes.reduce((sum, bike) => sum + bike.subtotal, 0);
                    
                    await notificationService.createNotification({
                        recipientId: vendorId,
                        senderId: customer._id,
                        type: 'booking_received',
                        title: '🎉 New Booking Received!',
                        message: `You have received a new booking from ${customer.firstname} ${customer.lastname}. Bikes: ${bikeNames}. Total: $${vendorTotal.toFixed(2)}`,
                        data: {
                            orderId: savedOrder._id,
                            orderid: orderid,
                            customerName: `${customer.firstname} ${customer.lastname}`,
                            customerEmail: customer.email,
                            bikes: bikes,
                            vendorTotal: vendorTotal
                        },
                        priority: 'high',
                        sendEmail: true
                    });
                } catch (notificationError) {
                    console.error(`Error sending notification to vendor ${vendorId}:`, notificationError);
                }
            }
        }

        // Populate the saved order with user, vendors, and bikes details for response
        const populatedOrder = await Order.findById(savedOrder._id)
            .populate('user', 'firstname lastname email')
            .populate('vendors', 'firstname lastname email')
            .populate('bikes.bike', 'bikeName bikeType images')
            .populate('bikes.vendor', 'firstname lastname email');

        res.status(201).json({
            message: "Order created successfully",
            order: populatedOrder,
            orderId: orderid,
            summary: {
                totalBikes: totalBikes,
                subtotal: totalAmount,
                serviceFee: serviceFee,
                finalTotal: finalTotal,
                vendors: Array.from(vendorSet).length
            }
        });

    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({
            message: "Error creating order",
            error: error.message
        });
    }
}

// Get all orders for a user (customer)
export async function getUserOrders(req, res) {
    try {
        if(!req.user) {
            return res.status(401).json({ message: "Please login first" });
        }

        const orders = await Order.find({ user: req.user.id })
            .populate('vendors', 'firstname lastname email phone')
            .populate('bikes.bike', 'bikeName bikeType images pricePerDay city mapUrl')
            .populate('bikes.vendor', 'firstname lastname email phone')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Orders retrieved successfully",
            orders: orders
        });

    } catch (error) {
        console.error("Error fetching user orders:", error);
        res.status(500).json({
            message: "Error fetching orders",
            error: error.message
        });
    }
}

// Get all orders for a vendor
export async function getVendorOrders(req, res) {
    try {
        if(!req.user) {
            return res.status(401).json({ message: "Please login first" });
        }

        // Find orders where the vendor is in the vendors array
        const allOrders = await Order.find({ vendors: req.user.id })
            .populate('user', 'firstname lastname email phone')
            .populate('bikes.bike', 'bikeName bikeType images city mapUrl')
            .populate('bikes.vendor', 'firstname lastname email phone')
            .populate('vendors', 'firstname lastname email phone')
            .sort({ createdAt: -1 });

        // Filter and modify orders to show only vendor's bikes and calculate vendor-specific totals
        const vendorOrders = allOrders.map(order => {
            // Filter bikes to only include this vendor's bikes
            const vendorBikes = order.bikes.filter(bikeItem => 
                bikeItem.vendor._id.toString() === req.user.id.toString()
            );

            // Calculate totals based only on vendor's bikes
            let vendorTotalAmount = 0;
            let vendorTotalBikes = 0;

            vendorBikes.forEach(bikeItem => {
                vendorTotalAmount += bikeItem.subtotal;
                vendorTotalBikes += bikeItem.quantity;
            });

            // Calculate vendor's share of service fee proportionally
            const vendorServiceFee = order.serviceFee * (vendorTotalAmount / (order.totalAmount || 1));
            const vendorFinalTotal = vendorTotalAmount + vendorServiceFee;

            // Return modified order with only vendor's data
            return {
                ...order.toObject(),
                bikes: vendorBikes,
                totalAmount: vendorTotalAmount,
                serviceFee: vendorServiceFee,
                finalTotal: vendorFinalTotal,
                totalBikes: vendorTotalBikes,
                // Add customer info for vendor convenience
                customer: order.user ? {
                    name: `${order.user.firstname} ${order.user.lastname}`,
                    email: order.user.email,
                    phone: order.user.phone
                } : null
            };
        });

        res.status(200).json({
            message: "Vendor orders retrieved successfully",
            orders: vendorOrders
        });

    } catch (error) {
        console.error("Error fetching vendor orders:", error);
        res.status(500).json({
            message: "Error fetching orders",
            error: error.message
        });
    }
}

// Update order status (for vendors/admins)
export async function updateOrderStatus(req, res) {
    try {
        console.log("Update order status request:", {
            orderId: req.params.orderId,
            body: req.body,
            userId: req.user?.id,
            userType: req.user?.type
        });

        if(!req.user) {
            return res.status(401).json({ message: "Please login first" });
        }

        const { orderId } = req.params;
        const { orderStatus, paymentStatus, bikeId, bikeStatus } = req.body;

        // Validate input
        if (!orderStatus && !paymentStatus && !bikeStatus) {
            return res.status(400).json({ message: "Please provide orderStatus, paymentStatus, or bikeStatus to update" });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        console.log("Found order:", {
            orderId: order._id,
            vendors: order.vendors,
            currentStatus: order.orderStatus
        });

        // Check if user is one of the vendors or admin
        const isVendor = order.vendors.some(vendor => vendor.toString() === req.user.id.toString());
        const isAdmin = req.user.type === "admin";
        
        console.log("Authorization check:", { isVendor, isAdmin, userId: req.user.id });
        
        if (!isVendor && !isAdmin) {
            return res.status(403).json({ message: "Not authorized to update this order" });
        }

        // Handle bike-specific status update (for multi-vendor orders)
        if (bikeId && bikeStatus) {
            // Find the specific bike in the order
            const bikeIndex = order.bikes.findIndex(bike => 
                bike.bike.toString() === bikeId && 
                bike.vendor.toString() === req.user.id.toString()
            );

            if (bikeIndex === -1) {
                return res.status(404).json({ message: "Bike not found or not owned by this vendor" });
            }

            // Get current bike status
            const currentBikeStatus = order.bikes[bikeIndex].bikeStatus || 'pending';
            
            // Validate status transition
            const validationResult = validateStatusTransition(currentBikeStatus, bikeStatus);
            if (!validationResult.valid) {
                return res.status(400).json({ 
                    message: validationResult.message,
                    currentStatus: currentBikeStatus,
                    attemptedStatus: bikeStatus
                });
            }

            // Update the bike status
            order.bikes[bikeIndex].bikeStatus = bikeStatus;

            // Update bike availability based on status
            if (bikeStatus === "completed" || bikeStatus === "cancelled") {
                try {
                    await Product.findByIdAndUpdate(bikeId, {
                        isAvailable: true,
                        isApproved: true
                    });
                    console.log(`Bike ${bikeId} set to available due to ${bikeStatus}`);
                } catch (bikeUpdateError) {
                    console.error("Error updating bike availability:", bikeUpdateError);
                }
            } else if (bikeStatus === "confirmed" || bikeStatus === "ongoing") {
                try {
                    await Product.findByIdAndUpdate(bikeId, {
                        isAvailable: false,
                        isApproved: false
                    });
                    console.log(`Bike ${bikeId} set to unavailable due to ${bikeStatus}`);
                } catch (bikeUpdateError) {
                    console.error("Error updating bike availability:", bikeUpdateError);
                }
            }

            // Calculate overall order status based on all bike statuses
            const bikeStatuses = order.bikes.map(bike => bike.bikeStatus);
            let newOrderStatus = order.orderStatus;

            if (bikeStatuses.every(status => status === "completed")) {
                newOrderStatus = "completed";
            } else if (bikeStatuses.every(status => status === "cancelled")) {
                newOrderStatus = "cancelled";
            } else if (bikeStatuses.some(status => status === "ongoing")) {
                newOrderStatus = "ongoing";
            } else if (bikeStatuses.every(status => status === "confirmed" || status === "completed")) {
                newOrderStatus = "confirmed";
            } else {
                newOrderStatus = "pending";
            }

            order.orderStatus = newOrderStatus;
        }

        // Handle overall order status update (admin only)
        if (orderStatus && isAdmin) {
            order.orderStatus = orderStatus;
            
            // Update all bikes to match order status
            order.bikes.forEach(bike => {
                bike.bikeStatus = orderStatus;
            });
            
            // Update bike availability based on order status
            if (orderStatus === "completed" || orderStatus === "cancelled") {
                try {
                    for (const bikeItem of order.bikes) {
                        await Product.findByIdAndUpdate(bikeItem.bike, {
                            isAvailable: true,
                            isApproved: true
                        });
                        console.log(`Bike ${bikeItem.bike} set back to available due to order ${orderStatus}`);
                    }
                } catch (bikeUpdateError) {
                    console.error("Error updating bike availability:", bikeUpdateError);
                }
            }
        }
        
        // Handle payment status update
        if (paymentStatus) {
            order.paymentStatus = paymentStatus;

            if (paymentStatus === "paid") {
                for (const bikeItem of order.bikes) {
                    try {
                        await Product.findByIdAndUpdate(bikeItem.bike, {
                            isAvailable: false,
                            isApproved: false
                        });
                        console.log(`Bike ${bikeItem.bike} set to unavailable due to paid order`);
                    } catch (bikeUpdateError) {
                        console.error("Error updating bike availability for paid order:", bikeUpdateError);
                    }
                }
            }
        }

        // Save the updated order
        const updatedOrder = await order.save();
        console.log("Order updated successfully:", updatedOrder._id);

        // Send notifications for status updates
        const notificationService = req.app.locals.notificationService;
        if (notificationService) {
            try {
                // Get user and vendor details for notifications
                const customer = await User.findById(order.user);
                const vendor = await User.findById(req.user.id);

                // Send notification to customer about status change
                if (customer && (orderStatus || bikeStatus)) {
                    const status = orderStatus || bikeStatus;
                    let message = '';
                    let title = '';

                    if (status === 'confirmed') {
                        title = '✅ Booking Confirmed!';
                        message = bikeId 
                            ? `Your bike booking has been confirmed by the vendor.`
                            : `Your booking #${order.orderid} has been confirmed!`;
                    } else if (status === 'cancelled') {
                        title = '❌ Booking Cancelled';
                        message = bikeId 
                            ? `Your bike booking has been cancelled by the vendor.`
                            : `Your booking #${order.orderid} has been cancelled.`;
                    } else if (status === 'completed') {
                        title = '🎯 Booking Completed';
                        message = bikeId 
                            ? `Your bike rental has been completed. Thank you for choosing us!`
                            : `Your booking #${order.orderid} has been completed. Thank you!`;
                    } else if (status === 'ongoing') {
                        title = '🚴‍♂️ Booking Started';
                        message = bikeId 
                            ? `Your bike rental has started. Enjoy your ride!`
                            : `Your booking #${order.orderid} is now active. Enjoy!`;
                    }

                    if (title && message) {
                        await notificationService.createNotification({
                            recipientId: customer._id,
                            senderId: vendor._id,
                            type: status === 'confirmed' ? 'booking_confirmed' : 'general',
                            title: title,
                            message: message,
                            data: {
                                orderId: order._id,
                                orderid: order.orderid,
                                newStatus: status,
                                bikeId: bikeId || null
                            },
                            priority: status === 'cancelled' ? 'high' : 'normal',
                            sendEmail: true
                        });
                    }
                }

                // Send notification for payment confirmation
                if (paymentStatus === 'paid' && customer && vendor) {
                    await notificationService.createNotification({
                        recipientId: vendor._id,
                        senderId: customer._id,
                        type: 'payment_received',
                        title: '💰 Payment Received',
                        message: `Payment has been received for booking #${order.orderid}. Total amount: $${order.finalTotal}`,
                        data: {
                            orderId: order._id,
                            orderid: order.orderid,
                            amount: order.finalTotal,
                            customerName: `${customer.firstname} ${customer.lastname}`
                        },
                        priority: 'normal',
                        sendEmail: true
                    });
                }

            } catch (notificationError) {
                console.error('Error sending status update notification:', notificationError);
            }
        }

        res.status(200).json({
            success: true,
            message: "Order updated successfully",
            order: updatedOrder
        });

    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({
            success: false,
            message: "Error updating order",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}

// Get order by ID (for both customers and vendors)
export async function getOrderById(req, res) {
    try {
        if(!req.user) {
            return res.status(401).json({ message: "Please login first" });
        }

        const { orderId } = req.params;
        const order = await Order.findById(orderId)
            .populate('user', 'firstname lastname email phone')
            .populate('vendors', 'firstname lastname email phone')
            .populate('bikes.bike', 'bikeName bikeType images pricePerDay city mapUrl')
            .populate('bikes.vendor', 'firstname lastname email phone');

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Check if user has access to this order
        const isCustomer = order.user._id.toString() === req.user.id.toString();
        const isVendor = order.vendors.some(vendor => vendor._id.toString() === req.user.id.toString());
        const isAdmin = req.user.type === "admin";

        if (!isCustomer && !isVendor && !isAdmin) {
            return res.status(403).json({ message: "Not authorized to view this order" });
        }

        res.status(200).json({
            message: "Order retrieved successfully",
            order: order
        });

    } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({
            message: "Error fetching order",
            error: error.message
        });
    }
}

// Get vendor earnings data for dashboard
export async function getVendorEarnings(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Please login first" });
        }

        const vendorId = req.user.id;

        // Get all completed orders for this vendor
        const completedOrders = await Order.find({
            vendors: vendorId,
            orderStatus: "completed"
        });

        // Calculate total earnings
        let totalEarnings = 0;
        const monthlyEarnings = Array(12).fill(0);
        
        for (const order of completedOrders) {
            // Calculate vendor's share from this order
            const vendorBikes = order.bikes.filter(bike => 
                bike.vendor.toString() === vendorId
            );
            
            const vendorOrderTotal = vendorBikes.reduce((sum, bike) => sum + bike.subtotal, 0);
            totalEarnings += vendorOrderTotal;
            
            // Add to monthly data
            const orderMonth = order.endDate.getMonth(); // 0-11
            monthlyEarnings[orderMonth] += vendorOrderTotal;
        }

        // Format monthly data for chart
        const monthlyData = monthlyEarnings.map((amount, index) => ({
            month: index + 1, // 1-12
            amount: Math.round(amount)
        })).filter(data => data.amount > 0);

        res.status(200).json({
            message: "Vendor earnings retrieved successfully",
            total: Math.round(totalEarnings),
            monthly: monthlyData
        });

    } catch (error) {
        console.error("Error fetching vendor earnings:", error);
        res.status(500).json({
            message: "Error fetching vendor earnings",
            error: error.message
        });
    }
}

// Get vendor booking statistics for dashboard
export async function getVendorStats(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Please login first" });
        }

        const vendorId = req.user.id;

        // Get booking statistics
        const [activeBookings, completedBookings, allBookings] = await Promise.all([
            Order.countDocuments({
                vendors: vendorId,
                orderStatus: { $in: ["confirmed", "ongoing"] }
            }),
            Order.countDocuments({
                vendors: vendorId,
                orderStatus: "completed"
            }),
            Order.countDocuments({
                vendors: vendorId
            })
        ]);

        res.status(200).json({
            message: "Vendor statistics retrieved successfully",
            active: activeBookings,
            completed: completedBookings,
            total: allBookings,
            pending: allBookings - activeBookings - completedBookings
        });

    } catch (error) {
        console.error("Error fetching vendor stats:", error);
        res.status(500).json({
            message: "Error fetching vendor statistics",
            error: error.message
        });
    }
}
   