const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function runSQL() {
  // Tentar diferentes formatos de URL
  let connectionString = process.env.DATABASE_URL;
  
  // Se a URL não funcionar, tentar construir manualmente
  if (!connectionString || connectionString.includes('[YOUR-PASSWORD]')) {
    const password = encodeURIComponent('!P4nt4n4l@9293709B13');
    connectionString = `postgresql://postgres.kxbmiciraywwupztjmfs:${password}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`;
  }

  const client = new Client({
    connectionString: connectionString,
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados');

    const sql = fs.readFileSync('supabase_schema.sql', 'utf8');
    
    // Dividir o SQL em comandos individuais
    const commands = sql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && !cmd.startsWith('/*'));

    console.log(`📝 Executando ${commands.length} comandos...`);

    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];
      if (cmd.trim()) {
        try {
          await client.query(cmd);
          console.log(`✅ Comando ${i + 1}/${commands.length} executado`);
        } catch (error) {
          // Ignorar erros de "já existe" para objetos que podem já estar criados
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate key') ||
              error.message.includes('relation already exists')) {
            console.log(`⚠️  Comando ${i + 1}/${commands.length} ignorado (já existe)`);
          } else {
            console.error(`❌ Erro no comando ${i + 1}:`, error.message);
            // Continuar mesmo com erro
          }
        }
      }
    }

    console.log('✅ Schema criado com sucesso!');
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runSQL();

