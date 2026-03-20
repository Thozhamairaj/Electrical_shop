const db = require('../db');

/**
 * Migration script to round all product prices to the nearest 10.
 * Examples: 92 -> 90, 104 -> 100, 106 -> 110.
 */
async function roundPrices() {
    try {
        console.log('🔄 Starting price rounding migration...');

        // Round both price and originalPrice to the nearest 10
        const query = `
            UPDATE "Products" 
            SET 
                price = ROUND(price / 10.0) * 10,
                "originalPrice" = CASE 
                    WHEN "originalPrice" IS NOT NULL THEN ROUND("originalPrice" / 10.0) * 10 
                    ELSE NULL 
                END,
                "updatedAt" = NOW();
        `;

        const result = await db.query(query);
        console.log(`✅ Successfully rounded prices for ${result.rowCount} products.`);
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    }
}

roundPrices();
