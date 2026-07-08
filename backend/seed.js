const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pgConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'devops',
  password: process.env.DB_PASSWORD || 'Shadow99@@',
  database: process.env.DB_NAME || 'cab_ride',
};

const DEMO_ADMIN_EMAIL = 'admin@BharatGo.com';
const DEMO_ADMIN_PASSWORD = 'Admin@123';

const pool = new Pool(pgConfig);

async function seed() {
  console.log(`🌱 Starting Database Seeding on ${pgConfig.host}:${pgConfig.port}...`);
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(sql);
    console.log('✅ Database seeded successfully with schema.sql!');
    
    console.log('🔄 Expanding Restaurants and Menus to all cities...');
    const CITIES = ['Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Chandigarh', 'Mohali', 'Kharar', 'Ludhiana', 'Amritsar', 'Jalandhar'];
    const restsRes = await pool.query("SELECT * FROM restaurants WHERE city = 'Delhi'");
    for (const city of CITIES) {
      for (const r of restsRes.rows) {
        const newR = await pool.query(
          "INSERT INTO restaurants (name, cuisine, rating, image_url, category, city) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
          [r.name, r.cuisine, r.rating, r.image_url, r.category, city]
        );
        await pool.query(
          "INSERT INTO menu_items (restaurant_id, name, description, price, is_veg, image_url) SELECT $1, name, description, price, is_veg, image_url FROM menu_items WHERE restaurant_id = $2",
          [newR.rows[0].id, r.id]
        );
      }
    }
    console.log('✅ Expansion Complete!');
    
    // Dynamically seed users using bcrypt for proper hashing
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('password123', salt);
    const adminHash = await bcrypt.hash(DEMO_ADMIN_PASSWORD, salt);

    const riderRes = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ('Test Rider', 'rider@test.com', $1, 'rider') ON CONFLICT (email) DO NOTHING RETURNING id",
      [hash]
    );
    const driverRes = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ('Test Driver', 'driver@test.com', $1, 'driver') ON CONFLICT (email) DO NOTHING RETURNING id",
      [hash]
    );
    const adminRes = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ('System Admin', $1, $2, 'admin') ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password = EXCLUDED.password, role = EXCLUDED.role RETURNING id",
      [DEMO_ADMIN_EMAIL, adminHash]
    );

    if (driverRes.rows.length > 0) {
      await pool.query(
        "INSERT INTO drivers (user_id, service_category, vehicle_name, vehicle_type, vehicle_number, aadhar_number, driving_license, latitude, longitude, is_online, is_available) VALUES ($1, 'ride', 'Honda City', 'sedan', 'DL 1C 1234', '123456789012', 'DL-1420110012345', 28.6139, 77.2090, true, true)",
        [driverRes.rows[0].id]
      );
      await pool.query(
        "INSERT INTO drivers (user_id, service_category, vehicle_name, vehicle_type, vehicle_number, aadhar_number, driving_license, latitude, longitude, is_online, is_available) VALUES ($1, 'food', 'Delivery Bike', 'bike', 'DL 2S 9999', '987654321098', 'DL-1420110098765', 28.6140, 77.2100, true, true)",
        [driverRes.rows[0].id]
      );
    }
    console.log('✅ Seeded dummy users (rider@test.com & driver@test.com) with password: password123');
    console.log(`✅ Admin demo ready (${DEMO_ADMIN_EMAIL} / ${DEMO_ADMIN_PASSWORD})`);
    
  } catch (err) {
    console.error('❌ Error seeding database:', err.message);
  } finally {
    pool.end();
  }
}

seed();
