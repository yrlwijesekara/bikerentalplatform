import express from "express";
import {
  createOrder,
  createPayPalOrder,
  capturePayPalOrder,
  getPayPalClientId,
  getAllOrdersAdmin,
  exportAdminOrdersReport,
  getAdminDashboardStats,
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

// Get all orders for admin
router.get("/admin/all", getAllOrdersAdmin);

// Export admin order history (PDF/DOC) with optional date range
router.get("/admin/export", exportAdminOrdersReport);

// Get admin dashboard analytics
router.get("/admin/dashboard-stats", getAdminDashboardStats);

// Get vendor earnings for dashboard
router.get("/vendor/earnings", getVendorEarnings);

// Get vendor booking statistics for dashboard
router.get("/vendor/stats", getVendorStats);

// Update order status (for vendors/admins)
router.put("/:orderId/status", updateOrderStatus);

// Get order by ID (for both customers and vendors)
router.get("/:orderId", getOrderById);

export default router;

