import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

/**
 * Server configuration object
 * Centralizes all environment variables and provides defaults
 */
const config = {
    // Server settings
    server: {
        port: parseInt(process.env.PORT || "5000", 10),
        nodeEnv: process.env.NODE_ENV || "development",
        isDevelopment: process.env.NODE_ENV === "development",
        isProduction: process.env.NODE_ENV === "production",
    },

    // Database settings
    database: {
        mongoUrl: process.env.MONGO_URL || "mongodb://localhost:27017/mern_project1",
    },

    // CORS settings
    cors: {
        clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    },

    // File upload settings
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880", 10), // 5MB default
        allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || "image/jpeg,image/png,image/jpg,image/webp,image/gif").split(","),
        uploadDir: "uploads",
    },

    // JWT settings (for future authentication)
    jwt: {
        secret: process.env.JWT_SECRET || "default_jwt_secret_change_in_production",
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },

    // API settings
    api: {
        version: process.env.API_VERSION || "v1",
        prefix: "/api",
    },
};

/**
 * Validates required environment variables
 * @throws {Error} If required variables are missing
 */
export const validateConfig = () => {
    const requiredVars = ["MONGO_URL"];

    const missing = requiredVars.filter((varName) => !process.env[varName]);

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(", ")}\n` +
            `Please check your .env file and ensure all required variables are set.`
        );
    }

    // Warn about using default JWT secret in production
    if (config.server.isProduction && process.env.JWT_SECRET === undefined) {
        console.warn(
            "⚠️  WARNING: Using default JWT secret in production! Please set JWT_SECRET in your .env file."
        );
    }
};

export default config;
