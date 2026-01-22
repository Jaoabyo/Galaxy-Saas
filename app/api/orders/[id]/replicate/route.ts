import prisma from "@/lib/prisma";
import { getTenantId } from "@/lib/auth-context";
import { NextResponse } from "next/server";
import { calculatePlatformFee, calculateNetProfit, calculateMargin } from "@/lib/calculations";
import { sendTelegramMessage } from "@/lib/telegram";

export const dynamic = 'force-dynamic';

// POST - Replicar pedido
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const tenantId = await getTenantId();

        // Buscar pedido original com itens
        const original = await prisma.order.findFirst({
            where: { id: params.id, tenantId },
            include: { 
                items: { include: { product: true } }, 
                platform: true 
            },
        });

        if (!original) {
            return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
        }

        // Recalcular valores com preços atuais dos produtos
        let grossTotal = 0;
        let totalCost = 0;
        const orderItemsData = [];
        const telegramItemsList: string[] = [];

        for (const item of original.items) {
            // Buscar produto atualizado
            const product = await prisma.product.findUnique({
                where: { id: item.productId },
            });

            if (!product || !product.active) {
                return NextResponse.json({ 
                    error: `Produto "${item.product.name}" não está mais disponível` 
                }, { status: 400 });
            }

            const unitPrice = Number(product.salePrice);
            const unitCost = Number(product.estimatedCost);
            const lineTotal = unitPrice * item.quantity;
            const lineCost = unitCost * item.quantity;

            grossTotal += lineTotal;
            totalCost += lineCost;

            orderItemsData.push({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: unitPrice,
                unitCost: unitCost,
            });

            telegramItemsList.push(`• ${product.name} (${item.quantity}x)`);
        }

        // Calcular taxas
        const feePercent = Number(original.platform.defaultFeePercent);
        const platformFeeValue = calculatePlatformFee(grossTotal, feePercent);
        const netProfit = calculateNetProfit(grossTotal, totalCost, platformFeeValue);
        const marginPct = calculateMargin(netProfit, grossTotal);

        // Criar novo pedido
        const newOrder = await prisma.order.create({
            data: {
                tenantId,
                platformId: original.platformId,
                paymentMethod: original.paymentMethod,
                channel: original.channel,
                customerName: original.customerName,
                notes: `[Replicado de ${new Date(original.createdAt).toLocaleDateString('pt-BR')}] ${original.notes || ''}`.trim(),
                grossTotal,
                totalCost,
                platformFeeValue,
                netProfit,
                marginPct,
                status: "NEW",
                items: {
                    create: orderItemsData
                }
            },
            include: { items: { include: { product: true } }, platform: true }
        });

        // Enviar notificação no Telegram
        const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
        const message = `
🔁 <b>PEDIDO REPLICADO</b> – Galáxia Gourmet

📍 <b>Origem:</b> ${original.platform.name}
💰 <b>Total:</b> ${formatter.format(grossTotal)}
💳 <b>Pagamento:</b> ${original.paymentMethod}
${original.customerName ? `👤 <b>Cliente:</b> ${original.customerName}` : ''}

🧾 <b>Itens:</b>
${telegramItemsList.join('\n')}

💵 <b>Lucro:</b> ${formatter.format(netProfit)}
⏰ ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        `.trim();

        await sendTelegramMessage(message);

        return NextResponse.json(newOrder, { status: 201 });
    } catch (error) {
        console.error('Error replicating order:', error);
        return NextResponse.json({ error: "Erro ao replicar pedido" }, { status: 500 });
    }
}

