const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Load environment variables
require('dotenv').config();

const pgConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'devops',
  password: process.env.DB_PASSWORD || 'Shadow99@@',
  database: process.env.DB_NAME || 'cab_ride',
  connectionTimeoutMillis: 3000, // Timeout fast if Postgres is offline
};

const DEMO_ADMIN_EMAIL = 'admin@BharatGo.com';
const DEMO_ADMIN_PASSWORD = 'Admin@123';

let pool = null;
let useFallback = false;

// --- Intelligent In-Memory Database Fallback Store ---
const inMemoryDb = {
  users: [
    {
      id: 1,
      name: 'John Rider',
      email: 'rider@BharatGo.com',
      password_hash: bcrypt.hashSync('password123', 10),
      role: 'rider',
      rating: 4.9,
      wallet_balance: 0.00,
      created_at: new Date()
    },
    {
      id: 2,
      name: 'Sarah Economy Driver',
      email: 'driver_eco@BharatGo.com',
      password_hash: bcrypt.hashSync('password123', 10),
      role: 'driver',
      rating: 4.8,
      wallet_balance: 0.00,
      created_at: new Date()
    },
    {
      id: 3,
      name: 'Michael Premium Driver',
      email: 'driver_premium@BharatGo.com',
      password_hash: bcrypt.hashSync('password123', 10),
      role: 'driver',
      rating: 4.95,
      wallet_balance: 0.00,
      created_at: new Date()
    },
    {
      id: 4,
      name: 'Elena SUV Driver',
      email: 'driver_suv@BharatGo.com',
      password_hash: bcrypt.hashSync('password123', 10),
      role: 'driver',
      rating: 4.75,
      wallet_balance: 0.00,
      created_at: new Date()
    },
    {
      id: 5,
      name: 'System Admin',
      email: DEMO_ADMIN_EMAIL,
      password_hash: bcrypt.hashSync(DEMO_ADMIN_PASSWORD, 10),
      role: 'admin',
      rating: 5.0,
      wallet_balance: 0.00,
      created_at: new Date()
    }
  ],
  drivers: [
    {
      id: 1,
      user_id: 2,
      vehicle_name: 'Hyundai Ioniq 5',
      vehicle_type: 'economy',
      service_category: 'ride',
      vehicle_number: 'CAB-ECO-99',
      aadhar_number: '123456789012',
      driving_license: 'DL-1420110012345',
      latitude: 40.7142,
      longitude: -74.0080,
      is_online: true,
      is_available: true,
      updated_at: new Date()
    },
    {
      id: 2,
      user_id: 3,
      vehicle_name: 'Ford Transit Ambulance',
      vehicle_type: 'ambulance',
      service_category: 'ambulance',
      vehicle_number: 'CAB-PRM-77',
      aadhar_number: '987654321098',
      driving_license: 'DL-1420110098765',
      latitude: 40.7100,
      longitude: -74.0020,
      is_online: true,
      is_available: true,
      updated_at: new Date()
    },
    {
      id: 3,
      user_id: 4,
      vehicle_name: 'Cargo Bike',
      vehicle_type: 'bike',
      service_category: 'food',
      vehicle_number: 'CAB-SUV-55',
      aadhar_number: '456789012345',
      driving_license: 'DL-1420110045678',
      latitude: 40.7200,
      longitude: -74.0150,
      is_online: true,
      is_available: true,
      updated_at: new Date()
    }
  ],
  rides: [],
  restaurants: [
    { id: 1, name: 'Burger King', category: 'Fast Food', rating: 4.2, delivery_time: '25-35 min', min_order: 150, image_url: '🍔' },
    { id: 2, name: 'Pizza Hut', category: 'Pizza', rating: 4.0, delivery_time: '35-45 min', min_order: 300, image_url: '🍕' },
    { id: 3, name: 'Sushi Express', category: 'Asian', rating: 4.6, delivery_time: '40-50 min', min_order: 500, image_url: '🍣' },
    { id: 4, name: 'Apollo Pharmacy', category: 'Pharmacy', rating: 4.8, delivery_time: '15-25 min', min_order: 100, image_url: '💊' },
    { id: 5, name: 'Wellness Forever', category: 'Pharmacy', rating: 4.7, delivery_time: '10-20 min', min_order: 100, image_url: '💊' },
    { id: 6, name: 'MedPlus', category: 'Pharmacy', rating: 4.5, delivery_time: '15-30 min', min_order: 100, image_url: '💊' },
    { id: 7, name: 'Delhi Medicos', category: 'Pharmacy', rating: 4.4, delivery_time: '20-30 min', min_order: 150, image_url: '💊' },
    { id: 8, name: 'Netmeds Store', category: 'Pharmacy', rating: 4.6, delivery_time: '25-40 min', min_order: 200, image_url: '💊' },
    { id: 9, name: 'Sanjivani Pharmacy', category: 'Pharmacy', rating: 4.3, delivery_time: '15-25 min', min_order: 100, image_url: '💊' },
    { id: 10, name: 'Guardian Pharmacy', category: 'Pharmacy', rating: 4.5, delivery_time: '20-35 min', min_order: 150, image_url: '💊' },
    { id: 11, name: 'Frank Ross Pharmacy', category: 'Pharmacy', rating: 4.4, delivery_time: '20-30 min', min_order: 150, image_url: '💊' },
    { id: 12, name: '98.4 Degrees', category: 'Pharmacy', rating: 4.7, delivery_time: '10-20 min', min_order: 200, image_url: '💊' },
    { id: 13, name: 'PharmaEasy Local', category: 'Pharmacy', rating: 4.6, delivery_time: '15-30 min', min_order: 100, image_url: '💊' },
    { id: 14, name: 'Truemeds', category: 'Pharmacy', rating: 4.5, delivery_time: '20-35 min', min_order: 200, image_url: '💊' },
    { id: 15, name: 'Tata 1mg Store', category: 'Pharmacy', rating: 4.8, delivery_time: '15-25 min', min_order: 150, image_url: '💊' },
    { id: 16, name: 'HealthKart', category: 'Pharmacy', rating: 4.3, delivery_time: '20-40 min', min_order: 300, image_url: '💊' },
    { id: 17, name: 'Patanjali Chikitsalaya', category: 'Pharmacy', rating: 4.2, delivery_time: '25-45 min', min_order: 100, image_url: '💊' },
    { id: 18, name: 'Ayurveda Kendra', category: 'Pharmacy', rating: 4.1, delivery_time: '30-50 min', min_order: 150, image_url: '💊' },
    { id: 19, name: 'City Health', category: 'Pharmacy', rating: 4.4, delivery_time: '15-25 min', min_order: 100, image_url: '💊' },
    { id: 20, name: 'LifeCare Meds', category: 'Pharmacy', rating: 4.5, delivery_time: '10-20 min', min_order: 100, image_url: '💊' },
    { id: 21, name: 'Global Pharmacy', category: 'Pharmacy', rating: 4.3, delivery_time: '20-30 min', min_order: 150, image_url: '💊' },
    { id: 22, name: 'Metro Medicals', category: 'Pharmacy', rating: 4.6, delivery_time: '15-30 min', min_order: 100, image_url: '💊' },
    { id: 23, name: 'Suburban Pharma', category: 'Pharmacy', rating: 4.2, delivery_time: '25-40 min', min_order: 200, image_url: '💊' }
  ],
  menu_items: [
    { id: 1, restaurant_id: 1, name: 'Double Cheese Burger', description: 'Two juicy beef patties with cheddar cheese.', price: 12.99, is_veg: false, image_url: '🍔' },
    { id: 2, restaurant_id: 1, name: 'Spicy Chicken Sandwich', description: 'Crispy chicken with spicy mayo.', price: 10.99, is_veg: false, image_url: '🍗' },
    { id: 3, restaurant_id: 1, name: 'Crispy French Fries', description: 'Golden potato fries with sea salt.', price: 4.99, is_veg: true, image_url: '🍟' },
    { id: 4, restaurant_id: 2, name: 'Margherita Pizza', description: 'Classic tomato sauce, fresh mozzarella, basil.', price: 16.00, is_veg: true, image_url: '🍕' },
    { id: 5, restaurant_id: 2, name: 'Pepperoni Pizza', description: 'Loaded with premium pepperoni.', price: 18.50, is_veg: false, image_url: '🍕' },
    { id: 6, restaurant_id: 3, name: 'Dragon Roll', description: 'Eel, cucumber, and avocado.', price: 14.00, is_veg: false, image_url: '🍣' },
    { id: 7, restaurant_id: 3, name: 'Spicy Tuna Roll', description: 'Fresh tuna with spicy sauce.', price: 12.00, is_veg: false, image_url: '🍣' },
    { id: 8, restaurant_id: 4, name: 'Paracetamol 500mg', description: 'Pain relief and fever reduction (10 tablets)', price: 40.00, is_veg: true, image_url: '💊' },
    { id: 9, restaurant_id: 4, name: 'First Aid Kit', description: 'Essential first aid items for home.', price: 250.00, is_veg: true, image_url: '🩹' },
    { id: 10, restaurant_id: 4, name: 'Vitamin C Tablets', description: 'Immunity booster.', price: 120.00, is_veg: true, image_url: '💊' },
    { id: 11, restaurant_id: 5, name: 'Cough Syrup', description: 'Dry cough relief 100ml.', price: 95.00, is_veg: true, image_url: '🍾' },
    { id: 12, restaurant_id: 5, name: 'Thermometer', description: 'Digital thermometer for precise readings.', price: 150.00, is_veg: true, image_url: '🌡️' }
  ],
  orders: [],
  chat_messages: [],
  complaints: [
    {
      id: 1,
      user_id: 1, // John Rider
      user_name: 'John Rider',
      user_role: 'rider',
      subject: 'Driver took too long',
      message: 'My driver yesterday took a totally wrong turn and delayed me by 20 minutes.',
      status: 'open',
      created_at: new Date(Date.now() - 86400000) // 1 day ago
    },
    {
      id: 2,
      user_id: 2, // Sarah Driver
      user_name: 'Sarah Economy Driver',
      user_role: 'driver',
      subject: 'Payment not received',
      message: 'The rider paid in cash but it says digital on my end?',
      status: 'resolved',
      created_at: new Date(Date.now() - 172800000) // 2 days ago
    }
  ]
};

