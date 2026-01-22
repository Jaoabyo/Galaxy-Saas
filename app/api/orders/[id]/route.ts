import prisma from "@/lib/prisma";
import { getTenantId } from "@/lib/auth-context";
import { NextResponse } from "next/server";
import { z } from "zod";
import { calculatePlatformFee, calculateNetProfit, calculateMargin } from "@/lib/calculations";
import { sendTelegramMessage } from "@/lib/telegram";

export const dynamic = 'force-dynamic';

const updateOrderSchema = z.object({
    status: z.enum(['NEW', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELED']).optional(),
    paymentMethod: z.enum(['PIX', 'CREDIT', 'DEBIT', 'CASH', 'OTHER']).optional(),
    customerName: z.string().optional(),
    notes: z.string().optional(),
});

// GET - Buscar pedido específico
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const tenantId = await getTenantId();
        const order = await prisma.order.findFirst({
            where: { id: params.id, tenantId },
            include: { 
                items: { include: { product: true } }, 
                platform: true 
            },
        });

        if (!order) {
            return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json({ error: "Erro ao buscar pedido" }, { status: 500 });
    }
}

// PUT - Atualizar pedido (status, notas, etc)
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const tenantId = await getTenantId();
        const body = await request.json();
        const validatedData = updateOrderSchema.parse(body);

        const existing = await prisma.order.findFirst({
            where: { id: params.id, tenantId },
            include: { platform: true },
        });

        if (!existing) {
            return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
        }

        const order = await prisma.order.update({
            where: { id: params.id },
            data: validatedData,
            include: { items: { include: { product: true } }, platform: true },
        });

        // Notificar mudança de status no Telegram
        if (validatedData.status && validatedData.status !== existing.status) {
            const statusLabels: Record<string, string> = {
                NEW: '🆕 Novo',
                CONFIRMED: '✅ Confirmado',
                PREPARING: '👨‍🍳 Preparando',
                OUT_FOR_DELIVERY: '🚴 Em Entrega',
                DELIVERED: '✅ Entregue',
                CANCELED: '❌ Cancelado',
            };

            const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
            const message = `
📝 <b>PEDIDO ATUALIZADO</b>

🔄 <b>Status:</b> ${statusLabels[validatedData.status]}
💰 <b>Total:</b> ${formatter.format(Number(existing.grossTotal))}
📍 <b>Plataforma:</b> ${existing.platform.name}
            `.trim();

            await sendTelegramMessage(message);
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json({ error: "Erro ao atualizar pedido" }, { status: 400 });
    }
}

// DELETE - Cancelar/Excluir pedido
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const tenantId = await getTenantId();

        const existing = await prisma.order.findFirst({
            where: { id: params.id, tenantId },
        });

        if (!existing) {
            return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
        }

        // Se o pedido é recente (menos de 24h), podemos deletar
        const hoursOld = (Date.now() - new Date(existing.createdAt).getTime()) / (1000 * 60 * 60);
        
        if (hoursOld < 24) {
            // Deletar itens primeiro, depois o pedido
            await prisma.orderItem.deleteMany({
                where: { orderId: params.id },
            });
            await prisma.order.delete({
                where: { id: params.id },
            });
            return NextResponse.json({ message: "Pedido excluído com sucesso" });
        } else {
            // Pedidos antigos são apenas cancelados
            await prisma.order.update({
                where: { id: params.id },
                data: { status: 'CANCELED' },
            });
            return NextResponse.json({ 
                message: "Pedido cancelado (pedidos com mais de 24h não podem ser excluídos)",
                canceled: true 
            });
        }
    } catch (error) {
        console.error('Error deleting order:', error);
        return NextResponse.json({ error: "Erro ao excluir pedido" }, { status: 500 });
    }
}


