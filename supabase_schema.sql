-- ============================================
-- SCHEMA DO BANCO DE DADOS - GALÁXIA GOURMET
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- Criar Enums
CREATE TYPE "PaymentMethod" AS ENUM ('PIX', 'CREDIT', 'DEBIT', 'CASH', 'OTHER');
CREATE TYPE "OrderStatus" AS ENUM ('NEW', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELED');

-- Tabela Tenant
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- Tabela Platform
CREATE TABLE "Platform" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "defaultFeePercent" DECIMAL(5,4) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Platform_pkey" PRIMARY KEY ("id")
);

-- Tabela Supplier
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- Tabela Product
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "salePrice" DECIMAL(10,2) NOT NULL,
    "estimatedCost" DECIMAL(10,2) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- Tabela Order
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "platformId" TEXT NOT NULL,
    "channel" TEXT,
    "customerName" TEXT,
    "grossTotal" DECIMAL(10,2) NOT NULL,
    "totalCost" DECIMAL(10,2) NOT NULL,
    "platformFeeValue" DECIMAL(10,2) NOT NULL,
    "netProfit" DECIMAL(10,2) NOT NULL,
    "marginPct" DECIMAL(10,2) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- Tabela OrderItem
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "unitCost" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- Tabela DailyClose
CREATE TABLE "DailyClose" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "grossIncome" DECIMAL(10,2) NOT NULL,
    "feesTotal" DECIMAL(10,2) NOT NULL,
    "costsTotal" DECIMAL(10,2) NOT NULL,
    "netProfit" DECIMAL(10,2) NOT NULL,
    "ordersCount" INTEGER NOT NULL,
    "closedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyClose_pkey" PRIMARY KEY ("id")
);

-- Tabela Expense
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- Adicionar Foreign Keys
ALTER TABLE "Platform" ADD CONSTRAINT "Platform_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Product" ADD CONSTRAINT "Product_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Order" ADD CONSTRAINT "Order_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "DailyClose" ADD CONSTRAINT "DailyClose_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Expense" ADD CONSTRAINT "Expense_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Adicionar Constraints Únicos
CREATE UNIQUE INDEX "Platform_tenantId_name_key" ON "Platform"("tenantId", "name");
CREATE UNIQUE INDEX "DailyClose_tenantId_date_key" ON "DailyClose"("tenantId", "date");

-- Criar índices para melhor performance
CREATE INDEX "Platform_tenantId_idx" ON "Platform"("tenantId");
CREATE INDEX "Product_tenantId_idx" ON "Product"("tenantId");
CREATE INDEX "Order_tenantId_idx" ON "Order"("tenantId");
CREATE INDEX "Order_platformId_idx" ON "Order"("platformId");
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- Habilitar Row Level Security (RLS)
ALTER TABLE "Tenant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Platform" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Supplier" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Expense" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DailyClose" ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (permitir leitura para todos)
CREATE POLICY "Enable read access for authenticated users" ON "Tenant"
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for authenticated users" ON "Platform"
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for authenticated users" ON "Product"
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for authenticated users" ON "Order"
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for authenticated users" ON "OrderItem"
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for authenticated users" ON "Supplier"
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for authenticated users" ON "Expense"
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for authenticated users" ON "DailyClose"
    FOR SELECT USING (true);

-- Inserir um Tenant padrão para testes (opcional)
-- Descomente se quiser criar um tenant de teste automaticamente
/*
INSERT INTO "Tenant" ("id", "name", "plan", "active", "createdAt", "updatedAt")
VALUES (
    gen_random_uuid()::text,
    'Galáxia Gourmet',
    'FREE',
    true,
    NOW(),
    NOW()
);
*/
