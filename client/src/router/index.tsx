import { createBrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react";
import MainLayout from "@/layouts/MainLayout";

// Lazy loading optimization - Senior Pattern for Performance
// Bu yanaşma tətbiqin ilkin yüklənmə sürətini artırır (Code Splitting)
const Home = lazy(() => import("@/pages/Home"));
const Products = lazy(() => import("@/pages/Products"));
const AddProduct = lazy(() => import("@/pages/AddProduct"));
const EditProduct = lazy(() => import("@/pages/EditProduct"));

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
                path: "products",
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <Products />
                    </Suspense>
                ),
            },
            {
                path: "products/new",
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <AddProduct />
                    </Suspense>
                ),
            },
            {
                path: "products/edit/:id",
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <EditProduct />
                    </Suspense>
                ),
            },
        ],
    },
]);
