const { Pool } = require('pg');
require('dotenv').config({ path: './.env' }); // Fixed path for running within /server

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error('❌ Error: DATABASE_URL not found in .env');
    process.exit(1);
}

console.log('Testing connection to:', connectionString.split('@')[1]); 

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function test() {
    try {
        console.log('--- 1. Testing SELECT NOW() ---');
        const res = await pool.query('SELECT NOW()');
        console.log('Success! Server time:', res.rows[0].now);

        console.log('\n--- 2. Checking Products table ---');
        const prodRes = await pool.query('SELECT count(*) FROM "Products"');
        console.log('Row count in "Products":', prodRes.rows[0].count);

        if (parseInt(prodRes.rows[0].count) > 0) {
            console.log('\n--- 3. Sampling one product ---');
            const sample = await pool.query('SELECT id, name FROM "Products" LIMIT 1');
            console.log('Sample product:', sample.rows[0]);
        }
    } catch (err) {
        console.error('\n❌ DATABASE ERROR:', err.message);
        if (err.code) console.error('Error Code:', err.code);
    } finally {
        await pool.end();
    }
}

test();
