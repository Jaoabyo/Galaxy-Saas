# Instruções de Configuração - Galáxia Gourmet

## ✅ Arquivos Criados

1. **`.env.local`** - Arquivo de variáveis de ambiente (já criado)
2. **`supabase_schema.sql`** - Script SQL para criar o schema no Supabase

## 📝 Configurar o Banco de Dados

### Passo 1: Obter a URL de Conexão do Supabase

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto: `kxbmiciraywwupztjmfs`
3. Vá em **Settings** → **Database**
4. Em **Connection string**, copie a string de conexão (formato URI)
5. A URL será algo como:
   ```
   postgresql://postgres.kxbmiciraywwupztjmfs:[YOUR-PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
   ```

### Passo 2: Atualizar o .env.local

Abra o arquivo `.env.local` e substitua `[YOUR-PASSWORD]` pela senha do seu banco de dados:

```env
DATABASE_URL=postgresql://postgres.kxbmiciraywwupztjmfs:SUA_SENHA_AQUI@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

### Passo 3: Executar o Script SQL no Supabase

1. Acesse o [SQL Editor do Supabase](https://supabase.com/dashboard/project/kxbmiciraywwupztjmfs/sql)
2. Abra o arquivo `supabase_schema.sql` que foi criado
3. Copie todo o conteúdo do arquivo
4. Cole no SQL Editor do Supabase
5. Clique em **Run** para executar

O script irá criar:
- ✅ Enums (PaymentMethod, OrderStatus)
- ✅ Todas as tabelas (Tenant, Platform, Product, Order, etc.)
- ✅ Foreign Keys e relacionamentos
- ✅ Índices para performance
- ✅ Row Level Security (RLS) básico

### Passo 4: Verificar a Instalação

Após executar o script SQL, você pode verificar se tudo foi criado corretamente:

```sql
-- Verificar se as tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar se os enums foram criados
SELECT typname 
FROM pg_type 
WHERE typtype = 'e';
```

## 🔧 Comandos Úteis

### Criar um Tenant de Teste

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

### Verificar Dados

```sql
-- Listar todos os tenants
SELECT * FROM "Tenant";

-- Listar todas as plataformas
SELECT * FROM "Platform";

-- Listar todos os produtos
SELECT * FROM "Product";
```

## 🚀 Próximos Passos

1. ✅ Configure o `.env.local` com a senha do banco
2. ✅ Execute o script SQL no Supabase
3. ✅ Execute `npm install` (se ainda não fez)
4. ✅ Execute `npx prisma generate` para gerar o Prisma Client
5. ✅ Execute `npm run dev` para iniciar o projeto

## 📚 Variáveis de Ambiente Configuradas

- ✅ `NEXT_PUBLIC_SUPABASE_URL` - URL do projeto Supabase
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Chave anônima do Supabase
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Chave de serviço do Supabase
- ✅ `TELEGRAM_BOT_TOKEN` - Token do bot do Telegram
- ✅ `TELEGRAM_CHAT_ID` - ID do chat do Telegram
- ⚠️ `DATABASE_URL` - **Você precisa adicionar a senha do banco**

