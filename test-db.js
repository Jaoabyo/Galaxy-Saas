const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
    console.log('Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'));
    
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected successfully!');
        
        const result = await client.query('SELECT NOW() as time');
        console.log('✅ Query result:', result.rows[0].time);
        
        // Check if tables exist
        const tables = await client.query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        console.log('✅ Tables:', tables.rows.map(r => r.table_name).join(', '));
        
        await client.end();
    } catch (error) {
        console.error('❌ Connection error:', error.message);
    }
}

testConnection();


