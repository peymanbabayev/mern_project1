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
};
