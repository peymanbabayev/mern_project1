import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { LogIn } from "lucide-react";

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
            navigate("/app");
        } catch (err: any) {
            setError(err.message || "Giriş zamanı xəta baş verdi");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="space-y-2 text-center lg:text-left">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Xoş Gəlmisiniz</h2>
                <p className="text-muted-foreground text-sm">
                    Sistemə daxil olmaq üçün məlumatlarınızı daxil edin.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg text-center">
                        {error}
                    </div>
                )}
                
                <div className="space-y-2 group">
                    <Label htmlFor="email" className="text-sm font-medium group-focus-within:text-primary transition-colors">
                        Email adresi
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 bg-white/60 dark:bg-black/40 backdrop-blur-sm border-muted-foreground/20 hover:border-primary/50 focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                    />
                </div>
                
                <div className="space-y-2 group">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-sm font-medium group-focus-within:text-primary transition-colors">
                            Şifrə
                        </Label>
                        <Link to="#" tabIndex={-1} className="text-xs font-medium text-primary hover:text-primary/80 hover:underline transition-colors">
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
                        className="h-12 bg-white/60 dark:bg-black/40 backdrop-blur-sm border-muted-foreground/20 hover:border-primary/50 focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                    />
                </div>

                <Button 
                    type="submit" 
                    className="w-full h-12 font-medium text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden group" 
                    disabled={isLoading}
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin relative z-10"></div>
                    ) : (
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            <LogIn className="w-5 h-5" />
                            Daxil ol
                        </span>
                    )}
                </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground pt-2">
                Hesabınız yoxdur?{" "}
                <Link to="/register" className="font-semibold text-primary hover:text-primary/80 hover:underline transition-colors">
                    Yeni hesab yaradın
                </Link>
            </div>
        </div>
    );
}
