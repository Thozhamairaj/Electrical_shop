const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'raj',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'electrical_shop',
    password: process.env.DB_PASSWORD || '123456',
    port: process.env.DB_PORT || 5432,
});

async function exportTable(tableName, fileName) {
    console.log(`📡 Exporting ${tableName}...`);
    try {
        const res = await pool.query(`SELECT * FROM "${tableName}"`);
        fs.writeFileSync(path.join(__dirname, fileName), JSON.stringify(res.rows, null, 2));
        console.log(`✅ Exported ${res.rows.length} rows to ${fileName}`);
    } catch (err) {
        console.error(`❌ Failed to export ${tableName}:`, err.message);
    }
}

async function run() {
    // Check tables first
    const tablesRes = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    const tables = tablesRes.rows.map(r => r.table_name);
    console.log('Available tables:', tables);

    const mappings = [
        { table: 'Products', file: 'products.json' },
        { table: 'Users', file: 'users.json' },
        { table: 'CartItems', file: 'cartitems.json' },
        { table: 'Admins', file: 'admins.json' }
    ];

    for (const m of mappings) {
        if (tables.includes(m.table)) {
            await exportTable(m.table, m.file);
        } else {
            console.warn(`⚠️  Table "${m.table}" not found in local DB.`);
        }
    }

    await pool.end();
}

run();
