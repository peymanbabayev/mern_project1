import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";

export interface TaskItem {
    _id: string;
    title: string;
    description?: string;
    type: "receive_purchase" | "ship_sale" | "other";
    referenceId?: {
        _id: string;
        kontragent?: { name: string };
        items?: Array<{ quantity: number, product: { _id: string, name: string, image?: string } }>;
    };
    referenceModel?: string;
    status: "pending" | "in_progress" | "completed" | "cancelled";
    createdAt: string;
}

export interface TaskResponse {
    status: string;
    data: TaskItem[];
}

export const taskService = {
    getAll: async () => {
        return apiClient.get<TaskResponse>(API_ENDPOINTS.TASKS.BASE);
    },
    
    complete: async (id: string, payload: { warehouseId?: string, receivedItems?: { productId: string, actualQuantity: number }[] }) => {
        return apiClient.post<{ status: string, data: TaskItem }>(
            API_ENDPOINTS.TASKS.COMPLETE(id),
            payload
        );
    }
};
