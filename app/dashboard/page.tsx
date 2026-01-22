"use client";

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatPercent } from '@/lib/utils';
import Link from 'next/link';

interface Summary {
    ordersCount: number;
    grossRevenue: number;
    feesTotal: number;
    costsTotal: number;
    netProfit: number;
    avgMargin: number;
}

interface DailySeries {
    date: string;
    gross: number;
    net: number;
    count: number;
}

export default function DashboardPage() {
    const [summary, setSummary] = useState<Summary | null>(null);
    const [dailySeries, setDailySeries] = useState<DailySeries[]>([]);
    const [period, setPeriod] = useState('30d');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const now = new Date();
        let from = new Date();

        if (period === '7d') from.setDate(now.getDate() - 7);
        if (period === '30d') from.setDate(now.getDate() - 30);
        if (period === 'today') from = new Date(now.toDateString());

        const fromStr = from.toISOString().split('T')[0];
        const toStr = now.toISOString().split('T')[0];

        fetch(`/api/reports/summary?from=${fromStr}&to=${toStr}`)
            .then(res => res.json())
            .then(data => {
                setSummary(data.summary || {
                    ordersCount: 0,
                    grossRevenue: 0,
                    feesTotal: 0,
                    costsTotal: 0,
                    netProfit: 0,
                    avgMargin: 0
                });
                setDailySeries(data.dailySeries || []);
            })
            .catch(() => {
                setSummary({
                    ordersCount: 0,
                    grossRevenue: 0,
                    feesTotal: 0,
                    costsTotal: 0,
                    netProfit: 0,
                    avgMargin: 0
                });
            })
            .finally(() => setLoading(false));
    }, [period]);

    const periodLabel = period === 'today' ? 'Hoje' : period === '7d' ? 'Últimos 7 dias' : 'Últimos 30 dias';

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
            <Navbar />
            
            <main className="container mx-auto py-8 px-4 space-y-8 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                            Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Visão geral do seu negócio • {periodLabel}
                        </p>
                    </div>
                    
                    <div className="flex gap-2 p-1 bg-muted rounded-xl">
                        {[
                            { value: 'today', label: 'Hoje' },
                            { value: '7d', label: '7 dias' },
                            { value: '30d', label: '30 dias' },
                        ].map((btn) => (
                            <button
                                key={btn.value}
                                onClick={() => setPeriod(btn.value)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    period === btn.value
                                        ? 'bg-primary text-primary-foreground shadow-lg'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i} className="animate-pulse-soft">
                                <CardHeader className="pb-2">
                                    <div className="h-4 bg-muted rounded w-24"></div>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-8 bg-muted rounded w-32"></div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* KPIs */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            <Card className="group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 animate-slide-up border-l-4 border-l-purple-500">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Faturamento Bruto
                                    </CardTitle>
                                    <span className="text-2xl">💰</span>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">
                                        {formatCurrency(summary?.grossRevenue || 0)}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {summary?.ordersCount || 0} pedidos no período
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="group hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 animate-slide-up border-l-4 border-l-green-500" style={{ animationDelay: '0.1s' }}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Lucro Líquido
                                    </CardTitle>
                                    <span className="text-2xl">📈</span>
                                </CardHeader>
                                <CardContent>
                                    <div className={`text-3xl font-bold ${(summary?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                        {formatCurrency(summary?.netProfit || 0)}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Após custos e taxas
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="group hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 animate-slide-up border-l-4 border-l-blue-500" style={{ animationDelay: '0.2s' }}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Margem Média
                                    </CardTitle>
                                    <span className="text-2xl">📊</span>
                                </CardHeader>
                                <CardContent>
                                    <div className={`text-3xl font-bold ${(summary?.avgMargin || 0) >= 30 ? 'text-green-600' : (summary?.avgMargin || 0) >= 15 ? 'text-yellow-600' : 'text-red-500'}`}>
                                        {formatPercent((summary?.avgMargin || 0) / 100)}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Meta: 30% ou mais
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="group hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 animate-slide-up border-l-4 border-l-red-400" style={{ animationDelay: '0.3s' }}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Taxas Pagas
                                    </CardTitle>
                                    <span className="text-2xl">💸</span>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-red-500">
                                        {formatCurrency(summary?.feesTotal || 0)}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Para plataformas de delivery
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Ações Rápidas */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <Link href="/orders/new" className="block">
                                <Card className="h-full cursor-pointer hover:shadow-xl hover:shadow-primary/20 hover:border-primary/50 transition-all duration-300 group">
                                    <CardContent className="flex items-center gap-4 p-6">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary text-white text-2xl group-hover:scale-110 transition-transform">
                                            ➕
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">Novo Pedido</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Registrar venda rapidamente
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href="/products" className="block">
                                <Card className="h-full cursor-pointer hover:shadow-xl hover:shadow-orange-500/20 hover:border-orange-500/50 transition-all duration-300 group">
                                    <CardContent className="flex items-center gap-4 p-6">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-warning text-white text-2xl group-hover:scale-110 transition-transform">
                                            🍟
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">Produtos</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Gerenciar catálogo
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href="/orders" className="block">
                                <Card className="h-full cursor-pointer hover:shadow-xl hover:shadow-green-500/20 hover:border-green-500/50 transition-all duration-300 group">
                                    <CardContent className="flex items-center gap-4 p-6">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-success text-white text-2xl group-hover:scale-110 transition-transform">
                                            📦
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">Pedidos</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Ver histórico de vendas
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </div>

                        {/* Empty State */}
                        {(summary?.ordersCount || 0) === 0 && (
                            <Card className="border-dashed border-2">
                                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="text-6xl mb-4">🚀</div>
                                    <h3 className="text-xl font-bold mb-2">
                                        Comece a usar o Galáxia Gourmet!
                                    </h3>
                                    <p className="text-muted-foreground max-w-md mb-6">
                                        Cadastre seus produtos, configure suas plataformas de delivery e comece a registrar pedidos para ver suas estatísticas aqui.
                                    </p>
                                    <div className="flex gap-4">
                                        <Link href="/products">
                                            <Button variant="outline">
                                                🍟 Cadastrar Produtos
                                            </Button>
                                        </Link>
                                        <Link href="/settings/platforms">
                                            <Button>
                                                ⚙️ Configurar Plataformas
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}

                {/* Footer */}
                <footer className="text-center py-8 border-t">
                    <p className="text-sm text-muted-foreground">
                        Desenvolvido com 💜 por{' '}
                        <a 
                            href="https://github.com/jaoadev" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-medium text-primary hover:underline"
                        >
                            @jaoadev
                        </a>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Galáxia Gourmet © {new Date().getFullYear()} - Gestão Inteligente para Delivery
                    </p>
                </footer>
            </main>
        </div>
    );
}
