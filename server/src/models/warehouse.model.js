import mongoose from "mongoose";

const warehouseSchema = new mongoose.Schema(
    {
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        location: {
            type: String,
            trim: true,
        },
        manager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
        notes: {
            type: String,
            trim: true,
        }
    },
    {
        timestamps: true,
    }
);

const Warehouse = mongoose.model("Warehouse", warehouseSchema);

export default Warehouse;
