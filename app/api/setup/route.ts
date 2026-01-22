import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

/**
 * API de Setup Inicial
 * Cria o tenant padrão, plataformas e produtos de exemplo
 * Executar uma vez para configurar o sistema
 */
export async function POST() {
    try {
        const { default: prisma } = await import("@/lib/prisma");
        
        // Verificar se já existe um tenant
        const existingTenant = await prisma.tenant.findFirst();
        if (existingTenant) {
            return NextResponse.json({ 
                success: true, 
                message: "Sistema já configurado!",
                tenantId: existingTenant.id 
            });
        }

        // Criar tenant
        const tenant = await prisma.tenant.create({
            data: {
                name: "Meu Restaurante",
                plan: "FREE",
                active: true,
            },
        });

        // Criar plataformas padrão
        await prisma.platform.create({
            data: {
                tenantId: tenant.id,
                name: "iFood",
                type: "DELIVERY",
                defaultFeePercent: 0.23, // 23%
                active: true,
            },
        });

        await prisma.platform.create({
            data: {
                tenantId: tenant.id,
                name: "Rappi",
                type: "DELIVERY",
                defaultFeePercent: 0.20, // 20%
                active: true,
            },
        });

        await prisma.platform.create({
            data: {
                tenantId: tenant.id,
                name: "Balcão / WhatsApp",
                type: "MANUAL",
                defaultFeePercent: 0.0, // 0%
                active: true,
            },
        });

        // Criar produtos de exemplo
        const produtos = [
            { name: "Hambúrguer Clássico", salePrice: 28.90, estimatedCost: 12.00 },
            { name: "X-Bacon Especial", salePrice: 34.90, estimatedCost: 15.00 },
            { name: "Batata Frita (Porção)", salePrice: 18.90, estimatedCost: 5.00 },
            { name: "Refrigerante Lata", salePrice: 6.90, estimatedCost: 3.00 },
            { name: "Combo Família", salePrice: 89.90, estimatedCost: 35.00 },
        ];

        for (const produto of produtos) {
            await prisma.product.create({
                data: {
                    tenantId: tenant.id,
                    ...produto,
                    active: true,
                },
            });
        }

        return NextResponse.json({
            success: true,
            message: "Sistema configurado com sucesso!",
            tenantId: tenant.id,
            data: {
                tenant: tenant.name,
                platforms: 3,
                products: produtos.length,
            }
        }, { status: 201 });

    } catch (error: any) {
        console.error('Setup error:', error);
        
        // Verificar se é erro de conexão
        const isConnectionError = error.message?.includes('FATAL') || 
                                  error.message?.includes('connection') ||
                                  error.message?.includes('does not exist') ||
                                  error.message?.includes('connect');
        
        return NextResponse.json({
            success: false,
            error: isConnectionError 
                ? "Não foi possível conectar ao banco de dados. Execute o SQL de setup no Supabase SQL Editor primeiro."
                : (error.message || "Erro ao configurar sistema"),
            needsDatabase: isConnectionError,
        }, { status: 500 });
    }
}

export async function GET() {
    try {
        const { default: prisma } = await import("@/lib/prisma");
        
        const tenant = await prisma.tenant.findFirst();
        const platforms = tenant ? await prisma.platform.count() : 0;
        const products = tenant ? await prisma.product.count() : 0;
        const orders = tenant ? await prisma.order.count() : 0;

        return NextResponse.json({
            configured: !!tenant,
            stats: {
                tenant: tenant?.name || null,
                platforms,
                products,
                orders,
            }
        });
    } catch (error: any) {
        console.error('Setup check error:', error);
        
        // Verificar se é erro de conexão/tabela não existe
        const isConnectionError = error.message?.includes('FATAL') || 
                                  error.message?.includes('does not exist') ||
                                  error.message?.includes('connection');
        
        return NextResponse.json({
            configured: false,
            needsDatabase: true,
            error: isConnectionError 
                ? "Banco de dados não configurado. Execute o SQL de setup primeiro."
                : error.message,
        });
    }
}
