import express from "express";
import {
  createOrder,
  getUserOrders,
  getVendorOrders,
  updateOrderStatus,
  getOrderById,
} from "../controllers/ordercontroller.js";

const router = express.Router();

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

export default router;

