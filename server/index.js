const cors = require('cors');
const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────
const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : null;
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'https://electrical-shop-three.vercel.app',
    'https://roll-down-vite-git-main-sachin-projects-1677271f.vercel.app',
    frontendUrl
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
app.use(express.json());

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

// ── Auto-seed Logic ───────────────────────────────────────────────
async function autoSeed() {
    try {
        const tables = ['Products', 'Users', 'CartItems', 'Admins'];
        for (const table of tables) {
            console.log(`🔍 Checking ${table} count...`);
            const result = await db.query(`SELECT COUNT(*) FROM "${table}"`);
            const count = parseInt(result.rows[0].count);
            console.log(`📊 Current ${table} count: ${count}`);

            if (count === 0) {
                const jsonPath = path.join(__dirname, `${table.toLowerCase()}.json`);
                if (fs.existsSync(jsonPath)) {
                    console.log(`🌱 Seeding ${table} from ${table.toLowerCase()}.json...`);
                    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
                    
                    for (const item of data) {
                        const keys = Object.keys(item).map(k => `"${k}"`).join(', ');
                        const values = Object.values(item);
                        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
                        
                        await db.query(`INSERT INTO "${table}" (${keys}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`, values);
                    }
                    console.log(`✅ Successfully seeded ${data.length} items into ${table}.`);
                }
            }
        }
    } catch (err) {
        console.error('❌ Auto-seed ERROR:', err);
    }
}

// ── Register Routes ───────────────────────────────────────────────
app.use('/api/cart', require('./routes/cart'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin-products', require('./routes/adminProducts'));
app.use('/api/orders', require('./routes/orders'));

// ── Debug / Seed Route ───────────────────────────────────────────
app.get('/api/debug/seed', async (req, res) => {
    try {
        const results = {};
        const tables = ['Products', 'Users', 'CartItems', 'Admins'];
        
        for (const table of tables) {
            const jsonPath = path.join(__dirname, `${table.toLowerCase()}.json`);
            if (fs.existsSync(jsonPath)) {
                if (req.query.force === 'true') {
                    await db.query(`TRUNCATE TABLE "${table}" CASCADE`);
                }
                
                const countRes = await db.query(`SELECT COUNT(*) FROM "${table}"`);
                if (parseInt(countRes.rows[0].count) === 0 || req.query.force === 'true') {
                    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
                    for (const item of data) {
                        const keys = Object.keys(item).map(k => `"${k}"`).join(', ');
                        const values = Object.values(item);
                        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
                        await db.query(`INSERT INTO "${table}" (${keys}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`, values);
                    }
                    results[table] = `Seeded ${data.length} items`;
                } else {
                    results[table] = "Skipped (already exists)";
                }
            } else {
                results[table] = "File not found";
            }
        }

        res.json({ success: true, database: "connected", results });
    } catch (err) {
        console.error('Debug seed error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

async function startServer() {
    try {
        // Test connection
        await db.query('SELECT NOW()');
        console.log('✅  Connected to PostgreSQL (pg.Pool)');

        // Auto-seed if empty
        await autoSeed();

        app.listen(PORT, () => console.log(`🚀  Server running on port ${PORT}`));
    } catch (err) {
        console.error('❌  Unable to connect to PostgreSQL:', err.message);
        process.exit(1);
    }
}

if (require.main === module) {
    startServer();
}
