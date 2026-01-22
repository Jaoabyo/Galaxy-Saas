"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        // Verificar se o sistema está configurado
        fetch('/api/setup')
            .then(res => res.json())
            .then(data => {
                if (data.configured) {
                    router.push('/dashboard');
                } else {
                    router.push('/setup');
                }
            })
            .catch(() => {
                // Em caso de erro, vai para setup
                router.push('/setup');
            });
    }, [router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-black flex items-center justify-center">
            <div className="text-center animate-pulse">
                <div className="text-7xl mb-6">🌌</div>
                <h1 className="text-3xl font-bold text-white mb-2">Galáxia Gourmet</h1>
                <p className="text-white/60">Carregando...</p>
            </div>
        </div>
    );
}
