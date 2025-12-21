import express from "express";
import { createProduct } from "../controllers/productcontroller.js";
import { getproducts } from "../controllers/productcontroller.js";

const router = express.Router();

router.post("/", createProduct);
router.get("/", getproducts);

export default router;