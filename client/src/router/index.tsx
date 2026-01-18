import { createBrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react";
import MainLayout from "@/layouts/MainLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

// Lazy loading optimization
const Home = lazy(() => import("@/pages/Home"));
const Products = lazy(() => import("@/pages/Products"));
const AddProduct = lazy(() => import("@/pages/AddProduct"));
const EditProduct = lazy(() => import("@/pages/EditProduct"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const Favorites = lazy(() => import("@/pages/Favorites"));

// Loading fallback component
const PageLoader = () => (
    <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
);

export const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <Home />
                    </Suspense>
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
                    <Suspense fallback={<PageLoader />}>
                        <Products />
                    </Suspense>
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
                    <ProtectedRoute adminOnly>
                        <Suspense fallback={<PageLoader />}>
                            <AddProduct />
                        </Suspense>
                    </ProtectedRoute>
                ),
            },
            {
                path: "products/edit/:id",
                element: (
                    <ProtectedRoute adminOnly>
                        <Suspense fallback={<PageLoader />}>
                            <EditProduct />
                        </Suspense>
                    </ProtectedRoute>
                ),
            },
        ],
    },
]);
