import { apiClient, type ApiResponse } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";

// Define Types (Ideally these should be in a types folder, but here is fine for now)
export interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  role: "user" | "admin";
  favorites?: string[]; // Array of Product IDs
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  login: async (credentials: any): Promise<ApiResponse<any>> => {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
  },

  register: async (userData: any): Promise<ApiResponse<any>> => {
    return apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
  },

  getCurrentUser: async (): Promise<ApiResponse<any>> => {
    return apiClient.get(API_ENDPOINTS.AUTH.ME);
  },
};
