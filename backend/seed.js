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

const pool = new Pool(pgConfig);

async function seed() {
  console.log(`🌱 Starting Database Seeding on ${pgConfig.host}:${pgConfig.port}...`);
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(sql);
    console.log('✅ Database seeded successfully with schema.sql!');
    
    // Dynamically seed users using bcrypt for proper hashing
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('password123', salt);

    const riderRes = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ('Test Rider', 'rider@test.com', $1, 'rider') ON CONFLICT (email) DO NOTHING RETURNING id",
      [hash]
    );
    const driverRes = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ('Test Driver', 'driver@test.com', $1, 'driver') ON CONFLICT (email) DO NOTHING RETURNING id",
      [hash]
    );

    if (driverRes.rows.length > 0) {
      await pool.query(
        "INSERT INTO drivers (user_id, service_category, vehicle_name, vehicle_type, vehicle_number, latitude, longitude, is_online, is_available) VALUES ($1, 'ride', 'Honda City', 'sedan', 'DL 1C 1234', 28.6139, 77.2090, true, true)",
        [driverRes.rows[0].id]
      );
      await pool.query(
        "INSERT INTO drivers (user_id, service_category, vehicle_name, vehicle_type, vehicle_number, latitude, longitude, is_online, is_available) VALUES ($1, 'food', 'Delivery Bike', 'bike', 'DL 2S 9999', 28.6140, 77.2100, true, true)",
        [driverRes.rows[0].id]
      );
    }
    console.log('✅ Seeded dummy users (rider@test.com & driver@test.com) with password: password123');
    
  } catch (err) {
    console.error('❌ Error seeding database:', err.message);
  } finally {
    pool.end();
  }
}

seed();
