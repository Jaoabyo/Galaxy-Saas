import prisma from "@/lib/prisma";
import { getTenantId } from "@/lib/auth-context";
import { NextResponse } from "next/server";
import { analyzeProducts, getProductRecommendation } from "@/lib/calculations";

/**
 * API do Assistente Inteligente
 * Retorna insights sobre produtos com prejuízo ou margem baixa
 */
export async function GET() {
    try {
        const tenantId = await getTenantId();

        // Obter plataforma padrão ou usar taxa padrão de 23% (iFood)
        const platforms = await prisma.platform.findMany({
            where: { tenantId, active: true },
            take: 1,
        });

        const defaultFeePercent = platforms.length > 0
            ? Number(platforms[0].defaultFeePercent)
            : 0.23; // 23% padrão iFood

        // Buscar todos os produtos ativos
        const products = await prisma.product.findMany({
            where: { tenantId, active: true },
        });

        if (products.length === 0) {
            return NextResponse.json({
                summary: {
                    totalProducts: 0,
                    productsWithIssues: 0,
                    losingMoneyCount: 0,
                    lowMarginCount: 0,
                    totalPotentialLoss: 0,
                    healthScore: 100,
                },
                losingMoney: [],
                lowMargin: [],
                recommendations: [],
            });
        }

        // Analisar produtos
        const analysis = analyzeProducts(
            products.map(p => ({
                id: p.id,
                name: p.name,
                salePrice: Number(p.salePrice),
                estimatedCost: Number(p.estimatedCost),
            })),
            defaultFeePercent,
            30 // Margem alvo de 30%
        );

        // Gerar recomendações detalhadas
        const recommendations = products
            .map(product => {
                const rec = getProductRecommendation(
                    product.name,
                    Number(product.salePrice),
                    Number(product.estimatedCost),
                    defaultFeePercent,
                    30
                );

                if (!rec) return null;

                return {
                    productId: product.id,
                    productName: product.name,
                    currentPrice: Number(product.salePrice),
                    suggestedPrice: rec.suggestedPrice,
                    currentMargin: rec.currentMargin,
                    potentialProfit: rec.potentialProfit,
                    message: rec.message,
                    type: rec.type,
                };
            })
            .filter(Boolean);

        // Calcular estatísticas gerais
        const totalProducts = products.length;
        const productsWithIssues = analysis.losingMoney.length + analysis.lowMargin.length;
        const healthScore = totalProducts > 0
            ? Math.round(((totalProducts - productsWithIssues) / totalProducts) * 100)
            : 100;

        return NextResponse.json({
            summary: {
                totalProducts,
                productsWithIssues,
                losingMoneyCount: analysis.losingMoney.length,
                lowMarginCount: analysis.lowMargin.length,
                totalPotentialLoss: analysis.totalPotentialLoss,
                healthScore,
            },
            losingMoney: analysis.losingMoney.map(item => ({
                product: {
                    id: item.product.id,
                    name: item.product.name,
                    currentPrice: item.product.salePrice,
                },
                loss: item.loss,
                recommendation: item.recommendation,
            })),
            lowMargin: analysis.lowMargin.map(item => ({
                product: {
                    id: item.product.id,
                    name: item.product.name,
                    currentPrice: item.product.salePrice,
                },
                margin: item.margin,
                recommendation: item.recommendation,
            })),
            recommendations,
        });
    } catch (error) {
        console.error('Error in assistant insights:', error);
        return NextResponse.json({
            summary: {
                totalProducts: 0,
                productsWithIssues: 0,
                losingMoneyCount: 0,
                lowMarginCount: 0,
                totalPotentialLoss: 0,
                healthScore: 100,
            },
            losingMoney: [],
            lowMargin: [],
            recommendations: [],
        });
    }
}
