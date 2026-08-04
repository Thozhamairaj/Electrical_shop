const express = require('express');
const db = require('../db');
const { adminAuth } = require('../middleware/adminAuth');

const router = express.Router();

// Helper to reduce stock
async function reduceStock(items) {
    for (const item of items) {
        // items is a JSON array from the DB or request
        await db.query(
            'UPDATE "Products" SET stock = GREATEST(0, stock - $1) WHERE id = $2',
            [item.quantity || 1, item.id]
        );
    }
}

// Create Order (Direct or WhatsApp)
router.post('/', async (req, res) => {
    try {
        const { userId, userEmail, userName, userPhone, items, totalAmount, shippingAddress, notes, isWhatsApp, status, paymentStatus } = req.body;
        if (!userId || !items || !totalAmount) {
            return res.status(400).json({ error: 'userId, items, and totalAmount are required' });
        }

        const result = await db.query(
            `INSERT INTO "Orders" ("userId", "userEmail", "userName", "userPhone", items, "totalAmount", "shippingAddress", notes, status, "paymentStatus", "createdAt", "updatedAt") 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
             RETURNING *`,
            [
                userId, 
                userEmail, 
                userName, 
                userPhone, 
                JSON.stringify(items), 
                totalAmount, 
                shippingAddress || 'To be collected', 
                notes || (isWhatsApp ? 'WhatsApp Order' : ''), 
                status || 'pending', 
                paymentStatus || 'pending'
            ]
        );

        const order = result.rows[0];

        if (!isWhatsApp) {
            await reduceStock(items);
        }

        res.status(201).json({ message: 'Order created', order });
    } catch (err) {
        console.error('Create order error:', err);
        res.status(500).json({ error: 'Failed to place order' });
    }
});

// Public fetch (for payment link)
router.get('/public/:id', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM "Orders" WHERE id = $1', [req.params.id]);
        const order = result.rows[0];
        if (!order) return res.status(404).json({ error: 'Order not found' });
        
        res.json({
            id: order.id,
            totalAmount: order.totalAmount,
            items: order.items,
            userName: order.userName,
            userEmail: order.userEmail,
            paymentStatus: order.paymentStatus,
            status: order.status
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

// My Orders
router.get('/my/:userId', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM "Orders" WHERE "userId" = $1 ORDER BY "createdAt" DESC', [req.params.userId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Admin: View All
router.get('/', adminAuth, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM "Orders" ORDER BY "createdAt" DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Admin: Update Status
router.put('/:id/status', adminAuth, async (req, res) => {
    try {
        const { status } = req.body;
        const result = await db.query(
            'UPDATE "Orders" SET status = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *',
            [status, req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
        res.json({ message: 'Status updated', order: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// Mock Payment for Dummy Flow
router.post('/:id/pay', async (req, res) => {
    try {
        const existingResult = await db.query('SELECT * FROM "Orders" WHERE id = $1', [req.params.id]);
        const existingOrder = existingResult.rows[0];
        if (!existingOrder) return res.status(404).json({ error: 'Order not found' });
        if (String(existingOrder.paymentStatus).toLowerCase() === 'paid') {
            return res.json({ message: 'Payment already completed', order: existingOrder });
        }

        const result = await db.query(
            `UPDATE "Orders" 
             SET "paymentStatus" = 'paid', status = 'confirmed', "updatedAt" = NOW()
             WHERE id = $1 RETURNING *`,
            [req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
        
        // Also reduce stock if not already done (for WhatsApp orders becoming paid)
        const order = result.rows[0];
        if (order.items) {
            await reduceStock(typeof order.items === 'string' ? JSON.parse(order.items) : order.items);
        }

        res.json({ message: 'Payment successful', order: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to process payment' });
    }
});

module.exports = router;
