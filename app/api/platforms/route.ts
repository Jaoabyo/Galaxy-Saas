import prisma from "@/lib/prisma";
import { getTenantId } from "@/lib/auth-context";
import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = 'force-dynamic';

const platformSchema = z.object({
    name: z.string().min(1),
    type: z.enum(['DELIVERY', 'MANUAL', 'MARKETPLACE']),
    defaultFeePercent: z.number().min(0).max(1),
    active: z.boolean().optional(),
});

export async function GET() {
    try {
        const tenantId = await getTenantId();
        const platforms = await prisma.platform.findMany({
            where: { tenantId },
            orderBy: { name: 'asc' },
        });
        return NextResponse.json(platforms);
    } catch (error) {
        console.error('Error fetching platforms:', error);
        return NextResponse.json([]);
    }
}

export async function POST(request: Request) {
    try {
        const tenantId = await getTenantId();
        const body = await request.json();
        const data = platformSchema.parse(body);

        const platform = await prisma.platform.create({
            data: {
                tenantId,
                ...data,
            },
        });

        return NextResponse.json(platform, { status: 201 });
    } catch (error) {
        console.error('Error creating platform:', error);
        return NextResponse.json({ error: "Erro ao criar plataforma" }, { status: 400 });
    }
}

