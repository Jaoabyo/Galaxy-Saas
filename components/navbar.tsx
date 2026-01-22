"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/orders", label: "Pedidos", icon: "📦" },
    { href: "/orders/new", label: "Novo Pedido", icon: "➕" },
    { href: "/products", label: "Produtos", icon: "🍟" },
    { href: "/settings/platforms", label: "Plataformas", icon: "⚙️" },
];

export function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary text-white text-xl">
                        🌌
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Galáxia Gourmet
                        </span>
                        <span className="text-[10px] text-muted-foreground -mt-1">
                            Gestão Inteligente
                        </span>
                    </div>
                </Link>

                <div className="flex items-center gap-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                pathname === item.href
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            )}
                        >
                            <span>{item.icon}</span>
                            <span className="hidden md:inline">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
}
