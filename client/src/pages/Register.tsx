import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { UserPlus, ShoppingBag, Layers, Activity } from "lucide-react";

export default function Register() {
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");
        setIsLoading(true);
        try {
            await register({ name, username, email, password });
            setSuccessMessage("Qeydiyyat uğurludur. Zəhmət olmasa admin təsdiqini gözləyin.");
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (err: any) {
            setError(err.message || "Qeydiyyat zamanı xəta baş verdi");
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
                    <div className="absolute -bottom-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary blur-3xl"></div>
                    <div className="absolute top-[10%] -right-[20%] w-[60%] h-[60%] rounded-full bg-indigo-400 blur-3xl"></div>
                </div>

                <div className="relative z-10 flex items-center gap-3">
                    <ShoppingBag className="w-8 h-8 text-primary" />
                    <span className="text-2xl font-black tracking-tight">Enterprise PMS</span>
                </div>

                <div className="relative z-10 max-w-md">
                    <h1 className="text-4xl font-bold leading-tight mb-6">
                        İndi qoşulun və <br/>
                        <span className="text-primary">fərqi hiss edin.</span>
                    </h1>
                    <p className="text-sidebar-foreground/70 text-lg mb-8">
                        Limitsiz məhsul əlavəsi, güclü analitika və komanda idarəetməsi ilə biznesinizi böyüdün.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sidebar-foreground/80">
                            <Layers className="w-5 h-5 text-primary" />
                            <span>Mürəkkəb məlumatların asan təşkili</span>
                        </div>
                        <div className="flex items-center gap-3 text-sidebar-foreground/80">
                            <Activity className="w-5 h-5 text-primary" />
                            <span>Real zamanlı hesabatlar və statistika</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-sm text-sidebar-foreground/50">
                    &copy; {new Date().getFullYear()} Enterprise PMS. Bütün hüquqlar qorunur.
                </div>
            </div>

            {/* Right Panel - Register Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-background relative overflow-y-auto">
                {/* Mobile Logo */}
                <div className="absolute top-8 left-8 flex lg:hidden items-center gap-2">
                    <ShoppingBag className="w-6 h-6 text-primary" />
                    <span className="text-xl font-bold tracking-tight text-foreground">PMS</span>
                </div>

                <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 py-10">
                    <div className="space-y-2 text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">Qeydiyyat</h2>
                        <p className="text-muted-foreground text-sm">
                            Platformaya qoşulmaq üçün məlumatlarınızı daxil edin.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg text-center animate-in fade-in">
                                {error}
                            </div>
                        )}
                        {successMessage && (
                            <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg text-center animate-in fade-in">
                                {successMessage}
                            </div>
                        )}
                        
                        <div className="space-y-2">
                            <Label htmlFor="name">Ad və Soyad</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Adınız Soyadınız"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="h-11 bg-muted/50 border-transparent focus:bg-background focus:border-primary transition-colors"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="username">İstifadəçi adı</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="istifadechi_adi"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="h-11 bg-muted/50 border-transparent focus:bg-background focus:border-primary transition-colors"
                            />
                        </div>
                        
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
                            <Label htmlFor="password">Şifrə</Label>
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
                                    <UserPlus className="w-5 h-5 mr-2" />
                                    Hesab Yarat
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="text-center text-sm text-muted-foreground pt-4">
                        Artıq hesabınız var?{" "}
                        <Link to="/login" className="font-semibold text-primary hover:underline transition-colors">
                            Daxil olun
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
