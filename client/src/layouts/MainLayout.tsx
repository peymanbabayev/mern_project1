import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";

export default function MainLayout() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto p-4 md:p-8">
                <Outlet />
            </main>
        </div>
    );
}
