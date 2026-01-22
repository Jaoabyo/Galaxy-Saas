"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils';
import { suggestPrice } from '@/lib/calculations';

export default function NewProductPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [salePrice, setSalePrice] = useState('');
    const [estimatedCost, setEstimatedCost] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const DEFAULT_FEE = 0.23;
    const TARGET_MARGIN = 30;

    const cost = parseFloat(estimatedCost) || 0;
    const price = parseFloat(salePrice) || 0;
    const suggested = cost > 0 ? suggestPrice(cost, DEFAULT_FEE, TARGET_MARGIN) : 0;
    const feeValue = price * DEFAULT_FEE;
    const profit = price - cost - feeValue;
    const margin = price > 0 ? (profit / price) * 100 : 0;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    salePrice: parseFloat(salePrice),
                    estimatedCost: parseFloat(estimatedCost),
                }),
            });

            if (res.ok) {
                router.push('/products');
            } else {
                setError('Erro ao cadastrar produto. Verifique os dados.');
            }
        } catch (err) {
            setError('Erro de conexão. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
            <Navbar />
            
            <main className="container mx-auto py-8 px-4 max-w-2xl animate-fade-in">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold">➕ Novo Produto</h1>
                    <p className="text-muted-foreground mt-1">
                        Cadastre um produto e veja a sugestão de preço do assistente
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações do Produto</CardTitle>
                            <CardDescription>
                                Preencha os dados abaixo para cadastrar um novo produto
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome do Produto</Label>
                                <Input
                                    id="name"
                                    placeholder="Ex: Hambúrguer Artesanal"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cost">Custo Estimado (R$)</Label>
                                    <Input
                                        id="cost"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0,00"
                                        value={estimatedCost}
                                        onChange={(e) => setEstimatedCost(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price">Preço de Venda (R$)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0,00"
                                        value={salePrice}
                                        onChange={(e) => setSalePrice(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {cost > 0 && (
                                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xl">🤖</span>
                                        <span className="font-bold text-purple-700 dark:text-purple-300">Assistente Inteligente</span>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <p>
                                            💡 <strong>Preço sugerido:</strong>{' '}
                                            <span className="text-purple-700 dark:text-purple-300 font-bold">
                                                {formatCurrency(suggested)}
                                            </span>
                                            <span className="text-muted-foreground ml-1">(margem de 30%)</span>
                                        </p>
                                        {price > 0 && (
                                            <>
                                                <p>
                                                    📊 <strong>Margem atual:</strong>{' '}
                                                    <span className={`font-bold ${margin >= 30 ? 'text-green-600' : margin >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                        {margin.toFixed(1)}%
                                                    </span>
                                                </p>
                                                <p>
                                                    💰 <strong>Lucro por unidade:</strong>{' '}
                                                    <span className={`font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {formatCurrency(profit)}
                                                    </span>
                                                </p>
                                            </>
                                        )}
                                    </div>
                                    {price > 0 && price < suggested && (
                                        <button
                                            type="button"
                                            onClick={() => setSalePrice(suggested.toFixed(2))}
                                            className="mt-3 text-xs px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                        >
                                            Usar preço sugerido
                                        </button>
                                    )}
                                </div>
                            )}

                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-200">
                                    {error}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                className="flex-1"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || !name || !salePrice || !estimatedCost}
                                className="flex-1 gradient-primary"
                            >
                                {loading ? 'Salvando...' : '✓ Cadastrar Produto'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>

                <footer className="text-center py-8">
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


