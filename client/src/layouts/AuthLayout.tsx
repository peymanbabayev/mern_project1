import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ShieldCheck, Zap, Layers, Activity } from "lucide-react";

const LOGIN_CONTENT = {
    title: (
        <>
            Məhsullarınızı daha <br />
            <span className="text-primary">ağıllı</span> idarə edin.
        </>
    ),
    desc: "Qlobal bazarda rəqabətədavamlı olmaq üçün ehtiyacınız olan bütün idarəetmə vasitələri tək bir platformada.",
    features: [
        { icon: <Zap className="w-5 h-5 text-primary" />, text: "Yüksək performanslı və sürətli interfeys" },
        { icon: <ShieldCheck className="w-5 h-5 text-primary" />, text: "Enterprise səviyyəli məlumat təhlükəsizliyi" }
    ]
};

const REGISTER_CONTENT = {
    title: (
        <>
            İndi qoşulun və <br />
            <span className="text-primary">fərqi hiss edin.</span>
        </>
    ),
    desc: "Limitsiz məhsul əlavəsi, güclü analitika və komanda idarəetməsi ilə biznesinizi böyüdün.",
    features: [
        { icon: <Layers className="w-5 h-5 text-primary" />, text: "Mürəkkəb məlumatların asan təşkili" },
        { icon: <Activity className="w-5 h-5 text-primary" />, text: "Real zamanlı hesabatlar və statistika" }
    ]
};

export default function AuthLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const isLogin = location.pathname === "/login";
    const leftContent = isLogin ? LOGIN_CONTENT : REGISTER_CONTENT;

    return (
        <div className="w-full min-h-screen flex items-stretch bg-background">
            {/* Left Panel */}
            <div className="hidden lg:flex w-1/2 bg-sidebar flex-col justify-between p-12 text-sidebar-primary-foreground relative overflow-hidden">
                {/* Modern Decorative Orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div 
                        animate={{ 
                            scale: [1, 1.05, 1],
                            rotate: [0, 5, 0]
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        style={{ willChange: "transform" }}
                        className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/20 blur-3xl mix-blend-screen"
                    />
                    <motion.div 
                        animate={{ 
                            scale: [1, 1.1, 1],
                            rotate: [0, -5, 0]
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        style={{ willChange: "transform" }}
                        className="absolute bottom-[10%] -right-[20%] w-[60%] h-[60%] rounded-full bg-blue-500/20 blur-3xl mix-blend-screen"
                    />
                </div>

                <div className="relative z-10 flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
                    <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                        <ShoppingBag className="w-7 h-7 text-primary" />
                    </div>
                    <span className="text-2xl font-black tracking-tight text-white">Enterprise PMS</span>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname + "-left"}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        style={{ willChange: "transform, opacity" }}
                        className="relative z-10 max-w-md"
                    >
                        <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6 text-white drop-shadow-sm">
                            {leftContent.title}
                        </h1>
                        <p className="text-sidebar-foreground/80 text-lg mb-8 leading-relaxed">
                            {leftContent.desc}
                        </p>

                        <div className="space-y-5">
                            {leftContent.features.map((f, i) => (
                                <motion.div 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + (i * 0.1) }}
                                    key={i} 
                                    style={{ willChange: "transform, opacity" }}
                                    className="flex items-center gap-4 text-sidebar-foreground/90 bg-white/5 p-3 rounded-xl border border-white/10"
                                >
                                    <div className="bg-white/10 p-2 rounded-lg">
                                        {f.icon}
                                    </div>
                                    <span className="font-medium">{f.text}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>

                <div className="relative z-10 text-sm text-sidebar-foreground/40 font-medium">
                    &copy; {new Date().getFullYear()} Enterprise PMS. Bütün hüquqlar qorunur.
                </div>
            </div>

            {/* Right Panel - Form Outlet */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 relative overflow-y-auto bg-background/95">
                {/* Mobile Logo */}
                <div className="absolute top-8 left-8 flex lg:hidden items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
                    <ShoppingBag className="w-6 h-6 text-primary" />
                    <span className="text-xl font-bold tracking-tight text-foreground">PMS</span>
                </div>

                <div className="w-full max-w-sm">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname + "-right"}
                            initial={{ opacity: 0, x: 15 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -15 }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                            style={{ willChange: "transform, opacity" }}
                            className="w-full"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
