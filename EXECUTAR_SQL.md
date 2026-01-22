# 🚀 Como Executar o SQL no Supabase

## Método Recomendado: SQL Editor do Supabase

### Passo 1: Acessar o SQL Editor
1. Acesse: https://supabase.com/dashboard/project/kxbmiciraywwupztjmfs/sql
2. Faça login na sua conta Supabase

### Passo 2: Executar o Script
1. Abra o arquivo `supabase_schema.sql` no seu editor
2. **Copie TODO o conteúdo** do arquivo
3. Cole no SQL Editor do Supabase
4. Clique no botão **"Run"** ou pressione `Ctrl+Enter`

### Passo 3: Verificar
Após executar, você verá mensagens de sucesso. Para verificar se tudo foi criado:

```sql
-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Deve retornar:
-- DailyClose
-- Expense
-- Order
-- OrderItem
-- Platform
-- Product
-- Supplier
-- Tenant
```

## ⚠️ Se Houver Erros

Se aparecer algum erro como "already exists", isso significa que algumas tabelas já existem. Isso é normal se você executar o script mais de uma vez. O script continuará criando as que faltam.

## ✅ Após Executar o SQL

Depois de executar o SQL com sucesso:

1. **Gerar o Prisma Client:**
   ```bash
   npx prisma generate
   ```

2. **Iniciar o projeto:**
   ```bash
   npm run dev
   ```

## 📝 Criar um Tenant de Teste (Opcional)

Após criar o schema, você pode criar um tenant de teste executando este SQL:

```sql
INSERT INTO "Tenant" ("id", "name", "plan", "active", "createdAt", "updatedAt")
VALUES (
    gen_random_uuid()::text,
    'Galáxia Gourmet',
    'FREE',
    true,
    NOW(),
    NOW()
)
RETURNING *;
```

Guarde o `id` retornado, pois você precisará dele para criar produtos, pedidos, etc.

