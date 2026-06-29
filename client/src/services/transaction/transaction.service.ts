import { apiClient, ApiResponse } from "@/services/api/client";
import { API_ENDPOINTS } from "@/services/api/endpoints";

export interface TransactionItem {
  product: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Transaction {
  _id: string;
  type: "sale" | "purchase" | "refund_sale" | "refund_purchase";
  kontragent: { _id: string; name: string } | string;
  items: TransactionItem[];
  totalAmount: number;
  status: "draft" | "completed" | "cancelled";
  paymentStatus: "unpaid" | "partial" | "paid";
  createdBy: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionListResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  pages: number;
}

export interface CreateTransactionPayload {
  type: "sale" | "purchase" | "refund_sale" | "refund_purchase";
  kontragent: string;
  items: { product: string; quantity: number; unitPrice: number }[];
  status?: "draft" | "completed" | "cancelled";
  paymentStatus?: "unpaid" | "partial" | "paid";
  notes?: string;
}

export const transactionService = {
  getAll: (params?: { page?: number; limit?: number; type?: string; status?: string }): Promise<ApiResponse<TransactionListResponse>> => {
    const url = new URL(API_ENDPOINTS.TRANSACTIONS.BASE);
    if (params?.page) url.searchParams.set("page", String(params.page));
    if (params?.limit) url.searchParams.set("limit", String(params.limit));
    if (params?.type) url.searchParams.set("type", params.type);
    if (params?.status) url.searchParams.set("status", params.status);
    return apiClient.get<TransactionListResponse>(url.toString());
  },

  getById: (id: string): Promise<ApiResponse<Transaction>> => {
    return apiClient.get<Transaction>(API_ENDPOINTS.TRANSACTIONS.BY_ID(id));
  },

  create: (data: CreateTransactionPayload): Promise<ApiResponse<Transaction>> => {
    return apiClient.post<Transaction>(API_ENDPOINTS.TRANSACTIONS.BASE, data);
  },

  update: (id: string, data: Partial<CreateTransactionPayload>): Promise<ApiResponse<Transaction>> => {
    return apiClient.put<Transaction>(API_ENDPOINTS.TRANSACTIONS.BY_ID(id), data);
  },

  delete: (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<null>(API_ENDPOINTS.TRANSACTIONS.BY_ID(id));
  },
};
