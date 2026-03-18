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
        console.log('🔍 Checking product count...');
        const result = await db.query('SELECT COUNT(*) FROM "Products"');
        const count = parseInt(result.rows[0].count);
        console.log(`📊 Current product count: ${count}`);

        if (count === 0) {
            console.log('🌱 No products found in database. Starting auto-seed...');
            const productsJsonPath = path.join(__dirname, 'products.json');

            if (fs.existsSync(productsJsonPath)) {
                console.log('📖 Reading products.json...');
                const rawData = fs.readFileSync(productsJsonPath, 'utf8');
                const products = JSON.parse(rawData);
                console.log(`📦 Found ${products.length} products to seed.`);

                // Simple bulk insert for PostgreSQL
                for (const p of products) {
                    await db.query(
                        `INSERT INTO "Products" (name, price, "originalPrice", description, image, category, rating, reviews, stock, "createdAt", "updatedAt") 
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
                        [p.name, p.price, p.originalPrice, p.description, p.image, p.category, p.rating, p.reviews, p.stock]
                    );
                }
                console.log(`✅ Successfully seeded ${products.length} products.`);
            } else {
                console.error(`❌ products.json NOT FOUND at: ${productsJsonPath}`);
            }
        } else {
            console.log('✅ Products already exist, skipping seed.');
        }
    } catch (err) {
        console.error('❌ Auto-seed CRITICAL ERROR:', err);
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
        const resultBefore = await db.query('SELECT COUNT(*) FROM "Products"');
        const countBefore = parseInt(resultBefore.rows[0].count);
        const productsJsonPath = path.join(__dirname, 'products.json');
        
        let fileStatus = "unknown";
        let seedResult = "skipped";

        if (fs.existsSync(productsJsonPath)) {
            fileStatus = "found";
            if (countBefore === 0 || req.query.force === 'true') {
                const rawData = fs.readFileSync(productsJsonPath, 'utf8');
                const products = JSON.parse(rawData);
                
                // Truncate if forced
                if (req.query.force === 'true') {
                    await db.query('TRUNCATE TABLE "Products" CASCADE');
                }

                for (const p of products) {
                    await db.query(
                        `INSERT INTO "Products" (name, price, "originalPrice", description, image, category, rating, reviews, stock, "createdAt", "updatedAt") 
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
                        [p.name, p.price, p.originalPrice, p.description, p.image, p.category, p.rating, p.reviews, p.stock]
                    );
                }
                seedResult = `seeded ${products.length} products`;
            } else {
                seedResult = "skipped (products already exist)";
            }
        } else {
            fileStatus = "not found";
        }

        const resultAfter = await db.query('SELECT COUNT(*) FROM "Products"');
        const countAfter = parseInt(resultAfter.rows[0].count);

        res.json({
            success: true,
            database: "connected (pg)",
            fileStatus,
            seedResult,
            countBefore,
            countAfter,
            path: productsJsonPath
        });
    } catch (err) {
        console.error('Debug seed error:', err);
        res.status(500).json({
            success: false,
            error: err.message,
            stack: err.stack
        });
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
