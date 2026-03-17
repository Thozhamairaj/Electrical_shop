const fs = require('fs');
const path = require('path');
const Product = require('./models/Product');
const { sequelize } = require('./index');

const productsJsonPath = path.join(__dirname, 'products.json');

async function seedFromJSON() {
    try {
        await sequelize.authenticate();
        console.log('Connected to PostgreSQL database.');

        if (!fs.existsSync(productsJsonPath)) {
            console.error('Error: server/products.json not found!');
            process.exit(1);
        }

        const rawData = fs.readFileSync(productsJsonPath, 'utf8');
        let products = JSON.parse(rawData);

        // Ensure stock is set to 50 for all products if not present
        products = products.map(p => ({
            ...p,
            stock: p.stock !== undefined ? p.stock : 50
        }));

        console.log(`Read ${products.length} products from JSON.`);

        // Clear existing products
        await Product.destroy({ where: {}, truncate: true });
        console.log('Cleared existing products from database.');

        // Insert products (excluding id to let DB auto-increment or explicitly mapping)
        // Since we have fixed IDs in JSON that match frontend, we should include them.
        await Product.bulkCreate(products);

        console.log(`Successfully seeded ${products.length} products into the database.`);
        process.exit(0);

    } catch (error) {
        console.error('Error seeding database from JSON:', error);
        process.exit(1);
    }
}

seedFromJSON();
