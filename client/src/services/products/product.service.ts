import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";

// Interfaces for Type Safety (Best Practice)
export interface Product {
  _id: string;
  name: string;
  image?: string;
  costPrice: number;
  salePrice: number;
  stockCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductDTO {
    name: string;
    costPrice: number;
    salePrice: number;
    stockCount: number;
    notes?: string;
    image?: string;
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {}

export const productService = {
  // Get all products
  getAll: async () => {
    return await apiClient.get<Product[]>(API_ENDPOINTS.PRODUCTS.BASE);
  },

  // Get product stats
  getStats: async () => {
    return await apiClient.get<any>(`${API_ENDPOINTS.PRODUCTS.BASE}/stats`);
  },

  // Get single product
  getById: async (id: string) => {
    return await apiClient.get<Product>(API_ENDPOINTS.PRODUCTS.BY_ID(id));
  },

  // Create product
  // DTO (Data Transfer Object) istifadə etmək tip təhlükəsizliyi üçündür
  create: async (data: CreateProductDTO | FormData) => {
    return await apiClient.post<Product>(API_ENDPOINTS.PRODUCTS.BASE, data);
  },

  // Update product
  update: async (id: string, data: UpdateProductDTO | FormData) => {
    return await apiClient.put<Product>(API_ENDPOINTS.PRODUCTS.BY_ID(id), data);
  },

  // Delete product
  delete: async (id: string) => {
    return await apiClient.delete<void>(API_ENDPOINTS.PRODUCTS.BY_ID(id));
  },
};
