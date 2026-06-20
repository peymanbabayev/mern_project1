import User from "../models/user.model.js";
import AuditLog from "../models/audit.model.js";

export const toggleFavorite = async (req, res) => {
    const { productId } = req.body;
    const userId = req.user._id;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found", status: "fail" });
        }

        const isFavorite = user.favorites.includes(productId);
        let updatedUser;

        if (isFavorite) {
            // Remove from favorites using $pull (more efficient and atomic)
            updatedUser = await User.findByIdAndUpdate(
                userId,
                { $pull: { favorites: productId } },
                { new: true }
            ).populate("favorites");
            res.json({ message: "Product removed from favorites", status: "success", favorites: updatedUser.favorites });
        } else {
            // Add to favorites using $addToSet (prevents duplicates)
            updatedUser = await User.findByIdAndUpdate(
                userId,
                { $addToSet: { favorites: productId } },
                { new: true }
            ).populate("favorites");
            res.json({ message: "Product added to favorites", status: "success", favorites: updatedUser.favorites });
        }
    } catch (error) {
        res.status(500).json({ message: error.message, status: "error" });
    }
};

export const getFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('favorites') // Yalnız favorites sahəsini seç
            .populate({
                path: 'favorites',
                select: 'name price image createdAt', // Yalnız lazım olan sahələr
                options: { sort: { createdAt: -1 } } // Ən yeniləri əvvəl
            })
            .lean();

        if (!user) {
            return res.status(404).json({ message: "User not found", status: "fail" });
        }
        res.json({ message: "Favorites retrieved", status: "success", data: user.favorites });
    } catch (error) {
        res.status(500).json({ message: error.message, status: "error" });
    }
}

// Admin: Get all pending users
export const getPendingUsers = async (req, res) => {
    try {
        const pendingUsers = await User.find({ status: "pending" }).select("-password");
        res.json({ status: "success", data: pendingUsers });
    } catch (error) {
        res.status(500).json({ message: error.message, status: "error" });
    }
};

// Admin: Approve or Reject user
export const updateUserStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // "approved" or "rejected"

    if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status", status: "fail" });
    }

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found", status: "fail" });
        }

        const oldStatus = user.status;
        user.status = status;
        await user.save();

        // Log action
        await AuditLog.create({
            user: req.user._id,
            action: `UPDATE_USER_STATUS`,
            entity: "User",
            entityId: user._id,
            details: { oldStatus, newStatus: status }
        });

        res.json({ message: `User status updated to ${status}`, status: "success", data: { _id: user._id, status: user.status } });
    } catch (error) {
        res.status(500).json({ message: error.message, status: "error" });
    }
};

// Admin: Change user role
export const updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body; 

    if (!["admin", "owner", "accountant", "sales_manager", "sales_rep", "purchasing", "warehouse", "viewer"].includes(role)) {
        return res.status(400).json({ message: "Invalid role", status: "fail" });
    }

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found", status: "fail" });
        }

        const oldRole = user.role;
        user.role = role;
        await user.save();

        // Log action
        await AuditLog.create({
            user: req.user._id,
            action: `UPDATE_USER_ROLE`,
            entity: "User",
            entityId: user._id,
            details: { oldRole, newRole: role }
        });

        res.json({ message: `User role updated to ${role}`, status: "success", data: { _id: user._id, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: error.message, status: "error" });
    }
};
