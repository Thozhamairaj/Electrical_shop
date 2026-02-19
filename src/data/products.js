export const products = [
  {
    id: 1,
    name: 'LED Panel Light 36W',
    category: 'lighting',
    price: 59.99,
    originalPrice: 74.99,
    image: '/led-panel-light.png',
    rating: 4.7,
    reviews: 182,
    description: 'Slim 2x2 LED panel light with uniform glow for offices, shops, and homes. Low glare diffuser and flicker-free driver.',
    specs: {
      wattage: '36W',
      size: '2x2 ft',
      colorTemp: '4000K neutral white',
      lumens: '3600 lm',
      warranty: '2 years'
    },
    inStock: true
  },
  {
    id: 2,
    name: 'LED Bulb Pack (12W x4)',
    category: 'lighting',
    price: 24.99,
    originalPrice: 34.99,
    image: '/led-bulbs-pack.png',
    rating: 4.6,
    reviews: 412,
    description: 'Pack of four 12W LED bulbs with high power factor and surge protection. Saves up to 85% energy.',
    specs: {
      wattage: '12W per bulb',
      base: 'B22',
      colorTemp: '6500K cool daylight',
      lumens: '1200 lm each',
      warranty: '1 year'
    },
    inStock: true
  },
  {
    id: 3,
    name: 'Premium Ceiling Fan 1200mm',
    category: 'fans',
    price: 129.99,
    originalPrice: 149.99,
    image: '/ceiling-fan.png',
    rating: 4.5,
    reviews: 265,
    description: 'High-airflow ceiling fan with copper motor and aerodynamic blades for silent performance.',
    specs: {
      sweep: '1200mm',
      airDelivery: '230 CMM',
      speed: '380 RPM',
      motor: '100% copper',
      warranty: '2 years'
    },
    inStock: true
  },
  {
    id: 4,
    name: 'BLDC Energy Saver Fan',
    category: 'fans',
    price: 169.99,
    originalPrice: 199.99,
    image: '/bldc-fan.png',
    rating: 4.8,
    reviews: 198,
    description: 'Brushless DC ceiling fan with up to 65% energy savings and remote control with timer modes.',
    specs: {
      sweep: '1200mm',
      airDelivery: '235 CMM',
      power: '32W at full speed',
      remote: 'Speed, timer, sleep modes',
      warranty: '3 years'
    },
    inStock: true
  },
  {
    id: 5,
    name: 'Kitchen Exhaust Fan 250mm',
    category: 'fans',
    price: 79.99,
    originalPrice: 99.99,
    image: '/exhaust-fan.png',
    rating: 4.4,
    reviews: 144,
    description: 'Compact exhaust fan with rust-proof body for kitchens and bathrooms. Quick ventilation and easy cleaning.',
    specs: {
      sweep: '250mm',
      airflow: '720 CMH',
      motor: 'Ball bearing',
      grill: 'Low-noise louver',
      warranty: '1 year'
    },
    inStock: true
  },
  {
    id: 6,
    name: 'Smart Touch Switch Panel (6 Gang)',
    category: 'switches',
    price: 89.99,
    originalPrice: 109.99,
    image: '/smart-switch.png',
    rating: 4.6,
    reviews: 203,
    description: 'Capacitive touch switch panel with glass finish. Wi-Fi enabled and works with Alexa and Google Home.',
    specs: {
      gangs: '6 touch controls',
      load: '16A max',
      connectivity: 'Wi-Fi, App control',
      voice: 'Alexa & Google Assistant',
      warranty: '2 years'
    },
    inStock: true
  },
  {
    id: 7,
    name: 'Modular Switch & Socket Kit',
    category: 'switches',
    price: 22.99,
    originalPrice: 29.99,
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&h=500&fit=crop',
    rating: 4.5,
    reviews: 332,
    description: 'Two 6A switches with two universal sockets in matte white finish. Flame-retardant and child-safe shutters.',
    specs: {
      configuration: '2 switches + 2 sockets',
      current: '6A',
      material: 'FR polycarbonate',
      safety: 'Child-safety shutters',
      warranty: '10 years'
    },
    inStock: true
  },
  {
    id: 8,
    name: 'Surge Protected Extension Board (6 Way)',
    category: 'safety',
    price: 32.99,
    originalPrice: 42.99,
    image: 'https://images.unsplash.com/photo-1591290619762-d71b5a5a4eb1?w=500&h=500&fit=crop',
    rating: 4.7,
    reviews: 507,
    description: '6-outlet extension board with master switch, overload protection, and heavy-duty 2m cord.',
    specs: {
      outlets: '6 universal sockets',
      cord: '2m heavy-duty',
      protection: 'Surge + overload',
      indicator: 'Neon master switch',
      warranty: '1 year'
    },
    inStock: true
  },
  {
    id: 9,
    name: 'Voltage Stabilizer 5 kVA (AC)',
    category: 'power',
    price: 189.99,
    originalPrice: 219.99,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
    rating: 4.4,
    reviews: 121,
    description: 'Digital voltage stabilizer for 1.5 ton ACs with intelligent time delay and thermal overload protection.',
    specs: {
      capacity: '5 kVA',
      inputRange: '170V - 270V',
      features: 'Smart delay, thermal cut-off',
      display: 'LED indicators',
      warranty: '3 years'
    },
    inStock: true
  },
  {
    id: 10,
    name: 'Home Inverter & Battery 900VA',
    category: 'power',
    price: 469.99,
    originalPrice: 529.99,
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=500&h=500&fit=crop',
    rating: 4.5,
    reviews: 98,
    description: 'Pure sine wave inverter with 150Ah tubular battery for silent backup of fans and lights during outages.',
    specs: {
      capacity: '900VA / 12V',
      battery: '150Ah tubular',
      backup: 'Up to 5 hrs @ 50% load',
      tech: 'Pure sine wave',
      warranty: '3 years inverter'
    },
    inStock: true
  },
  {
    id: 11,
    name: 'Outdoor LED Flood Light 50W',
    category: 'outdoor',
    price: 64.99,
    originalPrice: 79.99,
    image: 'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=500&h=500&fit=crop',
    rating: 4.6,
    reviews: 156,
    description: 'Weatherproof LED flood light for driveways and facades. High lumen output with toughened glass.',
    specs: {
      wattage: '50W',
      lumens: '5500 lm',
      colorTemp: '6000K cool white',
      ipRating: 'IP65',
      warranty: '2 years'
    },
    inStock: true
  },
  {
    id: 12,
    name: 'Motion Sensor Porch Light 18W',
    category: 'outdoor',
    price: 49.99,
    originalPrice: 64.99,
    image: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=500&h=500&fit=crop',
    rating: 4.7,
    reviews: 241,
    description: 'Aluminum porch light with PIR motion sensor for security and convenience. Auto on/off with dusk feature.',
    specs: {
      wattage: '18W',
      sensor: 'PIR 120° up to 8m',
      colorTemp: '3000K warm white',
      housing: 'Die-cast aluminum',
      warranty: '2 years'
    },
    inStock: true
  },
  {
    id: 13,
    name: 'MCB Circuit Breaker 32A (Single Pole)',
    category: 'safety',
    price: 12.99,
    originalPrice: 16.99,
    image: 'https://images.unsplash.com/photo-1621905252472-178b81cd8d6f?w=500&h=500&fit=crop',
    rating: 4.8,
    reviews: 389,
    description: 'Miniature circuit breaker with C-curve tripping for overload and short circuit protection.',
    specs: {
      current: '32A',
      poles: 'Single pole',
      breakingCapacity: '6kA',
      standard: 'IS/IEC 60898',
      warranty: '5 years'
    },
    inStock: true
  },
  {
    id: 14,
    name: 'Electrical Wire 2.5mm² (90m Roll)',
    category: 'wiring',
    price: 89.99,
    originalPrice: 109.99,
    image: 'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=500&h=500&fit=crop',
    rating: 4.6,
    reviews: 276,
    description: 'FR-PVC insulated copper wire for house wiring. Flame retardant and heat resistant up to 70°C.',
    specs: {
      size: '2.5mm²',
      length: '90 meters',
      conductor: '99.97% pure copper',
      insulation: 'FR-PVC',
      warranty: '2 years'
    },
    inStock: true
  },
  {
    id: 15,
    name: 'Digital Multimeter',
    category: 'tools',
    price: 34.99,
    originalPrice: 44.99,
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500&h=500&fit=crop',
    rating: 4.7,
    reviews: 512,
    description: 'Auto-ranging digital multimeter with AC/DC voltage, current, resistance, and continuity testing.',
    specs: {
      display: 'LCD 4000 counts',
      range: 'Auto-ranging',
      features: 'Voltage, current, resistance, diode test',
      safety: 'CAT III 600V',
      warranty: '1 year'
    },
    inStock: true
  },
  {
    id: 16,
    name: 'Screwdriver Set (6 Piece)',
    category: 'tools',
    price: 19.99,
    originalPrice: 24.99,
    image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500&h=500&fit=crop',
    rating: 4.5,
    reviews: 423,
    description: 'Professional electrician screwdriver set with insulated handles rated for 1000V.',
    specs: {
      pieces: '6 (3 flat + 3 Phillips)',
      insulation: '1000V rated',
      material: 'Chrome vanadium steel',
      handle: 'Ergonomic grip',
      warranty: 'Lifetime'
    },
    inStock: true
  },
  {
    id: 17,
    name: 'Wire Stripper & Cutter',
    category: 'tools',
    price: 24.99,
    originalPrice: 32.99,
    image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=500&h=500&fit=crop',
    rating: 4.6,
    reviews: 298,
    description: 'Multi-function wire stripper for 0.5-6mm² wires with precision cutting and crimping.',
    specs: {
      capacity: '0.5mm² to 6mm²',
      features: 'Strip, cut, crimp',
      material: 'Hardened steel',
      handle: 'Non-slip rubber',
      warranty: '2 years'
    },
    inStock: true
  },
  {
    id: 18,
    name: 'Junction Box (4x4 inch)',
    category: 'wiring',
    price: 8.99,
    originalPrice: 12.99,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
    rating: 4.4,
    reviews: 187,
    description: 'Weatherproof PVC junction box for concealed wiring with screw-on lid.',
    specs: {
      size: '4x4 inch',
      material: 'FR-PVC',
      depth: '50mm',
      mounting: 'Wall/ceiling mount',
      warranty: '1 year'
    },
    inStock: true
  },
  {
    id: 19,
    name: 'Cable Ties Pack (100 pcs)',
    category: 'wiring',
    price: 6.99,
    originalPrice: 9.99,
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500&h=500&fit=crop',
    rating: 4.3,
    reviews: 654,
    description: 'Self-locking nylon cable ties for wire management and bundling.',
    specs: {
      quantity: '100 pieces',
      size: '200mm x 3.6mm',
      material: 'Nylon 66',
      tensile: '22kg',
      warranty: 'N/A'
    },
    inStock: true
  },
  {
    id: 20,
    name: 'Electrical Tape (PVC)',
    category: 'wiring',
    price: 4.99,
    originalPrice: 6.99,
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500&h=500&fit=crop',
    rating: 4.5,
    reviews: 521,
    description: 'Flame-retardant PVC insulation tape for electrical connections.',
    specs: {
      width: '19mm',
      length: '20 meters',
      material: 'FR-PVC',
      temperature: '-10°C to 80°C',
      warranty: 'N/A'
    },
    inStock: true
  },
  {
    id: 21,
    name: 'RCCB 40A (Double Pole)',
    category: 'safety',
    price: 45.99,
    originalPrice: 59.99,
    image: 'https://images.unsplash.com/photo-1621905252472-178b81cd8d6f?w=500&h=500&fit=crop',
    rating: 4.7,
    reviews: 234,
    description: 'Residual current circuit breaker for earth leakage protection. 30mA sensitivity.',
    specs: {
      current: '40A',
      poles: 'Double pole',
      sensitivity: '30mA',
      standard: 'IS/IEC 61008',
      warranty: '3 years'
    },
    inStock: true
  },
  {
    id: 22,
    name: 'Distribution Board (8 Way)',
    category: 'safety',
    price: 79.99,
    originalPrice: 99.99,
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&h=500&fit=crop',
    rating: 4.6,
    reviews: 167,
    description: 'Metal distribution board with 8 MCB slots and main switch for home wiring.',
    specs: {
      ways: '8 + 1 main',
      material: 'Metal enclosure',
      mounting: 'Surface/flush',
      busbar: 'Copper',
      warranty: '2 years'
    },
    inStock: true
  },
  {
    id: 23,
    name: 'LED Tube Light 20W (4ft)',
    category: 'lighting',
    price: 29.99,
    originalPrice: 39.99,
    image: 'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=500&h=500&fit=crop',
    rating: 4.5,
    reviews: 389,
    description: 'T8 LED tube light with aluminum body and frosted diffuser for uniform light.',
    specs: {
      wattage: '20W',
      length: '4 feet (1200mm)',
      lumens: '2200 lm',
      colorTemp: '6500K cool white',
      warranty: '2 years'
    },
    inStock: true
  },
  {
    id: 24,
    name: 'Downlight LED 12W (Recessed)',
    category: 'lighting',
    price: 34.99,
    originalPrice: 44.99,
    image: 'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=500&h=500&fit=crop',
    rating: 4.6,
    reviews: 278,
    description: 'Slim recessed LED downlight with driver for false ceiling installation.',
    specs: {
      wattage: '12W',
      cutout: '125mm',
      lumens: '1200 lm',
      colorTemp: '4000K neutral white',
      warranty: '2 years'
    },
    inStock: true
  },
  {
    id: 25,
    name: 'Smart LED Bulb 9W (Wi-Fi)',
    category: 'lighting',
    price: 18.99,
    originalPrice: 26.99,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
    rating: 4.6,
    reviews: 341,
    description: 'Wi-Fi smart bulb with 16 million colour options, voice control and app scheduling.',
    specs: { wattage: '9W', base: 'B22', colorTemp: 'RGB+3000K-6500K', connectivity: 'Wi-Fi 2.4GHz', warranty: '1 year' },
    inStock: true
  },
  {
    id: 26,
    name: 'LED Strip Light 5m (RGB)',
    category: 'lighting',
    price: 22.99,
    originalPrice: 32.99,
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca0748?w=500&h=500&fit=crop',
    rating: 4.4,
    reviews: 589,
    description: 'IP20 RGB LED strip with remote and power adapter, cuttable every 3 LEDs.',
    specs: { length: '5 metres', leds: '300 LEDs', power: '24W', remote: 'IR 44-key', warranty: '6 months' },
    inStock: true
  },
  {
    id: 27,
    name: 'Batten LED 18W (2ft T8)',
    category: 'lighting',
    price: 14.99,
    originalPrice: 19.99,
    image: 'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=500&h=500&fit=crop',
    rating: 4.5,
    reviews: 214,
    description: 'Surface-mount batten light with integrated driver for corridors and workshops.',
    specs: { wattage: '18W', length: '2 ft (600mm)', lumens: '1800 lm', colorTemp: '6500K', warranty: '2 years' },
    inStock: true
  },

  // ── Extra Fans ─────────────────────────────────────────────────────────────
  {
    id: 28,
    name: 'Wall Fan 400mm (3-Speed)',
    category: 'fans',
    price: 59.99,
    originalPrice: 74.99,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
    rating: 4.3,
    reviews: 178,
    description: 'Heavy-duty wall-mount fan with oscillation and 3 speed settings for shops and garages.',
    specs: { sweep: '400mm', speeds: '3', oscillation: 'Yes (90°)', motor: 'Copper wound', warranty: '1 year' },
    inStock: true
  },
  {
    id: 29,
    name: 'Tower Fan 44-inch (Remote)',
    category: 'fans',
    price: 109.99,
    originalPrice: 139.99,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
    rating: 4.5,
    reviews: 132,
    description: 'Slim tower fan with 3 modes, 8-hour timer, remote and ultra-quiet motor.',
    specs: { height: '44 inches', modes: 'Normal/Nature/Sleep', timer: '8 hrs', remote: 'Yes', warranty: '1 year' },
    inStock: true
  },

  // ── Extra Switches ─────────────────────────────────────────────────────────
  {
    id: 30,
    name: 'Dimmer Switch 1000W',
    category: 'switches',
    price: 18.99,
    originalPrice: 24.99,
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&h=500&fit=crop',
    rating: 4.4,
    reviews: 211,
    description: 'Universal trailing-edge dimmer compatible with LED and incandescent loads up to 1000W.',
    specs: { load: '1000W max', compatibility: 'LED/Incandescent', finish: 'Matte white', type: 'Trailing edge', warranty: '2 years' },
    inStock: true
  },
  {
    id: 31,
    name: 'USB Socket Outlet (2 USB + 2 Pin)',
    category: 'switches',
    price: 28.99,
    originalPrice: 36.99,
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&h=500&fit=crop',
    rating: 4.7,
    reviews: 395,
    description: 'Modular socket with two fast-charge USB ports and two universal sockets in one plate.',
    specs: { usb: '2 × 5V 2.4A', sockets: '2 universal', finish: 'White gloss', standard: 'IS 1293', warranty: '2 years' },
    inStock: true
  },

  // ── Extra Power ────────────────────────────────────────────────────────────
  {
    id: 32,
    name: 'UPS 600VA (Computer)',
    category: 'power',
    price: 84.99,
    originalPrice: 99.99,
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=500&h=500&fit=crop',
    rating: 4.5,
    reviews: 267,
    description: 'Line-interactive UPS with AVR for desktop computers with up to 15 min backup.',
    specs: { capacity: '600VA/360W', backup: '15 min @ 50% load', outlets: '4', avr: 'Yes', warranty: '2 years' },
    inStock: true
  },
  {
    id: 33,
    name: 'Voltage Stabilizer 4 kVA (Refrigerator)',
    category: 'power',
    price: 134.99,
    originalPrice: 159.99,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
    rating: 4.3,
    reviews: 88,
    description: 'Automatic voltage stabilizer for refrigerators and washing machines with 2-min start delay.',
    specs: { capacity: '4 kVA', inputRange: '180V–270V', delay: '2 min start', display: 'Volt meter', warranty: '2 years' },
    inStock: true
  },

  // ── Extra Safety ───────────────────────────────────────────────────────────
  {
    id: 34,
    name: 'ELCB Earth Leakage Breaker 32A',
    category: 'safety',
    price: 38.99,
    originalPrice: 49.99,
    image: 'https://images.unsplash.com/photo-1621905252472-178b81cd8d6f?w=500&h=500&fit=crop',
    rating: 4.6,
    reviews: 143,
    description: 'Earth Leakage Circuit Breaker for equipment and pool/outdoor protection at 30mA.',
    specs: { current: '32A', sensitivity: '30mA', poles: 'Double pole', breaking: '6kA', warranty: '3 years' },
    inStock: true
  },
  {
    id: 35,
    name: 'Smoke Detector (Photoelectric)',
    category: 'safety',
    price: 24.99,
    originalPrice: 34.99,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
    rating: 4.7,
    reviews: 302,
    description: 'Standalone photoelectric smoke alarm with 85dB siren, test button, and 9V battery.',
    specs: { type: 'Photoelectric', alarm: '85dB', power: '9V battery', standard: 'IS 11360', warranty: '3 years' },
    inStock: true
  },

  // ── Extra Outdoor ──────────────────────────────────────────────────────────
  {
    id: 36,
    name: 'Solar Garden Light 10W',
    category: 'outdoor',
    price: 44.99,
    originalPrice: 59.99,
    image: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=500&h=500&fit=crop',
    rating: 4.5,
    reviews: 219,
    description: 'All-in-one solar street light with dusk-to-dawn sensor and 8-hour runtime.',
    specs: { power: '10W', runtime: '8–10 hrs', sensor: 'Dusk to dawn', panel: 'Mono-crystalline 6V', warranty: '1 year' },
    inStock: true
  },
  {
    id: 37,
    name: 'LED Spike Garden Light 5W (Pack of 4)',
    category: 'outdoor',
    price: 34.99,
    originalPrice: 44.99,
    image: 'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=500&h=500&fit=crop',
    rating: 4.4,
    reviews: 174,
    description: 'IP65 spike lights for garden path and flower bed accent lighting with warm glow.',
    specs: { wattage: '5W each', ipRating: 'IP65', colorTemp: '3000K', quantity: '4 units', warranty: '1 year' },
    inStock: true
  },

  // ── Extra Wiring ───────────────────────────────────────────────────────────
  {
    id: 38,
    name: 'Electrical Wire 1.5mm² (90m Roll)',
    category: 'wiring',
    price: 62.99,
    originalPrice: 79.99,
    image: 'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=500&h=500&fit=crop',
    rating: 4.6,
    reviews: 312,
    description: 'FR-PVC insulated 1.5mm² copper wire for light circuits and fan wiring.',
    specs: { size: '1.5mm²', length: '90 metres', conductor: '99.97% pure copper', insulation: 'FR-PVC', warranty: '2 years' },
    inStock: true
  },
  {
    id: 39,
    name: 'Conduit Pipe PVC 25mm (3m)',
    category: 'wiring',
    price: 3.99,
    originalPrice: 5.99,
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500&h=500&fit=crop',
    rating: 4.2,
    reviews: 441,
    description: 'ISI marked rigid PVC conduit pipe for concealed and surface electrical wiring.',
    specs: { size: '25mm', length: '3 metres', material: 'Rigid PVC', standard: 'IS 9537', warranty: 'N/A' },
    inStock: true
  },

  // ── Extra Tools ────────────────────────────────────────────────────────────
  {
    id: 40,
    name: 'Non-Contact Voltage Tester',
    category: 'tools',
    price: 16.99,
    originalPrice: 22.99,
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500&h=500&fit=crop',
    rating: 4.8,
    reviews: 623,
    description: 'Pen-type voltage tester with audible and visual alert for AC 12–1000V circuits.',
    specs: { range: 'AC 12–1000V', alert: 'Beep + LED', sensitivity: 'Adjustable', safety: 'CAT IV 1000V', warranty: '1 year' },
    inStock: true
  },
  {
    id: 41,
    name: 'Clamp Meter 400A AC/DC',
    category: 'tools',
    price: 54.99,
    originalPrice: 69.99,
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500&h=500&fit=crop',
    rating: 4.7,
    reviews: 287,
    description: 'Digital clamp meter with true RMS for AC/DC current, voltage, resistance and continuity.',
    specs: { current: '400A AC/DC', voltage: '600V AC/DC', display: 'True RMS 4000 counts', safety: 'CAT III 600V', warranty: '1 year' },
    inStock: true
  },
  {
    id: 42,
    name: 'Crimping Tool Set (Ratchet)',
    category: 'tools',
    price: 29.99,
    originalPrice: 39.99,
    image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500&h=500&fit=crop',
    rating: 4.6,
    reviews: 198,
    description: 'Ratchet crimping tool set with 10–120mm² cable lugs and ferrule dies.',
    specs: { range: '10–120mm²', action: 'Ratchet mechanism', dies: 'Included', material: 'Drop-forged steel', warranty: '2 years' },
    inStock: true
  },
  // ── Pipes & Fittings ──────────────────────────────────────────────────────
  {
    id: 43,
    name: 'CPVC Pipe 1 inch (3m)',
    category: 'pipes',
    price: 8.99,
    originalPrice: 12.99,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
    rating: 4.5,
    reviews: 312,
    description: 'ISI marked CPVC hot & cold water pipe rated for temperatures up to 93°C.',
    specs: { size: '1 inch (25mm)', length: '3 metres', material: 'CPVC', pressure: '10 kg/cm²', warranty: '10 years' },
    inStock: true
  },
  {
    id: 44,
    name: 'UPVC Ball Valve 1/2 inch',
    category: 'pipes',
    price: 3.49,
    originalPrice: 5.99,
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500&h=500&fit=crop',
    rating: 4.4,
    reviews: 478,
    description: 'Full bore UPVC ball valve for water supply lines, corrosion-free and lever operated.',
    specs: { size: '1/2 inch', material: 'UPVC', type: 'Full bore', operation: 'Lever', warranty: '2 years' },
    inStock: true
  },
  {
    id: 45,
    name: 'Elbow 90° CPVC Fitting 3/4 inch (Pack of 10)',
    category: 'pipes',
    price: 4.99,
    originalPrice: 7.99,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
    rating: 4.6,
    reviews: 543,
    description: 'Pack of 10 CPVC 90° elbows for hot/cold water plumbing joints.',
    specs: { size: '3/4 inch', quantity: '10 pieces', material: 'CPVC', type: '90° elbow', warranty: '5 years' },
    inStock: true
  },
  {
    id: 46,
    name: 'GI Pipe 1 inch (6m, Medium Duty)',
    category: 'pipes',
    price: 29.99,
    originalPrice: 39.99,
    image: 'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=500&h=500&fit=crop',
    rating: 4.3,
    reviews: 198,
    description: 'Galvanized iron medium-duty pipe for water supply and gas lines. IS 1239 marked.',
    specs: { size: '1 inch (25mm)', length: '6 metres', grade: 'Medium (Class B)', standard: 'IS 1239', warranty: '1 year' },
    inStock: true
  },

  // ── Water Tanks ───────────────────────────────────────────────────────────
  {
    id: 47,
    name: 'Overhead Water Tank 500L (Triple Layer)',
    category: 'tanks',
    price: 119.99,
    originalPrice: 149.99,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
    rating: 4.7,
    reviews: 284,
    description: 'ISI marked triple-layer polyethylene tank with UV protection and food-grade inner layer.',
    specs: { capacity: '500 litres', layers: 'Triple layer', material: 'LLDPE', uvProtection: 'Yes', warranty: '10 years' },
    inStock: true
  },
  {
    id: 48,
    name: 'Underground Sump Tank 1000L',
    category: 'tanks',
    price: 189.99,
    originalPrice: 229.99,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
    rating: 4.5,
    reviews: 132,
    description: 'Heavy-duty underground storage tank for civil and residential water harvesting.',
    specs: { capacity: '1000 litres', material: 'HDPE', depth: 'Up to 1.2m', fittings: 'Inlet, outlet, overflow', warranty: '5 years' },
    inStock: true
  },
  {
    id: 49,
    name: 'Overhead Water Tank 1000L (Triple Layer)',
    category: 'tanks',
    price: 199.99,
    originalPrice: 249.99,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
    rating: 4.8,
    reviews: 376,
    description: 'Large capacity triple-layer tank with 3-year guarantee on black outer UV layer.',
    specs: { capacity: '1000 litres', layers: 'Triple layer', material: 'LLDPE', uvProtection: 'Yes', warranty: '10 years' },
    inStock: true
  },

  // ── Water Pumps ───────────────────────────────────────────────────────────
  {
    id: 50,
    name: 'Self-Priming Monoblock Pump 0.5 HP',
    category: 'pumps',
    price: 79.99,
    originalPrice: 99.99,
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=500&h=500&fit=crop',
    rating: 4.5,
    reviews: 321,
    description: 'Centrifugal monoblock pump for domestic water supply from sump to overhead tank.',
    specs: { power: '0.5 HP', flow: '30 LPM', head: '25 metres', voltage: '230V AC', warranty: '1 year' },
    inStock: true
  },
  {
    id: 51,
    name: 'Submersible Pump 1 HP (Borewell)',
    category: 'pumps',
    price: 149.99,
    originalPrice: 189.99,
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=500&h=500&fit=crop',
    rating: 4.6,
    reviews: 198,
    description: 'Stainless steel submersible borewell pump with built-in thermal overload protector.',
    specs: { power: '1 HP', flow: '120 LPH', head: '40 metres', casing: 'SS 304', warranty: '2 years' },
    inStock: true
  },
  {
    id: 52,
    name: 'Pressure Booster Pump 0.75 HP',
    category: 'pumps',
    price: 109.99,
    originalPrice: 139.99,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
    rating: 4.4,
    reviews: 145,
    description: 'Automatic pressure booster pump with built-in pressure switch for multi-floor buildings.',
    specs: { power: '0.75 HP', pressure: '3.5 bar', trigger: 'Auto pressure switch', voltage: '230V AC', warranty: '1 year' },
    inStock: true
  },

  // ── Bathroom Fittings ─────────────────────────────────────────────────────
  {
    id: 53,
    name: 'Single Lever Basin Mixer Tap',
    category: 'bathroom',
    price: 34.99,
    originalPrice: 49.99,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
    rating: 4.6,
    reviews: 412,
    description: 'Chrome-finish single-lever mixer for hot & cold water with ceramic cartridge.',
    specs: { finish: 'Chrome', cartridge: 'Ceramic disc', connection: '1/2 inch', flow: '6 LPM', warranty: '5 years' },
    inStock: true
  },
  {
    id: 54,
    name: 'Rain Shower Head 8 inch (Overhead)',
    category: 'bathroom',
    price: 24.99,
    originalPrice: 34.99,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
    rating: 4.5,
    reviews: 289,
    description: 'Stainless steel square rain shower head with anti-clog nozzles and fixed arm mount.',
    specs: { size: '8 inch square', material: 'SS 304', nozzles: '121 anti-clog', connection: '1/2 inch', warranty: '2 years' },
    inStock: true
  },
  {
    id: 55,
    name: 'Flush Valve Set with Cistern Float',
    category: 'bathroom',
    price: 12.99,
    originalPrice: 18.99,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
    rating: 4.3,
    reviews: 531,
    description: 'PVC flush valve and float ball set for concealed and exposed cisterns.',
    specs: { type: 'Bottom entry', material: 'PVC + brass seat', float: 'Adjustable', compatibility: 'Universal', warranty: '1 year' },
    inStock: true
  },

  // ── Plumbing Tools ────────────────────────────────────────────────────────
  {
    id: 56,
    name: 'Pipe Wrench 14 inch',
    category: 'plumbing-tools',
    price: 19.99,
    originalPrice: 26.99,
    image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500&h=500&fit=crop',
    rating: 4.6,
    reviews: 387,
    description: 'Heavy-duty cast iron pipe wrench with hardened steel jaws for gripping pipes up to 2 inch.',
    specs: { length: '14 inch (350mm)', capacity: 'Up to 2 inch pipe', material: 'Cast iron', jaws: 'Hardened steel', warranty: '1 year' },
    inStock: true
  },
  {
    id: 57,
    name: 'CPVC Pipe Cutter (Heavy Duty)',
    category: 'plumbing-tools',
    price: 14.99,
    originalPrice: 19.99,
    image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500&h=500&fit=crop',
    rating: 4.7,
    reviews: 264,
    description: 'Ratchet pipe cutter for CPVC, PVC, and UPVC pipes up to 42mm OD — clean burr-free cut.',
    specs: { capacity: 'Up to 42mm OD', action: 'Ratchet', blade: 'SK5 alloy steel', material: 'Aluminium body', warranty: '1 year' },
    inStock: true
  },
  {
    id: 58,
    name: 'Teflon Thread Seal Tape (Pack of 5)',
    category: 'plumbing-tools',
    price: 2.99,
    originalPrice: 4.99,
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500&h=500&fit=crop',
    rating: 4.5,
    reviews: 912,
    description: 'PTFE thread seal tape for sealing pipe joints in water and gas connections.',
    specs: { width: '12mm', length: '10m per roll', quantity: '5 rolls', material: 'PTFE (Teflon)', warranty: 'N/A' },
    inStock: true
  },
];


export const categories = [
  { id: 'all', name: 'All Products', icon: '🛒' },
  // Electrical
  { id: 'lighting', name: 'Lighting', icon: '💡' },
  { id: 'fans', name: 'Fans & Ventilation', icon: '🌀' },
  { id: 'switches', name: 'Switches & Controls', icon: '🔘' },
  { id: 'power', name: 'Power Backup', icon: '🔋' },
  { id: 'safety', name: 'Safety & Protection', icon: '⚡' },
  { id: 'outdoor', name: 'Outdoor Lighting', icon: '🏡' },
  { id: 'wiring', name: 'Wiring & Cables', icon: '🔌' },
  { id: 'tools', name: 'Electrical Tools', icon: '🔧' },
  // Plumbing
  { id: 'pipes', name: 'Pipes & Fittings', icon: '🔩' },
  { id: 'tanks', name: 'Water Tanks', icon: '🛢️' },
  { id: 'pumps', name: 'Pumps & Motors', icon: '💧' },
  { id: 'bathroom', name: 'Bathroom Fittings', icon: '🚿' },
  { id: 'plumbing-tools', name: 'Plumbing Tools', icon: '🪛' },
];
