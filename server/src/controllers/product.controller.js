import mongoose from "mongoose";
import Product from "../models/product.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

// Get all products (Optimized)
export const getAllProducts = async (req, res) => {
    try {
        // .lean() - Plain JS obyektləri qaytarır (Mongoose document-dən daha sürətli)
        // .select() - Yalnız lazım olan sahələri seçir
        // .sort() - Ən yeni məhsulları əvvəl göstərir
        const products = await Product.find()
            .select('name price image createdAt updatedAt') // Yalnız lazım olan sahələr
            .sort({ createdAt: -1 }) // Ən yeniləri əvvəl
            .lean(); // Sürəti 2-3 dəfə artırır

        res.status(200).json({ status: "success", message: "Products fetched successfully", data: products });
    } catch (error) {
        console.error("Məhsulları alırken xəta:", error.message);
        res.status(500).json({ status: "error", message: "Server xətası" });
    }
};

// Get single product by ID
export const getProductById = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ status: "error", message: "Invalid product ID" });
    }

    try {
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ status: "error", message: "Product not found" });
        }

        res.status(200).json({ status: "success", message: "Product fetched successfully", data: product });
    } catch (error) {
        console.error("Məhsul alınarkən xəta:", error.message);
        res.status(500).json({ status: "error", message: "Server xətası" });
    }
};

// Create a new product
export const createProduct = async (req, res) => {
    try {
        const { name, price } = req.body;

        // Check if file is uploaded
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Şəkil yüklənməlidir" });
        }

        // Upload image to Cloudinary from memory buffer
        const cloudinaryResult = await uploadToCloudinary(req.file.buffer);
        const imageUrl = cloudinaryResult.secure_url;

        // Validation
        if (!name || !price) {
            return res.status(400).json({ success: false, message: "Bütün xanalar doldurulmalıdır" });
        }

        // Create new product
        const product = await Product.create({ name, price, image: imageUrl });
        res.status(201).json({ status: "success", message: "Product created successfully", data: product });
    } catch (error) {
        console.error("Məhsul yaradılarkən xəta:", error.message);
        res.status(500).json({ status: "error", message: "Server xətası" });
    }
};

// Delete a product
export const deleteProduct = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ status: "error", message: "Invalid product ID" });
    }

    try {
        await Product.findByIdAndDelete(id);
        res.status(200).json({ status: "success", message: "Product deleted successfully" });
    } catch (error) {
        console.error("Məhsul silinərkən xəta:", error.message);
        res.status(500).json({ status: "error", message: "Server xətası" });
    }
};

// Update a product
export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, price } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ status: "error", message: "Invalid product ID" });
    }

    try {
        let updateData = { name, price };

        // If new image is uploaded, update the URL via Cloudinary
        if (req.file) {
            const cloudinaryResult = await uploadToCloudinary(req.file.buffer);
            updateData.image = cloudinaryResult.secure_url;
        }

        const product = await Product.findByIdAndUpdate(id, updateData, { new: true });
        res.status(200).json({ status: "success", message: "Product updated successfully", data: product });
    } catch (error) {
        console.error("Məhsul yenilənərkən xəta:", error.message);
        res.status(500).json({ status: "error", message: "Server xətası" });
    }
};
