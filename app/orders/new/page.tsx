"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { Label } from '@/components/ui/label';

interface Product {
    id: string;
    name: string;
    salePrice: number;
    estimatedCost: number;
    active: boolean;
}

interface Platform {
    id: string;
    name: string;
    defaultFeePercent: string;
}

interface CartItem {
    product: Product;
    quantity: number;
}

export default function NewOrderPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [platformId, setPlatformId] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState('PIX');
    const [customerName, setCustomerName] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        Promise.all([
            fetch('/api/products').then(res => res.json()),
            fetch('/api/platforms').then(res => res.json()),
        ]).then(([productsData, platformsData]) => {
            const activeProducts = (productsData || [])
                .filter((p: any) => p.active)
                .map((p: any) => ({ 
                    ...p, 
                    salePrice: Number(p.salePrice),
                    estimatedCost: Number(p.estimatedCost),
                }));
            setProducts(activeProducts);
            setPlatforms(platformsData || []);
            if (platformsData?.length > 0) setPlatformId(platformsData[0].id);
        }).finally(() => setLoading(false));
    }, []);

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(i => i.product.id === product.id);
            if (existing) {
                return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => {
            const existing = prev.find(i => i.product.id === productId);
            if (existing && existing.quantity > 1) {
                return prev.map(i => i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i);
            }
            return prev.filter(i => i.product.id !== productId);
        });
    };

    const clearCart = () => {
        setCart([]);
    };

    const selectedPlatform = platforms.find(p => p.id === platformId);
    const feePercent = selectedPlatform ? Number(selectedPlatform.defaultFeePercent) : 0;
    const grossTotal = cart.reduce((acc, item) => acc + (item.product.salePrice * item.quantity), 0);
    const totalCost = cart.reduce((acc, item) => acc + (item.product.estimatedCost * item.quantity), 0);
    const platformFee = grossTotal * feePercent;
    const netProfit = grossTotal - totalCost - platformFee;
    const margin = grossTotal > 0 ? (netProfit / grossTotal) * 100 : 0;

    async function handleSubmit() {
        if (cart.length === 0 || !platformId) return;
        setSubmitting(true);

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    platformId,
                    paymentMethod,
                    customerName: customerName || undefined,
                    notes: notes || undefined,
                    items: cart.map(i => ({ productId: i.product.id, quantity: i.quantity })),
                }),
            });
            
            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/orders');
                }, 1500);
            } else {
                const data = await res.json();
                alert(data.error || 'Erro ao criar pedido');
            }
        } catch (e) {
            console.error(e);
            alert('Erro ao conectar');
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
                <Navbar />
                <div className="flex items-center justify-center py-32">
                    <div className="animate-pulse-soft text-muted-foreground">Carregando...</div>
                </div>
            </div>
        );
    }

    // Tela de sucesso
    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
                <Navbar />
                <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
                    <div className="text-8xl mb-6 animate-bounce">✅</div>
                    <h1 className="text-3xl font-bold text-green-600 mb-2">Pedido Criado!</h1>
                    <p className="text-muted-foreground mb-4">Notificação enviada para o Telegram</p>
                    <div className="text-2xl font-bold">{formatCurrency(grossTotal)}</div>
                    <div className="text-green-600 font-medium">Lucro: {formatCurrency(netProfit)}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
            <Navbar />
            <main className="container mx-auto py-8 px-4 animate-fade-in">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold">➕ Novo Pedido</h1>
                    <p className="text-muted-foreground mt-1">
                        Registre uma nova venda em segundos
                    </p>
                </div>

                {products.length === 0 || platforms.length === 0 ? (
                    <Card className="border-dashed border-2">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="text-6xl mb-4">⚠️</div>
                            <h3 className="text-xl font-bold mb-2">Configuração necessária</h3>
                            <p className="text-muted-foreground max-w-md mb-6">
                                Você precisa cadastrar produtos e plataformas antes de criar pedidos.
                            </p>
                            <div className="flex gap-4">
                                <Button variant="outline" onClick={() => router.push('/products')}>
                                    🍟 Cadastrar Produto
                                </Button>
                                <Button onClick={() => router.push('/settings/platforms')}>
                                    ⚙️ Configurar Plataforma
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Produtos */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold">1️⃣ Selecionar Produtos</h2>
                                <span className="text-sm text-muted-foreground">
                                    {products.length} disponíveis
                                </span>
                            </div>
                            <div className="grid gap-3 max-h-[600px] overflow-y-auto pr-2">
                                {products.map(product => {
                                    const inCart = cart.find(i => i.product.id === product.id);
                                    return (
                                        <Card
                                            key={product.id}
                                            className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${inCart ? 'border-primary border-2 shadow-primary/20' : ''}`}
                                            onClick={() => addToCart(product)}
                                        >
                                            <CardContent className="p-4 flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600 text-xl">
                                                        🍔
                                                    </div>
                                                    <div>
                                                        <div className="font-bold">{product.name}</div>
                                                        <div className="text-sm text-primary font-medium">
                                                            {formatCurrency(product.salePrice)}
                                                        </div>
                                                    </div>
                                                </div>
                                                {inCart ? (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); removeFromCart(product.id); }}
                                                            className="h-8 w-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors font-bold"
                                                        >
                                                            −
                                                        </button>
                                                        <span className="w-8 text-center font-bold text-lg">{inCart.quantity}</span>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                                            className="h-8 w-8 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors font-bold"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <Button size="sm" variant="secondary">➕ Adicionar</Button>
                                                )}
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Resumo */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold">2️⃣ Finalizar Pedido</h2>

                            <Card>
                                <CardHeader>
                                    <CardTitle>⚙️ Configurações</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Plataforma</Label>
                                            <Select value={platformId} onValueChange={setPlatformId}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {platforms.map(p => (
                                                        <SelectItem key={p.id} value={p.id}>
                                                            {p.name} ({(Number(p.defaultFeePercent) * 100).toFixed(0)}%)
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Pagamento</Label>
                                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="PIX">💜 PIX</SelectItem>
                                                    <SelectItem value="CREDIT">💳 Crédito</SelectItem>
                                                    <SelectItem value="DEBIT">💳 Débito</SelectItem>
                                                    <SelectItem value="CASH">💵 Dinheiro</SelectItem>
                                                    <SelectItem value="OTHER">📝 Outro</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Nome do Cliente (opcional)</Label>
                                        <Input 
                                            placeholder="Ex: João Silva"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Observações (opcional)</Label>
                                        <Input 
                                            placeholder="Ex: Sem cebola, troco para R$50..."
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-2 border-primary/30">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-center">
                                        <CardTitle>📋 Resumo do Pedido</CardTitle>
                                        {cart.length > 0 && (
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={clearCart}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                🗑️ Limpar
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {cart.length === 0 ? (
                                        <div className="text-center py-8">
                                            <div className="text-4xl mb-2">👆</div>
                                            <p className="text-muted-foreground">
                                                Clique nos produtos para adicionar
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {cart.map(item => (
                                                <div key={item.product.id} className="flex justify-between items-center py-2 border-b last:border-0">
                                                    <div>
                                                        <span className="font-medium">{item.product.name}</span>
                                                        <div className="text-sm text-muted-foreground">
                                                            {item.quantity}x {formatCurrency(item.product.salePrice)}
                                                        </div>
                                                    </div>
                                                    <span className="font-bold">
                                                        {formatCurrency(item.product.salePrice * item.quantity)}
                                                    </span>
                                                </div>
                                            ))}

                                            <div className="pt-4 mt-4 border-t border-dashed space-y-2">
                                                <div className="flex justify-between">
                                                    <span>Total Bruto</span>
                                                    <span className="font-bold">{formatCurrency(grossTotal)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm text-red-500">
                                                    <span>Taxa {selectedPlatform?.name} ({(feePercent * 100).toFixed(0)}%)</span>
                                                    <span>- {formatCurrency(platformFee)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm text-red-500">
                                                    <span>Custo dos produtos</span>
                                                    <span>- {formatCurrency(totalCost)}</span>
                                                </div>
                                                <div className={`flex justify-between text-xl font-bold pt-2 border-t ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    <span>💰 Lucro Líquido</span>
                                                    <span>{formatCurrency(netProfit)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm text-muted-foreground">
                                                    <span>Margem</span>
                                                    <span className={margin < 30 ? 'text-yellow-600' : 'text-green-600'}>
                                                        {margin.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className="w-full h-14 text-lg gradient-primary"
                                        disabled={cart.length === 0 || submitting}
                                        onClick={handleSubmit}
                                    >
                                        {submitting ? '⏳ Enviando...' : '🚀 FINALIZAR PEDIDO'}
                                    </Button>
                                </CardFooter>
                            </Card>

                            {/* Alerta de margem baixa */}
                            {cart.length > 0 && margin < 30 && margin >= 0 && (
                                <Card className="bg-yellow-50 border-yellow-200">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2 text-yellow-700">
                                            <span className="text-xl">⚠️</span>
                                            <span className="font-medium">
                                                Margem abaixo de 30% - considere ajustar os preços
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {cart.length > 0 && netProfit < 0 && (
                                <Card className="bg-red-50 border-red-200">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2 text-red-700">
                                            <span className="text-xl">🚨</span>
                                            <span className="font-medium">
                                                ATENÇÃO: Este pedido dá PREJUÍZO de {formatCurrency(Math.abs(netProfit))}!
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                )}

                <footer className="text-center py-8 mt-8 border-t">
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
