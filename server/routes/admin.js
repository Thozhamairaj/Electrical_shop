const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { adminAuth } = require('../middleware/adminAuth');

const router = express.Router();

// ── Admin Login ───────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'username and password are required' });
        }

        const result = await db.query('SELECT * FROM "Admins" WHERE username = $1 AND "isActive" = true', [username]);
        const admin = result.rows[0];

        if (!admin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const passwordMatch = await bcrypt.compare(password, admin.passwordHash);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        await db.query('UPDATE "Admins" SET "lastLogin" = NOW() WHERE id = $1', [admin.id]);

        const token = jwt.sign(
            { id: admin.id, username: admin.username, name: admin.name, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            token,
            admin: {
                id: admin.id,
                username: admin.username,
                name: admin.name,
                email: admin.email,
            },
        });
    } catch (err) {
        console.error('Admin login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Admin Profile ──────────────────────────────────────────────────
router.get('/me', adminAuth, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, username, name, email, "lastLogin" FROM "Admins" WHERE id = $1',
            [req.admin.id]
        );
        const admin = result.rows[0];
        if (!admin) return res.status(404).json({ error: 'Admin not found' });
        res.json(admin);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Admin Stats ────────────────────────────────────────────────────
router.get('/stats', adminAuth, async (req, res) => {
    try {
        const [products, orders, customers, recentOrders, lowStock] = await Promise.all([
            db.query('SELECT COUNT(*) FROM "Products"'),
            db.query('SELECT COUNT(*) FROM "Orders"'),
            db.query('SELECT COUNT(*) FROM "Users"'),
            db.query('SELECT * FROM "Orders" ORDER BY "createdAt" DESC LIMIT 5'),
            db.query('SELECT id, name, stock, category FROM "Products" WHERE stock <= 5')
        ]);

        res.json({
            productCount: parseInt(products.rows[0].count),
            orderCount: parseInt(orders.rows[0].count),
            customerCount: parseInt(customers.rows[0].count),
            recentOrders: recentOrders.rows,
            lowStockProducts: lowStock.rows
        });
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
