const express = require('express');
const Products = require('../models/Product');
const { adminAuth } = require('../middleware/adminAuth');

const router = express.Router();

function toNum(p) {
    const d = p.toJSON ? p.toJSON() : p;
    return {
        ...d,
        price: parseFloat(d.price),
        originalPrice: d.originalPrice != null ? parseFloat(d.originalPrice) : null,
        rating: d.rating != null ? parseFloat(d.rating) : null,
    };
}

// ── GET /api/admin-products — Admin: all products (full data) ───────
router.get('/', adminAuth, async (req, res) => {
    try {
        const products = await Products.findAll({ order: [['id', 'ASC']] });
        res.json(products.map(toNum));
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// ── POST /api/admin-products — Admin: create product ────────────────
router.post('/', adminAuth, async (req, res) => {
    try {
        const { name, price, originalPrice, description, image, category, rating, reviews, stock } = req.body;
        if (!name || !price) {
            return res.status(400).json({ error: 'name and price are required' });
        }

        const product = await Products.create({
            name, price, originalPrice, description, image, category,
            rating: rating || null,
            reviews: reviews || 0,
            stock: stock || 0,
        });

        res.status(201).json(toNum(product));
    } catch (err) {
        console.error('Create product error:', err);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// ── PUT /api/admin-products/:id — Admin: update product ─────────────
router.put('/:id', adminAuth, async (req, res) => {
    try {
        const product = await Products.findByPk(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        const { name, price, originalPrice, description, image, category, rating, reviews, stock } = req.body;
        await product.update({ name, price, originalPrice, description, image, category, rating, reviews, stock });

        res.json(toNum(product));
    } catch (err) {
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// ── DELETE /api/admin-products/:id — Admin: delete product ──────────
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const product = await Products.findByPk(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        await product.destroy();
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

module.exports = router;
