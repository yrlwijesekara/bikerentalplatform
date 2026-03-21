import express from 'express';
import { createReview, createMultipleReviews, getAllReviews, getVendorReviews, getProductReviews, getMyOrderReviewedProducts } from '../controllers/reviewController.js';

const router = express.Router();

// Create a new review (authenticated users)
router.post('/', createReview);

// Create multiple reviews in one request (authenticated users)
router.post('/submit-multiple', createMultipleReviews);

// Current user: get reviewed bikes for a specific order
router.get('/my-order/:orderId/reviewed-products', getMyOrderReviewedProducts);

// Admin: get all reviews with full details
router.get('/admin/all', getAllReviews);

// Vendor: get reviews for their own products
router.get('/vendor/my-products', getVendorReviews);

// Public: get reviews for a specific product
router.get('/product/:productId', getProductReviews);

export default router;
