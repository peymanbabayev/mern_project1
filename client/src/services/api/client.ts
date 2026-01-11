import {
  requestInterceptor,
  responseInterceptor,
  tokenManager, // Re-exporting tokenManager for convenience
} from "./interceptors";

// Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}

// Custom error class
export class ApiRequestError extends Error {
  statusCode?: number;
  errorData?: unknown;

  constructor(message: string, statusCode?: number, errorData?: unknown) {
    super(message);
    this.name = "ApiRequestError";
    this.statusCode = statusCode;
    this.errorData = errorData;
  }
}

// Re-export tokenManager
export { tokenManager };

// Base request function
const request = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    // Use Request Interceptor
    const refinedOptions = requestInterceptor(options);

    const response = await fetch(url, refinedOptions);

    // Use Response Interceptor
    return (await responseInterceptor(response)) as ApiResponse<T>;
  } catch (error: any) {
    console.error("API Request Error:", error);

    // Re-throw if already ApiRequestError
    if (error instanceof ApiRequestError) {
      throw error;
    }

    // Handle structured error from responseInterceptor
    if (error.statusCode && error.message) {
      throw new ApiRequestError(error.message, error.statusCode, error.data);
    }

    // Otherwise create new ApiRequestError
    throw new ApiRequestError(
      error instanceof Error ? error.message : "Unknown error occurred"
    );
  }
};

// GET
const get = async <T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> => {
  return request<T>(url, { ...options, method: "GET" });
};

// POST
const post = async <T>(
  url: string,
  body?: unknown,
  options?: RequestInit
): Promise<ApiResponse<T>> => {
  const isFormData = body instanceof FormData;
  return request<T>(url, {
    ...options,
    method: "POST",
    body: isFormData ? (body as BodyInit) : JSON.stringify(body),
  });
};

// PUT
const put = async <T>(
  url: string,
  body?: unknown,
  options?: RequestInit
): Promise<ApiResponse<T>> => {
  const isFormData = body instanceof FormData;
  return request<T>(url, {
    ...options,
    method: "PUT",
    body: isFormData ? (body as BodyInit) : JSON.stringify(body),
  });
};

// PATCH
const patch = async <T>(
  url: string,
  body?: unknown,
  options?: RequestInit
): Promise<ApiResponse<T>> => {
  const isFormData = body instanceof FormData;
  return request<T>(url, {
    ...options,
    method: "PATCH",
    body: isFormData ? (body as BodyInit) : JSON.stringify(body),
  });
};

// DELETE
const del = async <T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> => {
  return request<T>(url, { ...options, method: "DELETE" });
};

// Export as object
export const apiClient = {
  get,
  post,
  put,
  patch,
  delete: del,
} as const;
