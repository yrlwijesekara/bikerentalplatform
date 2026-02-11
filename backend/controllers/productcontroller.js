import Product from "../model/product.js";
import { checkVendor, checkAdmin } from "./usercontroller.js";

export async function createProduct(req, res) {
    // Check if user is a vendor
    if (!checkVendor(req.user)) {
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
        // For admin panel, show all products
        const products = await Product.find();
        
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

export async function getAvailableProducts(req, res) {
    try {
        
        const products = await Product.find({ 
            isAvailable: true, 
            isApproved: true 
        });
        
        res.status(200).json({
            message: "Available products fetched successfully", 
            products: products
        });
    } catch (error) {
        console.error("Error fetching available products:", error);
        res.status(500).json({ 
            message: "Error fetching available products",
            error: "Internal server error" 
        });
    }
}

export async function getproductbyvender(req, res) {
    try {
        // Fetch products for the logged-in vendor
        if (!checkVendor(req.user)) {
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

export async function updateProduct(req, res) {
    if (!checkVendor(req.user)) {
        return res.status(403).json({
            message: "Access denied. Only vendors can update products.",
            error: "Unauthorized"
        });
    }
    
    const data = req.body;
    const productId = req.params.id;
    
    try {
        // First, check if the product exists and belongs to the vendor
        const existingProduct = await Product.findOne({ 
            _id: productId, 
            vendor: req.user.id 
        });
        
        if (!existingProduct) {
            return res.status(404).json({
                message: "Product not found or you don't have permission to update this product.",
                error: "Not found"
            });
        }
        
        // Update the product only if it belongs to the vendor
        const updatedProduct = await Product.findByIdAndUpdate(
            productId, 
            data, 
            { new: true, runValidators: true }
        );
        
        res.status(200).json({
            message: "Product updated successfully",
            product: updatedProduct
        });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({
            message: "Error updating product",
            error: "Internal server error"
        });
    }


}

export async function deleteProduct(req, res) {
    if (!checkVendor(req.user)) {
        return res.status(403).json({
            message: "Access denied. Only vendors can delete products.",
            error: "Unauthorized"
        });
    }

    try {
        const productId = req.params.id;
        const result = await Product.deleteOne({ 
            _id: productId, 
            vendor: req.user.id 
        });
        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: "Product not found or you don't have permission to delete this product.",
                error: "Not found"
            });
        }
        res.status(200).json({
            message: "Product deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({
            message: "Error deleting product",
            error: "Internal server error"
        });
    }
}

export async function getproductinfo(req, res) {
    try {
        const productId = req.params.id;
        let product;
        
        if(checkAdmin(req.user) || checkVendor(req.user)) {
            product = await Product.findById(productId);
        } else {
            product = await Product.findOne({ _id: productId, isAvailable: true  });
        }

        if(product == null) {
            return res.status(404).json({
                message: "Product not found",
                error: "Not found"
            });
        }
        res.status(200).json({
            message: "Product fetched successfully",
            product: product
        });
    } catch (error) {
        console.error("Error fetching product info:", error);
        res.status(500).json({
            message: "Error fetching product info",
            error: "Internal server error"
        });
    }
}

export async function updateProductApproval(req, res) {
    // Check if user is an admin
    if (!checkAdmin(req.user)) {
        return res.status(403).json({
            message: "Access denied. Only admins can update product approval status.",
            error: "Unauthorized"
        });
    }

    const { isApproved, note } = req.body;
    const productId = req.params.id;

    // Validate input
    if (typeof isApproved !== 'boolean') {
        return res.status(400).json({
            message: "Invalid input. isApproved must be a boolean value.",
            error: "Bad request"
        });
    }

    try {
        // Prepare update data
        const updateData = { isApproved };
        if (note !== undefined && note !== null) {
            updateData.note = note;
        }

        // Find and update the product's approval status and note
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({
                message: "Product not found.",
                error: "Not found"
            });
        }

        res.status(200).json({
            message: `Product ${isApproved ? 'approved' : 'rejected'} successfully`,
            product: updatedProduct
        });
    } catch (error) {
        console.error("Error updating product approval:", error);
        res.status(500).json({
            message: "Error updating product approval status",
            error: "Internal server error"
        });
    }
}