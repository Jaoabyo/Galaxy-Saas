import prisma from "@/lib/prisma";
import { getTenantId } from "@/lib/auth-context";
import { NextResponse } from "next/server";
import { z } from "zod";
import { calculatePlatformFee, calculateNetProfit, calculateMargin } from "@/lib/calculations";
import { sendTelegramMessage } from "@/lib/telegram";

const orderItemSchema = z.object({
    productId: z.string(),
    quantity: z.number().min(1),
});

const createOrderSchema = z.object({
    platformId: z.string(),
    paymentMethod: z.enum(['PIX', 'CREDIT', 'DEBIT', 'CASH', 'OTHER']),
    items: z.array(orderItemSchema).min(1),
    channel: z.string().optional(),
    customerName: z.string().optional(),
    notes: z.string().optional(),
});

export async function POST(request: Request) {
    try {
        const tenantId = await getTenantId();
        const body = await request.json();
        const { platformId, paymentMethod, items, channel, customerName, notes } = createOrderSchema.parse(body);

        const productIds = items.map(i => i.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds }, tenantId }
        });

        const productMap = new Map(products.map(p => [p.id, p]));

        let grossTotal = 0;
        let totalCost = 0;
        const orderItemsData = [];
        const telegramItemsList: string[] = [];

        for (const item of items) {
            const product = productMap.get(item.productId);
            if (!product) {
                return NextResponse.json({ error: `Produto ${item.productId} não encontrado` }, { status: 400 });
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

        const platform = await prisma.platform.findUnique({
            where: { id: platformId },
        });

        if (!platform || platform.tenantId !== tenantId) {
            return NextResponse.json({ error: "Plataforma inválida" }, { status: 400 });
        }

        const feePercent = Number(platform.defaultFeePercent);
        const platformFeeValue = calculatePlatformFee(grossTotal, feePercent);
        const netProfit = calculateNetProfit(grossTotal, totalCost, platformFeeValue);
        const marginPct = calculateMargin(netProfit, grossTotal);

        const order = await prisma.order.create({
            data: {
                tenantId,
                platformId,
                paymentMethod,
                channel,
                customerName,
                notes,
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
            include: { items: true, platform: true }
        });

        // Enviar notificação no Telegram
        const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
        const message = `
🍟 <b>NOVO PEDIDO</b> – Galáxia Gourmet

📍 <b>Origem:</b> ${platform.name}
💰 <b>Total:</b> ${formatter.format(grossTotal)}
💳 <b>Pagamento:</b> ${paymentMethod}
${customerName ? `👤 <b>Cliente:</b> ${customerName}` : ''}

🧾 <b>Itens:</b>
${telegramItemsList.join('\n')}

💵 <b>Lucro:</b> ${formatter.format(netProfit)}
⏰ ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        `.trim();

        await sendTelegramMessage(message);

        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ error: "Erro ao criar pedido" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const tenantId = await getTenantId();
        const { searchParams } = new URL(request.url);
        const dateStr = searchParams.get('date');

        const whereClause: any = { tenantId };

        if (dateStr) {
            const start = new Date(dateStr);
            start.setHours(0, 0, 0, 0);
            const end = new Date(dateStr);
            end.setHours(23, 59, 59, 999);
            whereClause.createdAt = { gte: start, lte: end };
        }

        const orders = await prisma.order.findMany({
            where: whereClause,
            include: { items: { include: { product: true } }, platform: true },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json([]);
    }
}

