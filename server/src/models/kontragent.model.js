import mongoose from "mongoose";

const kontragentSchema = new mongoose.Schema(
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
        type: {
            type: String,
            enum: ["customer", "supplier", "both"],
            default: "customer",
        },
        contactPerson: {
            type: String,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
        },
        address: {
            type: String,
            trim: true,
        },
        taxId: {
            type: String, // VÖEN
            trim: true,
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

kontragentSchema.index({ type: 1 });
kontragentSchema.index({ name: "text" });

const Kontragent = mongoose.model("Kontragent", kontragentSchema);

export default Kontragent;
