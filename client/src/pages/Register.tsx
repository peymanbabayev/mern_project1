import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { UserPlus } from "lucide-react";

export default function Register() {
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("viewer");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { register, login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");
        setIsLoading(true);
        try {
            await register({ name, username, email, password, role });
            if (role === "viewer") {
                setSuccessMessage("Qeydiyyat uğurludur. Avtomatik daxil olunur...");
                await login({ email, password });
                navigate("/app");
            } else {
                setSuccessMessage("Qeydiyyat uğurludur. Zəhmət olmasa admin təsdiqini gözləyin.");
                setTimeout(() => {
                    navigate("/login");
                }, 3000);
            }
        } catch (err: any) {
            setError(err.message || "Qeydiyyat zamanı xəta baş verdi");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-8">
            <div className="space-y-2 text-center lg:text-left">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Qeydiyyat</h2>
                <p className="text-muted-foreground text-sm">
                    Platformaya qoşulmaq üçün məlumatlarınızı daxil edin.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg text-center">
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg text-center">
                        {successMessage}
                    </div>
                )}
                
                <div className="space-y-1.5 group">
                    <Label htmlFor="name" className="text-sm font-medium group-focus-within:text-primary transition-colors">Ad və Soyad</Label>
                    <Input
                        id="name"
                        type="text"
                        placeholder="Adınız Soyadınız"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="h-11 bg-white/60 dark:bg-black/40 backdrop-blur-sm border-muted-foreground/20 hover:border-primary/50 focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                    />
                </div>

                <div className="space-y-1.5 group">
                    <Label htmlFor="username" className="text-sm font-medium group-focus-within:text-primary transition-colors">İstifadəçi adı</Label>
                    <Input
                        id="username"
                        type="text"
                        placeholder="istifadechi_adi"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="h-11 bg-white/60 dark:bg-black/40 backdrop-blur-sm border-muted-foreground/20 hover:border-primary/50 focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                    />
                </div>
                
                <div className="space-y-1.5 group">
                    <Label htmlFor="email" className="text-sm font-medium group-focus-within:text-primary transition-colors">Email adresi</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11 bg-white/60 dark:bg-black/40 backdrop-blur-sm border-muted-foreground/20 hover:border-primary/50 focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                    />
                </div>
                
                <div className="space-y-1.5 group">
                    <Label htmlFor="password" className="text-sm font-medium group-focus-within:text-primary transition-colors">Şifrə</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-11 bg-white/60 dark:bg-black/40 backdrop-blur-sm border-muted-foreground/20 hover:border-primary/50 focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                    />
                </div>

                <div className="space-y-1.5 group">
                    <Label htmlFor="role" className="text-sm font-medium transition-colors">Rol (Vəzifə)</Label>
                    <Select value={role} onValueChange={setRole}>
                        <SelectTrigger className="h-11 bg-white/60 dark:bg-black/40 backdrop-blur-sm border-muted-foreground/20 hover:border-primary/50 focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm">
                            <SelectValue placeholder="Rol seçin" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="owner">Rəhbər</SelectItem>
                            <SelectItem value="accountant">Mühasib</SelectItem>
                            <SelectItem value="sales_manager">Satış Meneceri</SelectItem>
                            <SelectItem value="sales_rep">Satış Nümayəndəsi</SelectItem>
                            <SelectItem value="purchasing">Satınalma</SelectItem>
                            <SelectItem value="warehouse">Anbar İşçisi</SelectItem>
                            <SelectItem value="viewer">İzləyici</SelectItem>
                        </SelectContent>
                    </Select>
                    {role === "viewer" && (
                        <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm text-primary/90 shadow-inner animate-in fade-in slide-in-from-top-2 duration-300">
                            <strong>İzləyici kimi sınaqdan keçirin:</strong> Platformanın imkanlarını dərhal test etmək üçün bu rolu seçə bilərsiniz. Qeydiyyatdan sonra təsdiq gözləmədən sistemə daxil olaraq məhsullar və digər bölmələrlə tanış ola bilərsiniz.
                        </div>
                    )}
                </div>

                <Button 
                    type="submit" 
                    className="w-full h-11 font-medium text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden group mt-4" 
                    disabled={isLoading}
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin relative z-10"></div>
                    ) : (
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            <UserPlus className="w-5 h-5" />
                            Hesab Yarat
                        </span>
                    )}
                </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground pt-2">
                Artıq hesabınız var?{" "}
                <Link to="/login" className="font-semibold text-primary hover:text-primary/80 hover:underline transition-colors">
                    Daxil olun
                </Link>
            </div>
        </div>
    );
}
