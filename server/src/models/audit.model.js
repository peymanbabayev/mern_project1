import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        action: {
            type: String, // e.g., "APPROVE_USER", "UPDATE_ROLE"
            required: true,
        },
        entity: {
            type: String, // e.g., "User", "Product"
            required: true,
        },
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        details: {
            type: mongoose.Schema.Types.Mixed, // Stores old/new values or additional info
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster querying
auditLogSchema.index({ user: 1 });
auditLogSchema.index({ entity: 1, entityId: 1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
