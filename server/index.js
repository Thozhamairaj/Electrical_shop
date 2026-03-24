const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'https://electrical-shop-three.vercel.app',
    'https://electrical-shop-mayp.onrender.com'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        
        const cleanOrigin = origin.replace(/\/$/, '');
        if (allowedOrigins.includes(cleanOrigin) || cleanOrigin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked for origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

app.use(express.json());

// ── Root Route (Only GET) ──────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({ 
        message: 'Sri Vinayaga Hardwares API is running',
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ── Register Routes ───────────────────────────────────────────────
app.use('/api/cart', require('./routes/cart'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/orders', require('./routes/orders'));

// ── Start Server ──────────────────────────────────────────────────
async function startServer() {
    try {
        // Test database connection
        await db.query('SELECT NOW()');
        console.log('✅ Connected to PostgreSQL');

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        process.exit(1);
    }
}

startServer();
