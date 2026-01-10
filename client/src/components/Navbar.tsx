import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Navbar() {
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
                        <Link to="/products/new" className="text-muted-foreground hover:text-foreground transition-colors">
                            Yeni Məhsul
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link to="/products/new">Əlavə et</Link>
                    </Button>
                </div>
            </div>
        </header>
    );
}