import Order from "../model/order.js";
import Product from "../model/product.js"; // Import as Product, not Bike

export async function createOrder(req, res) {
    try {
        if(req.user == null) {
            return res.status(401).json({ message: "Please login first" });
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

        // Get bike details to fetch vendor info and price
        const bike = await Product.findById(req.body.bikeId).populate('vendor');
        if (!bike) {
            return res.status(404).json({ message: "Bike not found" });
        }

        // Calculate rental duration
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(req.body.endDate);
        const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

        if (totalDays <= 0) {
            return res.status(400).json({ message: "Invalid date range" });
        }

        // Calculate total amount
        const pricePerDay = req.body.pricePerDay || bike.pricePerDay;
        const totalAmount = pricePerDay * totalDays;

        // Create order object with all required fields
        const order = new Order({
            orderid: orderid,
            user: req.user.id, // Fix: use req.user.id instead of req.user._id
            vendor: bike.vendor._id || bike.vendor,
            bike: req.body.bikeId,
            startDate: startDate,
            endDate: endDate,
            totalDays: totalDays,
            pricePerDay: pricePerDay,
            totalAmount: totalAmount,
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

        // If payment method is card, automatically set payment as paid and update bike availability
        if (req.body.paymentMethod === "card") {
            savedOrder.paymentStatus = "paid";
            await savedOrder.save();
            
            // Update bike availability and approval status when payment is confirmed
            await Product.findByIdAndUpdate(req.body.bikeId, {
                isAvailable: false,
                isApproved: false
            });
            console.log(`Bike ${req.body.bikeId} set to unavailable and unapproved due to card payment`);
        }

        // Populate the saved order with user, vendor, and bike details for response
        const populatedOrder = await Order.findById(savedOrder._id)
            .populate('user', 'name email')
            .populate('vendor', 'name email') 
            .populate('bike', 'bikeName bikeType images');

        res.status(201).json({
            message: "Order created successfully",
            order: populatedOrder,
            orderId: orderid
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
            .populate('vendor', 'name email phoneNumber')
            .populate('bike', 'bikeName bikeType images pricePerDay')
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

        const orders = await Order.find({ vendor: req.user.id })
            .populate('user', 'name email phoneNumber')
            .populate('bike', 'bikeName bikeType images')
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

        // Check if user is the vendor or admin
        if (order.vendor.toString() !== req.user.id.toString() && req.user.type !== "admin") {
            return res.status(403).json({ message: "Not authorized to update this order" });
        }

        // Update the order
        if (orderStatus) {
            order.orderStatus = orderStatus;
            
            // If order is completed or cancelled, make bike available again
            if (orderStatus === "completed" || orderStatus === "cancelled") {
                await Product.findByIdAndUpdate(order.bike, {
                    isAvailable: true,
                    isApproved: true
                });
                console.log(`Bike ${order.bike} set back to available due to order ${orderStatus}`);
            }
        }
        
        if (paymentStatus) order.paymentStatus = paymentStatus;

        const updatedOrder = await order.save();

        // If payment status is set to "paid", update bike availability and approval status
        if (paymentStatus === "paid") {
            await Product.findByIdAndUpdate(order.bike, {
                isAvailable: false,
                isApproved: false
            });
            console.log(`Bike ${order.bike} set to unavailable and unapproved due to paid order`);
        }

        // If payment status is changed back from "paid", make bike available again
        if (paymentStatus && paymentStatus !== "paid" && updatedOrder.paymentStatus !== "paid") {
            await Product.findByIdAndUpdate(order.bike, {
                isAvailable: true
            });
            console.log(`Bike ${order.bike} set back to available`);
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
            .populate('vendor', 'name email phoneNumber')
            .populate('bike', 'bikeName bikeType images');

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Check if user has access to this order
        const isCustomer = order.user._id.toString() === req.user.id.toString();
        const isVendor = order.vendor._id.toString() === req.user.id.toString();
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

   