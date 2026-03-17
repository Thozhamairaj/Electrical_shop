const fs = require('fs');
const path = require('path');
const { sequelize } = require('./server/index');
const Product = require('./server/models/Product');

async function seed() {
    try {
        const rawData = fs.readFileSync(path.join(__dirname, 'server/products.json'), 'utf8');
        const products = JSON.parse(rawData);

        console.log(`Read ${products.length} products from JSON`);

        await sequelize.authenticate();
        console.log('Connected to database');

        // Syncing with alter: true to ensure schema is correct
        await sequelize.sync({ alter: true });

        // Clear existing products if you want a fresh start, 
        // or use bulkCreate with updateOnDuplicate
        console.log('Upserting products...');
        
        // We remove the ID to let MySQL handle it, or keep it if we want strict mapping
        // Given the generate script starts ID from 1, it matches the JSON.
        
        await Product.bulkCreate(products, {
            updateOnDuplicate: ['name', 'price', 'originalPrice', 'description', 'image', 'category', 'rating', 'reviews', 'stock']
        });

        console.log('✅ Database seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seed();
