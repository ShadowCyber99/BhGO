const { Pool } = require('pg');
require('dotenv').config();

const pgConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'devops',
  password: process.env.DB_PASSWORD || 'Shadow99@@',
  database: process.env.DB_NAME || 'cab_ride',
};

const pool = new Pool(pgConfig);

async function patch() {
  try {
    await pool.query("UPDATE drivers SET vehicle_name = 'LifeSupport Ambulance', vehicle_type = 'van' WHERE service_category = 'ambulance' AND vehicle_name = 'Simulated Car'");
    await pool.query("UPDATE drivers SET vehicle_name = 'Delivery Van', vehicle_type = 'van' WHERE service_category = 'parcel' AND vehicle_name = 'Simulated Car'");
    await pool.query("UPDATE drivers SET vehicle_name = 'Delivery Bike', vehicle_type = 'bike' WHERE service_category = 'food' AND vehicle_name = 'Simulated Car'");
    console.log('✅ Patched ghost drivers');
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

patch();
