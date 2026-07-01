const fs = require('fs');

const content = `-- Seed Menu Items (30+ Food)
INSERT INTO menu_items (restaurant_id, name, description, price, is_veg, image_url) VALUES 
-- Bukhara
(1, 'Dal Makhani', 'Slow cooked black lentils with cream.', 450.00, TRUE, '🍲'),
(1, 'Tandoori Roti', 'Whole wheat flatbread cooked in clay oven.', 50.00, TRUE, '🫓'),
(1, 'Murgh Malai Kabab', 'Creamy chicken kebabs.', 650.00, FALSE, '🍗'),
-- Indian Accent
(2, 'Blue Cheese Naan', 'Modern twist on classic naan.', 250.00, TRUE, '🫓'),
(2, 'Pork Ribs', 'Sweet and spicy glazed ribs.', 850.00, FALSE, '🍖'),
(2, 'Meetha Achaar Pork', 'Pork cooked with sweet pickle.', 750.00, FALSE, '🥩'),
-- Haldirams
(3, 'Chole Bhature', 'Spicy chickpeas with fried bread.', 180.00, TRUE, '🍛'),
(3, 'Raj Kachori', 'Crispy shell filled with yogurt and chutney.', 150.00, TRUE, '🥟'),
(3, 'Rasgulla (2pcs)', 'Spongy sweet cheese balls in syrup.', 80.00, TRUE, '🍡'),
-- Saravana Bhavan
(4, 'Masala Dosa', 'Crispy crepe filled with spiced potatoes.', 140.00, TRUE, '🥞'),
(4, 'Idli Vada Combo', 'Steamed rice cakes and fried lentil donuts.', 110.00, TRUE, '🍩'),
(4, 'Filter Coffee', 'Authentic South Indian coffee.', 60.00, TRUE, '☕'),
-- Paradise Biryani
(5, 'Hyderabadi Chicken Biryani', 'Aromatic rice cooked with chicken and spices.', 350.00, FALSE, '🍚'),
(5, 'Mutton Biryani', 'Classic rich mutton biryani.', 450.00, FALSE, '🍲'),
(5, 'Mirchi Ka Salan', 'Spicy chili and peanut curry.', 120.00, TRUE, '🌶️'),
-- Karim''s
(6, 'Mutton Korma', 'Rich and spicy mutton curry.', 550.00, FALSE, '🍲'),
(6, 'Chicken Jahangiri', 'Signature spicy chicken dish.', 480.00, FALSE, '🍗'),
(6, 'Khamiri Roti', 'Soft fermented bread.', 40.00, TRUE, '🫓'),
-- Moti Mahal
(7, 'Butter Chicken', 'The original classic creamy tomato chicken.', 480.00, FALSE, '🍛'),
(7, 'Paneer Butter Masala', 'Cottage cheese in rich tomato gravy.', 350.00, TRUE, '🧀'),
(7, 'Garlic Naan', 'Crispy naan topped with garlic.', 70.00, TRUE, '🫓'),
-- Oh! Calcutta
(8, 'Bhapa Ilish', 'Steamed Hilsa fish in mustard sauce.', 650.00, FALSE, '🐟'),
(8, 'Kosha Mangsho', 'Slow cooked spicy mutton.', 550.00, FALSE, '🥩'),
(8, 'Mishti Doi', 'Sweetened fermented yogurt.', 120.00, TRUE, '🍮'),
-- Punjabi Dhaba
(9, 'Sarson Ka Saag', 'Mustard greens curry.', 250.00, TRUE, '🥬'),
(9, 'Makki Di Roti', 'Cornmeal flatbread.', 40.00, TRUE, '🫓'),
(9, 'Lassi', 'Sweet churned yogurt drink.', 80.00, TRUE, '🥛'),
-- Chaat Corner
(10, 'Pani Puri', 'Crispy spheres with spicy mint water (6pcs).', 60.00, TRUE, '🧆'),
(10, 'Aloo Tikki Chaat', 'Potato patties with yogurt and chutney.', 100.00, TRUE, '🥔'),
(10, 'Pav Bhaji', 'Spicy vegetable mash with buttered buns.', 150.00, TRUE, '🍔'),
-- Mainland China
(11, 'Chilli Chicken', 'Spicy Indo-Chinese chicken.', 380.00, FALSE, '🍗'),
(11, 'Veg Hakka Noodles', 'Stir fried noodles with veggies.', 250.00, TRUE, '🍜'),
(11, 'Manchow Soup', 'Spicy dark soup with crispy noodles.', 180.00, TRUE, '🥣'),
-- Dakshin
(12, 'Chicken Chettinad', 'Fiery South Indian chicken curry.', 450.00, FALSE, '🍛'),
(12, 'Appam', 'Laced rice pancakes.', 60.00, TRUE, '🥞'),
(12, 'Meen Moilee', 'Fish in mild coconut milk curry.', 550.00, FALSE, '🐟'),
-- Bikanervala
(13, 'Samosa (2pcs)', 'Fried pastry with spiced potato filling.', 50.00, TRUE, '🥟'),
(13, 'Dhokla', 'Steamed gram flour snack.', 80.00, TRUE, '🧽'),
(13, 'Jalebi', 'Crispy fried spirals in sugar syrup.', 100.00, TRUE, '🥨'),
-- Rajdhani Thali
(14, 'Maharaja Thali', 'Complete traditional meal with 15+ items.', 550.00, TRUE, '🍱'),
(14, 'Dal Baati Churma', 'Baked wheat balls with lentil and sweet.', 350.00, TRUE, '🍲'),
(14, 'Aamras', 'Sweet mango puree.', 150.00, TRUE, '🥭'),
-- Tunday Kababi
(15, 'Galouti Kebab', 'Melt-in-mouth minced meat kebabs.', 350.00, FALSE, '🥩'),
(15, 'Ulte Tawa Ka Paratha', 'Soft flatbread cooked upside down.', 60.00, TRUE, '🫓'),
(15, 'Mutton Biryani (Awadhi)', 'Fragrant slow cooked biryani.', 450.00, FALSE, '🍚');

-- Sweet Tooth Desserts
(16, 'Chocolate Truffle Pastry', 'Rich chocolate cake slice.', 120.00, TRUE, '🍰'),
(16, 'Red Velvet Cupcake', 'With cream cheese frosting.', 90.00, TRUE, '🧁'),

-- Subway Sandwiches
(17, 'Paneer Tikka Sub (15cm)', 'Toasted sub with fresh veggies.', 180.00, TRUE, '🥪'),
(17, 'Chicken Teriyaki Sub (15cm)', 'Classic chicken sub.', 220.00, FALSE, '🌯');

-- Seed Grocery Items
INSERT INTO grocery_items (supermarket_id, name, description, price, category, image_url) VALUES 
-- BigBasket Local
(1, 'Aashirvaad Atta (5kg)', 'Whole wheat flour.', 245.00, 'Staples', '🌾'),
(1, 'Daawat Basmati Rice (1kg)', 'Premium long grain rice.', 180.00, 'Staples', '🍚'),
(1, 'Tata Salt (1kg)', 'Iodized salt.', 28.00, 'Staples', '🧂'),
(1, 'Madhur Sugar (1kg)', 'Refined sugar.', 55.00, 'Staples', '🍬'),
-- BlinkIt Fresh
(2, 'Amul Taaza Milk (1L)', 'Toned fresh milk.', 68.00, 'Dairy', '🥛'),
(2, 'Amul Butter (100g)', 'Pasteurized butter.', 56.00, 'Dairy', '🧈'),
(2, 'Amul Paneer (200g)', 'Fresh cottage cheese.', 90.00, 'Dairy', '🧀'),
(2, 'Britannia Bread', 'Sliced white bread.', 45.00, 'Bakery', '🍞'),
-- Reliance Smart
(3, 'Fresh Onions (1kg)', 'Locally sourced onions.', 35.00, 'Vegetables', '🧅'),
(3, 'Fresh Potatoes (1kg)', 'Farm fresh potatoes.', 30.00, 'Vegetables', '🥔'),
(3, 'Fresh Tomatoes (1kg)', 'Red ripe tomatoes.', 40.00, 'Vegetables', '🍅'),
(3, 'Green Chillies (250g)', 'Spicy fresh chillies.', 25.00, 'Vegetables', '🌶️'),
-- D-Mart Specials
(4, 'Maggi Noodles (4 Pack)', '2-minute instant noodles.', 56.00, 'Snacks', '🍜'),
(4, 'Fortune Sunflower Oil (1L)', 'Refined edible oil.', 145.00, 'Staples', '🛢️'),
(4, 'Surf Excel Detergent (1kg)', 'Washing powder.', 130.00, 'Cleaning', '🧼'),
(4, 'Colgate Toothpaste (150g)', 'Strong teeth formula.', 95.00, 'Personal Care', '🪥'),
-- Nature''s Basket
(5, 'Everest Turmeric Powder', 'Haldi powder 100g.', 35.00, 'Spices', '🌿'),
(5, 'Everest Red Chilli Powder', 'Spicy lal mirch 100g.', 40.00, 'Spices', '🌶️'),
(5, 'Tata Tea Gold (250g)', 'Premium tea leaves.', 145.00, 'Beverages', '🫖'),
(5, 'Bru Instant Coffee (50g)', 'Instant coffee blend.', 95.00, 'Beverages', '☕'),
-- Local Kirana
(6, 'Fresh Bananas (6pcs)', 'Robusta bananas.', 40.00, 'Fruits', '🍌'),
(6, 'Apples (1kg)', 'Kashmiri apples.', 200.00, 'Fruits', '🍎'),
(6, 'Eggs (1 Dozen)', 'Farm fresh eggs.', 80.00, 'Dairy & Eggs', '🥚'),
(6, 'Toor Dal (1kg)', 'Yellow split pigeon peas.', 160.00, 'Staples', '🥣'),
-- Croma Express
(7, 'USB-C Charging Cable', 'Fast charging cable 1m.', 350.00, 'Electronics', '🔌'),
(7, 'AA Batteries (Pack of 4)', 'Alkaline batteries.', 90.00, 'Electronics', '🔋'),
-- Licious
(8, 'Chicken Breast (500g)', 'Boneless, skinless chicken.', 280.00, 'Meat', '🍗'),
(8, 'Fresh Prawns (250g)', 'Cleaned and deveined.', 450.00, 'Seafood', '🦐');

-- Seed Medicine Items
INSERT INTO medicine_items (pharmacy_id, name, description, price, category, image_url) VALUES 
-- Apollo Pharmacy
(1, 'Paracetamol (10 Tablets)', 'Fever reducer.', 35.00, 'OTC', '💊'),
(1, 'First Aid Kit', 'Bandages and antiseptics.', 250.00, 'First Aid', '🩹'),
(1, 'Vitamin C (30 Tablets)', 'Immunity booster.', 120.00, 'Supplements', '🍋');
`;

const lines = fs.readFileSync('schema.sql', 'utf8').split('\\n');
let idx = lines.findIndex(l => l.startsWith('-- Seed Menu Items'));
if (idx !== -1) {
  fs.writeFileSync('schema.sql', lines.slice(0, idx).join('\\n') + '\\n' + content);
  console.log('Successfully updated schema.sql');
} else {
  console.log('Could not find marker in schema.sql');
}
