const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../src/data/products.js');
const content = fs.readFileSync(filePath, 'utf8');

// Regex to find and round prices
// "price": 120.41, -> "price": 120,
// We also want to round to the nearest 10 as per user request: 120.41 -> 120, 92 -> 90, 104 -> 100.
const roundedContent = content.replace(/(["']price["']|["']originalPrice["'])\s*:\s*([\d.]+)/g, (match, key, value) => {
    const val = parseFloat(value);
    const rounded = Math.round(val / 10) * 10;
    return `${key}: ${rounded}`;
});

fs.writeFileSync(filePath, roundedContent, 'utf8');
console.log('✅ Updated static products.js with rounded prices.');
