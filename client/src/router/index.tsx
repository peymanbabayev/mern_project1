import { createBrowserRouter, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

// Lazy loading optimization
const Landing = lazy(() => import("@/pages/Landing"));
const Home = lazy(() => import("@/pages/Home"));
const Products = lazy(() => import("@/pages/Products"));
const AddProduct = lazy(() => import("@/pages/AddProduct"));
const EditProduct = lazy(() => import("@/pages/EditProduct"));
const AuthLayout = lazy(() => import("@/layouts/AuthLayout"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const Favorites = lazy(() => import("@/pages/Favorites"));
const AdminUsers = lazy(() => import("@/pages/AdminUsers"));
// ERP Modules
const Kontragents = lazy(() => import("@/pages/Kontragents"));
const Transactions = lazy(() => import("@/pages/Transactions"));
const Warehouses = lazy(() => import("@/pages/Warehouses"));
const Tasks = lazy(() => import("@/pages/Tasks"));

// Loading fallback component
const PageLoader = () => (
    <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
);

export const router = createBrowserRouter([
    // ── PUBLIC: Landing Page ──────────────────────────────────────
    {
        path: "/",
        element: (
            <Suspense fallback={<PageLoader />}>
                <Landing />
            </Suspense>
        ),
    },

    // ── AUTH: Login / Register ────────────────────────────────────
    {
        element: (
            <Suspense fallback={<PageLoader />}>
                <AuthLayout />
            </Suspense>
        ),
        children: [
            {
                path: "/login",
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <Login />
                    </Suspense>
                ),
            },
            {
                path: "/register",
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <Register />
                    </Suspense>
                ),
            },
        ],
    },

    // ── APP: Protected Dashboard (all inside /app) ────────────────
    {
        path: "/app",
        element: <DashboardLayout />,
        children: [
            {
                index: true,
                element: (
                    <ProtectedRoute>
                        <Suspense fallback={<PageLoader />}>
                            <Home />
                        </Suspense>
                    </ProtectedRoute>
                ),
            },
            {
                path: "products",
                element: (
                    <ProtectedRoute>
                        <Suspense fallback={<PageLoader />}>
                            <Products />
                        </Suspense>
                    </ProtectedRoute>
                ),
            },
            {
                path: "favorites",
                element: (
                    <ProtectedRoute>
                        <Suspense fallback={<PageLoader />}>
                            <Favorites />
                        </Suspense>
                    </ProtectedRoute>
                ),
            },
            {
                path: "products/new",
                element: (
                    <ProtectedRoute allowedRoles={["admin", "viewer", "owner", "accountant"]}>
                        <Suspense fallback={<PageLoader />}>
                            <AddProduct />
                        </Suspense>
                    </ProtectedRoute>
                ),
            },
            {
                path: "products/edit/:id",
                element: (
                    <ProtectedRoute allowedRoles={["admin", "viewer", "owner"]}>
                        <Suspense fallback={<PageLoader />}>
                            <EditProduct />
                        </Suspense>
                    </ProtectedRoute>
                ),
            },
            {
                path: "admin/users",
                element: (
                    <ProtectedRoute allowedRoles={["admin"]}>
                        <Suspense fallback={<PageLoader />}>
                            <AdminUsers />
                        </Suspense>
                    </ProtectedRoute>
                ),
            },
            // ── ERP MODULES ──────────────────────────────────────────────
            {
                path: "kontragents",
                element: (
                    <ProtectedRoute>
                        <Suspense fallback={<PageLoader />}>
                            <Kontragents />
                        </Suspense>
                    </ProtectedRoute>
                ),
            },
            {
                path: "transactions",
                element: (
                    <ProtectedRoute>
                        <Suspense fallback={<PageLoader />}>
                            <Transactions />
                        </Suspense>
                    </ProtectedRoute>
                ),
            },
            {
                path: "warehouses",
                element: (
                    <ProtectedRoute>
                        <Suspense fallback={<PageLoader />}>
                            <Warehouses />
                        </Suspense>
                    </ProtectedRoute>
                ),
            },
            {
                path: "tasks",
                element: (
                    <ProtectedRoute>
                        <Suspense fallback={<PageLoader />}>
                            <Tasks />
                        </Suspense>
                    </ProtectedRoute>
                ),
            },
        ],
    },

    // Catch-all redirect
    {
        path: "*",
        element: <Navigate to="/" replace />,
    },
]);
