import Task from "../models/task.model.js";
import Transaction from "../models/transaction.model.js";
import Product from "../models/product.model.js";
import StockMovement from "../models/stockMovement.model.js";

// @desc    Get tasks for current user/role
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res) => {
    try {
        const { role, _id, companyId } = req.user || {};
        
        // Base query: always filter by company
        let query = { company: companyId };
        if (role !== "admin" && role !== "viewer" && role !== "owner") {
            query = {
                company: companyId,
                $or: [
                    { assignedRole: role },
                    { assignedUser: _id }
                ]
            };
        }

        const tasks = await Task.find(query)
            .populate({
                path: 'referenceId',
                populate: [
                    { path: 'kontragent', select: 'name' },
                    { path: 'items.product', select: 'name image' }
                ]
            })
            .sort({ createdAt: -1 });

        res.status(200).json({ status: "success", data: tasks });
    } catch (error) {
        res.status(500).json({ message: error.message, status: "error" });
    }
};

// @desc    Complete a task
// @route   POST /api/tasks/:id/complete
// @access  Private
export const completeTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { warehouseId, receivedItems } = req.body; // receivedItems: [{ productId, actualQuantity }]
        
        const task = await Task.findById(id);
        
        if (!task) {
            return res.status(404).json({ message: "Task not found", status: "fail" });
        }
        
        if (task.status === "completed") {
            return res.status(400).json({ message: "Task is already completed", status: "fail" });
        }

        // Handle 'receive_purchase' and 'ship_sale' tasks
        if ((task.type === "receive_purchase" || task.type === "ship_sale") && task.referenceModel === "Transaction") {
            if (!warehouseId) {
                return res.status(400).json({ message: "Warehouse ID is required for stock operations", status: "fail" });
            }

            const transaction = await Transaction.findById(task.referenceId);
            if (!transaction) {
                return res.status(404).json({ message: "Associated transaction not found", status: "fail" });
            }

            let newTotalAmount = 0;

            // Update product stocks and create stock movements
            for (const item of transaction.items) {
                // Determine actual quantity if provided, otherwise use original quantity
                let actualQty = item.quantity;
                if (receivedItems && Array.isArray(receivedItems)) {
                    const receivedInfo = receivedItems.find(ri => ri.productId === item.product.toString());
                    if (receivedInfo !== undefined && receivedInfo.actualQuantity !== undefined) {
                        actualQty = Number(receivedInfo.actualQuantity);
                    }
                }

                // Update transaction item to reflect actual received/shipped quantity
                item.quantity = actualQty;
                item.totalPrice = actualQty * item.unitPrice;
                newTotalAmount += item.totalPrice;

                if (actualQty > 0) {
                    const product = await Product.findById(item.product);
                    if (product) {
                        let movementType;
                        if (task.type === "receive_purchase") {
                            product.stockCount += actualQty;
                            movementType = "in";
                        } else if (task.type === "ship_sale") {
                            product.stockCount -= actualQty;
                            movementType = "out";
                        }

                        await product.save();

                        await StockMovement.create({
                            product: product._id,
                            warehouse: warehouseId,
                            type: movementType,
                            quantity: actualQty,
                            relatedTransaction: transaction._id,
                            notes: `${task.type === "receive_purchase" ? "Received" : "Shipped"} via Task ${task._id}. Expected: ${item.quantity}, Actual: ${actualQty}`,
                            createdBy: req.user?._id || req.user?.id || null
                        });
                    }
                }
            }

            // Update Transaction status and new total amount
            transaction.totalAmount = newTotalAmount;
            transaction.status = "completed";
            await transaction.save();
        }

        // Update Task status
        task.status = "completed";
        await task.save();

        res.status(200).json({ status: "success", data: task });
    } catch (error) {
        res.status(500).json({ message: error.message, status: "error" });
    }
};
