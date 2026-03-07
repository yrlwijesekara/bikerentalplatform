import Order from "../model/order.js";
import Product from "../model/product.js"; // Import as Product, not Bike

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

            vendorSet.add((bike.vendor._id || bike.vendor).toString());
            totalAmount += subtotal;
            totalBikes += quantity;
        }

        // Calculate order-level total days
        const totalDays = Math.ceil((maxEndDate - minStartDate) / (1000 * 60 * 60 * 24));

        // Calculate service fee (10%)
        const serviceFee = totalAmount * 0.10;
        const finalTotal = totalAmount + serviceFee;

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
            paymentMethod: req.body.paymentMethod,
            paymentStatus: "pending", // default
            orderStatus: "pending" // default
        });

        // Save the order
        const savedOrder = await order.save();

        // If payment method is card, automatically set payment as paid and update bikes availability
        if (req.body.paymentMethod === "card") {
            savedOrder.paymentStatus = "paid";
            await savedOrder.save();
            
            // Update all bikes availability and approval status when payment is confirmed
            for (const bikeItem of bikeItems) {
                await Product.findByIdAndUpdate(bikeItem.bike, {
                    isAvailable: false,
                    isApproved: false
                });
                console.log(`Bike ${bikeItem.bike} set to unavailable and unapproved due to card payment`);
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
            .populate('bikes.bike', 'bikeName bikeType images pricePerDay')
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
            .populate('bikes.bike', 'bikeName bikeType images')
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
        const { orderStatus, paymentStatus } = req.body;

        // Validate input
        if (!orderStatus && !paymentStatus) {
            return res.status(400).json({ message: "Please provide orderStatus or paymentStatus to update" });
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

        // Prepare update object
        const updateFields = {};
        if (orderStatus) updateFields.orderStatus = orderStatus;
        if (paymentStatus) updateFields.paymentStatus = paymentStatus;

        // Update the order using findByIdAndUpdate to avoid validation issues
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            updateFields,
            { new: true, runValidators: true }
        );

        console.log("Order updated successfully:", updatedOrder._id);

        // If order is completed or cancelled, make all bikes available again
        if (orderStatus && (orderStatus === "completed" || orderStatus === "cancelled")) {
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
                // Continue with order update even if bike update fails
            }
        }

        // If payment status is set to "paid", update all bikes availability and approval status
        if (paymentStatus === "paid") {
            try {
                for (const bikeItem of order.bikes) {
                    await Product.findByIdAndUpdate(bikeItem.bike, {
                        isAvailable: false,
                        isApproved: false
                    });
                    console.log(`Bike ${bikeItem.bike} set to unavailable and unapproved due to paid order`);
                }
            } catch (bikeUpdateError) {
                console.error("Error updating bike availability for paid order:", bikeUpdateError);
                // Continue with order update even if bike update fails
            }
        }

        // If payment status is changed back from "paid", make all bikes available again
        if (paymentStatus && paymentStatus !== "paid") {
            try {
                for (const bikeItem of order.bikes) {
                    await Product.findByIdAndUpdate(bikeItem.bike, {
                        isAvailable: true
                    });
                    console.log(`Bike ${bikeItem.bike} set back to available`);
                }
            } catch (bikeUpdateError) {
                console.error("Error updating bike availability for unpaid order:", bikeUpdateError);
                // Continue with order update even if bike update fails
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
            .populate('bikes.bike', 'bikeName bikeType images pricePerDay')
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

   