import config from "@/config/config";

// Backend server.js-də routes "/api/products" kimi təyin edilib
export const API_BASE_URL = config.api.baseUrl;

export const API_ENDPOINTS = {
  PRODUCTS: {
    BASE: `${API_BASE_URL}/products`,
    BY_ID: (id: string) => `${API_BASE_URL}/products/${id}`,
  },

  //   AUTH
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    ME: `${API_BASE_URL}/auth/me`,
  },

  //   USERS
  USERS: {
    BASE: `${API_BASE_URL}/user`,
    FAVORITES: `${API_BASE_URL}/user/favorites`,
  },

  //   ADMIN
  ADMIN: {
    PENDING_USERS: `${API_BASE_URL}/user/pending`,
    USER_STATUS: (id: string) => `${API_BASE_URL}/user/${id}/status`,
    USER_ROLE: (id: string) => `${API_BASE_URL}/user/${id}/role`,
  },

  // ERP: KONTRAGENT
  KONTRAGENTS: {
    BASE: `${API_BASE_URL}/kontragents`,
    BY_ID: (id: string) => `${API_BASE_URL}/kontragents/${id}`,
  },

  // ERP: TRANSACTIONS
  TRANSACTIONS: {
    BASE: `${API_BASE_URL}/transactions`,
    BY_ID: (id: string) => `${API_BASE_URL}/transactions/${id}`,
  },

  // ERP: WAREHOUSE
  WAREHOUSES: {
    BASE: `${API_BASE_URL}/warehouses`,
    BY_ID: (id: string) => `${API_BASE_URL}/warehouses/${id}`,
    INVENTORY: (id: string) => `${API_BASE_URL}/warehouses/${id}/inventory`,
  },

  // ERP: TASKS
  TASKS: {
    BASE: `${API_BASE_URL}/tasks`,
    COMPLETE: (id: string) => `${API_BASE_URL}/tasks/${id}/complete`,
  },
};
