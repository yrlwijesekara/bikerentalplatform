import express from 'express';
import { createReview, getAllReviews, getVendorReviews, getProductReviews } from '../controllers/reviewController.js';

const router = express.Router();

// Create a new review (authenticated users)
router.post('/', createReview);

// Admin: get all reviews with full details
router.get('/admin/all', getAllReviews);

// Vendor: get reviews for their own products
router.get('/vendor/my-products', getVendorReviews);

// Public: get reviews for a specific product
router.get('/product/:productId', getProductReviews);

export default router;
