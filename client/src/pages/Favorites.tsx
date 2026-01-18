import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { userService } from "@/services/user/user.service";
import { Button } from "@/components/ui/button";

export default function Favorites() {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["favorites"],
        queryFn: userService.getFavorites,
    });

    const favorites = data?.data || [];

    const handleFavoriteChange = () => {
        refetch(); // Məsələn, siyahıdan silinəndə siyahını yenilə
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-red-500 py-10">Xəta baş verdi: {(error as Error).message}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Favoritlər ❤️</h1>
                <Button variant="outline" asChild>
                    <Link to="/products">Bütün Məhsullar</Link>
                </Button>
            </div>

            {favorites.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-lg">
                    <p className="text-xl text-muted-foreground mb-4">Hələ heç bir məhsulu bəyənməmisiniz</p>
                    <Button asChild>
                        <Link to="/products">Məhsullara göz at</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {favorites.map((product: any) => (
                        <ProductCard
                            key={product._id}
                            product={product}
                            onDelete={() => { }}
                            onToggleFavorite={handleFavoriteChange}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
