import prisma from "@/lib/prisma";
import { getTenantId } from "@/lib/auth-context";
import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = 'force-dynamic';

const updateProductSchema = z.object({
    name: z.string().min(1).optional(),
    salePrice: z.number().min(0).optional(),
    estimatedCost: z.number().min(0).optional(),
    active: z.boolean().optional(),
});

// GET - Buscar produto específico
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const tenantId = await getTenantId();
        const product = await prisma.product.findFirst({
            where: { id: params.id, tenantId },
        });

        if (!product) {
            return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json({ error: "Erro ao buscar produto" }, { status: 500 });
    }
}

// PUT - Atualizar produto
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const tenantId = await getTenantId();
        const body = await request.json();
        const validatedData = updateProductSchema.parse(body);

        // Verificar se o produto existe e pertence ao tenant
        const existing = await prisma.product.findFirst({
            where: { id: params.id, tenantId },
        });

        if (!existing) {
            return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
        }

        const product = await prisma.product.update({
            where: { id: params.id },
            data: validatedData,
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 400 });
    }
}

// DELETE - Excluir produto
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const tenantId = await getTenantId();

        // Verificar se o produto existe e pertence ao tenant
        const existing = await prisma.product.findFirst({
            where: { id: params.id, tenantId },
        });

        if (!existing) {
            return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
        }

        // Verificar se o produto está sendo usado em pedidos
        const ordersWithProduct = await prisma.orderItem.count({
            where: { productId: params.id },
        });

        if (ordersWithProduct > 0) {
            // Ao invés de deletar, desativar o produto
            await prisma.product.update({
                where: { id: params.id },
                data: { active: false },
            });
            return NextResponse.json({ 
                message: "Produto desativado (possui pedidos vinculados)",
                deactivated: true 
            });
        }

        await prisma.product.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: "Produto excluído com sucesso" });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json({ error: "Erro ao excluir produto" }, { status: 500 });
    }
}

