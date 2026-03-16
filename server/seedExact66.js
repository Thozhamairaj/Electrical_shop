const fs = require('fs');
const path = require('path');
const Product = require('./models/Product');
const { sequelize } = require('./index');

const imagesDir = path.join(__dirname, '../public/Images_SVH');

const categories = ['lighting', 'fans', 'switches', 'power', 'safety', 'outdoor', 'wiring', 'tools', 'pipes', 'tanks', 'pumps', 'bathroom', 'plumbing-tools'];

async function seedExact66() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database to seed exactly 66 files.');

        // Clean existing
        await Product.destroy({ where: {}, truncate: true });
        console.log('Cleared existing products.');

        const files = fs.readdirSync(imagesDir).filter(file => file.endsWith('.png'));
        console.log(`Found ${files.length} images.`);

        const generatedProducts = files.map((file, index) => {
            // "Aqua Gold UPVC Pipes.png" -> "Aqua Gold UPVC Pipes"
            const name = file.replace('.png', '').trim();
            const category = categories[index % categories.length];
            const price = Math.floor(Math.random() * 100) + 10;
            const originalPrice = price + Math.floor(Math.random() * 30) + 5;

            return {
                id: index + 1,
                name: name,
                price: price + 0.99,
                originalPrice: originalPrice + 0.99,
                description: `High-quality ${name} for your electrical and plumbing needs.`,
                image: `/Images_SVH/${file}`,
                category: category,
                rating: (Math.random() * 2 + 3).toFixed(1), // Between 3.0 and 5.0
                reviews: Math.floor(Math.random() * 500) + 10,
                stock: 50,
                specs: {
                    material: 'Premium Grade',
                    warranty: '1 Year',
                    origin: 'India',
                    certification: 'ISI Certified'
                }
            };
        });

        await Product.bulkCreate(generatedProducts);
        
        // Also save to products.json to sync 
        fs.writeFileSync(path.join(__dirname, 'products.json'), JSON.stringify(generatedProducts, null, 2));

        console.log(`Successfully seeded ${generatedProducts.length} precise products.`);
        process.exit(0);

    } catch (error) {
        console.error('Error seeding EXACT 66 products:', error);
        process.exit(1);
    }
}

seedExact66();
