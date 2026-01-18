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

            req.user = await User.findById(decoded.id).select("-password");

            if (!req.user) {
                return res
                    .status(401)
                    .json({ message: "Not authorized, user not found", status: "fail" });
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

export const admin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ message: "Not authorized as an admin", status: "fail" });
    }
};
