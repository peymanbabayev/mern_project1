import { Edit, Trash2, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/services/products/product.service";

interface ProductCardProps {
    product: Product;
    onDelete: (id: string) => void;
}

export default function ProductCard({ product, onDelete }: ProductCardProps) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("az-AZ", {
            style: "currency",
            currency: "AZN",
        }).format(price);
    };

    return (
        <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-none bg-card/50 backdrop-blur-sm ring-1 ring-border/50">
            <CardHeader className="p-0">
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {product.image ? (
                        <img
                            src={product.image}
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
                {/* Description gələcəkdə əlavə oluna bilər */}
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    Bu məhsul haqqında qısa məlumat (Mock description)...
                </p>
            </CardContent>

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
        </Card>
    );
}