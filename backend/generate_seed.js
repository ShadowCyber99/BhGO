const fs = require('fs');

const INDIAN_CITIES = [
  { name: 'Delhi', lat: 28.6139, lng: 77.2090 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  { name: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
  { name: 'Mohali', lat: 30.7046, lng: 76.7179 },
  { name: 'Kharar', lat: 30.7414, lng: 76.6525 },
  { name: 'Ludhiana', lat: 30.9010, lng: 75.8573 },
  { name: 'Amritsar', lat: 31.6340, lng: 74.8723 },
  { name: 'Jalandhar', lat: 31.3260, lng: 75.5762 }
];

const RESTAURANT_TEMPLATES = [
  "Punjab Grill", "Dhaba Estd 1986", "Haldiram's", "Bikanervala", "Kareem's", 
  "Moti Mahal Delux", "Barbeque Nation", "Mainland China", "Oh! Calcutta", 
  "Paradise Biryani", "Saravana Bhavan", "Sagar Ratna", "The Great Indian Kitchen", 
  "Chai Point", "Faasos", "Behrouz Biryani", "Oven Story Pizza", "Sweet Truth",
  "Burger Singh", "Wow! Momo", "Rolls King", "Keventers", "Nirula's", 
  "Giani's", "Baskin Robbins", "Subway", "Dominos Pizza", "Pizza Hut", 
  "KFC", "McDonalds", "BlinkIt Groceries", "Zepto Fast Delivery", "Instamart"
];

let restaurantSql = `-- Seed Restaurants\nINSERT INTO restaurants (id, name, cuisine, rating, image_url, category) VALUES \n`;
let menuSql = `-- Seed Menu Items\nINSERT INTO menu_items (restaurant_id, name, description, price, is_veg, image_url) VALUES \n`;

let rId = 1;
const allRestaurants = [];
const allMenuRows = [];

for (const city of INDIAN_CITIES) {
  for (let i = 0; i < RESTAURANT_TEMPLATES.length; i++) {
    const templateName = RESTAURANT_TEMPLATES[i % RESTAURANT_TEMPLATES.length];
    const restName = `${templateName} ${city.name}`.replace(/'/g, "''");
    const isGrocery = restName.toLowerCase().includes('blinkit') || restName.toLowerCase().includes('zepto') || restName.toLowerCase().includes('instamart');
    const category = isGrocery ? 'grocery' : 'food';
    const rating = (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1);
    
    // Using random food emojis
    const emojis = ['🥘', '🍛', '🥟', '🥞', '🍚', '🍗', '🍲', '🐟', '🍢', '🍟', '🍜', '🥥', '🥨', '🍱', '🥩', '🍔', '🍕', '🛒', '🛍️', '🍎'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];

    allRestaurants.push(`(${rId}, '${restName}', 'Multi-Cuisine', ${rating}, '${emoji}', '${category}')`);

    // Add 4 menu items for this restaurant
    if (isGrocery) {
      allMenuRows.push(`(${rId}, 'Milk 1L', 'Fresh toned milk', 65.00, true, '🥛')`);
      allMenuRows.push(`(${rId}, 'Bread Packet', 'White sliced bread', 45.00, true, '🍞')`);
      allMenuRows.push(`(${rId}, 'Eggs 6pcs', 'Farm fresh eggs', 60.00, false, '🥚')`);
      allMenuRows.push(`(${rId}, 'Maggi Noodles', 'Instant noodles 4-pack', 56.00, true, '🍜')`);
    } else {
      allMenuRows.push(`(${rId}, 'Paneer Tikka', 'Tandoori cottage cheese', 250.00, true, '🧀')`);
      allMenuRows.push(`(${rId}, 'Chicken Biryani', 'Aromatic rice & chicken', 350.00, false, '🍚')`);
      allMenuRows.push(`(${rId}, 'Butter Naan', 'Tandoori flatbread', 50.00, true, '🫓')`);
      allMenuRows.push(`(${rId}, 'Gulab Jamun', 'Sweet milk dumplings', 90.00, true, '🍡')`);
    }
    rId++;
  }
}

restaurantSql += allRestaurants.join(',\n') + ';\n\n';
menuSql += allMenuRows.join(',\n') + ';\n\n';

const schemaBase = fs.readFileSync('schema.sql', 'utf8').split('\n').slice(0, 105).join('\n');

fs.writeFileSync('schema.sql', schemaBase + '\n\n' + restaurantSql + `SELECT setval('restaurants_id_seq', ${rId});\n\n` + menuSql);
console.log('Generated schema.sql successfully with ' + (rId-1) + ' restaurants.');
