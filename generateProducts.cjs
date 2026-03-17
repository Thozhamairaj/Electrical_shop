const fs = require('fs');
const path = require('path');

const imageDir = path.join(__dirname, 'public/Images_SVH');
const files = fs.readdirSync(imageDir);

const categories = {
  bathroom: ['tap', 'faucet', 'shower', 'flush', 'sanitary', 'wash basin', 'toilet', 'diverter'],
  outdoor: ['outdoor', 'street', 'lantern', 'wall lantern', 'garden'],
  lighting: ['led', 'bulb', 'light', 'downlight', 'panel', 'strip', 'spot', 'astra', 'glow'],
  fans: ['fan', 'regulator', 'dimmer', 'exhaust'],
  switches: ['switch', 'socket', 'plate'],
  power: ['inverter', 'battery', 'ups', 'stabilizer', 'voltage'],
  safety: ['safety', 'glove', 'helmet', 'glasses', 'kit', 'protection'],
  wiring: ['cable', 'wire', 'conduit', 'junction', 'frls'],
  pipes: ['pipe', 'elbow', 'tee', 'coupler', 'bend', 'flange', 'adapter', 'end cap', 'brush', 'union', 'valve', 'reducer', 'bush', 'joint', 'clip', 'lubricant', 'strainger', 'primer', 'tailpiece', 'connector', 'upvc'],
  tanks: ['tank', 'siltank', 'cover', 'lid'],
  pumps: ['pump', 'submersible', 'centrifugal', 'suction'],
  hardware: ['bolt', 'rack']
};

function getCategory(filename) {
  const lower = filename.toLowerCase();
  for (const [cat, keywords] of Object.entries(categories)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return cat;
    }
  }
  return 'electrical'; // Default
}

const products = files
  .filter(file => {
    const name = file.replace(/\.[^/.]+$/, '');
    return name.length > 2 && !/^\d+$/.test(name); // Filter out short (1, 2) or numeric-only names
  })
  .map((file, index) => {
  const name = file.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
  const category = getCategory(file);
  
  // Base prices based on category
  const priceMap = {
    lighting: 200,
    fans: 1500,
    switches: 150,
    power: 5000,
    safety: 300,
    outdoor: 1000,
    wiring: 50,
    pipes: 100,
    tanks: 3000,
    pumps: 4000,
    bathroom: 500,
    hardware: 20,
    electrical: 100
  };

  const basePrice = priceMap[category] || 100;
  const randomFactor = 0.8 + Math.random() * 0.4;
  const price = Number((basePrice * randomFactor).toFixed(2));
  const originalPrice = Number((price * 1.2).toFixed(2));

  const descriptions = {
    lighting: `Brighten your space with high-quality ${name}.`,
    fans: `Keep cool with our energy-efficient ${name}.`,
    bathroom: `Premium ${name} for a modern bathroom experience.`,
    pipes: `Durable and reliable ${name} for plumbing projects.`,
    safety: `Stay protected on the job with our ${name}.`,
    outdoor: `Durable and weather-resistant ${name} for outdoor use.`
  };

  return {
    id: index + 1,
    name: name,
    price: price,
    originalPrice: originalPrice,
    description: descriptions[category] || `High-quality ${name} for your electrical and plumbing needs.`,
    image: `/Images_SVH/${file}`,
    category: category,
    rating: Number((3.5 + Math.random() * 1.5).toFixed(1)),
    reviews: Math.floor(Math.random() * 500),
    stock: 50,
    specs: {
      material: "Premium Grade",
      warranty: "1 Year",
      origin: "India",
      certification: "ISI Certified"
    }
  };
});

fs.writeFileSync('server/products.json', JSON.stringify(products, null, 2));
console.log(`Generated ${products.length} products in server/products.json`);
