import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();

    return (
        <header className="border-b bg-card">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-6">
                    <Link to="/" className="text-xl font-bold tracking-tight hover:text-primary transition-colors">
                        🛍️ PMS
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                        <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                            Əsas Səhifə
                        </Link>
                        <Link to="/products" className="text-muted-foreground hover:text-foreground transition-colors">
                            Məhsullar
                        </Link>
                        {user?.role === "admin" && (
                            <Link to="/products/new" className="text-muted-foreground hover:text-foreground transition-colors">
                                Yeni Məhsul
                            </Link>
                        )}
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    {isAuthenticated ? (
                        <>
                            <span className="text-sm font-medium hidden sm:inline-block">Salam, {user?.name}</span>
                            <Button variant="ghost" size="sm" asChild>
                                <Link to="/favorites">Favoritlər ❤️</Link>
                            </Button>
                            {user?.role === "admin" && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link to="/products/new">Əlavə et</Link>
                                </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={logout}>
                                Çıxış
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" size="sm" asChild>
                                <Link to="/login">Giriş</Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link to="/register">Qeydiyyat</Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}