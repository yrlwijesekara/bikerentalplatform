import Review from '../model/review.js';
import Order from '../model/order.js';
import Product from '../model/product.js';
import mongoose from 'mongoose';
import { checkAdmin, checkVendor } from './usercontroller.js';

function normalizeId(value) {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value._id) return value._id.toString();
    if (typeof value?.toString === 'function') return value.toString();
    return null;
}

/**
 * Create a new review for a product/bike
 * Validates order completion and prevents duplicate reviews
 */
export async function createReview(req, res) {
    try {
        const rawProductId = req.body?.productId;
        const rawOrderId = req.body?.orderId;
        const { rating, comment } = req.body;
        const productId = normalizeId(rawProductId);
        const orderId = normalizeId(rawOrderId);
        const userId = req.user?.id;

        // ✅ Validation: Check all required fields
        if (!productId || !orderId || !rating) {
            return res.status(400).json({
                error: "Product ID, Order ID, and rating are required",
                received: { productId, orderId, rating, comment }
            });
        }

        if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                error: "Invalid productId or orderId format"
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
            order: orderId,
            $or: [{ product: productId }, { bike: productId }]
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
            bike: productId,
            product: productId,
            order: orderId,
           
            rating,
            comment: comment || null
        });

        const savedReview = await review.save();
        await savedReview.populate('user', 'firstname lastname email');

        const reviewerName = savedReview.user
            ? `${savedReview.user.firstname} ${savedReview.user.lastname}`
            : 'Unknown User';
        const reviewerEmail = savedReview.user?.email || null;

        return res.status(201).json({
            message: "Review created successfully",
            review: {
                id: savedReview._id,
                productId: savedReview.product,
                orderId: savedReview.order,
                user: {
                    name: reviewerName,
                    email: reviewerEmail
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
            details: error.message
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

/**
 * GET current user's reviewed product IDs for a specific order
 */
export async function getMyOrderReviewedProducts(req, res) {
    try {
        const userId = req.user?.id;
        const orderId = normalizeId(req.params?.orderId);

        if (!userId) {
            return res.status(401).json({
                error: "User must be authenticated"
            });
        }

        if (!orderId) {
            return res.status(400).json({
                error: "Order ID is required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                error: "Invalid orderId format"
            });
        }

        const reviews = await Review.find({ user: userId, order: orderId }).select('product bike');
        const reviewedProductIds = [
            ...new Set(
                reviews
                    .map((review) => review.product?.toString() || review.bike?.toString())
                    .filter(Boolean)
            )
        ];

        return res.status(200).json({
            orderId,
            reviewedProductIds,
            reviewedCount: reviewedProductIds.length
        });
    } catch (error) {
        console.error('Error fetching reviewed products for order:', error);
        return res.status(500).json({
            error: "Failed to fetch reviewed products",
            details: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
        });
    }
}

/**
 * Create multiple reviews for an order in one request
 * Expects: { orderId, reviews: [{ productId, rating, comment }] }
 */
export async function createMultipleReviews(req, res) {
    try {
        const userId = req.user?.id;
        const orderId = normalizeId(req.body?.orderId);
        const { reviews } = req.body;

        if (!userId) {
            return res.status(401).json({
                error: "User must be authenticated to submit reviews"
            });
        }

        if (!orderId) {
            return res.status(400).json({
                error: "Order ID is required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                error: "Invalid orderId format"
            });
        }

        if (!Array.isArray(reviews) || reviews.length === 0) {
            return res.status(400).json({
                error: "reviews must be a non-empty array"
            });
        }

        const order = await Order.findById(orderId).select('user orderStatus bikes');
        if (!order) {
            return res.status(404).json({
                error: "Order not found",
                orderId
            });
        }

        if (!order.user || order.user.toString() !== userId) {
            return res.status(403).json({
                error: "You can only review your own orders"
            });
        }

        if (order.orderStatus !== 'completed') {
            return res.status(400).json({
                error: "Can only review completed orders",
                currentStatus: order.orderStatus
            });
        }

        const orderProductIds = new Set(
            (order.bikes || []).map((bikeItem) => bikeItem?.bike?.toString()).filter(Boolean)
        );

        const seenProducts = new Set();
        const invalidItems = [];
        const normalizedReviews = [];

        for (let i = 0; i < reviews.length; i += 1) {
            const item = reviews[i] || {};
            const productId = normalizeId(item.productId);
            const rating = Number(item.rating);
            const comment = (item.comment || '').toString();

            if (!productId) {
                invalidItems.push({ index: i, reason: 'productId is required' });
                continue;
            }

            if (seenProducts.has(productId)) {
                invalidItems.push({ index: i, productId, reason: 'Duplicate productId in request' });
                continue;
            }

            if (!mongoose.Types.ObjectId.isValid(productId)) {
                invalidItems.push({ index: i, productId, reason: 'Invalid productId format' });
                continue;
            }

            if (!orderProductIds.has(productId)) {
                invalidItems.push({ index: i, productId, reason: 'Product does not belong to this order' });
                continue;
            }

            if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
                invalidItems.push({ index: i, productId, reason: 'rating must be a number between 1 and 5' });
                continue;
            }

            seenProducts.add(productId);
            normalizedReviews.push({
                productId,
                rating,
                comment: comment.trim() || null
            });
        }

        if (normalizedReviews.length === 0) {
            return res.status(400).json({
                error: 'No valid review items found',
                invalidItems
            });
        }

        const requestedProductIds = normalizedReviews.map((item) => item.productId);
        const existingReviews = await Review.find({
            user: userId,
            order: orderId,
            $or: [
                { product: { $in: requestedProductIds } },
                { bike: { $in: requestedProductIds } }
            ]
        }).select('product bike');

        const existingProductIds = new Set(
            existingReviews
                .map((review) => review.product?.toString() || review.bike?.toString())
                .filter(Boolean)
        );

        const toCreate = normalizedReviews.filter((item) => !existingProductIds.has(item.productId));
        const skippedProductIds = normalizedReviews
            .filter((item) => existingProductIds.has(item.productId))
            .map((item) => item.productId);

        const createdReviews = [];
        const creationErrors = [];

        for (const item of toCreate) {
            try {
                const created = await Review.create({
                    user: userId,
                    order: orderId,
                    bike: item.productId,
                    product: item.productId,
                    rating: item.rating,
                    comment: item.comment
                });
                createdReviews.push(created);
            } catch (createError) {
                creationErrors.push({
                    productId: item.productId,
                    reason: createError?.message || 'Failed to save review item'
                });
            }
        }

        const createdProductIds = createdReviews.map((review) => review.product.toString());

        const responseStatus = createdReviews.length > 0 ? 201 : 400;

        return res.status(responseStatus).json({
            message: 'Reviews processed successfully',
            orderId,
            submittedCount: reviews.length,
            createdCount: createdReviews.length,
            skippedCount: skippedProductIds.length,
            invalidCount: invalidItems.length + creationErrors.length,
            createdProductIds,
            skippedProductIds,
            invalidItems: [...invalidItems, ...creationErrors],
            createdReviews: createdReviews.map((review) => ({
                id: review._id,
                productId: review.product,
                orderId: review.order,
                rating: review.rating,
                comment: review.comment,
                createdAt: review.createdAt
            }))
        });
    } catch (error) {
        console.error('Error creating multiple reviews:', error);
        return res.status(500).json({
            error: 'Failed to create multiple reviews',
            details: error.message
        });
    }
}