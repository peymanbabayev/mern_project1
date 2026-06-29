import { apiClient, type ApiResponse } from "@/services/api/client";
import { API_ENDPOINTS } from "@/services/api/endpoints";

export interface Warehouse {
  _id: string;
  name: string;
  location?: string;
  manager?: string;
  status: "active" | "inactive";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseListResponse {
  warehouses: Warehouse[];
  total: number;
  page: number;
  pages: number;
}

export interface CreateWarehousePayload {
  name: string;
  location?: string;
  manager?: string;
  status?: "active" | "inactive";
  notes?: string;
}

export const warehouseService = {
  getAll: (params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<WarehouseListResponse>> => {
    const url = new URL(API_ENDPOINTS.WAREHOUSES.BASE);
    if (params?.page) url.searchParams.set("page", String(params.page));
    if (params?.limit) url.searchParams.set("limit", String(params.limit));
    if (params?.status) url.searchParams.set("status", params.status);
    return apiClient.get<WarehouseListResponse>(url.toString());
  },

  getById: (id: string): Promise<ApiResponse<Warehouse>> => {
    return apiClient.get<Warehouse>(API_ENDPOINTS.WAREHOUSES.BY_ID(id));
  },

  create: (data: CreateWarehousePayload): Promise<ApiResponse<Warehouse>> => {
    return apiClient.post<Warehouse>(API_ENDPOINTS.WAREHOUSES.BASE, data);
  },

  update: (id: string, data: Partial<CreateWarehousePayload>): Promise<ApiResponse<Warehouse>> => {
    return apiClient.put<Warehouse>(API_ENDPOINTS.WAREHOUSES.BY_ID(id), data);
  },

  delete: (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<null>(API_ENDPOINTS.WAREHOUSES.BY_ID(id));
  },

  getInventory: (id: string): Promise<ApiResponse<{ product: { _id: string, name: string, image?: string, costPrice?: number, salePrice?: number, stockCount: number }, stock: number }[]>> => {
    return apiClient.get<any>(API_ENDPOINTS.WAREHOUSES.INVENTORY(id));
  },
};
