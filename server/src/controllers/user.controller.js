import User from "../models/user.model.js";

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
        const user = await User.findById(req.user._id).populate('favorites');
        if (!user) {
            return res.status(404).json({ message: "User not found", status: "fail" });
        }
        res.json({ message: "Favorites retrieved", status: "success", data: user.favorites });
    } catch (error) {
        res.status(500).json({ message: error.message, status: "error" });
    }
}
