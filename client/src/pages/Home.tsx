import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { productService } from "@/services/products/product.service";
import { 
    Package, DollarSign, TrendingUp, ShoppingBag, 
    ArrowUpRight, Users, Activity, Clock, PlusCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Fetch stats using React Query
    const { data: statsData, isLoading, isError } = useQuery({
        queryKey: ["productStats"],
        queryFn: async () => {
            const response = await productService.getStats();
            return response.data;
        },
        staleTime: 60 * 1000, // 1 minute
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-6 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 max-w-2xl mx-auto mt-10">
                <h3 className="text-lg font-bold mb-2">Məlumatları yükləmək mümkün olmadı</h3>
                <p>Zəhmət olmasa səhifəni yeniləyin və ya daha sonra yenidən cəhd edin.</p>
            </div>
        );
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('az-AZ', { style: 'currency', currency: 'AZN' }).format(amount || 0);
    };

    return (
        <div className="space-y-8 pb-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-2xl border shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="relative z-10 space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        Xoş Gəldiniz, {user?.name}
                    </h1>
                    <p className="text-muted-foreground">Budur biznesinizin bugünkü xülasəsi.</p>
                </div>
                {user?.role === "admin" && (
                    <Button className="relative z-10 shadow-md" asChild>
                        <Link to="/products/new">
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Yeni Məhsul
                        </Link>
                    </Button>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Ümumi Məhsul</CardTitle>
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Package className="h-4 w-4 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statsData?.totalProducts || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <span className="text-green-500 flex items-center"><ArrowUpRight className="w-3 h-3"/> +2%</span> ötən aydan
                        </p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Ümumi Dəyər</CardTitle>
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <DollarSign className="h-4 w-4 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(statsData?.totalValue)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Bütün aktiv məhsullar</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Ortalama Qiymət</CardTitle>
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(statsData?.avgPrice)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Kataloq üzrə</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Sistem Statusu</CardTitle>
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <Activity className="h-4 w-4 text-indigo-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">Aktiv</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            Bütün xidmətlər normaldır
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity and Products */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                {/* Recent Products Table */}
                <Card className="lg:col-span-2 shadow-sm border-border/50 overflow-hidden">
                    <CardHeader className="border-b bg-muted/20 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Son Əlavə Edilən Məhsullar</CardTitle>
                                <CardDescription>Kataloqa daxil edilən ən yeni 5 məhsul</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link to="/app/products">Hamısına bax</Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {statsData?.recentProducts && statsData.recentProducts.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-muted-foreground bg-muted/30 uppercase">
                                        <tr>
                                            <th className="px-6 py-4 font-medium">Məhsul</th>
                                            <th className="px-6 py-4 font-medium">Qiymət</th>
                                            <th className="px-6 py-4 font-medium">Tarix</th>
                                            <th className="px-6 py-4 font-medium text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {statsData.recentProducts.map((product: any) => (
                                            <tr key={product._id} className="hover:bg-muted/10 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {product.image ? (
                                                            <img src={product.image} alt={product.name} className="w-10 h-10 rounded-md object-cover border" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center border">
                                                                <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                                                            </div>
                                                        )}
                                                        <span className="font-medium text-foreground">{product.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-medium">{formatCurrency(product.price)}</td>
                                                <td className="px-6 py-4 text-muted-foreground flex items-center gap-2">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {new Date(product.createdAt).toLocaleDateString('az-AZ')}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                        Aktiv
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-muted-foreground">
                                Hələ heç bir məhsul əlavə edilməyib.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions / Info Card */}
                <Card className="shadow-sm border-border/50">
                    <CardHeader className="border-b bg-muted/20 pb-4">
                        <CardTitle className="text-lg">Sürətli Əməliyyatlar</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                        <div onClick={() => navigate("/app/products")} className="p-4 rounded-xl border bg-card hover:border-primary/50 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <ShoppingBag className="w-5 h-5 text-primary group-hover:text-current" />
                                </div>
                                <div>
                                    <h4 className="font-semibold">Məhsullar</h4>
                                    <p className="text-xs text-muted-foreground">Kataloqu idarə edin</p>
                                </div>
                            </div>
                        </div>
                        {user?.role === "admin" && (
                            <div onClick={() => navigate("/app/admin/users")} className="p-4 rounded-xl border bg-card hover:border-primary/50 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                        <Users className="w-5 h-5 text-blue-600 group-hover:text-current" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">Komanda</h4>
                                        <p className="text-xs text-muted-foreground">İstifadəçiləri idarə edin</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}