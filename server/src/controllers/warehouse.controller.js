import mongoose from "mongoose";
import Warehouse from "../models/warehouse.model.js";
import StockMovement from "../models/stockMovement.model.js";
import Product from "../models/product.model.js";

// @desc    Get all warehouses
// @route   GET /api/warehouses
// @access  Private
export const getWarehouses = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const query = { company: req.user.companyId };
        if (status) query.status = status;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const [warehouses, total] = await Promise.all([
            Warehouse.find(query).populate("manager", "name email").sort({ createdAt: -1 }).skip(skip).limit(limitNum),
            Warehouse.countDocuments(query),
        ]);

        res.status(200).json({
            status: "success",
            data: {
                warehouses,
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum),
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message, status: "error" });
    }
};

// @desc    Create new warehouse
// @route   POST /api/warehouses
// @access  Private
export const createWarehouse = async (req, res) => {
    try {
        const warehouse = new Warehouse({ ...req.body, company: req.user.companyId });
        const createdWarehouse = await warehouse.save();
        res.status(201).json({ status: "success", data: createdWarehouse });
    } catch (error) {
        res.status(400).json({ message: error.message, status: "error" });
    }
};

// @desc    Update warehouse
// @route   PUT /api/warehouses/:id
// @access  Private
export const updateWarehouse = async (req, res) => {
    try {
        const warehouse = await Warehouse.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!warehouse) {
            return res.status(404).json({ message: "Warehouse not found", status: "fail" });
        }
        res.status(200).json({ status: "success", data: warehouse });
    } catch (error) {
        res.status(400).json({ message: error.message, status: "error" });
    }
};

// @desc    Record stock movement (In, Out, Transfer)
// @route   POST /api/warehouses/movement
// @access  Private
export const recordStockMovement = async (req, res) => {
    try {
        const { product, warehouse, type, quantity, notes } = req.body;
        
        const movement = new StockMovement({
            product,
            warehouse,
            type,
            quantity,
            notes,
            createdBy: req.user._id
        });
        
        const createdMovement = await movement.save();
        
        // Update product overall stock
        const prod = await Product.findById(product);
        if (prod) {
            if (type === "in") {
                prod.stock += quantity;
            } else if (type === "out") {
                prod.stock -= quantity;
            }
            await prod.save();
        }
        
        res.status(201).json({ status: "success", data: createdMovement });
    } catch (error) {
        res.status(400).json({ message: error.message, status: "error" });
    }
};

// @desc    Get stock movements for a warehouse
// @route   GET /api/warehouses/:id/movements
// @access  Private
export const getWarehouseMovements = async (req, res) => {
    try {
        const movements = await StockMovement.find({ warehouse: req.params.id })
            .populate("product", "name image")
            .populate("createdBy", "name")
            .sort({ createdAt: -1 });
        res.status(200).json({ status: "success", data: movements });
    } catch (error) {
        res.status(500).json({ message: error.message, status: "error" });
    }
};

// @desc    Get inventory for a warehouse
// @route   GET /api/warehouses/:id/inventory
// @access  Private
export const getWarehouseInventory = async (req, res) => {
    try {
        const warehouseId = new mongoose.Types.ObjectId(req.params.id);

        const inventory = await StockMovement.aggregate([
            { $match: { warehouse: warehouseId } },
            {
                $group: {
                    _id: "$product",
                    totalIn: { $sum: { $cond: [{ $in: ["$type", ["in", "adjustment"]] }, "$quantity", 0] } },
                    totalOut: { $sum: { $cond: [{ $in: ["$type", ["out", "transfer"]] }, "$quantity", 0] } }
                }
            },
            {
                $project: {
                    product: "$_id",
                    stock: { $subtract: ["$totalIn", "$totalOut"] }
                }
            }
        ]);

        // Populate product details
        const populatedInventory = await Product.populate(inventory, {
            path: "product",
            select: "name image costPrice salePrice stockCount"
        });

        // Filter out items with 0 stock (optional, but good for clean UI)
        const activeInventory = populatedInventory.filter(item => item.stock > 0);

        res.status(200).json({ status: "success", data: activeInventory });
    } catch (error) {
        res.status(500).json({ message: error.message, status: "error" });
    }
};
