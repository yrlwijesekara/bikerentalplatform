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

        // Calculate rental duration
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(req.body.endDate);
        const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

        if (totalDays <= 0) {
            return res.status(400).json({ message: "Invalid date range" });
        }

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
            const subtotal = pricePerDay * totalDays * quantity;

            bikeItems.push({
                bike: bike._id,
                vendor: bike.vendor._id || bike.vendor,
                quantity: quantity,
                pricePerDay: pricePerDay,
                subtotal: subtotal
            });

            vendorSet.add((bike.vendor._id || bike.vendor).toString());
            totalAmount += subtotal;
            totalBikes += quantity;
        }

        // Create order object with all required fields
        const order = new Order({
            orderid: orderid,
            user: req.user.id, 
            vendors: Array.from(vendorSet), // Convert Set to Array
            bikes: bikeItems,
            startDate: startDate,
            endDate: endDate,
            totalDays: totalDays,
            totalAmount: totalAmount,
            totalBikes: totalBikes,
            paymentMethod: req.body.paymentMethod,
            paymentStatus: "pending", // default
            orderStatus: "pending", // default
            
            // Payment proof fields (for bank transfer)
            paymentProof: req.body.paymentMethod === "bank_transfer" ? {
                slipImage: req.body.paymentProof?.slipImage,
                bankName: req.body.paymentProof?.bankName,
                accountHolderName: req.body.paymentProof?.accountHolderName,
                referenceNumber: req.body.paymentProof?.referenceNumber,
                transferredAmount: req.body.paymentProof?.transferredAmount,
                transferDate: req.body.paymentProof?.transferDate ? new Date(req.body.paymentProof.transferDate) : null,
                verificationStatus: req.body.paymentProof?.slipImage ? "pending" : "not_uploaded"
            } : undefined
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
            .populate('user', 'name email')
            .populate('vendors', 'name email')
            .populate('bikes.bike', 'bikeName bikeType images')
            .populate('bikes.vendor', 'name email');

        res.status(201).json({
            message: "Order created successfully",
            order: populatedOrder,
            orderId: orderid,
            summary: {
                totalBikes: totalBikes,
                totalAmount: totalAmount,
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
            .populate('vendors', 'name email phoneNumber')
            .populate('bikes.bike', 'bikeName bikeType images pricePerDay')
            .populate('bikes.vendor', 'name email')
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
        const orders = await Order.find({ vendors: req.user.id })
            .populate('user', 'name email phoneNumber')
            .populate('bikes.bike', 'bikeName bikeType images')
            .populate('bikes.vendor', 'name email')
            .populate('vendors', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Vendor orders retrieved successfully",
            orders: orders
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
        if(!req.user) {
            return res.status(401).json({ message: "Please login first" });
        }

        const { orderId } = req.params;
        const { orderStatus, paymentStatus } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Check if user is one of the vendors or admin
        const isVendor = order.vendors.some(vendor => vendor.toString() === req.user.id.toString());
        const isAdmin = req.user.type === "admin";
        
        if (!isVendor && !isAdmin) {
            return res.status(403).json({ message: "Not authorized to update this order" });
        }

        // Update the order
        if (orderStatus) {
            order.orderStatus = orderStatus;
            
            // If order is completed or cancelled, make all bikes available again
            if (orderStatus === "completed" || orderStatus === "cancelled") {
                for (const bikeItem of order.bikes) {
                    await Product.findByIdAndUpdate(bikeItem.bike, {
                        isAvailable: true,
                        isApproved: true
                    });
                    console.log(`Bike ${bikeItem.bike} set back to available due to order ${orderStatus}`);
                }
            }
        }
        
        if (paymentStatus) order.paymentStatus = paymentStatus;

        const updatedOrder = await order.save();

        // If payment status is set to "paid", update all bikes availability and approval status
        if (paymentStatus === "paid") {
            for (const bikeItem of order.bikes) {
                await Product.findByIdAndUpdate(bikeItem.bike, {
                    isAvailable: false,
                    isApproved: false
                });
                console.log(`Bike ${bikeItem.bike} set to unavailable and unapproved due to paid order`);
            }
        }

        // If payment status is changed back from "paid", make all bikes available again
        if (paymentStatus && paymentStatus !== "paid" && updatedOrder.paymentStatus !== "paid") {
            for (const bikeItem of order.bikes) {
                await Product.findByIdAndUpdate(bikeItem.bike, {
                    isAvailable: true
                });
                console.log(`Bike ${bikeItem.bike} set back to available`);
            }
        }

        res.status(200).json({
            message: "Order updated successfully",
            order: updatedOrder
        });

    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({
            message: "Error updating order",
            error: error.message
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
            .populate('user', 'name email phoneNumber')
            .populate('vendors', 'name email phoneNumber')
            .populate('bikes.bike', 'bikeName bikeType images pricePerDay')
            .populate('bikes.vendor', 'name email');

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

   