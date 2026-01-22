export interface Product {
    id: string;
    name: string;
    salePrice: number;
    estimatedCost: number;
    active: boolean;
}

export interface OrderItem {
    id: string;
    productId: string;
    product: Product;
    quantity: number;
    unitPrice: number;
    unitCost: number;
}

export interface Order {
    id: string;
    platform: 'IFOOD' | 'UBER_EATS' | 'MANUAL';
    status: string;
    createdAt: string;
    grossTotal: number;
    platformFeeValue: number;
    totalCost: number;
    netProfit: number;
    marginPct: number;
    paymentMethod: string;
    items: OrderItem[];
}

export interface DailyReport {
    date: string;
    ordersCount: number;
    grossIncome: number;
    feesTotal: number;
    costsTotal: number;
    netProfit: number;
    avgMargin: number;
}
