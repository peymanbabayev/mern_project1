import type { User } from "../auth/auth.service";
import { apiClient, type ApiResponse } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export const adminService = {
  getPendingUsers: async (): Promise<ApiResponse<User[]>> => {
    return apiClient.get(API_ENDPOINTS.ADMIN.PENDING_USERS);
  },

  updateUserStatus: async (userId: string, status: "approved" | "rejected"): Promise<ApiResponse<any>> => {
    return apiClient.put(API_ENDPOINTS.ADMIN.USER_STATUS(userId), { status });
  },

  updateUserRole: async (userId: string, role: string): Promise<ApiResponse<any>> => {
    return apiClient.put(API_ENDPOINTS.ADMIN.USER_ROLE(userId), { role });
  },
};
