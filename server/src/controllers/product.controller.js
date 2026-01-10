import mongoose from "mongoose";
import Product from "../models/product.model.js";

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ status: "success", message: "Products fetched successfully", data: products });
  } catch (error) {
    console.error("Məhsulları alırken xəta:", error.message);
    res.status(500).json({ status: "error", message: "Server xətası" });
  }
};

// Create a new product
export const createProduct = async (req, res) => {
  try {
    const { name, price, image } = req.body;

    // Validation
    if (!name || !price || !image) return res.status(400).json({ success: false, message: "Bütün xanalar doldurulmalıdır" });
    
    // Create new product
    const product = await Product.create({ name, price, image });
    res.status(201).json({ status: "success", message: "Product created successfully", data: product });
  } catch (error) {
    console.error("Məhsul yaradılarkən xəta:", error.message);
    res.status(500).json({ status: "error", message: "Server xətası" });
  }
};

// Delete a product
export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ status: "error", message: "Invalid product ID" });

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
  const { name, price, image } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ status: "error", message: "Invalid product ID" });

  try {
    const product = await Product.findByIdAndUpdate( id, { name, price, image }, { new: true });
    res.status(200).json({ status: "success", message: "Product updated successfully", data: product });
  } catch (error) {
    console.error("Məhsul yenilənərkən xəta:", error.message);
    res.status(500).json({ status: "error", message: "Server xətası" });
  }
};
