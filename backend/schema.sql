-- Drop existing tables to ensure clean wipe for Indian Context redesign
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;
DROP TABLE IF EXISTS rides CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create tables
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('rider', 'driver', 'admin')),
    rating DECIMAL(3,2) DEFAULT 5.00,
    wallet_balance DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE drivers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    service_category VARCHAR(20) NOT NULL, 
    vehicle_name VARCHAR(100) NOT NULL,
    vehicle_type VARCHAR(20) NOT NULL, 
    vehicle_number VARCHAR(50) NOT NULL,
    aadhar_number VARCHAR(12) NOT NULL,
    driving_license VARCHAR(20) NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    is_online BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rides (
    id SERIAL PRIMARY KEY,
    ref_id VARCHAR(50) UNIQUE,
    rider_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    driver_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    service_category VARCHAR(20) NOT NULL,
    vehicle_preference VARCHAR(20) DEFAULT 'any',
    pickup_address TEXT NOT NULL,
    dropoff_address TEXT NOT NULL,
    pickup_lat DECIMAL(10,8) NOT NULL,
    pickup_lng DECIMAL(11,8) NOT NULL,
    dropoff_lat DECIMAL(10,8) NOT NULL,
    dropoff_lng DECIMAL(11,8) NOT NULL,
    fare DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('requested', 'accepted', 'arrived', 'started', 'completed', 'cancelled')),
    payment_status VARCHAR(20) DEFAULT 'paid',
    payment_mode VARCHAR(20) DEFAULT 'digital',
    otp VARCHAR(4),
    cancelled_by VARCHAR(20),
    driver_penalty DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    cuisine VARCHAR(50) NOT NULL,
    rating DECIMAL(3,2) DEFAULT 4.5,
    image_url TEXT,
    category VARCHAR(20) DEFAULT 'food',
    city VARCHAR(50) DEFAULT 'Delhi'
);

CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    is_veg BOOLEAN DEFAULT true,
    image_url TEXT
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    ride_id INTEGER REFERENCES rides(id) ON DELETE CASCADE,
    restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
    total_amount DECIMAL(10,2) NOT NULL,
    items_json JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    ride_id INTEGER REFERENCES rides(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    ride_id INTEGER REFERENCES rides(id) ON DELETE CASCADE,
    driver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rider_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    tags JSONB,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Restaurants (15 Food, 6 Groceries)
INSERT INTO restaurants (id, name, cuisine, rating, image_url, category) VALUES 
(1, 'Bukhara Authentic', 'North Indian', 4.9, '🥘', 'food'),
(2, 'Indian Accent', 'Modern Indian', 4.8, '🍛', 'food'),
(3, 'Haldirams Classics', 'Snacks & Sweets', 4.7, '🥟', 'food'),
(4, 'Saravana Bhavan', 'South Indian', 4.8, '🥞', 'food'),
(5, 'Paradise Biryani', 'Hyderabadi', 4.6, '🍚', 'food'),
(6, 'Karim''s', 'Mughlai', 4.7, '🍗', 'food'),
(7, 'Moti Mahal Delux', 'North Indian', 4.5, '🍲', 'food'),
(8, 'Oh! Calcutta', 'Bengali', 4.8, '🐟', 'food'),
(9, 'Punjabi Dhaba', 'Punjabi', 4.4, '🍢', 'food'),
(10, 'Chaat Corner', 'Street Food', 4.6, '🍟', 'food'),
(11, 'Mainland China', 'Indo-Chinese', 4.5, '🍜', 'food'),
(12, 'Dakshin', 'South Indian', 4.7, '🥥', 'food'),
(13, 'Bikanervala', 'Sweets & Snacks', 4.6, '🥨', 'food'),
(14, 'Rajdhani Thali', 'Rajasthani', 4.8, '🍱', 'food'),
(15, 'Tunday Kababi', 'Awadhi', 4.9, '🥩', 'food'),

-- Grocery Stores
(16, 'BigBasket Local', 'Groceries', 4.7, '🛒', 'grocery'),
(17, 'BlinkIt Fresh', 'Daily Essentials', 4.8, '🛍️', 'grocery'),
(18, 'Reliance Smart', 'Supermarket', 4.5, '🏬', 'grocery'),
(19, 'D-Mart Specials', 'Discount Groceries', 4.6, '🏪', 'grocery'),
(20, 'Nature''s Basket', 'Premium Grocery', 4.8, '🥑', 'grocery'),
(21, 'Local Kirana', 'Neighborhood Store', 4.4, '🏪', 'grocery'),
(27, 'Zepto Fast', 'Quick Commerce', 4.7, '⚡', 'grocery'),
(28, 'Swiggy Instamart', 'Instant Groceries', 4.6, '🥡', 'grocery'),

-- Medical & Pharmacies
(22, 'Apollo Pharmacy', 'Medicines & Health', 4.8, '💊', 'pharmacy'),
(29, 'Netmeds', 'Online Pharmacy', 4.7, '💉', 'pharmacy'),
(30, 'PharmEasy', 'Healthcare Essentials', 4.5, '🩺', 'pharmacy'),
(31, '1mg Health', 'Medicines & Labs', 4.9, '🧪', 'pharmacy'),
(32, 'Truemeds', 'Discount Medicines', 4.4, '🩹', 'pharmacy'),

-- Others
(23, 'Croma Express', 'Electronics', 4.5, '🔌', 'grocery'),
(24, 'Licious', 'Fresh Meat & Seafood', 4.7, '🥩', 'grocery'),
(25, 'Sweet Tooth Desserts', 'Desserts & Cakes', 4.9, '🎂', 'food'),
(26, 'Subway Sandwiches', 'Healthy Fast Food', 4.3, '🥪', 'food');

-- Reset Sequence for restaurants
SELECT setval('restaurants_id_seq', 32);

-- Seed Menu Items (30+ Food)
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

-- Seed Grocery Items (20+ Items)
INSERT INTO menu_items (restaurant_id, name, description, price, is_veg, image_url) VALUES 
-- BigBasket Local
(16, 'Aashirvaad Atta (5kg)', 'Whole wheat flour.', 245.00, TRUE, '🌾'),
(16, 'Daawat Basmati Rice (1kg)', 'Premium long grain rice.', 180.00, TRUE, '🍚'),
(16, 'Tata Salt (1kg)', 'Iodized salt.', 28.00, TRUE, '🧂'),
(16, 'Madhur Sugar (1kg)', 'Refined sugar.', 55.00, TRUE, '🍬'),
-- BlinkIt Fresh
(17, 'Amul Taaza Milk (1L)', 'Toned fresh milk.', 68.00, TRUE, '🥛'),
(17, 'Amul Butter (100g)', 'Pasteurized butter.', 56.00, TRUE, '🧈'),
(17, 'Amul Paneer (200g)', 'Fresh cottage cheese.', 90.00, TRUE, '🧀'),
(17, 'Britannia Bread', 'Sliced white bread.', 45.00, TRUE, '🍞'),
-- Reliance Smart
(18, 'Fresh Onions (1kg)', 'Locally sourced onions.', 35.00, TRUE, '🧅'),
(18, 'Fresh Potatoes (1kg)', 'Farm fresh potatoes.', 30.00, TRUE, '🥔'),
(18, 'Fresh Tomatoes (1kg)', 'Red ripe tomatoes.', 40.00, TRUE, '🍅'),
(18, 'Green Chillies (250g)', 'Spicy fresh chillies.', 25.00, TRUE, '🌶️'),
-- D-Mart Specials
(19, 'Maggi Noodles (4 Pack)', '2-minute instant noodles.', 56.00, TRUE, '🍜'),
(19, 'Fortune Sunflower Oil (1L)', 'Refined edible oil.', 145.00, TRUE, '🛢️'),
(19, 'Surf Excel Detergent (1kg)', 'Washing powder.', 130.00, TRUE, '🧼'),
(19, 'Colgate Toothpaste (150g)', 'Strong teeth formula.', 95.00, TRUE, '🪥'),
-- Nature''s Basket
(20, 'Everest Turmeric Powder', 'Haldi powder 100g.', 35.00, TRUE, '🌿'),
(20, 'Everest Red Chilli Powder', 'Spicy lal mirch 100g.', 40.00, TRUE, '🌶️'),
(20, 'Tata Tea Gold (250g)', 'Premium tea leaves.', 145.00, TRUE, '🫖'),
(20, 'Bru Instant Coffee (50g)', 'Instant coffee blend.', 95.00, TRUE, '☕'),
-- Local Kirana
(21, 'Fresh Bananas (6pcs)', 'Robusta bananas.', 40.00, TRUE, '🍌'),
(21, 'Apples (1kg)', 'Kashmiri apples.', 200.00, TRUE, '🍎'),
(21, 'Eggs (1 Dozen)', 'Farm fresh eggs.', 80.00, FALSE, '🥚'),
(21, 'Toor Dal (1kg)', 'Yellow split pigeon peas.', 160.00, TRUE, '🥣'),

-- Apollo Pharmacy
(22, 'Paracetamol (10 Tablets)', 'Fever reducer.', 35.00, TRUE, '💊'),
(22, 'First Aid Kit', 'Bandages and antiseptics.', 250.00, TRUE, '🩹'),
(22, 'Vitamin C (30 Tablets)', 'Immunity booster.', 120.00, TRUE, '🍋'),

-- Netmeds
(29, 'Cough Syrup (100ml)', 'Soothes dry cough.', 95.00, TRUE, '🧴'),
(29, 'Vicks Vaporub (50g)', 'Cold relief balm.', 85.00, TRUE, '💆'),
(29, 'Digital Thermometer', 'Fast and accurate.', 200.00, TRUE, '🌡️'),

-- PharmEasy
(30, 'Dolo 650 (15 Tablets)', 'Fever and pain relief.', 30.00, TRUE, '💊'),
(30, 'Volini Spray (50g)', 'Pain relief spray.', 140.00, TRUE, '💨'),
(30, 'Eno Fruit Salt', 'Acidity relief.', 45.00, TRUE, '🥤'),

-- 1mg Health
(31, 'Blood Pressure Monitor', 'Automatic digital BP machine.', 1250.00, TRUE, '🩺'),
(31, 'Diabetic Test Strips', 'Pack of 50.', 800.00, TRUE, '🩸'),
(31, 'Multivitamins (60 Caps)', 'Daily essential vitamins.', 350.00, TRUE, '💊'),

-- Truemeds
(32, 'Ibuprofen (10 Tablets)', 'Anti-inflammatory.', 25.00, TRUE, '💊'),
(32, 'Antacid Liquid (200ml)', 'Relieves heartburn.', 110.00, TRUE, '🧴'),

-- Zepto & Instamart
(27, 'Lay''s Classic Salted', 'Potato chips.', 20.00, TRUE, '🥔'),
(27, 'Coca-Cola (750ml)', 'Cold drink.', 40.00, TRUE, '🥤'),
(28, 'Cadbury Dairy Milk', 'Milk chocolate.', 100.00, TRUE, '🍫'),
(28, 'Red Bull Energy Drink', '250ml can.', 125.00, TRUE, '⚡'),

-- Croma Express
(23, 'USB-C Charging Cable', 'Fast charging cable 1m.', 350.00, TRUE, '🔌'),
(23, 'AA Batteries (Pack of 4)', 'Alkaline batteries.', 90.00, TRUE, '🔋'),

-- Licious
(24, 'Chicken Breast (500g)', 'Boneless, skinless chicken.', 280.00, FALSE, '🍗'),
(24, 'Fresh Prawns (250g)', 'Cleaned and deveined.', 450.00, FALSE, '🦐'),

-- Sweet Tooth Desserts
(25, 'Chocolate Truffle Pastry', 'Rich chocolate cake slice.', 120.00, TRUE, '🍰'),
(25, 'Red Velvet Cupcake', 'With cream cheese frosting.', 90.00, TRUE, '🧁'),

-- Subway Sandwiches
(26, 'Paneer Tikka Sub (15cm)', 'Toasted sub with fresh veggies.', 180.00, TRUE, '🥪'),
(26, 'Chicken Teriyaki Sub (15cm)', 'Classic chicken sub.', 220.00, FALSE, '🌯');
