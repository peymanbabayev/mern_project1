import mongoose from "mongoose";

const stockMovementSchema = new mongoose.Schema(
    {
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        warehouse: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Warehouse",
            required: true,
        },
        type: {
            type: String,
            enum: ["in", "out", "transfer", "adjustment"],
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
        relatedTransaction: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Transaction", // Can be null if it's a manual adjustment
        },
        notes: {
            type: String,
            trim: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

stockMovementSchema.index({ product: 1, warehouse: 1 });
stockMovementSchema.index({ createdAt: -1 });

const StockMovement = mongoose.model("StockMovement", stockMovementSchema);

export default StockMovement;
