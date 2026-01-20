import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        favorites: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
        ],
    },
    {
        timestamps: true,
    }
);

// İndexlər - Auth sorğularının sürətini artırır
userSchema.index({ email: 1 }); // Login üçün
userSchema.index({ username: 1 }); // Username ilə axtarış üçün
userSchema.index({ role: 1 }); // Role-based queries üçün
userSchema.index({ createdAt: -1 }); // Tarix üzrə sıralama üçün


// Hash password before saving
userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        console.error("Error hashing password:", error);
        throw error;
    }
});

// Method to check password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method to return user info without password
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};

const User = mongoose.model("User", userSchema);

export default User;
