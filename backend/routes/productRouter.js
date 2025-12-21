import express from "express";
import { createProduct } from "../controllers/productcontroller.js";
import { getproducts } from "../controllers/productcontroller.js";
import { getproductbyvender } from "../controllers/productcontroller.js";

const router = express.Router();

router.post("/", createProduct);
router.get("/", getproducts);
router.get("/vendor", getproductbyvender);

export default router;