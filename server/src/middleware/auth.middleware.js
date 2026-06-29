import jwt from "jsonwebtoken";
import config from "../config/config.js";
import User from "../models/user.model.js";

export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(token, config.jwt.secret);

            req.user = await User.findById(decoded.id).select("-password").populate("company", "_id name");

            if (!req.user) {
                return res
                    .status(401)
                    .json({ message: "Not authorized, user not found", status: "fail" });
            }

            if (req.user.status !== "approved") {
                return res.status(403).json({ message: "Not authorized, account pending approval or rejected", status: "fail" });
            }

            // Normalize company to ObjectId for easy use in controllers
            if (req.user.company && req.user.company._id) {
                req.user.companyId = req.user.company._id;
            } else {
                req.user.companyId = req.user.company;
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: "Not authorized, token failed", status: "fail" });
        }
    } else {
        res.status(401).json({ message: "Not authorized, no token", status: "fail" });
    }
};

export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // DEMO REQUIREMENT: admin and viewer have full access
        if (req.user && (req.user.role === 'admin' || req.user.role === 'viewer')) {
            return next();
        }

        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role '${req.user ? req.user.role : 'none'}' is not authorized to access this route`,
                status: "fail",
            });
        }
        next();
    };
};
