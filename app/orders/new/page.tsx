"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import { Label } from '@/components/ui/label';

interface Product {
    id: string;
    name: string;
    salePrice: number;
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
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('/api/products').then(res => res.json()),
            fetch('/api/platforms').then(res => res.json()),
        ]).then(([productsData, platformsData]) => {
            setProducts((productsData || []).map((p: any) => ({ ...p, salePrice: Number(p.salePrice) })));
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

    const selectedPlatform = platforms.find(p => p.id === platformId);
    const feePercent = selectedPlatform ? Number(selectedPlatform.defaultFeePercent) : 0;
    const grossTotal = cart.reduce((acc, item) => acc + (item.product.salePrice * item.quantity), 0);
    const estimatedFee = grossTotal * feePercent;
    const estimatedNet = grossTotal - estimatedFee;

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
                    items: cart.map(i => ({ productId: i.product.id, quantity: i.quantity })),
                }),
            });
            if (res.ok) {
                router.push('/orders');
            } else {
                alert('Erro ao criar pedido');
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
                                <Button variant="outline" onClick={() => router.push('/products/new')}>
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
                            <h2 className="text-xl font-bold">1. Selecionar Produtos</h2>
                            <div className="grid gap-3">
                                {products.map(product => {
                                    const inCart = cart.find(i => i.product.id === product.id);
                                    return (
                                        <Card
                                            key={product.id}
                                            className={`cursor-pointer transition-all hover:shadow-lg ${inCart ? 'border-primary shadow-primary/20' : ''}`}
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
                                                    <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                                                        {inCart.quantity}x
                                                    </span>
                                                ) : (
                                                    <Button size="sm" variant="secondary">Adicionar</Button>
                                                )}
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Resumo */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold">2. Finalizar Pedido</h2>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Configurações</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Plataforma</Label>
                                        <Select value={platformId} onValueChange={setPlatformId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {platforms.map(p => (
                                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
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
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-2 border-primary/30">
                                <CardHeader>
                                    <CardTitle>📋 Resumo do Pedido</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {cart.length === 0 ? (
                                        <p className="text-muted-foreground text-center py-8">
                                            Clique nos produtos para adicionar
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {cart.map(item => (
                                                <div key={item.product.id} className="flex justify-between items-center">
                                                    <span className="text-sm">
                                                        {item.quantity}x {item.product.name}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">
                                                            {formatCurrency(item.product.salePrice * item.quantity)}
                                                        </span>
                                                        <button
                                                            onClick={() => removeFromCart(item.product.id)}
                                                            className="h-6 w-6 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors text-sm"
                                                        >
                                                            −
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="pt-4 mt-4 border-t space-y-2">
                                                <div className="flex justify-between">
                                                    <span>Total Bruto</span>
                                                    <span className="font-bold">{formatCurrency(grossTotal)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm text-muted-foreground">
                                                    <span>Taxa {selectedPlatform?.name} ({(feePercent * 100).toFixed(0)}%)</span>
                                                    <span>- {formatCurrency(estimatedFee)}</span>
                                                </div>
                                                <div className="flex justify-between text-xl font-bold text-green-600 pt-2">
                                                    <span>Lucro Estimado</span>
                                                    <span>{formatCurrency(estimatedNet)}</span>
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
                                        {submitting ? 'Enviando...' : '🚀 FINALIZAR PEDIDO'}
                                    </Button>
                                </CardFooter>
                            </Card>
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