// Check DB Connection on startup
const initDb = async () => {
  console.log('🔌 Connecting to PostgreSQL on', `${pgConfig.host}:${pgConfig.port}...`);
  
  if (!process.env.DB_PASSWORD) {
    console.warn('⚠️ No DB_PASSWORD provided in .env. Attempting blank password.');
  }

  pool = new Pool(pgConfig);

  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL Connected Successfully!');
    
    // Seed admin user for demo purposes if not exists
    try {
      const hash = bcrypt.hashSync(DEMO_ADMIN_PASSWORD, 10);
      const adminRes = await client.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [DEMO_ADMIN_EMAIL]);
      if (adminRes.rows.length === 0) {
        await client.query(
          'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
          ['System Admin', DEMO_ADMIN_EMAIL, hash, 'admin']
        );
        console.log('🛡️ Admin user seeded into PostgreSQL!');
      } else {
        await client.query(
          'UPDATE users SET name = $1, password = $2, role = $3 WHERE id = $4',
          ['System Admin', hash, 'admin', adminRes.rows[0].id]
        );
        console.log('🛡️ Admin demo credentials refreshed in PostgreSQL!');
      }
    } catch (seedErr) {
      console.warn('⚠️ Could not seed admin user:', seedErr.message);
    }

    client.release();
    useFallback = false;
  } catch (err) {
    console.warn('\n================================================================');
    console.warn('❌ DATABASE CONNECTION FAILED:', err.message);
    console.warn('⚡ AUTOMATIC SWITCH TO IN-MEMORY DEMO MODE');
    console.warn('💡 App will work perfectly for demo and testing without setup!');
    console.warn('💡 To use real PostgreSQL, create the "BharatGo" DB and update .env');
    console.warn('================================================================\n');
    useFallback = true;
  }
};

