const cors = require('cors');
const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();

// ── Middleware ────────────────────────────────────────────────────
// Clean the FRONTEND_URL to remove any trailing slashes
const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : null;

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    frontendUrl
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Clean incoming origin for comparison
        const cleanOrigin = origin.replace(/\/$/, '');

        if (allowedOrigins.includes(cleanOrigin)) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked for origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express.json());

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

const { Sequelize } = require('sequelize');
const PORT = process.env.PORT || 5000;

const sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: false,
    })
    : new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            dialect: 'postgres',
            logging: false,
        }
    );

// Export sequelize for use in models
module.exports = { sequelize };

// Import models (order matters — independent models first)
const Users = require('./models/User');
const Products = require('./models/Product');
const CartItems = require('./models/CartItem');
const Admins = require('./models/Admin');
const Orders = require('./models/Order');

async function autoSeed() {
    try {
        console.log('🔍 Checking product count...');
        const count = await Products.count();
        console.log(`📊 Current product count: ${count}`);
        
        if (count === 0) {
            console.log('🌱 No products found in database. Starting auto-seed...');
            const productsJsonPath = path.join(__dirname, 'products.json');
            
            if (fs.existsSync(productsJsonPath)) {
                console.log('📖 Reading products.json...');
                const rawData = fs.readFileSync(productsJsonPath, 'utf8');
                const products = JSON.parse(rawData);
                console.log(`📦 Found ${products.length} products to seed.`);
                
                await Products.bulkCreate(products);
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

// Register routes
const cartRoutes = require('./routes/cart');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const adminRoutes = require('./routes/admin');
const adminProductRoutes = require('./routes/adminProducts');
const orderRoutes = require('./routes/orders');

app.use('/api/cart', cartRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin-products', adminProductRoutes);
app.use('/api/orders', orderRoutes);

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('✅  Connected to PostgreSQL');

        // Sync models
        await sequelize.sync({ alter: true });
        console.log('✅  Database models synced');

        // Auto-seed if empty
        await autoSeed();

        app.listen(PORT, () => console.log(`🚀  Server running on http://localhost:${PORT}`));
    } catch (err) {
        console.error('❌  Unable to connect to PostgreSQL:', err.message);
        process.exit(1);
    }
}

if (require.main === module) {
    startServer();
}
