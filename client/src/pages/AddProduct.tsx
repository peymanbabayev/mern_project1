import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/products/product.service";
import ProductForm from "@/components/ProductForm";

export default function AddProduct() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: productService.create,
        onSuccess: () => {
            // Products siyahısını yeniləyirik
            queryClient.invalidateQueries({ queryKey: ["products"] });

            // Geri qayıdırıq
            navigate("/products");

            // Simple alert as feedback (or replace with toast)
            // alert("Məhsul uğurla yaradıldı! 🎉");
        },
        onError: (error) => {
            console.error("Error creating product:", error);
            alert("Məhsul yaradılarkən xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.");
        },
    });

    const handleSubmit = (formData: FormData) => {
        mutation.mutate(formData);
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4 animate-in slide-in-from-bottom-5 duration-500">
            <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Yeni Məhsul</h1>
                <p className="text-muted-foreground">
                    Bazaya yeni məhsul əlavə etmək üçün formu doldurun.
                </p>
            </div>

            <ProductForm
                onSubmit={handleSubmit}
                isLoading={mutation.isPending}
                buttonText="Əlavə et"
            />
        </div>
    );
}