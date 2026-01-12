/// <reference types="vite/client" />

interface ImportMetaEnv {
  // API Configuration
  readonly VITE_API_BASE_URL: string;
  
  // App Configuration
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  
  // Environment
  readonly VITE_NODE_ENV: string;
  
  // Feature Flags
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_DEBUG: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
