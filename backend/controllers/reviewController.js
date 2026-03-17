import Review from '../model/review.js';
import Order from '../model/order.js';
import Product from '../model/product.js';
import { checkAdmin, checkVendor } from './usercontroller.js';

/**
 * Create a new review for a product/bike
 * Validates order completion and prevents duplicate reviews
 */
export async function createReview(req, res) {
    try {
        const { productId, orderId, rating, comment } = req.body;
        const userId = req.user?.id;

        // ✅ Validation: Check all required fields
        if (!productId || !orderId || !rating) {
            return res.status(400).json({
                error: "Product ID, Order ID, and rating are required",
                received: { productId, orderId, rating, comment }
            });
        }

        // ✅ Validation: Check rating range (1-5)
        if (typeof rating !== 'number' || rating < 1 || rating > 5) {
            return res.status(400).json({
                error: "Rating must be a number between 1 and 5"
            });
        }

        // ✅ Validation: Ensure user is authenticated
        if (!userId) {
            return res.status(401).json({
                error: "User must be authenticated to submit a review"
            });
        }

        // ✅ Check order exists and belongs to user
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                error: "Order not found",
                orderId
            });
        }

        if (order.user.toString() !== userId) {
            return res.status(403).json({
                error: "You can only review your own orders"
            });
        }

        // ✅ Check order is completed
        if (order.orderStatus !== 'completed') {
            return res.status(400).json({
                error: "Can only review completed orders",
                currentStatus: order.orderStatus,
                message: "Please wait for your order to be completed before submitting a review"
            });
        }

        // ✅ Check for duplicate review from same user for same product
        const existingReview = await Review.findOne({
            user: userId,
            product: productId,
            order: orderId
        });

        if (existingReview) {
            return res.status(409).json({
                error: "You have already reviewed this product for this order",
                reviewId: existingReview._id
            });
        }

        // ✅ Create and save review
        const review = new Review({
            user: userId,
            product: productId,
            order: orderId,
           
            rating,
            comment: comment || null
        });

        const savedReview = await review.save();
        await savedReview.populate('user', 'firstname lastname email');

        return res.status(201).json({
            message: "Review created successfully",
            review: {
                id: savedReview._id,
                productId: savedReview.product,
                orderId: savedReview.order,
                user: {
                    name: `${savedReview.user.firstname} ${savedReview.user.lastname}`,
                    email: savedReview.user.email
                },
                rating: savedReview.rating,
                comment: savedReview.comment,
                createdAt: savedReview.createdAt
            }
        });

    } catch (error) {
        console.error('Error creating review:', error);
        return res.status(500).json({
            error: "Failed to create review",
            details: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
        });
    }
}

/**
 * GET all reviews — Admin only
 */
export async function getAllReviews(req, res) {
    try {
        if (!checkAdmin(req.user)) {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [reviews, total] = await Promise.all([
            Review.find()
                .populate('user', 'firstname lastname email')
                .populate('product', 'bikeName bikeType city pricePerDay')
                .populate('order', 'orderStatus createdAt')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Review.countDocuments()
        ]);

        return res.status(200).json({
            total,
            page,
            totalPages: Math.ceil(total / limit),
            reviews: reviews.map(r => ({
                id: r._id,
                user: {
                    name: `${r.user.firstname} ${r.user.lastname}`,
                    email: r.user.email
                },
                product: r.product,
                order: r.order,
                rating: r.rating,
                comment: r.comment,
                createdAt: r.createdAt
            }))
        });
    } catch (error) {
        console.error('Error fetching all reviews:', error);
        return res.status(500).json({
            error: "Failed to fetch reviews",
            details: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
        });
    }
}

/**
 * GET reviews for a vendor's own products — Vendor only
 */
export async function getVendorReviews(req, res) {
    try {
        if (!checkVendor(req.user)) {
            return res.status(403).json({ error: "Access denied. Vendors only." });
        }

        const vendorId = req.user.id;

        // Find all products owned by this vendor
        const vendorProducts = await Product.find({ vendor: vendorId }).select('_id');
        if (!vendorProducts.length) {
            return res.status(200).json({ total: 0, reviews: [] });
        }

        const productIds = vendorProducts.map(p => p._id);

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [reviews, total] = await Promise.all([
            Review.find({ product: { $in: productIds } })
                .populate('user', 'firstname lastname email')
                .populate('product', 'bikeName bikeType city pricePerDay')
                .populate('order', 'orderStatus createdAt')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Review.countDocuments({ product: { $in: productIds } })
        ]);

        return res.status(200).json({
            total,
            page,
            totalPages: Math.ceil(total / limit),
            reviews: reviews.map(r => ({
                id: r._id,
                user: {
                    name: `${r.user.firstname} ${r.user.lastname}`,
                    email: r.user.email
                },
                product: r.product,
                order: r.order,
                rating: r.rating,
                comment: r.comment,
                createdAt: r.createdAt
            }))
        });
    } catch (error) {
        console.error('Error fetching vendor reviews:', error);
        return res.status(500).json({
            error: "Failed to fetch reviews",
            details: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
        });
    }
}

/**
 * GET reviews for a specific product — Public
 */
export async function getProductReviews(req, res) {
    try {
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({ error: "Product ID is required" });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [reviews, total] = await Promise.all([
            Review.find({ product: productId })
                .populate('user', 'firstname lastname')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Review.countDocuments({ product: productId })
        ]);

        const avgRating = total > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : null;

        return res.status(200).json({
            total,
            page,
            totalPages: Math.ceil(total / limit),
            averageRating: avgRating ? parseFloat(avgRating) : null,
            reviews: reviews.map(r => ({
                id: r._id,
                user: {
                    name: `${r.user.firstname} ${r.user.lastname}`
                },
                rating: r.rating,
                comment: r.comment,
                createdAt: r.createdAt
            }))
        });
    } catch (error) {
        console.error('Error fetching product reviews:', error);
        return res.status(500).json({
            error: "Failed to fetch reviews",
            details: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
        });
    }
}