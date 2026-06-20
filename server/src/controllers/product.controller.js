import mongoose from "mongoose";
import Product from "../models/product.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

// Helper to filter product based on role (DTO pattern)
const filterProductForRole = (product, role) => {
    let filtered = { ...product };
    
    // Roles that can see costPrice: admin, viewer, owner, accountant
    if (!["admin", "viewer", "owner", "accountant"].includes(role)) {
        delete filtered.costPrice;
    }
    
    // Roles that can see salePrice & proposals: admin, viewer, owner, accountant, sales_manager, sales_rep
    if (!["admin", "viewer", "owner", "accountant", "sales_manager", "sales_rep"].includes(role)) {
        delete filtered.salePrice;
        delete filtered.priceProposals;
    }
    
    // Everyone can see name, stockCount, image, createdAt, updatedAt
    return filtered;
};

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .sort({ createdAt: -1 })
            .lean();

        const role = req.user.role;
        const filteredProducts = products.map(p => filterProductForRole(p, role));

        res.status(200).json({ status: "success", message: "Products fetched successfully", data: filteredProducts });
    } catch (error) {
        console.error("Məhsulları alırken xəta:", error.message);
        res.status(500).json({ status: "error", message: "Server xətası" });
    }
};

export const getProductStats = async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        
        const stats = await Product.aggregate([
            {
                $group: {
                    _id: null,
                    totalSaleValue: { $sum: { $multiply: ["$salePrice", "$stockCount"] } },
                    totalCostValue: { $sum: { $multiply: ["$costPrice", "$stockCount"] } },
                }
            }
        ]);

        const recentProducts = await Product.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        const role = req.user.role;
        const filteredRecentProducts = recentProducts.map(p => filterProductForRole(p, role));

        let totalSaleValue = stats.length > 0 ? stats[0].totalSaleValue : 0;
        let totalCostValue = stats.length > 0 ? stats[0].totalCostValue : 0;
        
        let data = {
            totalProducts,
            recentProducts: filteredRecentProducts
        };

        if (["admin", "viewer", "owner", "accountant"].includes(role)) {
             data.totalCostValue = totalCostValue;
             data.marginValue = totalSaleValue - totalCostValue;
        }
        if (["admin", "viewer", "owner", "accountant", "sales_manager"].includes(role)) {
             data.totalSaleValue = totalSaleValue;
        }

        res.status(200).json({ status: "success", data });
    } catch (error) {
        console.error("Statistika alınarkən xəta:", error.message);
        res.status(500).json({ status: "error", message: "Server xətası" });
    }
};

export const getProductById = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ status: "error", message: "Invalid product ID" });
    }

    try {
        const product = await Product.findById(id).lean();

        if (!product) {
            return res.status(404).json({ status: "error", message: "Product not found" });
        }

        const filteredProduct = filterProductForRole(product, req.user.role);

        res.status(200).json({ status: "success", message: "Product fetched successfully", data: filteredProduct });
    } catch (error) {
        console.error("Məhsul alınarkən xəta:", error.message);
        res.status(500).json({ status: "error", message: "Server xətası" });
    }
};

export const createProduct = async (req, res) => {
    try {
        const { name, costPrice, salePrice, stockCount } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, message: "Şəkil yüklənməlidir" });
        }

        const cloudinaryResult = await uploadToCloudinary(req.file.buffer);
        const imageUrl = cloudinaryResult.secure_url;

        if (!name || costPrice === undefined) {
            return res.status(400).json({ success: false, message: "Ad və Maya dəyəri doldurulmalıdır" });
        }

        const product = await Product.create({ 
            name, 
            costPrice: Number(costPrice) || 0, 
            salePrice: Number(salePrice) || 0, 
            stockCount: Number(stockCount) || 0, 
            image: imageUrl 
        });
        
        res.status(201).json({ status: "success", message: "Product created successfully", data: filterProductForRole(product.toObject(), req.user.role) });
    } catch (error) {
        console.error("Məhsul yaradılarkən xəta:", error.message);
        res.status(500).json({ status: "error", message: "Server xətası" });
    }
};

