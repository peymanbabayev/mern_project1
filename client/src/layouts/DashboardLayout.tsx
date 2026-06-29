import { Outlet, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { 
    Menu, X, Package, PlusCircle, Heart, LogOut, Users, 
    ChevronLeft, Bell, Search, LayoutDashboard, 
    UserRound, ArrowRightLeft, Warehouse
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { productService } from "@/services/products/product.service";
import { authService } from "@/services/auth/auth.service";
import { tokenManager } from "@/services/api/interceptors";

export default function DashboardLayout() {
    const { user, isAuthenticated, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const queryClient = useQueryClient();

    // Prefetch critical data
    useEffect(() => {
        const token = tokenManager.get();
        if (token) {
            queryClient.prefetchQuery({
                queryKey: ["products"],
                queryFn: async () => {
                    const response = await productService.getAll();
                    return response.data;
                },
                staleTime: 5 * 60 * 1000,
            });

            queryClient.prefetchQuery({
                queryKey: ["currentUser"],
                queryFn: async () => {
                    try {
                        const response = await authService.getCurrentUser();
                        if (response.status === "success") return response.data;
                        return null;
                    } catch (error) {
                        return null;
                    }
                },
                staleTime: 10 * 60 * 1000,
            });
        }
    }, [queryClient, isAuthenticated]);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    // Nav items
    const navItems = [
        { path: "/app", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
        { path: "/app/products", label: "Məhsullar", icon: <Package className="w-5 h-5" /> },
        ...(isAuthenticated ? [{ path: "/app/favorites", label: "Favoritlər", icon: <Heart className="w-5 h-5" /> }] : []),
        ...(user?.role === "admin" || user?.role === "viewer" || user?.role === "owner" || user?.role === "accountant" ? [
            { path: "/app/products/new", label: "Yeni Məhsul", icon: <PlusCircle className="w-5 h-5" /> },
        ] : []),
        // ── ERP Modules (visible to all logged in users) ──
        { path: "/app/kontragents", label: "Kontragentlər", icon: <UserRound className="w-5 h-5" /> },
        { path: "/app/transactions", label: "Qaimələr", icon: <ArrowRightLeft className="w-5 h-5" /> },
        { path: "/app/warehouses", label: "Anbarlar", icon: <Warehouse className="w-5 h-5" /> },
        { path: "/app/tasks", label: "Tapşırıqlar", icon: <Bell className="w-5 h-5" /> },
        // ── Admin ──
        ...(user?.role === "admin" ? [
            { path: "/app/admin/users", label: "İstifadəçilər", icon: <Users className="w-5 h-5" /> }
        ] : []),
    ];

    if (!isAuthenticated) {
        // Layout for unauthenticated (Login / Register) - full screen without header
        return (
            <div className="min-h-screen bg-background">
                <Outlet />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            {/* Desktop Sidebar */}
            <aside 
                className={`relative ${sidebarOpen ? 'w-64' : 'w-20'} hidden md:flex flex-col transition-all duration-300 ease-in-out border-r bg-sidebar text-sidebar-foreground z-20 shadow-xl`}
            >
                <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border/50">
                    {sidebarOpen && (
                        <Link to="/app" className="text-xl font-bold tracking-tight text-sidebar-primary-foreground flex items-center gap-2 overflow-hidden whitespace-nowrap animate-in fade-in">
                            <img src="/pms-favicon.png" alt="PMS Logo" className="w-7 h-7 rounded-lg object-cover" />
                            {sidebarOpen && <span>PMS</span>}
                        </Link>
                    )}
                    {!sidebarOpen && (
                        <Link to="/app" className="mx-auto" title="PMS">
                            <img src="/pms-favicon.png" alt="PMS Logo" className="w-8 h-8 rounded-lg object-cover" />
                        </Link>
                    )}
                </div>
                
                <div className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== "/app" && location.pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                                    isActive 
                                    ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-md' 
                                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                }`}
                                title={!sidebarOpen ? item.label : undefined}
                            >
                                <span className={`${isActive ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground'}`}>
                                    {item.icon}
                                </span>
                                {sidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
                            </Link>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-sidebar-border/50">
                    <button 
                        onClick={() => logout()}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/80 hover:bg-destructive/20 hover:text-red-400 transition-colors w-full ${!sidebarOpen && 'justify-center'}`}
                        title={!sidebarOpen ? "Çıxış" : undefined}
                    >
                        <LogOut className="w-5 h-5" />
                        {sidebarOpen && <span>Çıxış</span>}
                    </button>
                </div>
                
                {/* Sidebar Toggle Button */}
                <button 
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="absolute -right-3 top-20 z-50 bg-sidebar-primary text-sidebar-primary-foreground rounded-full p-1 shadow-lg hover:bg-primary transition-colors border border-background"
                >
                    <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${!sidebarOpen ? 'rotate-180' : ''}`} />
                </button>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
            )}

            {/* Mobile Sidebar */}
            <aside 
                className={`fixed inset-y-0 left-0 w-64 bg-sidebar text-sidebar-foreground z-50 transform transition-transform duration-300 ease-in-out md:hidden shadow-2xl ${
                    mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="h-16 flex items-center justify-between px-6 border-b border-sidebar-border/50">
                    <Link to="/app" className="text-xl font-bold tracking-tight text-sidebar-primary-foreground flex items-center gap-2">
                        <img src="/pms-favicon.png" alt="PMS Logo" className="w-7 h-7 rounded-lg object-cover" />
                        PMS
                    </Link>
                    <button onClick={() => setMobileMenuOpen(false)} className="text-sidebar-foreground/80 hover:text-sidebar-foreground">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="py-6 flex flex-col gap-2 px-4 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== "/app" && location.pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                                    isActive 
                                    ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-md' 
                                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                }`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                    <div className="border-t border-sidebar-border/50 my-2"></div>
                    <button 
                        onClick={() => logout()}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-destructive/20 hover:text-red-300 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Çıxış</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-background transition-all duration-300">
                {/* Top Navbar */}
                <header className="h-16 border-b bg-card/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 z-10 sticky top-0 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setMobileMenuOpen(true)}
                            className="md:hidden p-2 -ml-2 rounded-lg hover:bg-accent text-foreground"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        
                        {/* Global Search Placeholder */}
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-accent/50 hover:bg-accent border rounded-lg text-muted-foreground transition-colors w-64 max-w-md">
                            <Search className="w-4 h-4" />
                            <span className="text-sm">Axtarış...</span>
                            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                <span className="text-xs">⌘</span>K
                            </kbd>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <Button variant="ghost" size="icon" className="relative text-foreground">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full animate-pulse"></span>
                        </Button>
                        
                        <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-md">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="hidden sm:flex flex-col text-sm">
                                <span className="font-semibold leading-none">{user?.name}</span>
                                <span className="text-xs text-muted-foreground mt-1 capitalize">{user?.role}</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto w-full animate-in fade-in duration-500">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
