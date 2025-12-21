import Product from "../model/product.js";
import { isvender, isadmin } from "./usercontroller.js";

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
            error: "Internal server error" 
        });
    }
}

export async function getproducts(req, res) {
    try {
        // Admin can see all products, regular users see only available products
        let products;
        if (isadmin(req, res)) {
            products = await Product.find(); // All products for admin
        } else {
            products = await Product.find({
                isAvailable: true // Only available products for regular users
            });
        }
        
        res.status(200).json({
            message: "Products fetched successfully", 
            products: products
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ 
            message: "Error fetching products",
            error: "Internal server error" 
        });
    }
}
export async function getproductbyvender(req, res) {
    try {
        // Fetch products for the logged-in vendor
        if (!isvender(req, res)) {
            return res.status(403).json({
                message: "Access denied. Only vendors can view their products."
            });
        }
        const products = await Product.find({ vendor: req.user.id });
        res.status(200).json({
            message: "Products fetched successfully",
            products: products
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({
            message: "Error fetching products",
            error: "Internal server error"
        });
    }
        }