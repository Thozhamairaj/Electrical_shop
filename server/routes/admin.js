const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admins = require('../models/Admin');
const { adminAuth } = require('../middleware/adminAuth');

const router = express.Router();

// ── POST /api/admin/login ───────────────────────────────────────────
// Admin login with username + password
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'username and password are required' });
        }

        const admin = await Admins.findOne({ where: { username, isActive: true } });
        if (!admin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const passwordMatch = await bcrypt.compare(password, admin.passwordHash);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login time
        await admin.update({ lastLogin: new Date() });

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

// ── GET /api/admin/me ───────────────────────────────────────────────
// Verify token and return admin info
router.get('/me', adminAuth, async (req, res) => {
    try {
        const admin = await Admins.findByPk(req.admin.id, {
            attributes: ['id', 'username', 'name', 'email', 'lastLogin'],
        });
        if (!admin) return res.status(404).json({ error: 'Admin not found' });
        res.json(admin);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── GET /api/admin/stats ────────────────────────────────────────────
// Dashboard stats: product count, order count, etc.
router.get('/stats', adminAuth, async (req, res) => {
    try {
        const Products = require('../models/Product');
        const Orders = require('../models/Order');
        const Users = require('../models/User');

        const [productCount, orderCount, customerCount] = await Promise.all([
            Products.count(),
            Orders.count(),
            Users.count(),
        ]);

        const recentOrders = await Orders.findAll({
            order: [['createdAt', 'DESC']],
            limit: 5,
        });

        const lowStockProducts = await Products.findAll({
            where: { stock: { [require('sequelize').Op.lte]: 5 } },
            attributes: ['id', 'name', 'stock', 'category'],
        });

        res.json({ productCount, orderCount, customerCount, recentOrders, lowStockProducts });
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
