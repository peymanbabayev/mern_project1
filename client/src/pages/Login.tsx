import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { LogIn, ShoppingBag, ShieldCheck, Zap } from "lucide-react";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        try {
            await login({ email, password });
            navigate("/");
        } catch (err: any) {
            setError(err.message || "Giriş zamanı xəta baş verdi");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen flex items-stretch">
            {/* Left Panel - Hidden on Mobile */}
            <div className="hidden lg:flex w-1/2 bg-sidebar flex-col justify-between p-12 text-sidebar-primary-foreground relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
                    <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary blur-3xl"></div>
                    <div className="absolute bottom-[10%] -right-[20%] w-[60%] h-[60%] rounded-full bg-blue-400 blur-3xl"></div>
                </div>

                <div className="relative z-10 flex items-center gap-3">
                    <ShoppingBag className="w-8 h-8 text-primary" />
                    <span className="text-2xl font-black tracking-tight">Enterprise PMS</span>
                </div>

                <div className="relative z-10 max-w-md">
                    <h1 className="text-4xl font-bold leading-tight mb-6">
                        Məhsullarınızı daha <br/>
                        <span className="text-primary">ağıllı</span> idarə edin.
                    </h1>
                    <p className="text-sidebar-foreground/70 text-lg mb-8">
                        Qlobal bazarda rəqabətədavamlı olmaq üçün ehtiyacınız olan bütün idarəetmə vasitələri tək bir platformada.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sidebar-foreground/80">
                            <Zap className="w-5 h-5 text-primary" />
                            <span>Yüksək performanslı və sürətli interfeys</span>
                        </div>
                        <div className="flex items-center gap-3 text-sidebar-foreground/80">
                            <ShieldCheck className="w-5 h-5 text-primary" />
                            <span>Enterprise səviyyəli məlumat təhlükəsizliyi</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-sm text-sidebar-foreground/50">
                    &copy; {new Date().getFullYear()} Enterprise PMS. Bütün hüquqlar qorunur.
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-background relative">
                {/* Mobile Logo */}
                <div className="absolute top-8 left-8 flex lg:hidden items-center gap-2">
                    <ShoppingBag className="w-6 h-6 text-primary" />
                    <span className="text-xl font-bold tracking-tight text-foreground">PMS</span>
                </div>

                <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="space-y-2 text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">Xoş Gəlmisiniz</h2>
                        <p className="text-muted-foreground text-sm">
                            Sistemə daxil olmaq üçün məlumatlarınızı daxil edin.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg text-center animate-in fade-in">
                                {error}
                            </div>
                        )}
                        
                        <div className="space-y-2">
                            <Label htmlFor="email">Email adresi</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-11 bg-muted/50 border-transparent focus:bg-background focus:border-primary transition-colors"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Şifrə</Label>
                                <Link to="#" className="text-xs font-medium text-primary hover:underline">
                                    Şifrəni unutmusunuz?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-11 bg-muted/50 border-transparent focus:bg-background focus:border-primary transition-colors"
                            />
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full h-11 font-medium text-base shadow-lg shadow-primary/20 transition-all hover:translate-y-[-1px]" 
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5 mr-2" />
                                    Daxil ol
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="text-center text-sm text-muted-foreground pt-4">
                        Hesabınız yoxdur?{" "}
                        <Link to="/register" className="font-semibold text-primary hover:underline transition-colors">
                            Yeni hesab yaradın
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
