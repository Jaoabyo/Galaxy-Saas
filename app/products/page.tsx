"use client";

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { suggestPrice } from '@/lib/calculations';
import Link from 'next/link';

interface Product {
    id: string;
    name: string;
    salePrice: string;
    estimatedCost: string;
    active: boolean;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const DEFAULT_FEE = 0.23;
    const TARGET_MARGIN = 30;

    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                setProducts(data || []);
            })
            .finally(() => setLoading(false));
    }, []);

    const getHealthBadge = (margin: number) => {
        if (margin < 0) return { label: 'Prejuízo', class: 'bg-red-100 text-red-700 border-red-200' };
        if (margin < TARGET_MARGIN / 100) return { label: 'Baixa', class: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
        return { label: 'Saudável', class: 'bg-green-100 text-green-700 border-green-200' };
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
            <Navbar />
            
            <main className="container mx-auto py-8 px-4 space-y-8 animate-fade-in">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-bold">🍟 Produtos</h1>
                        <p className="text-muted-foreground mt-1">
                            Assistente de Lucro ativo • Base: iFood 23% | Meta: 30%
                        </p>
                    </div>
                    <Link href="/products/new">
                        <Button className="gradient-primary">
                            ➕ Novo Produto
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Catálogo de Produtos</CardTitle>
                        <CardDescription>
                            Gerencie seus produtos e veja sugestões de preço do assistente inteligente
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="animate-pulse-soft text-muted-foreground">
                                    Carregando produtos...
                                </div>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="text-6xl mb-4">📦</div>
                                <h3 className="text-xl font-bold mb-2">Nenhum produto cadastrado</h3>
                                <p className="text-muted-foreground max-w-md mb-6">
                                    Comece cadastrando seus produtos para poder criar pedidos e acompanhar seu lucro.
                                </p>
                                <Link href="/products/new">
                                    <Button>➕ Cadastrar Primeiro Produto</Button>
                                </Link>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Produto</TableHead>
                                        <TableHead className="text-right">Preço</TableHead>
                                        <TableHead className="text-right">Custo</TableHead>
                                        <TableHead className="text-right">Margem</TableHead>
                                        <TableHead>Saúde</TableHead>
                                        <TableHead>Assistente</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.map((product) => {
                                        const price = Number(product.salePrice);
                                        const cost = Number(product.estimatedCost);
                                        const feeValue = price * DEFAULT_FEE;
                                        const profit = price - cost - feeValue;
                                        const margin = price > 0 ? profit / price : 0;
                                        const health = getHealthBadge(margin);
                                        const suggested = suggestPrice(cost, DEFAULT_FEE, TARGET_MARGIN);

                                        return (
                                            <TableRow key={product.id} className="hover:bg-muted/50">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                                                            🍔
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{product.name}</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {product.active ? 'Ativo' : 'Inativo'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {formatCurrency(price)}
                                                </TableCell>
                                                <TableCell className="text-right text-muted-foreground">
                                                    {formatCurrency(cost)}
                                                </TableCell>
                                                <TableCell className={`text-right font-bold ${margin < 0 ? 'text-red-600' : margin < TARGET_MARGIN / 100 ? 'text-yellow-600' : 'text-green-600'}`}>
                                                    {formatPercent(margin)}
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${health.class}`}>
                                                        {health.label}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {margin < TARGET_MARGIN / 100 ? (
                                                        <div className="text-xs">
                                                            <span className="text-amber-600 font-medium">
                                                                💡 Sugerido: {formatCurrency(suggested)}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-green-600 text-xs font-medium">✓ OK</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                <footer className="text-center py-8 border-t">
                    <p className="text-sm text-muted-foreground">
                        Desenvolvido com 💜 por{' '}
                        <a href="https://github.com/jaoadev" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                            @jaoadev
                        </a>
                    </p>
                </footer>
            </main>
        </div>
    );
}

