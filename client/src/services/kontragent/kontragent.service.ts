import { apiClient, ApiResponse } from "@/services/api/client";
import { API_ENDPOINTS } from "@/services/api/endpoints";

export interface Kontragent {
  _id: string;
  name: string;
  type: "customer" | "supplier" | "both";
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KontragentListResponse {
  kontragents: Kontragent[];
  total: number;
  page: number;
  pages: number;
}

export interface CreateKontragentPayload {
  name: string;
  type: "customer" | "supplier" | "both";
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
  notes?: string;
}

export const kontragentService = {
  getAll: (params?: { page?: number; limit?: number; search?: string; type?: string }): Promise<ApiResponse<KontragentListResponse>> => {
    const url = new URL(API_ENDPOINTS.KONTRAGENTS.BASE);
    if (params?.page) url.searchParams.set("page", String(params.page));
    if (params?.limit) url.searchParams.set("limit", String(params.limit));
    if (params?.search) url.searchParams.set("search", params.search);
    if (params?.type) url.searchParams.set("type", params.type);
    return apiClient.get<KontragentListResponse>(url.toString());
  },

  getById: (id: string): Promise<ApiResponse<Kontragent>> => {
    return apiClient.get<Kontragent>(API_ENDPOINTS.KONTRAGENTS.BY_ID(id));
  },

  create: (data: CreateKontragentPayload): Promise<ApiResponse<Kontragent>> => {
    return apiClient.post<Kontragent>(API_ENDPOINTS.KONTRAGENTS.BASE, data);
  },

  update: (id: string, data: Partial<CreateKontragentPayload>): Promise<ApiResponse<Kontragent>> => {
    return apiClient.put<Kontragent>(API_ENDPOINTS.KONTRAGENTS.BY_ID(id), data);
  },

  delete: (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<null>(API_ENDPOINTS.KONTRAGENTS.BY_ID(id));
  },
};
