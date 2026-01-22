"use client";

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { suggestPrice } from '@/lib/calculations';

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
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({ name: '', salePrice: '', estimatedCost: '' });
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    
    const DEFAULT_FEE = 0.23;
    const TARGET_MARGIN = 30;

    const fetchProducts = () => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                setProducts(data || []);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const getHealthBadge = (margin: number) => {
        if (margin < 0) return { label: 'Prejuízo', class: 'bg-red-100 text-red-700 border-red-200' };
        if (margin < TARGET_MARGIN / 100) return { label: 'Baixa', class: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
        return { label: 'Saudável', class: 'bg-green-100 text-green-700 border-green-200' };
    };

    const openNewProduct = () => {
        setEditingProduct(null);
        setFormData({ name: '', salePrice: '', estimatedCost: '' });
        setShowModal(true);
    };

    const openEditProduct = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            salePrice: String(product.salePrice),
            estimatedCost: String(product.estimatedCost),
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingProduct(null);
        setFormData({ name: '', salePrice: '', estimatedCost: '' });
    };

    const handleSave = async () => {
        if (!formData.name || !formData.salePrice || !formData.estimatedCost) {
            alert('Preencha todos os campos!');
            return;
        }

        setSaving(true);

        try {
            const payload = {
                name: formData.name,
                salePrice: parseFloat(formData.salePrice),
                estimatedCost: parseFloat(formData.estimatedCost),
            };

            let res;
            if (editingProduct) {
                res = await fetch(`/api/products/${editingProduct.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            } else {
                res = await fetch('/api/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            }

            if (res.ok) {
                closeModal();
                fetchProducts();
            } else {
                const error = await res.json();
                alert(error.error || 'Erro ao salvar produto');
            }
        } catch (error) {
            alert('Erro ao salvar produto');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (product: Product) => {
        if (!confirm(`Tem certeza que deseja excluir "${product.name}"?`)) {
            return;
        }

        setDeleting(product.id);

        try {
            const res = await fetch(`/api/products/${product.id}`, {
                method: 'DELETE',
            });

            const data = await res.json();

            if (res.ok) {
                if (data.deactivated) {
                    alert('Produto desativado (possui pedidos vinculados)');
                }
                fetchProducts();
            } else {
                alert(data.error || 'Erro ao excluir produto');
            }
        } catch (error) {
            alert('Erro ao excluir produto');
        } finally {
            setDeleting(null);
        }
    };

    const toggleActive = async (product: Product) => {
        try {
            const res = await fetch(`/api/products/${product.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: !product.active }),
            });

            if (res.ok) {
                fetchProducts();
            }
        } catch (error) {
            alert('Erro ao atualizar produto');
        }
    };

    // Calcular preço sugerido em tempo real no modal
    const getSuggestedPrice = () => {
        const cost = parseFloat(formData.estimatedCost);
        if (isNaN(cost) || cost <= 0) return null;
        return suggestPrice(cost, DEFAULT_FEE, TARGET_MARGIN);
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
                    <Button className="gradient-primary" onClick={openNewProduct}>
                        ➕ Novo Produto
                    </Button>
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
                                <Button onClick={openNewProduct}>➕ Cadastrar Primeiro Produto</Button>
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
                                        <TableHead className="text-center">Ações</TableHead>
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
                                            <TableRow key={product.id} className={`hover:bg-muted/50 ${!product.active ? 'opacity-50' : ''}`}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                                                            🍔
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{product.name}</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {product.active ? '✅ Ativo' : '❌ Inativo'}
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
                                                <TableCell>
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => openEditProduct(product)}
                                                            className="h-8 w-8 p-0 hover:bg-blue-100"
                                                            title="Editar"
                                                        >
                                                            ✏️
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => toggleActive(product)}
                                                            className="h-8 w-8 p-0 hover:bg-yellow-100"
                                                            title={product.active ? 'Desativar' : 'Ativar'}
                                                        >
                                                            {product.active ? '🔒' : '🔓'}
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(product)}
                                                            disabled={deleting === product.id}
                                                            className="h-8 w-8 p-0 hover:bg-red-100"
                                                            title="Excluir"
                                                        >
                                                            {deleting === product.id ? '⏳' : '🗑️'}
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

            {/* Modal de Criar/Editar Produto */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-background rounded-xl shadow-2xl w-full max-w-md animate-fade-in">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-bold">
                                {editingProduct ? '✏️ Editar Produto' : '➕ Novo Produto'}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                {editingProduct ? 'Atualize os dados do produto' : 'Cadastre um novo produto no catálogo'}
                            </p>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome do Produto</Label>
                                <Input
                                    id="name"
                                    placeholder="Ex: Hambúrguer Especial"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cost">Custo (R$)</Label>
                                    <Input
                                        id="cost"
                                        type="number"
                                        step="0.01"
                                        placeholder="0,00"
                                        value={formData.estimatedCost}
                                        onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price">Preço de Venda (R$)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        placeholder="0,00"
                                        value={formData.salePrice}
                                        onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Sugestão de preço */}
                            {getSuggestedPrice() && (
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <span className="text-amber-600 font-medium">💡 Assistente:</span>
                                        <span className="text-sm">
                                            Para margem de {TARGET_MARGIN}%, sugiro{' '}
                                            <strong className="text-amber-700">{formatCurrency(getSuggestedPrice()!)}</strong>
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        className="mt-2 text-xs text-amber-600 hover:text-amber-800 underline"
                                        onClick={() => setFormData({ ...formData, salePrice: getSuggestedPrice()!.toFixed(2) })}
                                    >
                                        Usar preço sugerido
                                    </button>
                                </div>
                            )}

                            {/* Preview da margem */}
                            {formData.salePrice && formData.estimatedCost && (
                                <div className="p-3 bg-muted/50 rounded-lg">
                                    <div className="text-sm text-muted-foreground">Preview:</div>
                                    {(() => {
                                        const price = parseFloat(formData.salePrice);
                                        const cost = parseFloat(formData.estimatedCost);
                                        const fee = price * DEFAULT_FEE;
                                        const profit = price - cost - fee;
                                        const margin = price > 0 ? (profit / price) * 100 : 0;
                                        
                                        return (
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="text-sm">
                                                    Taxa iFood: <strong>{formatCurrency(fee)}</strong>
                                                </span>
                                                <span className="text-sm">
                                                    Lucro: <strong className={profit < 0 ? 'text-red-600' : 'text-green-600'}>
                                                        {formatCurrency(profit)}
                                                    </strong>
                                                </span>
                                                <span className={`text-sm font-bold ${margin < 0 ? 'text-red-600' : margin < TARGET_MARGIN ? 'text-yellow-600' : 'text-green-600'}`}>
                                                    Margem: {margin.toFixed(1)}%
                                                </span>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t flex justify-end gap-3">
                            <Button variant="outline" onClick={closeModal} disabled={saving}>
                                Cancelar
                            </Button>
                            <Button onClick={handleSave} disabled={saving} className="gradient-primary">
                                {saving ? '⏳ Salvando...' : (editingProduct ? 'Salvar Alterações' : 'Criar Produto')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
