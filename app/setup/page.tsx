"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

export default function SetupPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    const [status, setStatus] = useState<{ configured: boolean; needsDatabase?: boolean; error?: string } | null>(null);
    const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string; needsDatabase?: boolean } | null>(null);

    useEffect(() => {
        fetch('/api/setup')
            .then(res => res.json())
            .then(data => {
                setStatus(data);
                if (data.configured) {
                    setTimeout(() => router.push('/dashboard'), 2000);
                }
            })
            .finally(() => setChecking(false));
    }, [router]);

    async function handleSetup() {
        setLoading(true);
        setResult(null);
        
        try {
            const res = await fetch('/api/setup', { method: 'POST' });
            const data = await res.json();
            setResult(data);
            
            if (data.success) {
                setTimeout(() => router.push('/dashboard'), 2000);
            }
        } catch (error) {
            setResult({ success: false, error: 'Erro de conexão. Verifique se o banco de dados está configurado.' });
        } finally {
            setLoading(false);
        }
    }

    if (checking) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-black flex items-center justify-center">
                <div className="text-center animate-pulse">
                    <div className="text-6xl mb-4">🌌</div>
                    <p className="text-white/70">Verificando configuração...</p>
                </div>
            </div>
        );
    }

    if (status?.configured) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-black flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">✅</div>
                    <p className="text-white text-xl font-bold">Sistema já configurado!</p>
                    <p className="text-white/70 mt-2">Redirecionando para o Dashboard...</p>
                </div>
            </div>
        );
    }

    // Se precisa configurar o banco de dados primeiro
    if (status?.needsDatabase || result?.needsDatabase) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-black flex items-center justify-center p-4">
                <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-lg border-white/20 text-white">
                    <CardHeader className="text-center space-y-4">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-4xl shadow-lg shadow-orange-500/50">
                            ⚠️
                        </div>
                        <CardTitle className="text-2xl font-bold">
                            Configurar Banco de Dados
                        </CardTitle>
                        <CardDescription className="text-white/70">
                            O banco de dados precisa ser configurado primeiro
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <h3 className="font-bold text-lg mb-3 text-orange-400">📝 Passo a Passo:</h3>
                            <ol className="space-y-3 text-white/80 text-sm">
                                <li className="flex gap-3">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/30 text-xs font-bold">1</span>
                                    <span>Acesse o <strong>Supabase SQL Editor</strong> do seu projeto</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/30 text-xs font-bold">2</span>
                                    <span>Copie o conteúdo do arquivo <code className="bg-white/10 px-2 py-0.5 rounded">supabase_schema.sql</code></span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/30 text-xs font-bold">3</span>
                                    <span>Cole e execute o SQL no editor</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/30 text-xs font-bold">4</span>
                                    <span>Volte aqui e clique em &quot;Tentar Novamente&quot;</span>
                                </li>
                            </ol>
                        </div>

                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                            <p className="text-sm text-red-300">
                                <strong>Erro atual:</strong> {status?.error || result?.error || "Banco de dados não configurado"}
                            </p>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4">
                        <Button
                            onClick={() => {
                                setStatus(null);
                                setResult(null);
                                setChecking(true);
                                fetch('/api/setup')
                                    .then(res => res.json())
                                    .then(data => {
                                        setStatus(data);
                                        if (data.configured) {
                                            router.push('/dashboard');
                                        }
                                    })
                                    .finally(() => setChecking(false));
                            }}
                            className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500"
                        >
                            🔄 Tentar Novamente
                        </Button>
                        <p className="text-center text-white/50 text-xs">
                            Desenvolvido por{' '}
                            <a href="https://github.com/jaoadev" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
                                @jaoadev
                            </a>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-black flex items-center justify-center p-4">
            <Card className="w-full max-w-lg bg-white/10 backdrop-blur-lg border-white/20 text-white">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-4xl shadow-lg shadow-purple-500/50">
                        🌌
                    </div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Galáxia Gourmet
                    </CardTitle>
                    <CardDescription className="text-white/70 text-lg">
                        Sistema de Gestão para Delivery
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="space-y-4 text-white/80">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">📊</span>
                            <div>
                                <p className="font-medium">Dashboard em Tempo Real</p>
                                <p className="text-sm text-white/60">Acompanhe faturamento, custos e lucros</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">🤖</span>
                            <div>
                                <p className="font-medium">Assistente Inteligente</p>
                                <p className="text-sm text-white/60">Sugere preços e identifica prejuízos</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">📱</span>
                            <div>
                                <p className="font-medium">Alertas no Telegram</p>
                                <p className="text-sm text-white/60">Receba notificações de novos pedidos</p>
                            </div>
                        </div>
                    </div>

                    {result && (
                        <div className={`p-4 rounded-xl ${result.success ? 'bg-green-500/20 border border-green-500/50' : 'bg-red-500/20 border border-red-500/50'}`}>
                            {result.success ? (
                                <p className="text-green-300">✅ {result.message}</p>
                            ) : (
                                <p className="text-red-300">❌ {result.error}</p>
                            )}
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                    <Button
                        onClick={handleSetup}
                        disabled={loading}
                        className="w-full h-14 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/30"
                    >
                        {loading ? (
                            <>
                                <span className="animate-spin mr-2">⏳</span>
                                Configurando...
                            </>
                        ) : (
                            <>🚀 Iniciar Configuração</>
                        )}
                    </Button>
                    <p className="text-center text-white/50 text-xs">
                        Desenvolvido por{' '}
                        <a href="https://github.com/jaoadev" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
                            @jaoadev
                        </a>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
