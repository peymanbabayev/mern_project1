/**
 * Client-side configuration
 * All environment variables must be prefixed with VITE_ to be exposed to the client
 */

interface AppConfig {
  api: {
    baseUrl: string;
    serverUrl: string;
  };
  app: {
    name: string;
    version: string;
  };
  env: {
    isDevelopment: boolean;
    isProduction: boolean;
    mode: string;
  };
  features: {
    analytics: boolean;
    debug: boolean;
  };
}

const config: AppConfig = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
    serverUrl: import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:5000",
  },

  // App Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || "MERN Project",
    version: import.meta.env.VITE_APP_VERSION || "1.0.0",
  },

  // Environment Configuration
  env: {
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    mode: import.meta.env.MODE,
  },

  // Feature Flags
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === "true",
    debug: import.meta.env.VITE_ENABLE_DEBUG === "true",
  },
};

/**
 * Validates the configuration
 * Logs warnings for missing or invalid configuration
 */
export const validateConfig = (): void => {
  if (!config.api.baseUrl) {
    console.warn("⚠️  API Base URL is not configured. Using default.");
  }

  if (config.env.isDevelopment && config.features.debug) {
    console.log("🔧 Debug mode is enabled");
    console.log("📋 Current configuration:", config);
    console.log("🔗 VITE_API_BASE_URL from ENV:", import.meta.env.VITE_API_BASE_URL);
  }
};

// Validate on load
validateConfig();

export default config;
