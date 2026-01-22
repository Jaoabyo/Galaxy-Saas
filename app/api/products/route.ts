import prisma from "@/lib/prisma";
import { getTenantId } from "@/lib/auth-context";
import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = 'force-dynamic';

const productSchema = z.object({
    name: z.string().min(1),
    salePrice: z.number().min(0),
    estimatedCost: z.number().min(0),
    active: z.boolean().optional(),
});

export async function GET() {
    try {
        const tenantId = await getTenantId();
        const products = await prisma.product.findMany({
            where: { tenantId },
            orderBy: { name: 'asc' },
        });
        return NextResponse.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json([]);
    }
}

export async function POST(request: Request) {
    try {
        const tenantId = await getTenantId();
        const body = await request.json();
        const validatedData = productSchema.parse(body);

        const product = await prisma.product.create({
            data: {
                tenantId,
                name: validatedData.name,
                salePrice: validatedData.salePrice,
                estimatedCost: validatedData.estimatedCost,
                active: validatedData.active ?? true,
            },
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ error: "Erro ao criar produto" }, { status: 400 });
    }
}

