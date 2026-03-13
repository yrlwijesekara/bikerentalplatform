import express from "express";
import {
  createOrder,
  createPayPalOrder,
  capturePayPalOrder,
  getPayPalClientId,
  getUserOrders,
  getVendorOrders,
  updateOrderStatus,
  getOrderById,
  getVendorEarnings,
  getVendorStats,
} from "../controllers/ordercontroller.js";

const router = express.Router();

// PayPal helper routes
router.get("/paypal/client-id", getPayPalClientId);
router.post("/paypal/create-order", createPayPalOrder);
router.post("/paypal/capture-order", capturePayPalOrder);

// Create a new order
router.post("/", createOrder);

// Get all orders for logged-in user (customer)
router.get("/my-orders", getUserOrders);

// Get all orders for logged-in vendor
router.get("/vendor-orders", getVendorOrders);

// Update order status (for vendors/admins)
router.put("/:orderId/status", updateOrderStatus);

// Get order by ID (for both customers and vendors)
router.get("/:orderId", getOrderById);

// Get vendor earnings for dashboard
router.get("/vendor/earnings", getVendorEarnings);

// Get vendor booking statistics for dashboard  
router.get("/vendor/stats", getVendorStats);

export default router;

