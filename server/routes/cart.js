const express = require('express');
const db = require('../db');
const router = express.Router();

// Returns the user's cart items
router.get('/:userId', async (req, res) => {
    try {
        const result = await db.query('SELECT *, "productId" as id FROM "CartItems" WHERE "userId" = $1', [req.params.userId]);
        res.json({ items: result.rows });
    } catch (err) {
        console.error('GET cart error:', err);
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
});

// Syncs entire cart from local to server
router.put('/:userId', async (req, res) => {
    try {
        const { items } = req.body;
        const userId = req.params.userId;

        // Start a batch by deleting existing
        await db.query('DELETE FROM "CartItems" WHERE "userId" = $1', [userId]);

        if (items && items.length > 0) {
            for (const item of items) {
                const pid = item.id || item.productId;
                if (!pid) {
                    console.warn('Skipping cart item without ID:', item.name);
                    continue;
                }
                await db.query(
                    `INSERT INTO "CartItems" ("userId", "productId", name, price, quantity, image, "createdAt", "updatedAt") 
                     VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
                    [userId, pid, item.name, item.price, item.quantity, item.image]
                );
            }
        }

        const result = await db.query('SELECT *, "productId" as id FROM "CartItems" WHERE "userId" = $1', [userId]);
        res.json({ items: result.rows });
    } catch (err) {
        console.error('PUT cart error:', err);
        res.status(500).json({ error: 'Failed to sync cart' });
    }
});

// Clears all items in the user's cart
router.delete('/:userId', async (req, res) => {
    try {
        await db.query('DELETE FROM "CartItems" WHERE "userId" = $1', [req.params.userId]);
        res.json({ message: 'Cart cleared' });
    } catch (err) {
        console.error('DELETE cart error:', err);
        res.status(500).json({ error: 'Failed to clear cart' });
    }
});

module.exports = router;
