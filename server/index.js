const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();

// ── Middleware ────────────────────────────────────────────────────
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true,
}));
app.use(express.json());

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

const { Sequelize } = require('sequelize');
const PORT = process.env.PORT || 5000;

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: false,
    }
);

// Export sequelize for use in models
module.exports = { sequelize };

// Import models (order matters — independent models first)
require('./models/User');
require('./models/Product');
require('./models/CartItem');
require('./models/Admin');
require('./models/Order');

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
        console.log('✅  Connected to MySQL');

        // Sync models
        await sequelize.sync({ alter: true });
        console.log('✅  Database models synced');

        app.listen(PORT, () => console.log(`🚀  Server running on http://localhost:${PORT}`));
    } catch (err) {
        console.error('❌  Unable to connect to MySQL:', err.message);
        process.exit(1);
    }
}

startServer();
