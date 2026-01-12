import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { productService } from "@/services/products/product.service";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Products() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Fetch Products
    const {
        data: products,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ["products"],
        queryFn: async () => {
            const response = await productService.getAll();
            return response.data;
        },
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: productService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
        onError: (err) => {
            alert("Silinmə zamanı xəta baş verdi: " + err);
        },
    });

    const handleDelete = (id: string) => {
        if (window.confirm("Bu məhsulu silmək istədiyinizə əminsiniz?")) {
            deleteMutation.mutate(id);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-muted-foreground animate-pulse">Məhsullar yüklənir...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="container mx-auto py-10 px-4">
                <Card className="border-destructive max-w-lg mx-auto">
                    <CardHeader>
                        <CardTitle className="text-destructive flex items-center gap-2">
                            ❌ Xəta baş verdi
                        </CardTitle>
                        <CardDescription>{(error as Error).message}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button onClick={() => refetch()} variant="outline" className="w-full">
                            Yenidən cəhd et
                        </Button>
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
                    <p className="text-muted-foreground">
                        Sistemdəki bütün məhsulların idarə edilməsi
                    </p>
                </div>
                <Button onClick={() => navigate("/products/new")} className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Yeni Məhsul
                </Button>
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
                        Hələlik bazada məhsul yoxdur. İlk məhsulu əlavə edərək başlayın.
                    </p>
                    <Button onClick={() => navigate("/products/new")} variant="secondary">
                        <Plus className="mr-2 h-4 w-4" /> İndi Əlavə Et
                    </Button>
                </div>
            )}
        </div>
    );
}