const express = require('express');
const db = require('../db');
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
            params.push(`%${search.toLowerCase()}%`);
            query += ` AND LOWER(name) LIKE $${params.length}`;
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

module.exports = router;
