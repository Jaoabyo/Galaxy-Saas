# 🚀 Galáxia Gourmet

Sistema SaaS de gestão financeira e operacional para delivery, desenvolvido para MEIs e pequenos restaurantes crescerem com controle real do dinheiro.

## ✨ Funcionalidades Principais

### 📦 Gestão de Pedidos
- **Registro rápido**: Crie pedidos em segundos selecionando produtos
- **Cálculo automático**: Sistema calcula automaticamente custos, taxas, lucro e margem
- **Replicação**: Clone pedidos anteriores para agilizar o processo
- **Multi-plataforma**: Suporte para diferentes plataformas de delivery (iFood, Uber Eats, etc.)

### 📊 Relatórios e Análises
- **Dashboard completo**: Visualize faturamento, lucro líquido, margem média e taxas
- **Relatórios diários**: Acompanhe o desempenho dia a dia
- **Relatórios por produto**: Identifique os produtos mais vendidos e lucrativos
- **Gráficos**: Visualizações de evolução financeira (requer instalação do recharts)

### 🤖 Assistente Inteligente
- **Detecção de prejuízos**: Identifica produtos que estão gerando prejuízo
- **Análise de margem**: Aponta produtos com margem abaixo da meta (30%)
- **Sugestões de preço**: Recomenda reajustes de preço para melhorar rentabilidade
- **Insights automáticos**: API dedicada para análises inteligentes (`/api/assistant/insights`)

### 🔔 Notificações
- **Telegram**: Receba notificações instantâneas quando novos pedidos são criados
- **Alertas em tempo real**: Mantenha-se informado sobre todas as operações

### 🏢 Multi-tenant (SaaS)
- **Isolamento de dados**: Cada cliente tem seus próprios dados
- **Escalável**: Pronto para crescer com múltiplos clientes

## 🛠️ Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Prisma** - ORM para PostgreSQL
- **Supabase** - Backend as a Service (PostgreSQL + Auth)
- **Telegram Bot API** - Notificações
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes UI

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Supabase
- Bot do Telegram (opcional, para notificações)

## 🚀 Instalação

1. **Clone o repositório**
   ```bash
   git clone <seu-repositorio>
   cd galaxia
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   
   Crie um arquivo `.env.local` na raiz do projeto:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
   SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
   
   # Telegram (opcional)
   TELEGRAM_BOT_TOKEN=seu_token
   TELEGRAM_CHAT_ID=seu_chat_id
   
   # Database
   DATABASE_URL=postgresql://postgres.seu-projeto:senha@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
   ```

4. **Configure o banco de dados**
   
   Execute o script SQL no Supabase:
   - Acesse: https://supabase.com/dashboard/project/seu-projeto/sql
   - Copie o conteúdo de `supabase_schema.sql`
   - Cole e execute no SQL Editor

5. **Gere o Prisma Client**
   ```bash
   npx prisma generate
   ```

6. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

   Acesse: http://localhost:3000

## 📁 Estrutura do Projeto

```
galaxia/
├── app/                    # Next.js App Router
│   ├── api/                # API Routes
│   │   ├── assistant/      # Assistente inteligente
│   │   ├── orders/         # Gestão de pedidos
│   │   ├── products/       # Gestão de produtos
│   │   ├── platforms/      # Gestão de plataformas
│   │   └── reports/        # Relatórios
│   ├── orders/             # Páginas de pedidos
│   ├── products/           # Páginas de produtos
│   └── settings/           # Configurações
├── components/             # Componentes React
│   ├── ui/                 # Componentes UI (shadcn)
│   └── navbar.tsx          # Navegação
├── lib/                    # Utilitários e lógica
│   ├── calculations.ts     # Cálculos financeiros e assistente
│   ├── supabase.ts        # Cliente Supabase
│   ├── telegram.ts        # Integração Telegram
│   └── utils.ts           # Funções utilitárias
├── prisma/                 # Schema do Prisma
│   └── schema.prisma       # Modelos do banco
└── types/                  # Tipos TypeScript
```

## 🎯 Principais Endpoints da API

### Pedidos
- `POST /api/orders` - Criar novo pedido
- `GET /api/orders` - Listar pedidos
- `POST /api/orders/[id]/clone` - Clonar pedido

### Produtos
- `GET /api/products` - Listar produtos
- `POST /api/products` - Criar produto

### Relatórios
- `GET /api/reports/summary` - Resumo financeiro
- `GET /api/reports/daily` - Relatório diário
- `GET /api/reports/products` - Relatório por produto

### Assistente Inteligente
- `GET /api/assistant/insights` - Insights e recomendações

## 💡 Como Usar o Assistente Inteligente

O assistente analisa automaticamente seus produtos e identifica:

1. **Produtos com prejuízo**: Produtos que estão gerando prejuízo após custos e taxas
2. **Margem baixa**: Produtos com margem abaixo da meta (30%)
3. **Sugestões de preço**: Preços recomendados para atingir a margem desejada

Acesse a página de **Produtos** para ver as recomendações em tempo real, ou use a API `/api/assistant/insights` para integrações.

## 📈 Próximos Passos

- [ ] Instalar e configurar gráficos (recharts)
- [ ] Implementar autenticação de usuários
- [ ] Adicionar mais análises ao assistente
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] App mobile (React Native)

## 📝 Licença

Este projeto é proprietário. Todos os direitos reservados.

## 🤝 Suporte

Para dúvidas ou suporte, entre em contato através do repositório.

---

**Desenvolvido com ❤️ para pequenos restaurantes e MEIs**


