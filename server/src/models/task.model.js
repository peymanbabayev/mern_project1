import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        type: {
            type: String,
            enum: ["receive_purchase", "ship_sale", "other"],
            required: true,
        },
        referenceId: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "referenceModel",
        },
        referenceModel: {
            type: String,
            enum: ["Transaction", "Other"],
        },
        assignedRole: {
            type: String,
            enum: ["admin", "owner", "accountant", "sales_manager", "sales_rep", "purchasing", "warehouse", "viewer"],
        },
        assignedUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        status: {
            type: String,
            enum: ["pending", "in_progress", "completed", "cancelled"],
            default: "pending",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

taskSchema.index({ assignedRole: 1, status: 1 });
taskSchema.index({ assignedUser: 1, status: 1 });
taskSchema.index({ createdAt: -1 });

const Task = mongoose.model("Task", taskSchema);

export default Task;
