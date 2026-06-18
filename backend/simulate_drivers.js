const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const { io } = require('socket.io-client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pgConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'devops',
  password: process.env.DB_PASSWORD || 'Shadow99@@',
  database: process.env.DB_NAME || 'cab_ride',
};

const JWT_SECRET = process.env.JWT_SECRET || 'cabride_super_secret_key_2024';
const SERVER_URL = 'http://localhost:5000';

const pool = new Pool(pgConfig);

// Indian cities coordinates for our ghost drivers
const CITIES = [
  { name: 'Delhi', lat: 28.6139, lng: 77.2090 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
];

const NUM_GHOSTS = 15;
const ghostDrivers = [];

// Helper: Calculate distance in km
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Helper: Move driver slightly towards target or randomly
function moveTowards(currentLat, currentLng, targetLat, targetLng, speed = 0.002) {
  const dist = Math.sqrt(Math.pow(targetLat - currentLat, 2) + Math.pow(targetLng - currentLng, 2));
  if (dist < speed) return { lat: targetLat, lng: targetLng };
  
  const ratio = speed / dist;
  return {
    lat: currentLat + (targetLat - currentLat) * ratio,
    lng: currentLng + (targetLng - currentLng) * ratio
  };
}

// Generate token
function generateToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

async function setupGhosts() {
  console.log('🤖 Creating / Fetching Ghost Drivers in DB...');
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('ghostpass', salt);

  for (let i = 1; i <= NUM_GHOSTS; i++) {
    const email = `ghost_${i}@test.com`;
    const name = `Driver ${i} (AI)`;
    
    let res = await pool.query(`SELECT id FROM users WHERE email = $1`, [email]);
    let userId;
    if (res.rows.length === 0) {
      res = await pool.query(
        "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'driver') RETURNING id",
        [name, email, hash]
      );
      userId = res.rows[0].id;
      
      const city = CITIES[i % CITIES.length];
      const lat = city.lat + (Math.random() - 0.5) * 0.05;
      const lng = city.lng + (Math.random() - 0.5) * 0.05;
      const services = ['ride', 'parcel', 'food', 'ambulance'];
      const service = services[i % services.length];

      await pool.query(
        "INSERT INTO drivers (user_id, service_category, vehicle_name, vehicle_type, vehicle_number, latitude, longitude, is_online, is_available) VALUES ($1, $2, $3, $4, $5, $6, $7, true, true)",
        [userId, service, 'Simulated Car', 'sedan', `GH ${i}`, lat, lng]
      );
    } else {
      userId = res.rows[0].id;
    }

    const driverDetails = await pool.query(`SELECT * FROM drivers WHERE user_id = $1`, [userId]);
    
    ghostDrivers.push({
      id: userId,
      name,
      email,
      token: generateToken({ id: userId, role: 'driver' }),
      details: driverDetails.rows[0],
      currentLocation: { lat: parseFloat(driverDetails.rows[0].latitude), lng: parseFloat(driverDetails.rows[0].longitude) },
      city: CITIES[i % CITIES.length],
      socket: null,
      status: 'idle', // idle, driving_to_pickup, riding_to_dropoff
      targetLocation: null,
      activeRide: null,
      riderId: null
    });
  }
  
  console.log(`✅ Loaded ${ghostDrivers.length} ghost drivers.`);
}

async function startSimulation() {
  await setupGhosts();

  ghostDrivers.forEach(ghost => {
    ghost.socket = io(SERVER_URL, {
      auth: { token: ghost.token }
    });

    ghost.socket.on('connect', () => {
      console.log(`🔌 Ghost ${ghost.name} connected.`);
      ghost.socket.emit('join', { userId: ghost.id, role: 'driver' });
      
      // Wander randomly or drive to target
      setInterval(() => {
        if (ghost.status === 'idle') {
          // Wander slightly
          ghost.currentLocation.lat += (Math.random() - 0.5) * 0.001;
          ghost.currentLocation.lng += (Math.random() - 0.5) * 0.001;
        } else if (ghost.targetLocation) {
          ghost.currentLocation = moveTowards(
            ghost.currentLocation.lat, ghost.currentLocation.lng,
            ghost.targetLocation.lat, ghost.targetLocation.lng,
            0.002 // speed
          );

          // Check if reached
          const dist = getDistance(
            ghost.currentLocation.lat, ghost.currentLocation.lng,
            ghost.targetLocation.lat, ghost.targetLocation.lng
          );

          if (dist < 0.2) { // 200m
            if (ghost.status === 'driving_to_pickup') {
              ghost.status = 'waiting';
              ghost.socket.emit('update_ride_status', { rideId: ghost.activeRide.id, status: 'arrived' });
              console.log(`📍 Ghost ${ghost.name} arrived at pickup!`);
              
              setTimeout(() => {
                ghost.status = 'riding_to_dropoff';
                ghost.targetLocation = { lat: parseFloat(ghost.activeRide.dropoffLat), lng: parseFloat(ghost.activeRide.dropoffLng) };
                ghost.socket.emit('update_ride_status', { rideId: ghost.activeRide.id, status: 'started' });
                console.log(`🚗 Ghost ${ghost.name} started the ride!`);
              }, 3000);
            } else if (ghost.status === 'riding_to_dropoff') {
              ghost.status = 'idle';
              ghost.targetLocation = null;
              ghost.socket.emit('update_ride_status', { rideId: ghost.activeRide.id, status: 'completed' });
              console.log(`🏁 Ghost ${ghost.name} completed the ride!`);
              ghost.activeRide = null;
              ghost.riderId = null;
            }
          }
        }

        ghost.socket.emit('update_location', {
          driverId: ghost.id,
          latitude: ghost.currentLocation.lat,
          longitude: ghost.currentLocation.lng
        });

      }, 2000);
    });

    // Listen to new rides
    ghost.socket.on('new_ride_requested', (data) => {
      if (ghost.status !== 'idle') return;
      
      const reqLat = parseFloat(data.pickupLat);
      const reqLng = parseFloat(data.pickupLng);
      const dist = getDistance(ghost.currentLocation.lat, ghost.currentLocation.lng, reqLat, reqLng);
      
      if (dist < 50) { // Accept if within 50km
        console.log(`⚡ Ghost ${ghost.name} is accepting request from ${data.riderName}!`);
        ghost.status = 'driving_to_pickup';
        ghost.activeRide = data;
        ghost.riderId = data.riderId;
        ghost.targetLocation = { lat: reqLat, lng: reqLng };
        
        ghost.socket.emit('accept_ride', { rideId: data.id, driverId: ghost.id });
        
        // Automated Communication
        setTimeout(() => {
          ghost.socket.emit('send_chat_message', {
            rideId: data.id,
            senderId: ghost.id,
            receiverId: ghost.riderId,
            text: "Hi! I am your AI driver. I have accepted your request and I'm on my way!"
          });
        }, 1500);
      }
    });

    ghost.socket.on('receive_chat_message', (msg) => {
      if (msg.sender_id !== ghost.id && ghost.activeRide && msg.ride_id === ghost.activeRide.id) {
        console.log(`💬 Ghost ${ghost.name} received msg: ${msg.message_text}`);
        setTimeout(() => {
          ghost.socket.emit('send_chat_message', {
            rideId: ghost.activeRide.id,
            senderId: ghost.id,
            receiverId: ghost.riderId,
            text: `(Auto-reply) I received your message: "${msg.message_text}". See you soon!`
          });
        }, 2000);
      }
    });

    ghost.socket.on('ride_status_update', (data) => {
       if (data.ride.status === 'cancelled' && ghost.activeRide && ghost.activeRide.id === data.ride.id) {
         console.log(`🚫 Ghost ${ghost.name}'s ride was cancelled!`);
         ghost.status = 'idle';
         ghost.targetLocation = null;
         ghost.activeRide = null;
         ghost.riderId = null;
       }
    });
  });
}

startSimulation();
