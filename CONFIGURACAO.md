# Configuração do Projeto Galáxia

## Variáveis de Ambiente Necessárias

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

### Supabase
```env
NEXT_PUBLIC_SUPABASE_URL=https://kxbmiciraywwupztjmfs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4Ym1pY3JpYXl3d3VwenRqbWZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwNzIyMzgsImV4cCI6MjA4NDY0ODIzOH0.2WX-rhuXQEy5PrEcx136mrjpmL9kew84kHzS19iqMhs
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4Ym1pY3JpYXl3d3VwenRqbWZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTA3MjIzOCwiZXhwIjoyMDg0NjQ4MjM4fQ.WDT1Alv6cxoLbhCf-GKXwqDOL6QfeG0DI9xaJ7yDNLU
```

### Telegram Bot
```env
TELEGRAM_BOT_TOKEN=8053481129:AAFA6cEfnK3RHheebBP9KPQCLAtwU9S_kD0
TELEGRAM_CHAT_ID=-1003652659024
```

### Database (Prisma)
```env
DATABASE_URL=your_database_connection_string_here
```

## Arquivos Criados

- `lib/supabase.ts` - Cliente Supabase configurado
- `lib/telegram.ts` - Integração com Telegram Bot para notificações

## Uso

O bot do Telegram será usado automaticamente para enviar notificações quando:
- Um novo pedido é criado
- Um pedido é clonado (modo quick)

As mensagens são enviadas no formato HTML para o chat configurado.

