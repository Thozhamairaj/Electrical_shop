const express = require('express');
const CartItems = require('../models/CartItem');
const { sequelize } = require('../index');

const router = express.Router();

// ── GET /api/cart/:userId ──────────────────────────────────────────
// Returns the user's cart items (empty array if none found)
router.get('/:userId', async (req, res) => {
    try {
        const items = await CartItems.findAll({ 
            where: { userId: req.params.userId }
        });
        res.json({ items });
    } catch (err) {
        console.error('GET cart error:', err);
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
});

// ── PUT /api/cart/:userId ──────────────────────────────────────────
// Upserts (replaces) the full cart for this user
router.put('/:userId', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { items, userEmail, userName } = req.body;
        if (!Array.isArray(items)) {
            return res.status(400).json({ error: 'items must be an array' });
        }

        const userId = req.params.userId;

        // Delete existing items for this user
        await CartItems.destroy({
            where: { userId },
            transaction
        });

        // Bulk create new items with userId
        const cartItems = items.map(item => {
            const { pk, createdAt, updatedAt, id, ...itemData } = item;
            return {
                ...itemData,
                productId: itemData.productId || id,  // frontend sends id, model needs productId
                userId,
                userEmail: userEmail || null,
                userName: userName || null,
            };
        });

        await CartItems.bulkCreate(cartItems, { transaction });

        await transaction.commit();

        const updatedItems = await CartItems.findAll({
            where: { userId }
        });

        res.json({ items: updatedItems });
    } catch (err) {
        await transaction.rollback();
        console.error('PUT cart error:', err);
        res.status(500).json({ error: 'Failed to save cart' });
    }
});

// ── DELETE /api/cart/:userId ───────────────────────────────────────
// Clears all items in the user's cart
router.delete('/:userId', async (req, res) => {
    try {
        await CartItems.destroy({ where: { userId: req.params.userId } });
        res.json({ message: 'Cart cleared' });
    } catch (err) {
        console.error('DELETE cart error:', err);
        res.status(500).json({ error: 'Failed to clear cart' });
    }
});

module.exports = router;
