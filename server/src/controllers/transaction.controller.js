import Transaction from "../models/transaction.model.js";
import Product from "../models/product.model.js";

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res) => {
    try {
        const { type, status, page = 1, limit = 10 } = req.query;
        const query = { company: req.user.companyId };
        if (type) query.type = type;
        if (status) query.status = status;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const [transactions, total] = await Promise.all([
            Transaction.find(query)
                .populate("kontragent", "name type email")
                .populate("createdBy", "name email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            Transaction.countDocuments(query),
        ]);

        res.status(200).json({
            status: "success",
            data: {
                transactions,
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum),
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message, status: "error" });
    }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
export const getTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id)
            .populate("kontragent")
            .populate("items.product", "name sku")
            .populate("createdBy", "name");
            
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found", status: "fail" });
        }
        res.status(200).json({ status: "success", data: transaction });
    } catch (error) {
        res.status(500).json({ message: error.message, status: "error" });
    }
};

const createWarehouseTask = async (transaction, reqUser) => {
    const Task = (await import("../models/task.model.js")).default;
    
    const existingTask = await Task.findOne({ referenceId: transaction._id });
    if (existingTask) return;
    
    let taskType, title, description;
    if (transaction.type === "purchase") {
        taskType = "receive_purchase";
        title = `Məhsulları qəbul et: Qaimə #${transaction._id.toString().slice(-6).toUpperCase()}`;
        description = `Təchizatçıdan daxil olan məhsulları anbara qəbul edin.`;
    } else if (transaction.type === "sale") {
        taskType = "ship_sale";
        title = `Məhsulları təhvil ver: Qaimə #${transaction._id.toString().slice(-6).toUpperCase()}`;
        description = `Müştəriyə göndəriləcək məhsulları anbardan çıxarın.`;
    } else if (transaction.type === "refund_sale") {
        taskType = "receive_purchase";
        title = `Qaytarmanı qəbul et: Qaimə #${transaction._id.toString().slice(-6).toUpperCase()}`;
        description = `Müştəridən qayıdan məhsulları anbara qəbul edin.`;
    } else if (transaction.type === "refund_purchase") {
        taskType = "ship_sale";
        title = `Təchizatçıya qaytar: Qaimə #${transaction._id.toString().slice(-6).toUpperCase()}`;
        description = `Təchizatçıya qaytarılacaq məhsulları anbardan çıxarın.`;
    }

    if (taskType) {
        await Task.create({
            title,
            description,
            type: taskType,
            referenceId: transaction._id,
            referenceModel: "Transaction",
            assignedRole: "warehouse",
            status: "pending",
            company: transaction.company,
            createdBy: reqUser?._id || reqUser?.id || null
        });
    }
};

// @desc    Create transaction (Draft or Completed)
// @route   POST /api/transactions
// @access  Private
export const createTransaction = async (req, res) => {
    try {
        const { type, kontragent, items, status, paymentStatus, notes } = req.body;
        
        let totalAmount = 0;
        
        // Calculate total amount
        if (items && items.length > 0) {
            items.forEach(item => {
                item.totalPrice = item.quantity * item.unitPrice;
                totalAmount += item.totalPrice;
            });
        }
        
        const transaction = new Transaction({
            type,
            kontragent,
            items: items || [],
            totalAmount,
            status: status || "draft",
            paymentStatus: paymentStatus || "unpaid",
            notes,
            company: req.user.companyId,
            createdBy: req.user?._id || req.user?.id || null
        });
        
        const createdTransaction = await transaction.save();
        
        // If completed directly, update stock 
        if (createdTransaction.status === "completed") {
            for (const item of createdTransaction.items) {
                const product = await Product.findById(item.product);
                if (product) {
                    if (type === "sale" || type === "refund_purchase") {
                        product.stockCount -= item.quantity;
                    } else if (type === "purchase" || type === "refund_sale") {
                        product.stockCount += item.quantity;
                    }
                    await product.save();
                }
            }
        } else if (createdTransaction.status === "pending_receipt") {
            // Create task for warehouseman
            await createWarehouseTask(createdTransaction, req.user);
        }
        
        res.status(201).json({ status: "success", data: createdTransaction });
    } catch (error) {
        res.status(400).json({ message: error.message, status: "error" });
    }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
export const updateTransaction = async (req, res) => {
    try {
        const { status } = req.body;
        const transaction = await Transaction.findById(req.params.id);
        
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found", status: "fail" });
        }
        
        // Handle status change to complete and update stock if it wasn't complete before
        if (status === "completed" && transaction.status !== "completed") {
            for (const item of transaction.items) {
                const product = await Product.findById(item.product);
                if (product) {
                    if (transaction.type === "sale" || transaction.type === "refund_purchase") {
                        product.stockCount -= item.quantity;
                    } else if (transaction.type === "purchase" || transaction.type === "refund_sale") {
                        product.stockCount += item.quantity;
                    }
                    await product.save();
                }
            }
        }
        
        // Calculate new total if items are modified
        if (req.body.items) {
            let totalAmount = 0;
            req.body.items.forEach(item => {
                item.totalPrice = item.quantity * item.unitPrice;
                totalAmount += item.totalPrice;
            });
            req.body.totalAmount = totalAmount;
        }

        const updatedTransaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        // If status is pending_receipt, ensure task exists
        if (updatedTransaction.status === "pending_receipt") {
            await createWarehouseTask(updatedTransaction, req.user);
        }

        res.status(200).json({ status: "success", data: updatedTransaction });
    } catch (error) {
        res.status(400).json({ message: error.message, status: "error" });
    }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
export const deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found", status: "fail" });
        }
        
        // Revert stock if it was completed
        if (transaction.status === "completed") {
            for (const item of transaction.items) {
                const product = await Product.findById(item.product);
                if (product) {
                    if (transaction.type === "sale" || transaction.type === "refund_purchase") {
                        product.stock += item.quantity;
                    } else if (transaction.type === "purchase" || transaction.type === "refund_sale") {
                        product.stock -= item.quantity;
                    }
                    await product.save();
                }
            }
        }
        
        await transaction.deleteOne();
        res.status(200).json({ message: "Transaction removed", status: "success" });
    } catch (error) {
        res.status(500).json({ message: error.message, status: "error" });
    }
};
