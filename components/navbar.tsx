"use client";

import Link from "next/link";
import Image from "next/image";
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
                <Link href="/dashboard" className="flex items-center gap-3 logo-container group">
                    <div className="relative w-12 h-12 transition-transform group-hover:scale-105">
                        <Image
                            src="/images/logo.png"
                            alt="Galáxia Gourmet"
                            width={48}
                            height={48}
                            className="object-contain"
                            priority
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-gradient-galaxia">
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
                                    ? "gradient-lilac-rose text-white shadow-lg shadow-primary/25"
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
