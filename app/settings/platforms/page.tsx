"use client";

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Platform {
    id: string;
    name: string;
    type: string;
    defaultFeePercent: string;
    active: boolean;
}

export default function PlatformsPage() {
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    const [name, setName] = useState('');
    const [type, setType] = useState('DELIVERY');
    const [fee, setFee] = useState('');

    async function fetchPlatforms() {
        const data = await fetch('/api/platforms').then(res => res.json());
        setPlatforms(data || []);
    }

    useEffect(() => {
        fetchPlatforms().finally(() => setLoading(false));
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setFormLoading(true);

        const feePercent = Number(fee) / 100;

        try {
            const res = await fetch('/api/platforms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, type, defaultFeePercent: feePercent }),
            });

            if (res.ok) {
                setName('');
                setType('DELIVERY');
                setFee('');
                setShowForm(false);
                fetchPlatforms();
            }
        } finally {
            setFormLoading(false);
        }
    }

    const typeLabels: Record<string, string> = {
        DELIVERY: '🛵 Delivery',
        MANUAL: '📝 Manual',
        MARKETPLACE: '🏪 Marketplace',
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
            <Navbar />
            
            <main className="container mx-auto py-8 px-4 space-y-8 animate-fade-in">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-bold">⚙️ Plataformas</h1>
                        <p className="text-muted-foreground mt-1">
                            Configure suas plataformas de delivery e suas taxas
                        </p>
                    </div>
                    <Button onClick={() => setShowForm(!showForm)} className="gradient-primary">
                        {showForm ? '✕ Cancelar' : '➕ Nova Plataforma'}
                    </Button>
                </div>

                {showForm && (
                    <Card className="animate-slide-up">
                        <CardHeader>
                            <CardTitle>Cadastrar Plataforma</CardTitle>
                            <CardDescription>
                                Adicione uma nova plataforma de vendas
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Nome</Label>
                                        <Input
                                            placeholder="Ex: iFood"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Tipo</Label>
                                        <Select value={type} onValueChange={setType}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="DELIVERY">🛵 Delivery</SelectItem>
                                                <SelectItem value="MANUAL">📝 Manual</SelectItem>
                                                <SelectItem value="MARKETPLACE">🏪 Marketplace</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Taxa (%)</Label>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="100"
                                            placeholder="Ex: 23"
                                            value={fee}
                                            onChange={(e) => setFee(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <Button type="submit" disabled={formLoading}>
                                    {formLoading ? 'Salvando...' : '✓ Salvar Plataforma'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Plataformas Cadastradas</CardTitle>
                        <CardDescription>
                            Gerencie suas plataformas de vendas
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="animate-pulse-soft text-muted-foreground">
                                    Carregando plataformas...
                                </div>
                            </div>
                        ) : platforms.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="text-6xl mb-4">🛵</div>
                                <h3 className="text-xl font-bold mb-2">Nenhuma plataforma cadastrada</h3>
                                <p className="text-muted-foreground max-w-md mb-6">
                                    Cadastre as plataformas de delivery onde você vende (iFood, Uber Eats, etc.)
                                </p>
                                <Button onClick={() => setShowForm(true)}>
                                    ➕ Cadastrar Primeira Plataforma
                                </Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Plataforma</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead className="text-right">Taxa</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {platforms.map((platform) => (
                                        <TableRow key={platform.id} className="hover:bg-muted/50">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                                                        🛵
                                                    </div>
                                                    <span className="font-medium">{platform.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="px-2 py-1 rounded-lg bg-muted text-sm">
                                                    {typeLabels[platform.type] || platform.type}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-red-500">
                                                {(Number(platform.defaultFeePercent) * 100).toFixed(1)}%
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${platform.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                    {platform.active ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
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