export const updateCostPrice = async (req, res) => {
    const { id } = req.params;
    const { costPrice } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ status: "error", message: "Invalid product ID" });
    if (costPrice === undefined) return res.status(400).json({ status: "error", message: "Cost price is required" });

    try {
        const product = await Product.findByIdAndUpdate(id, { costPrice: Number(costPrice) }, { new: true }).lean();
        if (!product) return res.status(404).json({ status: "error", message: "Product not found" });

        res.status(200).json({ status: "success", message: "Cost price updated", data: filterProductForRole(product, req.user.role) });
    } catch (error) {
        console.error("Xəta:", error.message);
        res.status(500).json({ status: "error", message: "Server xətası" });
    }
};

export const proposePrice = async (req, res) => {
    const { id } = req.params;
    const { proposedPrice } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ status: "error", message: "Invalid product ID" });
    if (!proposedPrice) return res.status(400).json({ status: "error", message: "Proposed price is required" });

    try {
        const proposal = {
            proposedPrice: Number(proposedPrice),
            proposedBy: req.user._id,
            role: req.user.role,
            status: "pending"
        };

        const product = await Product.findByIdAndUpdate(
            id, 
            { $push: { priceProposals: proposal } }, 
            { new: true }
        ).lean();

        if (!product) return res.status(404).json({ status: "error", message: "Product not found" });

        res.status(200).json({ status: "success", message: "Price proposal submitted", data: filterProductForRole(product, req.user.role) });
    } catch (error) {
        console.error("Xəta:", error.message);
        res.status(500).json({ status: "error", message: "Server xətası" });
    }
};

export const approvePriceProposal = async (req, res) => {
    const { id, proposalId } = req.params;
    const { status } = req.body; // "approved" or "rejected"

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(proposalId)) {
        return res.status(400).json({ status: "error", message: "Invalid IDs" });
    }

    try {
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ status: "error", message: "Product not found" });

        const proposal = product.priceProposals.id(proposalId);
        if (!proposal) return res.status(404).json({ status: "error", message: "Proposal not found" });

        proposal.status = status;
        if (status === "approved") {
            product.salePrice = proposal.proposedPrice;
        }

        await product.save();

        res.status(200).json({ status: "success", message: `Proposal ${status}`, data: filterProductForRole(product.toObject(), req.user.role) });
    } catch (error) {
        console.error("Xəta:", error.message);
        res.status(500).json({ status: "error", message: "Server xətası" });
    }
};

export const updateStock = async (req, res) => {
    const { id } = req.params;
    const { stockCount } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ status: "error", message: "Invalid product ID" });
    if (stockCount === undefined) return res.status(400).json({ status: "error", message: "Stock count is required" });

    try {
        const product = await Product.findByIdAndUpdate(id, { stockCount: Number(stockCount) }, { new: true }).lean();
        if (!product) return res.status(404).json({ status: "error", message: "Product not found" });

        res.status(200).json({ status: "success", message: "Stock updated", data: filterProductForRole(product, req.user.role) });
    } catch (error) {
        console.error("Xəta:", error.message);
        res.status(500).json({ status: "error", message: "Server xətası" });
    }
};

export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body; // Admin, viewer, owner can update name and image via this generic route

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ status: "error", message: "Invalid product ID" });

    try {
        let updateData = {};
        if (name) updateData.name = name;

        if (req.file) {
            const cloudinaryResult = await uploadToCloudinary(req.file.buffer);
            updateData.image = cloudinaryResult.secure_url;
        }

        const product = await Product.findByIdAndUpdate(id, updateData, { new: true }).lean();
        if(!product) return res.status(404).json({ status: "error", message: "Product not found" });

        res.status(200).json({ status: "success", message: "Product updated successfully", data: filterProductForRole(product, req.user.role) });
    } catch (error) {
        console.error("Məhsul yenilənərkən xəta:", error.message);
        res.status(500).json({ status: "error", message: "Server xətası" });
    }
};

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
