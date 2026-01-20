import { Edit, Trash2, ShoppingCart, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/services/products/product.service";
import config from "@/config/config";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/user/user.service";

interface ProductCardProps {
    product: Product;
    onDelete: (id: string) => void;
    onToggleFavorite?: () => void;
}

export default function ProductCard({ product, onDelete, onToggleFavorite }: ProductCardProps) {
    const { user, refreshUser, isAuthenticated } = useAuth();
    const queryClient = useQueryClient();

    // Handle populated favorites (objects) or ID strings
    const isFavorite = user?.favorites?.some((fav: any) =>
        (typeof fav === 'string' ? fav : fav._id) === product._id
    );

    const formatPrice = (price: number) => new Intl.NumberFormat("az-AZ", { style: "currency", currency: "AZN" }).format(price);

    const getProductImageUrl = (imagePath: string) => {
        if (!imagePath) return null;
        if (imagePath.startsWith("http") || imagePath.startsWith("blob:")) return imagePath;
        const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
        return `${config.api.serverUrl}${path}`;
    };

    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) return;

        try {
            await userService.toggleFavorite(product._id);
            await refreshUser();
            // Invalidate favorites query to ensure sync across pages
            queryClient.invalidateQueries({ queryKey: ["favorites"] });

            if (onToggleFavorite) onToggleFavorite();
        } catch (error) {
            console.error("Failed to toggle favorite", error);
        }
    };

    return (
        <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-none bg-card/50 backdrop-blur-sm ring-1 ring-border/50 relative">
            {/* Favorite Button - Touch Friendly */}
            <button
                onClick={handleToggleFavorite}
                className={`absolute top-2 left-2 md:top-3 md:left-3 z-10 p-2.5 md:p-2 rounded-full bg-white/90 backdrop-blur transition-all active:scale-95 ${isFavorite ? "text-red-500 hover:text-red-600 shadow-lg" : "text-gray-400 hover:text-red-500 shadow-md"
                    }`}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
                <Heart className={`w-5 h-5 md:w-5 md:h-5 ${isFavorite ? "fill-current" : ""}`} />
            </button>

            <CardHeader className="p-0">
                <div className="relative aspect-square md:aspect-[4/3] overflow-hidden bg-muted">
                    {product.image ? (
                        <img
                            src={getProductImageUrl(product.image) || ""}
                            alt={product.name}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                        />
                    ) : (
                        <div className="flex items-center justify-center w-full h-full text-muted-foreground bg-secondary/30">
                            <ShoppingCart className="w-12 h-12 md:w-16 md:h-16 opacity-20" />
                        </div>
                    )}
                    <Badge className="absolute top-2 right-2 md:top-3 md:right-3 bg-white/95 text-black hover:bg-white shadow-md backdrop-blur text-xs md:text-sm px-2 py-1 md:px-2.5 md:py-1">
                        {formatPrice(product.price)}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="p-4 md:p-5">
                <h3 className="font-semibold text-base md:text-lg line-clamp-2 md:line-clamp-1 group-hover:text-primary transition-colors leading-snug">
                    {product.name}
                </h3>
            </CardContent>

            {user?.role === "admin" && (
                <CardFooter className="p-4 md:p-5 pt-0 flex gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 hover:bg-primary hover:text-primary-foreground transition-colors text-sm md:text-base h-9 md:h-8 active:scale-95"
                        asChild
                    >
                        <Link to={`/products/edit/${product._id}`}>
                            <Edit className="w-4 h-4 mr-1.5 md:mr-2" />
                            <span className="hidden xs:inline">Düzəlt</span>
                            <span className="xs:hidden">Edit</span>
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive hover:bg-destructive hover:text-white border-destructive/20 hover:border-destructive transition-colors h-9 w-9 md:h-8 md:w-8 active:scale-95"
                        onClick={() => onDelete(product._id)}
                        aria-label="Delete product"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}