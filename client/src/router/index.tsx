import { createBrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

// Lazy loading optimization
const Home = lazy(() => import("@/pages/Home"));
const Products = lazy(() => import("@/pages/Products"));
const AddProduct = lazy(() => import("@/pages/AddProduct"));
const EditProduct = lazy(() => import("@/pages/EditProduct"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const Favorites = lazy(() => import("@/pages/Favorites"));
const AdminUsers = lazy(() => import("@/pages/AdminUsers"));

// Loading fallback component
const PageLoader = () => (
    <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
);

export const router = createBrowserRouter([
    {
        path: "/",
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
                path: "login",
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <Login />
                    </Suspense>
                ),
            },
            {
                path: "register",
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <Register />
                    </Suspense>
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
                    <ProtectedRoute allowedRoles={["admin", "manager", "vendor"]}>
                        <Suspense fallback={<PageLoader />}>
                            <AddProduct />
                        </Suspense>
                    </ProtectedRoute>
                ),
            },
            {
                path: "products/edit/:id",
                element: (
                    <ProtectedRoute allowedRoles={["admin", "manager", "vendor"]}>
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
        ],
    },
]);
