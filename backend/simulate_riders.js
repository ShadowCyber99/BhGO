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

const pool = new Pool(pgConfig);

const JWT_SECRET = process.env.JWT_SECRET || 'cabride_super_secret_key_2024';
const SERVER_URL = 'http://localhost:5000';

const CITIES = [
  { name: 'Delhi', lat: 28.6139, lng: 77.2090 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  { name: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567 },
];

const NUM_GHOSTS = 10;
const ghostRiders = [];

function generateToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
}

function getRandomCoordinate(city) {
  return {
    lat: city.lat + (Math.random() - 0.5) * 0.08,
    lng: city.lng + (Math.random() - 0.5) * 0.08
  };
}

async function setupRiders() {
  console.log('🤖 Creating / Fetching Ghost Riders in DB...');
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('ghostpass', salt);

  for (let i = 1; i <= NUM_GHOSTS; i++) {
    const email = `ghost_rider_${i}@test.com`;
    const name = `Customer ${i} (AI)`;
    
    let res = await pool.query(`SELECT id FROM users WHERE email = $1`, [email]);
    let userId;
    if (res.rows.length === 0) {
      res = await pool.query(
        "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'rider') RETURNING id",
        [name, email, hash]
      );
      userId = res.rows[0].id;
    } else {
      userId = res.rows[0].id;
    }

    ghostRiders.push({
      id: userId,
      name,
      email,
      token: generateToken({ id: userId, role: 'rider' }),
      socket: null,
      status: 'idle', // idle, requesting, active
      activeRideId: null,
      driverId: null
    });
  }
  
  console.log(`✅ Loaded ${ghostRiders.length} ghost riders.`);
}

async function requestRandomRide(rider) {
  if (rider.status !== 'idle') return;

  const city = CITIES[Math.floor(Math.random() * CITIES.length)];
  const pickup = getRandomCoordinate(city);
  const dropoff = getRandomCoordinate(city);
  const services = ['ride', 'ride', 'ride', 'parcel', 'food', 'ambulance'];
  const service = services[Math.floor(Math.random() * services.length)];
  const fare = Math.floor(Math.random() * 500) + 150;

  try {
    const response = await fetch(`${SERVER_URL}/api/rides/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${rider.token}`
      },
      body: JSON.stringify({
        serviceCategory: service,
        pickupAddress: `Dummy Point A (${city.name})`,
        dropoffAddress: `Dummy Point B (${city.name})`,
        pickupLat: pickup.lat,
        pickupLng: pickup.lng,
        dropoffLat: dropoff.lat,
        dropoffLng: dropoff.lng,
        fare: fare
      })
    });

    if (response.ok) {
      const data = await response.json();
      rider.status = 'active';
      rider.activeRideId = data.ride.id;
      console.log(`📱 ${rider.name} requested a ${service.toUpperCase()} ride in ${city.name} [Ref: ${data.ride.refId}]`);
    }
  } catch (e) {
    console.error('Failed to request ride:', e.message);
  }
}

async function startSimulation() {
  await setupRiders();

  ghostRiders.forEach(ghost => {
    ghost.socket = io(SERVER_URL, { auth: { token: ghost.token } });

    ghost.socket.on('connect', () => {
      console.log(`🔌 Ghost ${ghost.name} connected.`);
      ghost.socket.emit('join', { userId: ghost.id, role: 'rider' });
    });

    ghost.socket.on('ride_status_update', (data) => {
      if (ghost.activeRideId === data.ride.id) {
        ghost.driverId = data.ride.driverId;
        console.log(`🔄 ${ghost.name}'s ride status updated to: ${data.ride.status.toUpperCase()}`);

        // Automated Conversational Replies based on Driver Action
        if (data.ride.status === 'accepted') {
          setTimeout(() => {
            console.log(`💬 ${ghost.name} sending "Thanks" message...`);
            ghost.socket.emit('send_chat_message', {
              rideId: ghost.activeRideId,
              senderId: ghost.id,
              receiverId: ghost.driverId,
              text: "Thanks for accepting! Please come to the exact pickup location."
            });
          }, 3000);
        }
        else if (data.ride.status === 'arrived') {
          setTimeout(() => {
            console.log(`💬 ${ghost.name} sending "Coming" message...`);
            ghost.socket.emit('send_chat_message', {
              rideId: ghost.activeRideId,
              senderId: ghost.id,
              receiverId: ghost.driverId,
              text: "I see you! I am coming down right now."
            });
          }, 2000);
        }
        else if (data.ride.status === 'completed' || data.ride.status === 'cancelled') {
          ghost.status = 'idle';
          ghost.activeRideId = null;
          ghost.driverId = null;
          console.log(`✅ ${ghost.name} is now idle again.`);
        }
      }
    });

    ghost.socket.on('receive_chat_message', (msg) => {
      if (msg.sender_id !== ghost.id && msg.ride_id === ghost.activeRideId) {
         console.log(`✉️ ${ghost.name} received message from Driver: ${msg.message_text}`);
      }
    });
  });

  // Master Loop: Randomly trigger a ride request every 10 seconds
  setInterval(() => {
    const idleRiders = ghostRiders.filter(r => r.status === 'idle');
    if (idleRiders.length > 0) {
      const luckyRider = idleRiders[Math.floor(Math.random() * idleRiders.length)];
      requestRandomRide(luckyRider);
    }
  }, 10000);
}

startSimulation();
