import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/products/product.service";
import ProductForm from "@/components/ProductForm";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditProduct() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Fetch product data
    const { data: response, isLoading: isFetching, isError } = useQuery({
        queryKey: ["product", id],
        queryFn: () => productService.getById(id!),
        enabled: !!id,
    });

    const product = response?.data;

    // Update mutation
    const mutation = useMutation({
        mutationFn: (data: FormData) => productService.update(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["product", id] });
            queryClient.invalidateQueries({ queryKey: ["productStats"] });
            navigate("/app/products");
        },
        onError: (error) => {
            console.error("Error updating product:", error);
            alert("Məhsul yenilənərkən xəta baş verdi.");
        },
    });

    if (isFetching) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-muted-foreground">Məlumatlar yüklənir...</p>
            </div>
        );
    }

    if (isError || !product) {
        return (
            <div className="max-w-xl mx-auto mt-10">
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Xəta</CardTitle>
                        <CardDescription>Məhsul tapılmadı və ya yüklənmə zamanı xəta baş verdi.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-8 px-4 animate-in slide-in-from-bottom-5 duration-500">
            <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Düzəliş</h1>
                <p className="text-muted-foreground">"{product.name}" məhsulu üzərində düzəlişlər edin.</p>
            </div>

            <ProductForm
                defaultValues={{
                    name: product.name,
                    costPrice: product.costPrice,
                    salePrice: product.salePrice,
                    stockCount: product.stockCount,
                    image: product.image,
                }}
                onSubmit={(data) => mutation.mutate(data)}
                isLoading={mutation.isPending}
                buttonText="Yenilə"
            />
        </div>
    );
}
