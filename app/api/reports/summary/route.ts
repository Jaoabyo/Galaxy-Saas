import prisma from "@/lib/prisma";
import { getTenantId } from "@/lib/auth-context";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const tenantId = await getTenantId();
        const { searchParams } = new URL(request.url);
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        const status = searchParams.get('status');

        const whereClause: any = { tenantId };

        if (from && to) {
            const start = new Date(from);
            start.setHours(0, 0, 0, 0);
            const end = new Date(to);
            end.setHours(23, 59, 59, 999);
            whereClause.createdAt = { gte: start, lte: end };
        }

        // Considerar todos os status exceto CANCELED para estatísticas
        if (status) {
            whereClause.status = status;
        }

        const orders = await prisma.order.findMany({
            where: whereClause,
            orderBy: { createdAt: 'asc' }
        });

        const summary = {
            ordersCount: orders.length,
            grossRevenue: orders.reduce((acc, o) => acc + Number(o.grossTotal), 0),
            feesTotal: orders.reduce((acc, o) => acc + Number(o.platformFeeValue), 0),
            costsTotal: orders.reduce((acc, o) => acc + Number(o.totalCost), 0),
            netProfit: orders.reduce((acc, o) => acc + Number(o.netProfit), 0),
            avgMargin: 0
        };

        if (summary.grossRevenue > 0) {
            summary.avgMargin = (summary.netProfit / summary.grossRevenue) * 100;
        }

        const dailyDataMap = new Map();
        orders.forEach(o => {
            const date = o.createdAt.toISOString().split('T')[0];
            if (!dailyDataMap.has(date)) {
                dailyDataMap.set(date, { date, gross: 0, net: 0, count: 0 });
            }
            const day = dailyDataMap.get(date);
            day.gross += Number(o.grossTotal);
            day.net += Number(o.netProfit);
            day.count += 1;
        });

        const dailySeries = Array.from(dailyDataMap.values()).sort((a, b) => a.date.localeCompare(b.date));

        return NextResponse.json({ summary, dailySeries });
    } catch (error) {
        console.error('Error in summary:', error);
        // Retornar dados zerados em caso de erro
        return NextResponse.json({
            summary: {
                ordersCount: 0,
                grossRevenue: 0,
                feesTotal: 0,
                costsTotal: 0,
                netProfit: 0,
                avgMargin: 0
            },
            dailySeries: []
        });
    }
}

