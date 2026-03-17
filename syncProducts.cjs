const fs = require('fs');
const path = require('path');

// 1. Read products from the server products.json
const serverProductsPath = path.join(__dirname, 'server/products.json');
const frontendProductsPath = path.join(__dirname, 'src/data/products.js');

const rawProducts = fs.readFileSync(serverProductsPath, 'utf8');
const parsedProducts = JSON.parse(rawProducts);

// 2. Fetch the categories array which needs to stay at the bottom of the file
const categoriesExport = `export const categories = [
  { id: 'all', name: 'All Products', icon: '🛒' },
  // Electrical
  { id: 'lighting', name: 'Lighting', icon: '💡' },
  { id: 'fans', name: 'Fans & Ventilation', icon: '🌀' },
  { id: 'switches', name: 'Switches & Controls', icon: '🔘' },
  { id: 'power', name: 'Power Backup', icon: '🔋' },
  { id: 'safety', name: 'Safety & Protection', icon: '⚡' },
  { id: 'outdoor', name: 'Outdoor Lighting', icon: '🏡' },
  { id: 'wiring', name: 'Wiring & Cables', icon: '🔌' },
  // Plumbing
  { id: 'pipes', name: 'Pipes & Fittings', icon: '🔩' },
  { id: 'tanks', name: 'Water Tanks', icon: '🛢️' },
  { id: 'pumps', name: 'Pumps & Motors', icon: '💧' },
  { id: 'bathroom', name: 'Bathroom Fittings', icon: '🚿' },
];`;

// 3. Format the frontend export structure
const fileString = `export const products = ${JSON.stringify(parsedProducts, null, 2)};\n\n${categoriesExport}\n`;

// 4. Overwrite the file synchronously 
fs.writeFileSync(frontendProductsPath, fileString);
console.log(`Successfully synced ${parsedProducts.length}-item database structure exactly into frontend export.`);
