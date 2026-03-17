const express = require('express');
const Products = require('../models/Product');
const router = express.Router();

// MySQL returns DECIMAL as strings — convert to numbers
function toNum(p) {
    const d = p.toJSON ? p.toJSON() : p;
    return {
        ...d,
        price: parseFloat(d.price),
        originalPrice: d.originalPrice != null ? parseFloat(d.originalPrice) : null,
        rating: d.rating != null ? parseFloat(d.rating) : null,
    };
}

// Get all products
router.get('/', async (req, res) => {
    try {
        const { category, search } = req.query;
        const where = {};
        
        if (category && category !== 'all') {
            where.category = category;
        }

        const products = await Products.findAll({ where });
        
        // Filter by search term if provided (could also use Sequelize Op.like)
        let filteredProducts = products;
        if (search) {
            filteredProducts = products.filter(p => 
                p.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        res.json(filteredProducts.map(toNum));
    } catch (err) {
        console.error('GET products error:', err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Products.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(toNum(product));
    } catch (err) {
        console.error('GET product error:', err);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

module.exports = router;