// Helper: Run Query with support for both PostgreSQL and In-Memory fallback
const query = async (text, params = []) => {
  if (!useFallback) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      console.error('Postgres Query Error:', err.message);
      throw err;
    }
  }

  // --- Simulate SQL queries on In-Memory lists ---
  const sql = text.toLowerCase().trim().replace(/\s+/g, ' ');

  // 1. Fetch User by Email: `SELECT * FROM users WHERE email = $1`
  if (sql.includes('select * from users where email =') || sql.includes('select * from users where lower(email) = lower(')) {
    const email = params[0].toLowerCase();
    const user = inMemoryDb.users.find(u => u.email.toLowerCase() === email);
    if (user) {
      return { rows: [{ ...user, password: user.password_hash }] };
    }
    return { rows: [] };
  }

  // 2. Fetch User & Driver profile: JOIN users and drivers
  if (sql.includes('select u.*, d.vehicle_name') && sql.includes('where u.id =')) {
    const id = parseInt(params[0]);
    const user = inMemoryDb.users.find(u => u.id === id);
    if (!user) return { rows: [] };
    
    const driver = inMemoryDb.drivers.find(d => d.user_id === id);
    return { rows: [{
      ...user,
      vehicle_name: driver ? driver.vehicle_name : null,
      vehicle_type: driver ? driver.vehicle_type : null,
      vehicle_number: driver ? driver.vehicle_number : null,
      latitude: driver ? driver.latitude : null,
      longitude: driver ? driver.longitude : null,
      service_category: driver ? driver.service_category : null,
      is_online: driver ? driver.is_online : null,
      is_available: driver ? driver.is_available : null
    }] };
  }

  // 3. Fetch User by ID: `SELECT * FROM users WHERE id = $1`
  if (sql.includes('select * from users where id =')) {
    const id = parseInt(params[0]);
    const user = inMemoryDb.users.find(u => u.id === id);
    return { rows: user ? [user] : [] };
  }

  // 4. Create User: `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *`
  if (sql.includes('insert into users') && sql.includes('returning *')) {
    const name = params[0];
    const email = params[1];
    const password_hash = params[2];
    const role = params[3];
    
    // Check duplicates
    if (inMemoryDb.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error(`duplicate key value violates unique constraint "users_email_key"`);
    }

    const newUser = {
      id: inMemoryDb.users.length + 1,
      name,
      email,
      password_hash,
      role,
      rating: 5.0,
      created_at: new Date()
    };
    inMemoryDb.users.push(newUser);
    return { rows: [newUser] };
  }

  // 5. Create Driver details: `INSERT INTO drivers ...`
  if (sql.includes('insert into drivers') && sql.includes('returning *')) {
    const user_id = parseInt(params[0]);
    const service_category = params[1];
    const vehicle_name = params[2];
    const vehicle_type = params[3];
    const vehicle_number = params[4];
    const aadhar_number = params[5];
    const driving_license = params[6];

    const newDriver = {
      id: inMemoryDb.drivers.length + 1,
      user_id,
      service_category,
      vehicle_name,
      vehicle_type,
      vehicle_number,
      aadhar_number,
      driving_license,
      latitude: 40.7128 + (Math.random() - 0.5) * 0.02,
      longitude: -74.0060 + (Math.random() - 0.5) * 0.02,
      is_online: true,
      is_available: true,
      updated_at: new Date()
    };
    inMemoryDb.drivers.push(newDriver);
    return { rows: [newDriver] };
  }

  // 6. Get online and available drivers with service category
  if (sql.includes('from drivers d join users u') && sql.includes('is_online = true')) {
    let activeDrivers = inMemoryDb.drivers.filter(d => d.is_online && d.is_available);
    
    // Check if filtering by service_category (e.g. d.service_category = $1)
    if (sql.includes('service_category = $')) {
        const category = params[0];
        activeDrivers = activeDrivers.filter(d => d.service_category === category);
    }
    
    // Check if filtering by vehicle_preference (e.g. d.vehicle_type = $2)
    if (sql.includes('vehicle_type = $')) {
        const pref = params[1] || params[0];
        if (pref && pref !== 'any') {
            activeDrivers = activeDrivers.filter(d => d.vehicle_type === pref);
        }
    }

    activeDrivers = activeDrivers.map(d => {
        const u = inMemoryDb.users.find(user => user.id === d.user_id);
        return {
          ...d,
          name: u ? u.name : 'Driver',
          rating: u ? u.rating : 5.0
        };
      });
    return { rows: activeDrivers };
  }

  // 7. Request Ride: `INSERT INTO rides ... RETURNING *`
  if (sql.includes('insert into rides') && sql.includes('returning *')) {
    const ref_id = params[0];
    const rider_id = parseInt(params[1]);
    const service_category = params[2] || 'ride';
    const vehicle_preference = params[3] || 'any';
    const pickup_address = params[4];
    const dropoff_address = params[5];
    const pickup_lat = parseFloat(params[6]);
    const pickup_lng = parseFloat(params[7]);
    const dropoff_lat = parseFloat(params[8]);
    const dropoff_lng = parseFloat(params[9]);
    const fare = parseFloat(params[10]);
    const payment_mode = params[11];
    const otp = params[12];
    const status = 'requested';

    const newRide = {
      id: inMemoryDb.rides.length + 1,
      ref_id,
      rider_id,
      driver_id: null,
      pickup_address,
      dropoff_address,
      pickup_lat,
      pickup_lng,
      dropoff_lat,
      dropoff_lng,
      fare,
      status,
      service_category,
      vehicle_preference,
      otp,
      payment_mode,
      payment_status: 'paid',
      created_at: new Date(),
      updated_at: new Date()
    };
    inMemoryDb.rides.push(newRide);
    return { rows: [newRide] };
  }

  // 8. Fetch Active Ride (Rider or Driver):
  if (sql.includes('select r.*') && sql.includes('status in (')) {
    const userId = parseInt(params[0]);
    
    // Find a ride that is active (not completed or cancelled) and involves this user
    const activeRide = inMemoryDb.rides.find(r => 
      (r.rider_id === userId || r.driver_id === userId) &&
      ['requested', 'accepted', 'arrived', 'started'].includes(r.status)
    );
    
    if (activeRide) {
      // Append driver info if assigned
      let driverUserObj = null;
      let driverDetailsObj = null;
      if (activeRide.driver_id) {
        driverUserObj = inMemoryDb.users.find(u => u.id === activeRide.driver_id);
        driverDetailsObj = inMemoryDb.drivers.find(d => d.user_id === activeRide.driver_id);
      }
      const riderUserObj = inMemoryDb.users.find(u => u.id === activeRide.rider_id);

      return { rows: [{
        ...activeRide,
        driver_name: driverUserObj ? driverUserObj.name : null,
        driver_rating: driverUserObj ? driverUserObj.rating : null,
        vehicle_name: driverDetailsObj ? driverDetailsObj.vehicle_name : null,
        vehicle_number: driverDetailsObj ? driverDetailsObj.vehicle_number : null,
        vehicle_type: driverDetailsObj ? driverDetailsObj.vehicle_type : null,
        driver_lat: driverDetailsObj ? driverDetailsObj.latitude : null,
        driver_lng: driverDetailsObj ? driverDetailsObj.longitude : null,
        rider_name: riderUserObj ? riderUserObj.name : 'Passenger',
        payment_status: activeRide.payment_status || 'paid',
        otp: activeRide.otp
      }] };
    }
    return { rows: [] };
  }

  // 9. Update Ride status / assign driver
  if (sql.includes('update rides set')) {
    let rideId = null;
    let newStatus = null;
    let driverId = null;

    // e.g., UPDATE rides SET status = $1, driver_id = $2 WHERE id = $3 RETURNING *
    if (sql.includes('status = $1') && sql.includes('driver_id = $2')) {
      newStatus = params[0];
      driverId = parseInt(params[1]);
      rideId = parseInt(params[2]);
    } else if (sql.includes('status = $1') && sql.includes('where id = $2')) {
      newStatus = params[0];
      rideId = parseInt(params[1]);
    }

    const rideIndex = inMemoryDb.rides.findIndex(r => r.id === rideId);
    if (rideIndex !== -1) {
      if (newStatus) inMemoryDb.rides[rideIndex].status = newStatus;
      if (driverId !== undefined) inMemoryDb.rides[rideIndex].driver_id = driverId;
      inMemoryDb.rides[rideIndex].updated_at = new Date();

      // If completing, free up the driver
      if (newStatus === 'completed' || newStatus === 'cancelled') {
        const dId = inMemoryDb.rides[rideIndex].driver_id;
        
        if (newStatus === 'cancelled') {
          inMemoryDb.rides[rideIndex].payment_status = 'refunded';
        }

        const dIndex = inMemoryDb.drivers.findIndex(d => d.user_id === dId);
        if (dIndex !== -1) {
          inMemoryDb.drivers[dIndex].is_available = true;
        }
      } else if (newStatus === 'accepted') {
        // Driver is no longer available
        const dIndex = inMemoryDb.drivers.findIndex(d => d.user_id === driverId);
        if (dIndex !== -1) {
          inMemoryDb.drivers[dIndex].is_available = false;
        }
      }

      const updatedRide = inMemoryDb.rides[rideIndex];
      let driverUserObj = null;
      let driverDetailsObj = null;
      if (updatedRide.driver_id) {
        driverUserObj = inMemoryDb.users.find(u => u.id === updatedRide.driver_id);
        driverDetailsObj = inMemoryDb.drivers.find(d => d.user_id === updatedRide.driver_id);
      }
      const riderUserObj = inMemoryDb.users.find(u => u.id === updatedRide.rider_id);

      return { rows: [{
        ...updatedRide,
        driver_name: driverUserObj ? driverUserObj.name : null,
        driver_rating: driverUserObj ? driverUserObj.rating : null,
        vehicle_name: driverDetailsObj ? driverDetailsObj.vehicle_name : null,
        vehicle_number: driverDetailsObj ? driverDetailsObj.vehicle_number : null,
        vehicle_type: driverDetailsObj ? driverDetailsObj.vehicle_type : null,
        driver_lat: driverDetailsObj ? driverDetailsObj.latitude : null,
        driver_lng: driverDetailsObj ? driverDetailsObj.longitude : null,
        rider_name: riderUserObj ? riderUserObj.name : 'Passenger',
        payment_status: updatedRide.payment_status || 'paid'
      }] };
    }
    return { rows: [] };
  }

  // 10. Update Driver online status/coordinates: `UPDATE drivers SET ...`
  if (sql.includes('update drivers set')) {
    // Check if updating online status: e.g. `UPDATE drivers SET is_online = $1 WHERE user_id = $2`
    if (sql.includes('is_online = $1') && sql.includes('user_id = $2')) {
      const isOnline = params[0] === true || params[0] === 'true';
      const userId = parseInt(params[1]);
      const dIndex = inMemoryDb.drivers.findIndex(d => d.user_id === userId);
      if (dIndex !== -1) {
        inMemoryDb.drivers[dIndex].is_online = isOnline;
        return { rows: [inMemoryDb.drivers[dIndex]] };
      }
    }
    
    // Check if updating coordinates: e.g. `UPDATE drivers SET latitude = $1, longitude = $2 WHERE user_id = $3`
    if (sql.includes('latitude = $1') && sql.includes('longitude = $2')) {
      const lat = parseFloat(params[0]);
      const lng = parseFloat(params[1]);
      const userId = parseInt(params[2]);
      const dIndex = inMemoryDb.drivers.findIndex(d => d.user_id === userId);
      if (dIndex !== -1) {
        inMemoryDb.drivers[dIndex].latitude = lat;
        inMemoryDb.drivers[dIndex].longitude = lng;
        return { rows: [inMemoryDb.drivers[dIndex]] };
      }
    }
  }

  // 11. Fetch Completed/All Ride History for Rider/Driver
  if (sql.includes('select r.*') && sql.includes('order by r.created_at')) {
    const userId = parseInt(params[0]);
    const history = inMemoryDb.rides
      .filter(r => r.rider_id === userId || r.driver_id === userId)
      .map(r => {
        const riderUser = inMemoryDb.users.find(u => u.id === r.rider_id);
        const driverUser = r.driver_id ? inMemoryDb.users.find(u => u.id === r.driver_id) : null;
        return {
          ...r,
          rider_name: riderUser ? riderUser.name : 'Passenger',
          driver_name: driverUser ? driverUser.name : 'Unassigned',
        };
      })
      .sort((a, b) => b.created_at - a.created_at);
    return { rows: history };
  }

  // 12. Fetch Restaurants
  if (sql.includes('select * from restaurants')) {
    return { rows: inMemoryDb.restaurants };
  }

  // 13. Fetch Menu Items
  if (sql.includes('select * from menu_items where restaurant_id =')) {
    const rId = parseInt(params[0]);
    return { rows: inMemoryDb.menu_items.filter(m => m.restaurant_id === rId) };
  }

  // 14. Create Order
  if (sql.includes('insert into orders') && sql.includes('returning *')) {
    const newOrder = {
      id: inMemoryDb.orders.length + 1,
      ride_id: parseInt(params[0]),
      restaurant_id: parseInt(params[1]),
      total_amount: parseFloat(params[2]),
      items_json: params[3],
      created_at: new Date()
    };
    inMemoryDb.orders.push(newOrder);
    return { rows: [newOrder] };
  }

  // 15. Create Chat Message
  if (sql.includes('insert into chat_messages') && sql.includes('returning *')) {
    const newMsg = {
      id: inMemoryDb.chat_messages.length + 1,
      ride_id: parseInt(params[0]),
      sender_id: parseInt(params[1]),
      message_text: params[2],
      created_at: new Date()
    };
    
    inMemoryDb.chat_messages.push(newMsg);
    return { rows: [newMsg] };
  }

  // 16. Get Chat Messages
  if (sql.includes('select * from chat_messages where ride_id =')) {
    const rId = parseInt(params[0]);
    return { rows: inMemoryDb.chat_messages.filter(m => m.ride_id === rId).sort((a,b) => a.created_at - b.created_at) };
  }

  // 17. Update User Rating
  if (sql.includes('update users set rating')) {
    const r = parseFloat(params[0]);
    const uId = parseInt(params[1]);
    const uIndex = inMemoryDb.users.findIndex(u => u.id === uId);
    if (uIndex !== -1) {
        // Mock moving average
        inMemoryDb.users[uIndex].rating = (inMemoryDb.users[uIndex].rating + r) / 2;
        return { rows: [inMemoryDb.users[uIndex]] };
    }
  }

  // Fallback return empty rows
  return { rows: [] };
};

module.exports = {
  initDb,
  query,
  getUseFallback: () => useFallback,
  getInMemoryDb: () => inMemoryDb
};
