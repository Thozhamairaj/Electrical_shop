const products = require('./products.json');
const Product = require('./models/Product');
const { sequelize } = require('./index');

async function seed() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database for seeding.');

        // Clear existing products
        await Product.destroy({ where: {}, truncate: true });
        console.log('Existing products cleared.');

        // Convert specs object to string if necessary (though current model doesn't have specs field, I'll stick to the model fields)
        const productsToSeed = products.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            originalPrice: p.originalPrice,
            description: p.description,
            image: p.image,
            category: p.category,
            rating: p.rating,
            reviews: p.reviews,
            stock: p.inStock ? 50 : 0 // Default stock if inStock is true
        }));

        await Product.bulkCreate(productsToSeed);
        console.log(`Successfully seeded ${productsToSeed.length} products.`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding products:', error);
        process.exit(1);
    }
}

seed();
