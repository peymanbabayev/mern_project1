import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ShoppingBag, Sparkles } from "lucide-react";

export default function Home() {
    const { loading } = useAuth();
    const [showSplash, setShowSplash] = useState(true);

    // Splash screen timer
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 2500); // 2.5 saniyə splash ekranı görünür

        return () => clearTimeout(timer);
    }, []);

    // Splash Screen UI
    if (showSplash || loading) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl animate-in fade-in duration-700 px-4">
                <div className="relative mb-6 md:mb-8">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse"></div>
                    <ShoppingBag className="relative w-20 h-20 md:w-24 md:h-24 text-primary animate-bounce duration-1000" />
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-pink-500 animate-pulse">
                    PMS
                </h1>

                <p className="mt-4 md:mt-6 text-lg sm:text-xl md:text-2xl font-medium text-muted-foreground animate-in slide-in-from-bottom-4 fade-in duration-1000 delay-300 text-center">
                    Məhsul İdarəetmə Sistemi
                </p>

                <div className="mt-6 md:mt-8 flex gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary animate-ping delay-0"></span>
                    <span className="w-3 h-3 rounded-full bg-primary animate-ping delay-150"></span>
                    <span className="w-3 h-3 rounded-full bg-primary animate-ping delay-300"></span>
                </div>
            </div>
        );
    }

    // Actual Home Content (Only visible if authenticated)
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] md:min-h-[85vh] p-4 text-center animate-in zoom-in-95 duration-700">
            <div className="relative max-w-4xl w-full">
                {/* Background decorative elements */}
                <div className="absolute -top-10 md:-top-20 -left-10 md:-left-20 w-48 h-48 md:w-72 md:h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 md:-bottom-20 -right-10 md:-right-20 w-48 h-48 md:w-72 md:h-72 bg-blue-500/10 rounded-full blur-3xl"></div>

                <div className="relative bg-card/50 backdrop-blur-sm border shadow-2xl rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-12 overflow-hidden">
                    <div className="flex justify-center mb-4 md:mb-6">
                        <div className="p-2.5 md:p-3 bg-primary/10 rounded-xl md:rounded-2xl">
                            <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                        </div>
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight mb-4 md:mb-6 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Xoş Gəlmisiniz!
                    </h1>

                    <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed px-2">
                        Müasir Məhsul İdarəetmə Sistemi (PMS) ilə işiniz daha sürətli və rahat olacaq.
                        Bütün məlumatlar parmaqlarınızın ucunda.
                    </p>

                    <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-3 text-left">
                        <div className="group p-5 md:p-6 rounded-xl md:rounded-2xl bg-background border hover:border-primary/50 transition-colors shadow-sm hover:shadow-md">
                            <div className="text-2xl mb-2">🚀</div>
                            <h3 className="font-semibold text-base md:text-lg mb-2">Sürətli</h3>
                            <p className="text-xs md:text-sm text-muted-foreground">Anında məlumat yenilənməsi və sürətli interfeys.</p>
                        </div>
                        <div className="group p-5 md:p-6 rounded-xl md:rounded-2xl bg-background border hover:border-primary/50 transition-colors shadow-sm hover:shadow-md">
                            <div className="text-2xl mb-2">🛡️</div>
                            <h3 className="font-semibold text-base md:text-lg mb-2">Təhlükəsiz</h3>
                            <p className="text-xs md:text-sm text-muted-foreground">Məlumatlarınızın təhlükəsizliyi bizim üçün prioritetdir.</p>
                        </div>
                        <div className="group p-5 md:p-6 rounded-xl md:rounded-2xl bg-background border hover:border-primary/50 transition-colors shadow-sm hover:shadow-md">
                            <div className="text-2xl mb-2">❤️</div>
                            <h3 className="font-semibold text-base md:text-lg mb-2">Rahat</h3>
                            <p className="text-xs md:text-sm text-muted-foreground">İstifadəçi dostu dizayn və favoritlər funksiyası.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}