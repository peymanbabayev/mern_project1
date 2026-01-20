import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            await login({ email, password });
            navigate("/");
        } catch (err: any) {
            setError(err.message || "Login failed");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[70vh] md:min-h-[80vh] px-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1 pb-4">
                    <CardTitle className="text-xl md:text-2xl text-center font-bold">Giriş</CardTitle>
                    <CardDescription className="text-center text-sm md:text-base">
                        Hesabınıza daxil olmaq üçün email və şifrənizi daxil edin
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-4 md:px-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && <div className="text-red-500 text-xs md:text-sm text-center p-2 bg-red-50 rounded-md">{error}</div>}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm md:text-base">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="ornek@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-10 md:h-11 text-sm md:text-base"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm md:text-base">Şifrə</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-10 md:h-11 text-sm md:text-base"
                            />
                        </div>
                        <Button type="submit" className="w-full h-10 md:h-11 text-sm md:text-base font-medium">
                            Daxil ol
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center pt-4">
                    <p className="text-xs md:text-sm text-muted-foreground">
                        Hesabınız yoxdur?{" "}
                        <Link to="/register" className="text-primary font-medium hover:underline">
                            Qeydiyyatdan keçin
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
