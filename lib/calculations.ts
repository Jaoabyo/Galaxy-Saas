/**
 * Cálculos Financeiros e Assistente Inteligente
 * Galáxia Gourmet - Sistema de gestão para delivery
 */

/**
 * Calcula a taxa da plataforma sobre o valor total
 */
export function calculatePlatformFee(grossTotal: number, feePercent: number): number {
  return grossTotal * feePercent;
}

/**
 * Calcula o lucro líquido (após custos e taxas)
 */
export function calculateNetProfit(
  grossTotal: number,
  totalCost: number,
  platformFee: number
): number {
  return grossTotal - totalCost - platformFee;
}

/**
 * Calcula a margem percentual
 */
export function calculateMargin(netProfit: number, grossTotal: number): number {
  if (grossTotal === 0) return 0;
  return (netProfit / grossTotal) * 100;
}

/**
 * Sugere um preço de venda baseado em custo, taxa da plataforma e margem desejada
 * Fórmula: Preço = Custo / (1 - Taxa% - Margem%)
 */
export function suggestPrice(
  cost: number,
  platformFeePercent: number,
  targetMarginPercent: number
): number {
  const feeDecimal = platformFeePercent;
  const marginDecimal = targetMarginPercent / 100;
  
  // Preço = Custo / (1 - Taxa - Margem)
  const denominator = 1 - feeDecimal - marginDecimal;
  
  if (denominator <= 0) {
    // Se a soma de taxa + margem >= 100%, não é possível ter lucro
    // Retorna um preço mínimo (custo * 1.5 como fallback)
    return cost * 1.5;
  }
  
  const suggestedPrice = cost / denominator;
  
  // Arredonda para 2 casas decimais
  return Math.round(suggestedPrice * 100) / 100;
}

/**
 * Analisa se um produto está gerando prejuízo
 */
export function isProductLosingMoney(
  salePrice: number,
  cost: number,
  platformFeePercent: number
): boolean {
  const fee = salePrice * platformFeePercent;
  const profit = salePrice - cost - fee;
  return profit < 0;
}

/**
 * Analisa a saúde financeira de um produto
 * Retorna: 'profit' | 'low_margin' | 'loss'
 */
export function analyzeProductHealth(
  salePrice: number,
  cost: number,
  platformFeePercent: number,
  targetMarginPercent: number = 30
): 'profit' | 'low_margin' | 'loss' {
  const fee = salePrice * platformFeePercent;
  const profit = salePrice - cost - fee;
  const margin = salePrice > 0 ? (profit / salePrice) * 100 : 0;
  
  if (profit < 0) {
    return 'loss';
  }
  
  if (margin < targetMarginPercent) {
    return 'low_margin';
  }
  
  return 'profit';
}

/**
 * Calcula o prejuízo estimado de um produto
 */
export function calculateLoss(
  salePrice: number,
  cost: number,
  platformFeePercent: number
): number {
  const fee = salePrice * platformFeePercent;
  const profit = salePrice - cost - fee;
  return profit < 0 ? Math.abs(profit) : 0;
}

/**
 * Gera recomendações inteligentes para um produto
 */
export interface ProductRecommendation {
  type: 'loss' | 'low_margin' | 'warning';
  message: string;
  suggestedPrice: number;
  currentMargin: number;
  potentialProfit: number;
}

export function getProductRecommendation(
  productName: string,
  salePrice: number,
  cost: number,
  platformFeePercent: number,
  targetMarginPercent: number = 30
): ProductRecommendation | null {
  const health = analyzeProductHealth(salePrice, cost, platformFeePercent, targetMarginPercent);
  const currentMargin = calculateMargin(
    salePrice - cost - (salePrice * platformFeePercent),
    salePrice
  );
  const suggestedPrice = suggestPrice(cost, platformFeePercent, targetMarginPercent);
  const potentialProfit = suggestedPrice - cost - (suggestedPrice * platformFeePercent);
  
  if (health === 'loss') {
    const loss = calculateLoss(salePrice, cost, platformFeePercent);
    return {
      type: 'loss',
      message: `⚠️ ${productName} está gerando prejuízo de ${loss.toFixed(2)} por unidade. Reajuste urgente necessário!`,
      suggestedPrice,
      currentMargin,
      potentialProfit,
    };
  }
  
  if (health === 'low_margin') {
    return {
      type: 'low_margin',
      message: `📊 ${productName} tem margem baixa (${currentMargin.toFixed(1)}%). Considere aumentar o preço para melhorar a rentabilidade.`,
      suggestedPrice,
      currentMargin,
      potentialProfit,
    };
  }
  
  return null;
}

/**
 * Analisa múltiplos produtos e retorna os que precisam de atenção
 */
export function analyzeProducts(
  products: Array<{
    id: string;
    name: string;
    salePrice: number;
    estimatedCost: number;
  }>,
  platformFeePercent: number,
  targetMarginPercent: number = 30
): {
  losingMoney: Array<{ product: any; loss: number; recommendation: ProductRecommendation }>;
  lowMargin: Array<{ product: any; margin: number; recommendation: ProductRecommendation }>;
  totalPotentialLoss: number;
} {
  const losingMoney: Array<{ product: any; loss: number; recommendation: ProductRecommendation }> = [];
  const lowMargin: Array<{ product: any; margin: number; recommendation: ProductRecommendation }> = [];
  let totalPotentialLoss = 0;
  
  products.forEach((product) => {
    const health = analyzeProductHealth(
      product.salePrice,
      product.estimatedCost,
      platformFeePercent,
      targetMarginPercent
    );
    
    const recommendation = getProductRecommendation(
      product.name,
      product.salePrice,
      product.estimatedCost,
      platformFeePercent,
      targetMarginPercent
    );
    
    if (health === 'loss' && recommendation) {
      const loss = calculateLoss(product.salePrice, product.estimatedCost, platformFeePercent);
      losingMoney.push({ product, loss, recommendation });
      totalPotentialLoss += loss;
    } else if (health === 'low_margin' && recommendation) {
      const margin = calculateMargin(
        product.salePrice - product.estimatedCost - (product.salePrice * platformFeePercent),
        product.salePrice
      );
      lowMargin.push({ product, margin, recommendation });
    }
  });
  
  return {
    losingMoney,
    lowMargin,
    totalPotentialLoss,
  };
}



