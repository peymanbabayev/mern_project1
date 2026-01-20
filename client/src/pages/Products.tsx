import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { productService } from "@/services/products/product.service";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

export default function Products() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuth();

    // Fetch Products with Caching Strategy
    const { data: products, isLoading, isError, error, refetch } = useQuery({
        queryKey: ["products"],
        queryFn: async () => {
            const response = await productService.getAll();
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: productService.delete,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
        onError: (err) => alert("Silinmə zamanı xəta baş verdi: " + err),
    });

    const handleDelete = (id: string) => {
        if (window.confirm("Bu məhsulu silmək istədiyinizə əminsiniz?")) deleteMutation.mutate(id);
    };

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Məhsullar</h1>
                        <p className="text-muted-foreground">Sistemdəki bütün məhsulların idarə edilməsi</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <Card key={i} className="overflow-hidden">
                            <div className="aspect-square bg-muted animate-pulse" />
                            <CardHeader>
                                <div className="h-6 bg-muted rounded animate-pulse mb-2" />
                                <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="container mx-auto py-10 px-4">
                <Card className="border-destructive max-w-lg mx-auto">
                    <CardHeader>
                        <CardTitle className="text-destructive flex items-center gap-2">❌ Xəta baş verdi</CardTitle>
                        <CardDescription>{(error as Error).message}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button onClick={() => refetch()} variant="outline" className="w-full">Yenidən cəhd et</Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Məhsullar</h1>
                    <p className="text-muted-foreground"> Sistemdəki bütün məhsulların idarə edilməsi</p>
                </div>
                {user?.role === "admin" && (
                    <Button onClick={() => navigate("/products/new")} className="w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" /> Yeni Məhsul
                    </Button>
                )}
            </div>

            {/* Grid Content */}
            {products && products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard
                            key={product._id}
                            product={product}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center min-h-[40vh] border-2 border-dashed rounded-lg bg-muted/50 p-8 text-center">
                    <h3 className="text-xl font-semibold">Heç bir məhsul tapılmadı 📦</h3>
                    <p className="text-muted-foreground mt-2 mb-6">
                        Hələlik bazada məhsul yoxdur.
                    </p>
                    {user?.role === "admin" && (
                        <Button onClick={() => navigate("/products/new")} variant="secondary">
                            <Plus className="mr-2 h-4 w-4" /> İndi Əlavə Et
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}