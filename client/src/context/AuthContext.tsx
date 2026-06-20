import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authService, type User } from "../services/auth/auth.service";
import { tokenManager } from "../services/api/interceptors";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: any) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [loading, setLoading] = useState<boolean>(true);
    const queryClient = useQueryClient();

    // React Query ilə user data-nı cache-lə
    const { data: user = null, refetch } = useQuery({
        queryKey: ["currentUser"],
        queryFn: async () => {
            const token = tokenManager.get();
            if (!token) return null;

            try {
                const response = await authService.getCurrentUser();
                if (response.status === "success") {
                    return response.data;
                }
                return null;
            } catch (error) {
                console.error("Failed to fetch user", error);
                return null;
            }
        },
        staleTime: 10 * 60 * 1000, // 10 dəqiqə - user data fresh sayılır
        gcTime: 30 * 60 * 1000, // 30 dəqiqə - cache-də saxlanılır
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        enabled: !!tokenManager.get(), // Token varsa query işləsin
    });

    useEffect(() => {
        // İlk yükləmə bitdikdən sonra loading-i false et
        const token = tokenManager.get();
        if (token) {
            refetch().finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [refetch]);

    const refreshUser = async () => {
        await refetch();
    };

    const login = async (credentials: any) => {
        try {
            const response = await authService.login(credentials);
            if (response.status === "success") {
                const { token, ...userData } = response.data;

                if (token) {
                    tokenManager.set(token);
                    // User data-nı cache-ə yaz
                    queryClient.setQueryData(["currentUser"], userData);
                }
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            throw error;
        }
    };

    const register = async (userDataInput: any) => {
        try {
            const response = await authService.register(userDataInput);
            if (response.status !== "success") {
                throw new Error(response.message);
            }
            // Məlumat: Backend qeydiyyatdan sonra dərhal token qaytarmır,
            // çünki istifadəçi 'pending' statusundadır və admin təsdiqini gözləməlidir.
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        tokenManager.remove();
        // Cache-i təmizlə
        queryClient.setQueryData(["currentUser"], null);
        queryClient.clear(); // Bütün cache-i təmizlə
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
