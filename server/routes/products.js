const express = require('express');
const db = require('../db');
const { adminAuth } = require('../middleware/adminAuth');
const router = express.Router();

// PostgreSQL returns DECIMAL as strings — convert to numbers
function toNum(p) {
    return {
        ...p,
        price: parseFloat(p.price),
        originalPrice: p.originalPrice != null ? parseFloat(p.originalPrice) : null,
        rating: p.rating != null ? parseFloat(p.rating) : null,
        reviews: p.reviews != null ? parseInt(p.reviews) : 0,
        stock: p.stock != null ? parseInt(p.stock) : 0,
    };
}

// Get all products
router.get('/', async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = 'SELECT * FROM "Products" WHERE 1=1';
        const params = [];

        if (category && category !== 'all') {
            params.push(category);
            query += ` AND category = $${params.length}`;
        }

        if (search) {
            const searchPattern = `%${search.toLowerCase()}%`;
            params.push(searchPattern);
            query += ` AND (LOWER(name) LIKE $${params.length} OR LOWER(description) LIKE $${params.length} OR LOWER(category) LIKE $${params.length})`;
        }

        query += ' ORDER BY id ASC';

        const result = await db.query(query, params);
        res.json(result.rows.map(toNum));
    } catch (err) {
        console.error('GET products error:', err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get single product
router.get('/:id', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM "Products" WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(toNum(result.rows[0]));
    } catch (err) {
        console.error('GET product error:', err);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// ── Admin Routes ──────────────────────────────────────────────────

// Create product
router.post('/', adminAuth, async (req, res) => {
    try {
        const { name, price, originalPrice, description, image, category, rating, reviews, stock } = req.body;
        if (!name || !price) {
            return res.status(400).json({ error: 'name and price are required' });
        }

        const result = await db.query(
            `INSERT INTO "Products" (name, price, "originalPrice", description, image, category, rating, reviews, stock, "createdAt", "updatedAt") 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
             RETURNING *`,
            [name, price, originalPrice, description, image, category, rating, reviews, stock]
        );

        res.status(201).json(toNum(result.rows[0]));
    } catch (err) {
        console.error('Create product error:', err);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// Update product
router.put('/:id', adminAuth, async (req, res) => {
    try {
        const { name, price, originalPrice, description, image, category, rating, reviews, stock } = req.body;
        const result = await db.query(
            `UPDATE "Products" 
             SET name = $1, price = $2, "originalPrice" = $3, description = $4, image = $5, category = $6, rating = $7, reviews = $8, stock = $9, "updatedAt" = NOW()
             WHERE id = $10
             RETURNING *`,
            [name, price, originalPrice, description, image, category, rating, reviews, stock, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(toNum(result.rows[0]));
    } catch (err) {
        console.error('Update product error:', err);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Delete product
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const result = await db.query('DELETE FROM "Products" WHERE id = $1 RETURNING id', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error('Delete product error:', err);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

module.exports = router;
