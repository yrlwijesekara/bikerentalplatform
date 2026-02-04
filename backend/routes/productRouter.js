import express from "express";
import { createProduct } from "../controllers/productcontroller.js";
import { getproducts } from "../controllers/productcontroller.js";
import { getproductbyvender } from "../controllers/productcontroller.js";
import { updateProduct } from "../controllers/productcontroller.js";
import { deleteProduct } from "../controllers/productcontroller.js";
import { getproductinfo } from "../controllers/productcontroller.js";
import { updateProductApproval } from "../controllers/productcontroller.js";

const router = express.Router();

router.post("/", createProduct);
router.get("/", getproducts);
router.get("/vender", getproductbyvender);
router.put("/admin/:id/approve", updateProductApproval);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.get("/:id", getproductinfo);







export default router;