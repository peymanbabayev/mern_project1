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
            {/* Favorite Button */}
            <button
                onClick={handleToggleFavorite}
                className={`absolute top-3 left-3 z-10 p-2 rounded-full bg-white/80 backdrop-blur transition-colors ${isFavorite ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-red-500"
                    }`}
            >
                <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
            </button>

            <CardHeader className="p-0">
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {product.image ? (
                        <img
                            src={getProductImageUrl(product.image) || ""}
                            alt={product.name}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                        />
                    ) : (
                        <div className="flex items-center justify-center w-full h-full text-muted-foreground bg-secondary/30">
                            <ShoppingCart className="w-12 h-12 opacity-20" />
                        </div>
                    )}
                    <Badge className="absolute top-3 right-3 bg-white/90 text-black hover:bg-white shadow-sm backdrop-blur">
                        {formatPrice(product.price)}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="p-5">
                <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                    {product.name}
                </h3>
            </CardContent>

            {user?.role === "admin" && (
                <CardFooter className="p-5 pt-0 flex gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                        asChild
                    >
                        <Link to={`/products/edit/${product._id}`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Düzəlt
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive hover:bg-destructive hover:text-white border-destructive/20 hover:border-destructive transition-colors"
                        onClick={() => onDelete(product._id)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}