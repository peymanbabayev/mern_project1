import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { productService } from "@/services/products/product.service";
import { authService } from "@/services/auth/auth.service";
import { tokenManager } from "@/services/api/interceptors";

export default function MainLayout() {
    const queryClient = useQueryClient();

    // App yüklənən kimi critical data-nı prefetch et
    useEffect(() => {
        // 1. Məhsulları prefetch et
        queryClient.prefetchQuery({
            queryKey: ["products"],
            queryFn: async () => {
                const response = await productService.getAll();
                return response.data;
            },
            staleTime: 5 * 60 * 1000, // 5 dəqiqə
        });

        // 2. User data-nı prefetch et (token varsa)
        const token = tokenManager.get();
        if (token) {
            queryClient.prefetchQuery({
                queryKey: ["currentUser"],
                queryFn: async () => {
                    try {
                        const response = await authService.getCurrentUser();
                        if (response.status === "success") {
                            return response.data;
                        }
                        return null;
                    } catch (error) {
                        console.error("Failed to prefetch user", error);
                        return null;
                    }
                },
                staleTime: 10 * 60 * 1000, // 10 dəqiqə
            });
        }
    }, [queryClient]);

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto p-4 md:p-8">
                <Outlet />
            </main>
        </div>
    );
}
