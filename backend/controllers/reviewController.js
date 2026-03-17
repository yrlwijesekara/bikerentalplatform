import Review from '../model/review.js';
import Order from '../model/order.js';

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