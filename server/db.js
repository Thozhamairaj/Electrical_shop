const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const isProduction = process.env.NODE_ENV === 'production' || 
                   process.env.DATABASE_URL?.includes('render.com') || 
                   process.env.DATABASE_URL?.includes('supabase.co');

// Use DATABASE_URL if available (Render), otherwise fallback to individual params (Local)
const poolConfig = process.env.DATABASE_URL 
    ? { 
        connectionString: process.env.DATABASE_URL,
        ssl: isProduction ? { rejectUnauthorized: false } : false,
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 5432,
        ssl: false
      };

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};
