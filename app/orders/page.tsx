"use client";

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

interface Order {
    id: string;
    createdAt: string;
    grossTotal: string;
    netProfit: string;
    status: string;
    paymentMethod: string;
    platform: { name: string };
    items: Array<{ quantity: number; product: { name: string } }>;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/orders')
            .then(res => res.json())
            .then(data => {
                setOrders(data || []);
            })
            .finally(() => setLoading(false));
    }, []);

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { label: string; class: string }> = {
            NEW: { label: 'Novo', class: 'bg-blue-100 text-blue-700' },
            CONFIRMED: { label: 'Confirmado', class: 'bg-purple-100 text-purple-700' },
            PREPARING: { label: 'Preparando', class: 'bg-yellow-100 text-yellow-700' },
            OUT_FOR_DELIVERY: { label: 'Em Entrega', class: 'bg-orange-100 text-orange-700' },
            DELIVERED: { label: 'Entregue', class: 'bg-green-100 text-green-700' },
            CANCELED: { label: 'Cancelado', class: 'bg-red-100 text-red-700' },
        };
        return badges[status] || { label: status, class: 'bg-gray-100 text-gray-700' };
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
            <Navbar />
            
            <main className="container mx-auto py-8 px-4 space-y-8 animate-fade-in">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-bold">📦 Pedidos</h1>
                        <p className="text-muted-foreground mt-1">
                            Histórico de todas as suas vendas
                        </p>
                    </div>
                    <Link href="/orders/new">
                        <Button className="gradient-primary">
                            ➕ Novo Pedido
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Últimos Pedidos</CardTitle>
                        <CardDescription>
                            Veja o histórico de vendas e acompanhe seu lucro
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="animate-pulse-soft text-muted-foreground">
                                    Carregando pedidos...
                                </div>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="text-6xl mb-4">🛒</div>
                                <h3 className="text-xl font-bold mb-2">Nenhum pedido ainda</h3>
                                <p className="text-muted-foreground max-w-md mb-6">
                                    Comece registrando seu primeiro pedido para acompanhar suas vendas e lucros.
                                </p>
                                <Link href="/orders/new">
                                    <Button>➕ Criar Primeiro Pedido</Button>
                                </Link>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Data</TableHead>
                                        <TableHead>Plataforma</TableHead>
                                        <TableHead>Itens</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                        <TableHead className="text-right">Lucro</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.map((order) => {
                                        const status = getStatusBadge(order.status);
                                        const itemsText = order.items
                                            .map(i => `${i.quantity}x ${i.product.name}`)
                                            .join(', ');

                                        return (
                                            <TableRow key={order.id} className="hover:bg-muted/50">
                                                <TableCell className="font-medium">
                                                    {formatDate(order.createdAt)}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="px-2 py-1 rounded-lg bg-muted text-sm">
                                                        {order.platform?.name || 'N/A'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">
                                                    {itemsText}
                                                </TableCell>
                                                <TableCell className="text-right font-bold">
                                                    {formatCurrency(Number(order.grossTotal))}
                                                </TableCell>
                                                <TableCell className={`text-right font-bold ${Number(order.netProfit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {formatCurrency(Number(order.netProfit))}
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.class}`}>
                                                        {status.label}
                                                    </span>
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


