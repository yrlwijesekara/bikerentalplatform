import Product from "../model/product.js";
import { isvender } from "./usercontroller.js";

export async function createProduct(req, res) {
    // Check if user is a vendor
    if (!isvender(req, res)) {
        return res.status(403).json({
            message: "Access denied. Only vendors can create products."
        });
    }

    // Add vendor ID to product data
    const productData = {
        ...req.body,
        vendor: req.user.id
    };

    const newProduct = new Product(productData);
    try {
        const savedProduct = await newProduct.save();
        res.status(201).json({
            message: "Product created successfully",
            product: savedProduct
        });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ 
            message: "Error creating product",
            error: "Internal server error" });
    }
}