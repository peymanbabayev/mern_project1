import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, ArrowUpDown, Edit, Trash2, Image as ImageIcon, Heart } from "lucide-react";
import { productService, type Product, } from "@/services/products/product.service";
import { userService } from "@/services/user/user.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

export default function Products() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user, refreshUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: keyof Product | null, direction: 'asc' | 'desc' }>({ key: 'createdAt', direction: 'desc' });

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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["productStats"] });
        },
        onError: (err) => alert("Silinmə zamanı xəta baş verdi: " + err),
    });

    const handleDelete = (id: string) => {
        if (window.confirm("Bu məhsulu silmək istədiyinizə əminsiniz?")) deleteMutation.mutate(id);
    };

    const handleToggleFavorite = async (e: React.MouseEvent, productId: string) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await userService.toggleFavorite(productId);
            await refreshUser();
            queryClient.invalidateQueries({ queryKey: ["currentUser"] });
            queryClient.invalidateQueries({ queryKey: ["favorites"] });
        } catch (error) {
            console.error("Failed to toggle favorite", error);
        }
    };

    const handleSort = (key: keyof Product) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const filteredAndSortedProducts = useMemo(() => {
        if (!products) return [];
        let result = [...products];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(p => p.name.toLowerCase().includes(term));
        }

        if (sortConfig.key) {
            result.sort((a, b) => {
                const aValue = a[sortConfig.key as keyof Product] || '';
                const bValue = b[sortConfig.key as keyof Product] || '';
                
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [products, searchTerm, sortConfig]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('az-AZ', { style: 'currency', currency: 'AZN' }).format(amount || 0);
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-muted animate-pulse rounded w-1/4"></div>
                <div className="h-10 bg-muted animate-pulse rounded w-full max-w-sm"></div>
                <div className="h-[400px] bg-muted animate-pulse rounded-lg border"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-6 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 max-w-2xl mt-10">
                <h3 className="text-lg font-bold mb-2">Xəta baş verdi</h3>
                <p className="mb-4">{(error as Error).message}</p>
                <Button onClick={() => refetch()} variant="outline">Yenidən cəhd et</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-6 rounded-2xl border shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="relative z-10">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Məhsullar</h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-1">Sistemdəki bütün məhsulların siyahısı və idarə edilməsi.</p>
                </div>
                {(user?.role === "admin" || user?.role === "viewer" || user?.role === "owner" || user?.role === "accountant") && (
                    <Button onClick={() => navigate("/app/products/new")} className="w-full sm:w-auto relative z-10 shadow-md">
                        <Plus className="mr-2 h-4 w-4" /> Yeni Məhsul
                    </Button>
                )}
            </div>

            {/* Table Toolbar */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Məhsul adı ilə axtarış..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 h-10 bg-card border-border/50 focus:border-primary shadow-sm"
                    />
                </div>
                <div className="text-sm text-muted-foreground font-medium bg-card px-4 py-2 rounded-lg border shadow-sm">
                    Cəmi: {filteredAndSortedProducts.length}
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/30 border-b">
                            <tr>
                                <th className="px-6 py-4 font-medium text-muted-foreground w-16">Şəkil</th>
                                <th className="px-6 py-4 font-medium text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('name')}>
                                    <div className="flex items-center gap-1">
                                        Məhsul Adı <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 font-medium text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('costPrice')}>
                                    <div className="flex items-center gap-1">
                                        Maya Dəyəri <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 font-medium text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('salePrice')}>
                                    <div className="flex items-center gap-1">
                                        Satış Qiyməti <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 font-medium text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('stockCount')}>
                                    <div className="flex items-center gap-1">
                                        Stok <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 font-medium text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('createdAt')}>
                                    <div className="flex items-center gap-1">
                                        Əlavə Edilib <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 font-medium text-muted-foreground">Status</th>
                                <th className="px-6 py-4 font-medium text-muted-foreground text-right">Əməliyyat</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredAndSortedProducts.length > 0 ? (
                                filteredAndSortedProducts.map((product) => (
                                    <tr key={product._id} className="hover:bg-muted/10 transition-colors group">
                                        <td className="px-6 py-4">
                                            {product.image ? (
                                                <img src={product.image} alt={product.name} className="w-10 h-10 rounded-md object-cover border shadow-sm" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center border shadow-sm">
                                                    <ImageIcon className="w-5 h-5 text-muted-foreground/50" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-foreground">{product.name}</td>
                                        <td className="px-6 py-4 font-medium text-muted-foreground">{formatCurrency(product.costPrice ?? 0)}</td>
                                        <td className="px-6 py-4 font-semibold text-primary">{formatCurrency(product.salePrice ?? 0)}</td>
                                        <td className="px-6 py-4 font-medium">
                                            {product.stockCount ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                    {product.stockCount} ədəd
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                                    Bitib (0)
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {product.createdAt ? new Date(product.createdAt).toLocaleDateString('az-AZ') : 'Tarix yoxdur'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                Aktiv
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-100 transition-opacity">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-50" 
                                                    onClick={(e) => handleToggleFavorite(e, product._id)}
                                                    title={user?.favorites?.some((f: any) => (typeof f === 'string' ? f : f._id) === product._id) ? "Favoritlərdən sil" : "Favoritlərə əlavə et"}
                                                >
                                                    <Heart className={`h-4 w-4 ${user?.favorites?.some((f: any) => (typeof f === 'string' ? f : f._id) === product._id) ? 'fill-current text-red-500' : ''}`} />
                                                </Button>
                                                {(user?.role === "admin" || user?.role === "viewer" || user?.role === "owner") && (
                                                    <>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50" onClick={() => navigate(`/app/products/edit/${product._id}`)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(product._id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center">
                                            <Search className="h-10 w-10 text-muted-foreground/30 mb-4" />
                                            <p className="text-lg font-medium text-foreground">Heç nə tapılmadı</p>
                                            <p className="text-sm">Axtarış meyarlarını dəyişin və ya yeni məhsul əlavə edin.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}