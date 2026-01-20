import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Home, Package, PlusCircle, Heart, LogOut, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur-md shadow-sm">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                {/* Logo */}
                <Link
                    to="/"
                    className="text-xl md:text-2xl font-bold tracking-tight hover:text-primary transition-colors flex items-center gap-2"
                    onClick={closeMobileMenu}
                >
                    🛍️ <span className="hidden xs:inline">PMS</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Əsas Səhifə
                    </Link>
                    <Link to="/products" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Məhsullar
                    </Link>
                    {user?.role === "admin" && (
                        <Link to="/products/new" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                            <PlusCircle className="w-4 h-4" />
                            Yeni Məhsul
                        </Link>
                    )}
                </nav>

                {/* Desktop Auth Buttons */}
                <div className="hidden md:flex items-center gap-3">
                    {isAuthenticated ? (
                        <>
                            <span className="text-sm font-medium hidden lg:inline-block">Salam, {user?.name}</span>
                            <Button variant="ghost" size="sm" asChild>
                                <Link to="/favorites" className="flex items-center gap-2">
                                    <Heart className="w-4 h-4" />
                                    <span className="hidden lg:inline">Favoritlər</span>
                                </Link>
                            </Button>
                            {user?.role === "admin" && (
                                <Button variant="outline" size="sm" asChild className="hidden xl:flex">
                                    <Link to="/products/new">Əlavə et</Link>
                                </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={logout} className="flex items-center gap-2">
                                <LogOut className="w-4 h-4" />
                                Çıxış
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" size="sm" asChild>
                                <Link to="/login" className="flex items-center gap-2">
                                    <LogIn className="w-4 h-4" />
                                    Giriş
                                </Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link to="/register" className="flex items-center gap-2">
                                    <UserPlus className="w-4 h-4" />
                                    Qeydiyyat
                                </Link>
                            </Button>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t bg-card/98 backdrop-blur-lg animate-in slide-in-from-top-5 duration-200">
                    <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
                        <Link
                            to="/"
                            onClick={closeMobileMenu}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                        >
                            <Home className="w-5 h-5" />
                            <span className="font-medium">Əsas Səhifə</span>
                        </Link>
                        <Link
                            to="/products"
                            onClick={closeMobileMenu}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                        >
                            <Package className="w-5 h-5" />
                            <span className="font-medium">Məhsullar</span>
                        </Link>

                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/favorites"
                                    onClick={closeMobileMenu}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                                >
                                    <Heart className="w-5 h-5" />
                                    <span className="font-medium">Favoritlər</span>
                                </Link>
                                {user?.role === "admin" && (
                                    <Link
                                        to="/products/new"
                                        onClick={closeMobileMenu}
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                                    >
                                        <PlusCircle className="w-5 h-5" />
                                        <span className="font-medium">Yeni Məhsul</span>
                                    </Link>
                                )}
                                <div className="border-t my-2"></div>
                                <div className="px-4 py-2 text-sm text-muted-foreground">
                                    Salam, <span className="font-semibold text-foreground">{user?.name}</span>
                                </div>
                                <button
                                    onClick={() => { logout(); closeMobileMenu(); }}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-destructive/10 transition-colors text-destructive w-full text-left"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span className="font-medium">Çıxış</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="border-t my-2"></div>
                                <Link
                                    to="/login"
                                    onClick={closeMobileMenu}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                                >
                                    <LogIn className="w-5 h-5" />
                                    <span className="font-medium">Giriş</span>
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={closeMobileMenu}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                                >
                                    <UserPlus className="w-5 h-5" />
                                    <span className="font-medium">Qeydiyyat</span>
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}