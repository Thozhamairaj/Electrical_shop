/**
 * fixCategories.js
 * One-time script to reclassify products from the orphan "electrical" category
 * into their proper categories.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../db');

const updates = [
  // → switches (modular switch plates, smart switches)
  { names: ['Arteor-product', 'Classic Series', 'Imagno 410', 'MARVEL SERIES-Milk White QT', 'MURPHY SERIES QT',
    'Silent Pro Enso Silk white  1st Angle', 'Silent pro Blossom smart Denimblue 1 angle 1',
    'Striker-Surface', 'Tabs', 'White Divino', 'White Divino-dg', 'White-bg Artboard-1',
    'Voltino Grandi Didi Plus', 'Voltino Max Digi', 'Living Now Thumbnail'], newCategory: 'switches' },

  // → wiring (cables, junction boxes, electrical conduit)
  { names: ['Flame Retardant Grade (90Mtr) Silver', 'PVC Electrical Fittings'], newCategory: 'wiring' },

  // → pipes (valves, strainers, pipe caps — these are plumbing fittings)
  { names: ['BallVolve', 'PlainBallVolve', 'YStrainer', 'EndCap', 'BrassFTA', 'BrassMTA'], newCategory: 'pipes' },

  // → lighting (bulbs and LED lamps)
  { names: ['Philips 14w', 'Philips 22w', 'Slim line 25W', 'Yolo 15w'], newCategory: 'lighting' },

  // → power (inverters, water heaters, smart meters, circuit tools)
  { names: ['Instant Water Heater', 'Smart Water Heater', 'V-Guard Electric Water Heater',
    'V-Guard Instant Geyser', 'V-Guard Instant Water Heater', 'V-Guard Storage Water Heater',
    'V-Guard Water Heater', 'V-Guard Water-Heater Zeno', 'Supreme Meter'], newCategory: 'power' },

  // → safety (circuit tester)
  { names: ['Circuit Test Plug (New)'], newCategory: 'safety' },
];

async function run() {
  let totalUpdated = 0;
  for (const { names, newCategory } of updates) {
    for (const name of names) {
      const result = await db.query(
        `UPDATE "Products" SET category = $1, "updatedAt" = NOW() WHERE name = $2 AND category = 'electrical' RETURNING id, name, category`,
        [newCategory, name]
      );
      if (result.rows.length > 0) {
        console.log(`✅ [${result.rows[0].id}] "${result.rows[0].name}" → ${newCategory}`);
        totalUpdated++;
      } else {
        // Try partial match
        const r2 = await db.query(
          `UPDATE "Products" SET category = $1, "updatedAt" = NOW() WHERE name ILIKE $2 AND category = 'electrical' RETURNING id, name, category`,
          [newCategory, `%${name}%`]
        );
        r2.rows.forEach(row => {
          console.log(`✅ [${row.id}] "${row.name}" → ${newCategory} (partial match)`);
          totalUpdated++;
        });
      }
    }
  }

  // Check remaining electrical
  const remaining = await db.query(`SELECT id, name FROM "Products" WHERE category = 'electrical' ORDER BY name`);
  if (remaining.rows.length > 0) {
    console.log(`\n⚠️  Still in 'electrical' (${remaining.rows.length}):`);
    remaining.rows.forEach(r => console.log(`  [${r.id}] ${r.name}`));
  } else {
    console.log('\n🎉 All products reclassified! electrical category is now empty.');
  }

  // Final category counts
  const counts = await db.query(`SELECT category, COUNT(*) as count FROM "Products" GROUP BY category ORDER BY category`);
  console.log('\n📊 Final category counts:');
  let total = 0;
  counts.rows.forEach(r => { console.log(`  ${r.category}: ${r.count}`); total += parseInt(r.count); });
  console.log(`  TOTAL: ${total}`);

  console.log(`\nUpdated ${totalUpdated} products.`);
  process.exit(0);
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
