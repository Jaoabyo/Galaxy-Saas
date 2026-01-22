"use client";

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

interface OrderItem {
    id: string;
    quantity: number;
    unitPrice: string;
    product: { id: string; name: string };
}

interface Order {
    id: string;
    createdAt: string;
    grossTotal: string;
    totalCost: string;
    platformFeeValue: string;
    netProfit: string;
    marginPct: string;
    status: string;
    paymentMethod: string;
    customerName: string | null;
    notes: string | null;
    platform: { id: string; name: string };
    items: OrderItem[];
}

const STATUS_OPTIONS = [
    { value: 'NEW', label: '🆕 Novo', class: 'bg-blue-100 text-blue-700' },
    { value: 'CONFIRMED', label: '✅ Confirmado', class: 'bg-purple-100 text-purple-700' },
    { value: 'PREPARING', label: '👨‍🍳 Preparando', class: 'bg-yellow-100 text-yellow-700' },
    { value: 'OUT_FOR_DELIVERY', label: '🚴 Em Entrega', class: 'bg-orange-100 text-orange-700' },
    { value: 'DELIVERED', label: '✅ Entregue', class: 'bg-green-100 text-green-700' },
    { value: 'CANCELED', label: '❌ Cancelado', class: 'bg-red-100 text-red-700' },
];

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('ALL');

    const fetchOrders = () => {
        setLoading(true);
        fetch('/api/orders')
            .then(res => res.json())
            .then(data => {
                setOrders(data || []);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const getStatusBadge = (status: string) => {
        const found = STATUS_OPTIONS.find(s => s.value === status);
        return found || { value: status, label: status, class: 'bg-gray-100 text-gray-700' };
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

    const formatDateFull = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Replicar pedido
    const handleReplicate = async (order: Order) => {
        if (!confirm(`Replicar pedido de ${formatCurrency(Number(order.grossTotal))}?`)) {
            return;
        }

        setActionLoading(order.id);
        try {
            const res = await fetch(`/api/orders/${order.id}/replicate`, {
                method: 'POST',
            });

            if (res.ok) {
                alert('✅ Pedido replicado com sucesso!');
                fetchOrders();
            } else {
                const data = await res.json();
                alert(data.error || 'Erro ao replicar pedido');
            }
        } catch (error) {
            alert('Erro ao replicar pedido');
        } finally {
            setActionLoading(null);
        }
    };

    // Atualizar status
    const handleStatusChange = async (orderId: string, newStatus: string) => {
        setActionLoading(orderId);
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                fetchOrders();
            } else {
                alert('Erro ao atualizar status');
            }
        } catch (error) {
            alert('Erro ao atualizar status');
        } finally {
            setActionLoading(null);
        }
    };

    // Excluir/Cancelar pedido
    const handleDelete = async (order: Order) => {
        const hoursOld = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60);
        const action = hoursOld < 24 ? 'excluir' : 'cancelar';
        
        if (!confirm(`Tem certeza que deseja ${action} este pedido?`)) {
            return;
        }

        setActionLoading(order.id);
        try {
            const res = await fetch(`/api/orders/${order.id}`, {
                method: 'DELETE',
            });

            const data = await res.json();

            if (res.ok) {
                alert(data.message);
                fetchOrders();
            } else {
                alert(data.error || 'Erro ao processar pedido');
            }
        } catch (error) {
            alert('Erro ao processar pedido');
        } finally {
            setActionLoading(null);
        }
    };

    // Ver detalhes
    const openDetails = (order: Order) => {
        setSelectedOrder(order);
        setShowDetails(true);
    };

    const closeDetails = () => {
        setShowDetails(false);
        setSelectedOrder(null);
    };

    // Filtrar pedidos
    const filteredOrders = filterStatus === 'ALL' 
        ? orders 
        : orders.filter(o => o.status === filterStatus);

    // Stats rápidos
    const todayOrders = orders.filter(o => {
        const today = new Date().toDateString();
        return new Date(o.createdAt).toDateString() === today;
    });
    const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.grossTotal), 0);
    const todayProfit = todayOrders.reduce((sum, o) => sum + Number(o.netProfit), 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
            <Navbar />
            
            <main className="container mx-auto py-8 px-4 space-y-8 animate-fade-in">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-bold">📦 Pedidos</h1>
                        <p className="text-muted-foreground mt-1">
                            Gerencie seus pedidos e acompanhe o fluxo de vendas
                        </p>
                    </div>
                    <Link href="/orders/new">
                        <Button className="gradient-primary text-lg px-6 py-3">
                            ➕ Novo Pedido
                        </Button>
                    </Link>
                </div>

                {/* Stats do dia */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
                        <CardContent className="p-4">
                            <div className="text-sm text-blue-600 font-medium">Pedidos Hoje</div>
                            <div className="text-3xl font-bold text-blue-700">{todayOrders.length}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
                        <CardContent className="p-4">
                            <div className="text-sm text-green-600 font-medium">Faturamento Hoje</div>
                            <div className="text-3xl font-bold text-green-700">{formatCurrency(todayRevenue)}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
                        <CardContent className="p-4">
                            <div className="text-sm text-purple-600 font-medium">Lucro Hoje</div>
                            <div className="text-3xl font-bold text-purple-700">{formatCurrency(todayProfit)}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <CardTitle>Histórico de Pedidos</CardTitle>
                                <CardDescription>
                                    Clique em um pedido para ver detalhes ou use as ações rápidas
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Label className="text-sm">Filtrar:</Label>
                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Todos</SelectItem>
                                        {STATUS_OPTIONS.map(s => (
                                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="animate-pulse-soft text-muted-foreground">
                                    Carregando pedidos...
                                </div>
                            </div>
                        ) : filteredOrders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="text-6xl mb-4">🛒</div>
                                <h3 className="text-xl font-bold mb-2">Nenhum pedido encontrado</h3>
                                <p className="text-muted-foreground max-w-md mb-6">
                                    {filterStatus !== 'ALL' 
                                        ? 'Não há pedidos com este status.'
                                        : 'Comece registrando seu primeiro pedido.'}
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
                                        <TableHead className="text-center">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOrders.map((order) => {
                                        const status = getStatusBadge(order.status);
                                        const itemsText = order.items
                                            .map(i => `${i.quantity}x ${i.product.name}`)
                                            .join(', ');
                                        const isLoading = actionLoading === order.id;

                                        return (
                                            <TableRow 
                                                key={order.id} 
                                                className={`hover:bg-muted/50 cursor-pointer ${order.status === 'CANCELED' ? 'opacity-50' : ''}`}
                                                onClick={() => openDetails(order)}
                                            >
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
                                                <TableCell onClick={(e) => e.stopPropagation()}>
                                                    <Select 
                                                        value={order.status} 
                                                        onValueChange={(val) => handleStatusChange(order.id, val)}
                                                        disabled={isLoading}
                                                    >
                                                        <SelectTrigger className={`w-[140px] h-8 text-xs ${status.class}`}>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {STATUS_OPTIONS.map(s => (
                                                                <SelectItem key={s.value} value={s.value}>
                                                                    {s.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleReplicate(order)}
                                                            disabled={isLoading}
                                                            className="h-8 w-8 p-0 hover:bg-blue-100"
                                                            title="Replicar Pedido"
                                                        >
                                                            {isLoading ? '⏳' : '🔁'}
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => openDetails(order)}
                                                            className="h-8 w-8 p-0 hover:bg-purple-100"
                                                            title="Ver Detalhes"
                                                        >
                                                            👁️
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(order)}
                                                            disabled={isLoading || order.status === 'CANCELED'}
                                                            className="h-8 w-8 p-0 hover:bg-red-100"
                                                            title="Excluir/Cancelar"
                                                        >
                                                            🗑️
                                                        </Button>
                                                    </div>
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

            {/* Modal de Detalhes */}
            {showDetails && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-background rounded-xl shadow-2xl w-full max-w-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b sticky top-0 bg-background">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold">📦 Detalhes do Pedido</h2>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {formatDateFull(selectedOrder.createdAt)}
                                    </p>
                                </div>
                                <button onClick={closeDetails} className="text-2xl hover:opacity-70">✕</button>
                            </div>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Info Geral */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <div className="text-sm text-muted-foreground">Plataforma</div>
                                    <div className="font-bold text-lg">{selectedOrder.platform.name}</div>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <div className="text-sm text-muted-foreground">Pagamento</div>
                                    <div className="font-bold text-lg">{selectedOrder.paymentMethod}</div>
                                </div>
                            </div>

                            {selectedOrder.customerName && (
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="text-sm text-blue-600">👤 Cliente</div>
                                    <div className="font-bold">{selectedOrder.customerName}</div>
                                </div>
                            )}

                            {/* Itens */}
                            <div>
                                <h3 className="font-bold mb-3">🧾 Itens do Pedido</h3>
                                <div className="space-y-2">
                                    {selectedOrder.items.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">🍔</span>
                                                <div>
                                                    <div className="font-medium">{item.product.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {item.quantity}x {formatCurrency(Number(item.unitPrice))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="font-bold">
                                                {formatCurrency(Number(item.unitPrice) * item.quantity)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Financeiro */}
                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal</span>
                                    <span className="font-medium">{formatCurrency(Number(selectedOrder.grossTotal))}</span>
                                </div>
                                <div className="flex justify-between text-sm text-red-600">
                                    <span>Taxa da plataforma</span>
                                    <span>- {formatCurrency(Number(selectedOrder.platformFeeValue))}</span>
                                </div>
                                <div className="flex justify-between text-sm text-red-600">
                                    <span>Custo dos produtos</span>
                                    <span>- {formatCurrency(Number(selectedOrder.totalCost))}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                    <span>Lucro Líquido</span>
                                    <span className={Number(selectedOrder.netProfit) >= 0 ? 'text-green-600' : 'text-red-600'}>
                                        {formatCurrency(Number(selectedOrder.netProfit))}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Margem</span>
                                    <span>{Number(selectedOrder.marginPct).toFixed(1)}%</span>
                                </div>
                            </div>

                            {selectedOrder.notes && (
                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="text-sm text-yellow-600">📝 Observações</div>
                                    <div>{selectedOrder.notes}</div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t flex justify-between gap-3">
                            <Button 
                                variant="outline" 
                                onClick={() => {
                                    closeDetails();
                                    handleReplicate(selectedOrder);
                                }}
                            >
                                🔁 Replicar Pedido
                            </Button>
                            <Button onClick={closeDetails}>
                                Fechar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
