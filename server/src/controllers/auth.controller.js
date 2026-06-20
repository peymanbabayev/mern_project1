import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

const generateToken = (id) => {
    return jwt.sign({ id }, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
    });
};

export const register = async (req, res) => {
    const { name, username, email, password, role } = req.body;

    try {
        const userExists = await User.findOne({ $or: [{ email }, { username }] });

        if (userExists) {
            return res.status(400).json({
                message: "User already exists",
                status: "fail",
            });
        }

        const assignedRole = role || "viewer";
        const assignedStatus = assignedRole === "viewer" ? "approved" : "pending";

        const user = await User.create({
            name,
            username,
            email,
            password,
            role: assignedRole,
            status: assignedStatus
        });

        if (user) {
            const successMessage = assignedStatus === "approved" 
                ? "User registered successfully." 
                : "User registered successfully. Please wait for admin approval.";

            res.status(201).json({
                message: successMessage,
                status: "success",
                data: {
                    _id: user._id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    status: user.status
                },
            });
        } else {
            res.status(400).json({ message: "Invalid user data", status: "fail" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message, status: "error" });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log(`[LOGIN ATTEMPT] Email: ${email}`);
        // Yalnız lazım olan sahələri seç (performance optimization)
        const user = await User.findOne({ email }).select('+password'); // password default olaraq exclude olunur

        if (!user) {
            console.log("[LOGIN FAILED] User not found");
            return res.status(401).json({ message: "Invalid email or password", status: "fail" });
        }

        const isMatch = await user.matchPassword(password);
        console.log(`[LOGIN DEBUG] Password match result: ${isMatch}`);

        if (isMatch) {
            if (user.status !== "approved") {
                return res.status(403).json({ message: "Account pending approval or rejected", status: "fail" });
            }

            res.json({
                message: "Login successful",
                status: "success",
                data: {
                    _id: user._id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                    favorites: user.favorites,
                    token: generateToken(user._id),
                },
            });
        } else {
            console.log("[LOGIN FAILED] Password incorrect");
            res.status(401).json({ message: "Invalid email or password", status: "fail" });
        }
    } catch (error) {
        console.error("[LOGIN ERROR]", error);
        res.status(500).json({ message: error.message, status: "error" });
    }
};

export const getMe = async (req, res) => {
    try {
        // .lean() - Plain JS obyektləri qaytarır (sürətli)
        // .select() - Password-u exclude edir
        const user = await User.findById(req.user._id)
            .select('-password') // Password-u göndərmə
            .populate({
                path: 'favorites',
                select: 'name price image' // Favorites-də yalnız lazım olan sahələr
            })
            .lean();

        res.json({
            message: "User found",
            status: "success",
            data: user
        });
    } catch (error) {
        res.status(500).json({ message: error.message, status: "error" });
    }
};
