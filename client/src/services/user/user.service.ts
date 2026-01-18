import { apiClient, type ApiResponse } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";

export const userService = {
  toggleFavorite: async (productId: string): Promise<ApiResponse<any>> => {
    return apiClient.post(API_ENDPOINTS.USERS.FAVORITES, { productId });
  },

  getFavorites: async (): Promise<ApiResponse<any>> => {
    return apiClient.get(API_ENDPOINTS.USERS.FAVORITES);
  },
};
