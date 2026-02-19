const express = require('express');
const Cart = require('../models/Cart');

const router = express.Router();

// ── GET /api/cart/:userId ──────────────────────────────────────────
// Returns the user's cart items (empty array if none found)
router.get('/:userId', async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.userId });
        res.json({ items: cart ? cart.items : [] });
    } catch (err) {
        console.error('GET cart error:', err);
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
});

// ── PUT /api/cart/:userId ──────────────────────────────────────────
// Upserts (replaces) the full cart for this user
router.put('/:userId', async (req, res) => {
    try {
        const { items } = req.body;
        if (!Array.isArray(items)) {
            return res.status(400).json({ error: 'items must be an array' });
        }

        const cart = await Cart.findOneAndUpdate(
            { userId: req.params.userId },
            { $set: { items } },
            { new: true, upsert: true, runValidators: true }
        );
        res.json({ items: cart.items });
    } catch (err) {
        console.error('PUT cart error:', err);
        res.status(500).json({ error: 'Failed to save cart' });
    }
});

// ── DELETE /api/cart/:userId ───────────────────────────────────────
// Clears all items in the user's cart
router.delete('/:userId', async (req, res) => {
    try {
        await Cart.findOneAndUpdate(
            { userId: req.params.userId },
            { $set: { items: [] } },
            { upsert: true }
        );
        res.json({ message: 'Cart cleared' });
    } catch (err) {
        console.error('DELETE cart error:', err);
        res.status(500).json({ error: 'Failed to clear cart' });
    }
});

module.exports = router;
