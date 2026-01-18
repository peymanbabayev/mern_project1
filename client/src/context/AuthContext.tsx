import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
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
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const refreshUser = async () => {
        try {
            const response = await authService.getCurrentUser();
            if (response.status === "success") {
                // response.data IS the user object (based on getMe controller)
                setUser(response.data);
            }
        } catch (error) {
            console.error("Failed to refresh user", error);
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            const token = tokenManager.get();
            if (token) {
                await refreshUser();
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (credentials: any) => {
        try {
            const response = await authService.login(credentials);
            if (response.status === "success") {
                // response.data should contain user and token
                const { token, ...userData } = response.data;

                if (token) {
                    tokenManager.set(token);
                    setUser(userData);
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
            if (response.status === "success") {
                const { token, ...userData } = response.data;

                if (token) {
                    tokenManager.set(token);
                    setUser(userData);
                }
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        tokenManager.remove();
        setUser(null);
        window.location.href = "/login";
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
