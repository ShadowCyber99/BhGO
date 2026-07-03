const express = require('express');
const jwt = require('jsonwebtoken');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const db = require('./db');

const authRoutes = require('./routes/auth');
const rideRoutes = require('./routes/rides');
const adminRoutes = require('./routes/admin');

require('dotenv').config();

const app = express();
app.set('trust proxy', 1); // Trust the first proxy (Nginx) to use X-Forwarded-For properly
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Security & Logging Middleware
app.use(helmet());
app.use(morgan('combined'));

// API Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', apiLimiter);

// Standard Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: db.getUseFallback() ? 'in-memory-demo' : 'postgresql-active',
    timestamp: new Date()
  });
});

// Socket.io Real-time connection management
const activeConnections = new Map(); // userId -> socketId
const activeSimulations = new Map(); // rideId -> { timeoutIds: [], intervalIds: [] }

// Helper to register a timeout or interval in simulation tracking
const registerSimTracker = (rideId, type, id) => {
  if (!activeSimulations.has(rideId)) {
    activeSimulations.set(rideId, { timeoutIds: [], intervalIds: [] });
  }
  const sim = activeSimulations.get(rideId);
  if (type === 'timeout') sim.timeoutIds.push(id);
  if (type === 'interval') sim.intervalIds.push(id);
};

// Helper to abort and clean up simulation handles
const clearSimulation = (rideId) => {
  const sim = activeSimulations.get(rideId);
  if (sim) {
    console.log(`🤖 [Driver AI] Aborting active simulation handles for Ride ${rideId}`);
    sim.timeoutIds.forEach(id => clearTimeout(id));
    sim.intervalIds.forEach(id => clearInterval(id));
    activeSimulations.delete(rideId);
  }
};

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
    socket.user = decoded.user;
    next();
  });
});

io.on('connection', (socket) => {
  console.log('⚡ New client socket connected:', socket.id, 'User:', socket.user.id);

  // User registers their presence with their User ID
  socket.on('join', (data) => {
    const userId = socket.user.id;
    const role = socket.user.role;
    const { serviceFilter } = data;
    
    if (userId) {
      socket.join(`user_${userId}`);
      activeConnections.set(userId.toString(), socket.id);
      console.log(`👤 User ${userId} (${role}) joined room user_${userId}`);

      // If driver, set them online in DB and update their active service filter
      if (role === 'driver') {
        const category = serviceFilter && serviceFilter !== 'all' ? serviceFilter : 'all';
        db.query('UPDATE drivers SET is_online = true, service_category = $1 WHERE user_id = $2', [category, userId])
          .then(() => {
            console.log(`🚗 Driver ${userId} is now marked ONLINE with filter: ${serviceFilter || 'all'}`);
            // Broadcast driver update to all listening clients (to update maps)
            io.emit('drivers_changed');
          })
          .catch(err => console.error('Error setting driver online:', err.message));
      }
    }
  });

  // Client requests a ride
  socket.on('request_ride', async (rideData) => {
    const { rideId } = rideData;
    const riderId = socket.user.id;
    console.log(`🔔 Ride ${rideId} requested by Rider ${riderId}`);

    // Standard Socket Broadcast to actual online drivers (if any exist)
    socket.broadcast.emit('new_ride_requested', rideData);

    // Add a 3-minute timeout to expire the request if no driver accepts
    const timeoutId = setTimeout(async () => {
      try {
        const rideRes = await db.query('SELECT status FROM rides WHERE id = $1', [rideId]);
        if (rideRes.rows.length > 0 && rideRes.rows[0].status === 'requested') {
          console.log(`⏰ Ride ${rideId} timed out after 3 minutes. Automarking as cancelled.`);
          await db.query("UPDATE rides SET status = 'cancelled', cancelled_by = 'system', driver_penalty = 0 WHERE id = $1", [rideId]);
          
          // Notify the rider
          io.to(`user_${riderId}`).emit('ride_timeout', { rideId });
          
          // Tell all drivers to remove it from their screen
          socket.broadcast.emit('ride_unavailable', { rideId });
        }
      } catch (err) {
        console.error('Timeout check error:', err.message);
      }
    }, 3 * 60 * 1000); // 3 minutes

    registerSimTracker(rideId, 'timeout', timeoutId);
  });

  // Driver explicitly accepts a ride
  socket.on('accept_ride', async (data) => {
    const { rideId } = data;
    const driverId = socket.user.id;
    try {
      console.log(`✅ Driver ${driverId} accepting Ride ${rideId}`);
      
      const rideRes = await db.query('SELECT * FROM rides WHERE id = $1', [rideId]);
      if (rideRes.rows.length === 0) return;
      const ride = rideRes.rows[0];

      if (ride.status !== 'requested') return; // Someone else got it or it was cancelled

      const driverRes = await db.query('SELECT d.*, u.name, u.rating FROM drivers d JOIN users u ON d.user_id = u.id WHERE d.user_id = $1', [driverId]);
      if (driverRes.rows.length === 0) return;
      const driver = driverRes.rows[0];

      // Security: Strict matching rules
      const isAmbulanceDriver = driver.service_category === 'ambulance' || driver.vehicle_type === 'ambulance';
      if (ride.service_category === 'ambulance' && !isAmbulanceDriver) {
        return socket.emit('ride_error', { message: 'Unauthorized: Only Ambulance drivers can accept this request.' });
      }
      if (ride.service_category === 'food') {
        if (driver.vehicle_type !== 'bike') return socket.emit('ride_error', { message: 'Unauthorized: Only bike riders can deliver food.' });
      }
      if (ride.service_category === 'parcel') {
        if (ride.vehicle_preference === 'bike' && driver.vehicle_type !== 'bike') {
          return socket.emit('ride_error', { message: 'Unauthorized: Parcel <= 25kg requires a Bike.' });
        }
        if (ride.vehicle_preference === 'cab' && driver.vehicle_type === 'bike') {
          return socket.emit('ride_error', { message: 'Unauthorized: Parcel > 25kg requires a Cab.' });
        }
      }
      if (ride.service_category === 'ride') {
        if (driver.service_category !== 'ride') return socket.emit('ride_error', { message: 'Unauthorized: Incorrect service category.' });
        if (ride.vehicle_preference === 'bike' && driver.vehicle_type !== 'bike') return socket.emit('ride_error', { message: 'Unauthorized: Rider requested a bike.' });
        if (ride.vehicle_preference !== 'any' && ride.vehicle_preference !== 'bike' && driver.vehicle_type !== ride.vehicle_preference && driver.vehicle_type !== 'cab') {
           return socket.emit('ride_error', { message: `Unauthorized: Rider requested ${ride.vehicle_preference} cab.` });
        }
      }

      // Update ride
      await db.query("UPDATE rides SET status = 'accepted', driver_id = $1 WHERE id = $2", [driverId, rideId]);
      // Update driver to unavailable
      await db.query("UPDATE drivers SET is_available = false WHERE user_id = $1", [driverId]);

      const updatedRide = {
        id: ride.id,
        refId: ride.ref_id,
        riderId: ride.rider_id,
        serviceCategory: ride.service_category,
        pickupAddress: ride.pickup_address,
        dropoffAddress: ride.dropoff_address,
        pickupLat: parseFloat(ride.pickup_lat),
        pickupLng: parseFloat(ride.pickup_lng),
        dropoffLat: parseFloat(ride.dropoff_lat),
        dropoffLng: parseFloat(ride.dropoff_lng),
        fare: parseFloat(ride.fare),
        status: 'accepted',
        paymentMode: ride.payment_mode,
        paymentStatus: ride.payment_status,
        driverId: driverId,
        driverName: driver.name,
        driverRating: parseFloat(driver.rating),
        vehicleName: driver.vehicle_name,
        vehicleNumber: driver.vehicle_number,
        vehicleType: driver.vehicle_type,
        driverLat: parseFloat(driver.latitude),
        driverLng: parseFloat(driver.longitude),
        otp: ride.otp
      };

      // Notify passenger and driver
      io.to(`user_${ride.rider_id}`).emit('ride_status_update', { ride: updatedRide });
      io.to(`user_${driverId}`).emit('ride_status_update', { ride: updatedRide });
      
      // Notify all other drivers that the ride was taken so their screens unblock
      socket.broadcast.emit('ride_unavailable', { rideId });
      io.emit('drivers_changed');

    } catch (err) {
      console.error('Accept Ride Error:', err.message);
    }
  });

  // Driver updates ride status
  socket.on('update_ride_status', async (data) => {
    const { rideId, status, otp } = data;
    try {
      console.log(`🔄 Ride ${rideId} status updated to ${status}`);
      
      if (status === 'started') {
        const rideCheck = await db.query("SELECT otp FROM rides WHERE id = $1", [rideId]);
        if (rideCheck.rows.length > 0 && rideCheck.rows[0].otp && rideCheck.rows[0].otp !== otp) {
          socket.emit('ride_error', { message: 'Invalid OTP. Please ask the rider for the correct PIN.' });
          return;
        }
      }
      
      let queryStr = "UPDATE rides SET status = $1 WHERE id = $2 RETURNING *";
      let queryParams = [status, rideId];

      if (status === 'cancelled') {
        // Driver cancelled it. Apply 3% penalty to driver's future earnings
        queryStr = "UPDATE rides SET status = $1, cancelled_by = 'driver', driver_penalty = (fare * 0.03) WHERE id = $2 RETURNING *";
      }

      await db.query(queryStr, queryParams);
      
      const rideRes = await db.query(
        `SELECT r.*, u_driver.name as driver_name, u_driver.rating as driver_rating, 
                d.vehicle_name, d.vehicle_number, d.vehicle_type, 
                d.latitude as driver_lat, d.longitude as driver_lng 
         FROM rides r 
         LEFT JOIN users u_driver ON r.driver_id = u_driver.id 
         LEFT JOIN drivers d ON r.driver_id = d.user_id 
         WHERE r.id = $1`, 
        [rideId]
      );
      if (rideRes.rows.length === 0) return;
      const row = rideRes.rows[0];

      // If completed, free driver
      if (status === 'completed') {
        await db.query("UPDATE drivers SET is_available = true WHERE user_id = $1", [row.driver_id]);
        io.emit('drivers_changed');
      }

      const updatedRide = {
        id: row.id,
        refId: row.ref_id,
        riderId: row.rider_id,
        serviceCategory: row.service_category,
        pickupAddress: row.pickup_address,
        dropoffAddress: row.dropoff_address,
        pickupLat: parseFloat(row.pickup_lat),
        pickupLng: parseFloat(row.pickup_lng),
        dropoffLat: parseFloat(row.dropoff_lat),
        dropoffLng: parseFloat(row.dropoff_lng),
        fare: parseFloat(row.fare),
        status: row.status,
        paymentMode: row.payment_mode,
        paymentStatus: row.payment_status,
        driverId: row.driver_id,
        driverName: row.driver_name,
        driverRating: row.driver_rating ? parseFloat(row.driver_rating) : null,
        vehicleName: row.vehicle_name,
        vehicleNumber: row.vehicle_number,
        vehicleType: row.vehicle_type,
        driverLat: row.driver_lat ? parseFloat(row.driver_lat) : null,
        driverLng: row.driver_lng ? parseFloat(row.driver_lng) : null,
        otp: row.otp
      };

      // Notify passenger and driver
      io.to(`user_${row.rider_id}`).emit('ride_status_update', { ride: updatedRide });
      io.to(`user_${row.driver_id}`).emit('ride_status_update', { ride: updatedRide });

    } catch (err) {
      console.error('Update Ride Status Error:', err.message);
    }
  });

  // Client cancels an active ride
  socket.on('cancel_ride', async (data) => {
    const { rideId, userId } = data;
    console.log(`❌ Ride ${rideId} cancellation requested by User ${userId}`);

    try {
      // 1. Fetch current ride state
      const rideRes = await db.query('SELECT * FROM rides WHERE id = $1', [rideId]);
      if (rideRes.rows.length === 0) return;
      const ride = rideRes.rows[0];

      // 2. Abort running simulation loops
      clearSimulation(rideId);

      // 3. Update ride status in DB
      await db.query("UPDATE rides SET status = 'cancelled', cancelled_by = 'rider', driver_penalty = 0 WHERE id = $1", [rideId]);

      // 4. Refund to Wallet if paid digitally
      if (ride.payment_mode === 'digital' && ride.status !== 'cancelled') {
        await db.query("UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2", [ride.fare, ride.rider_id]);
        console.log(`💸 Refunded ₹${ride.fare} to rider ${ride.rider_id}'s wallet.`);
        // Note: The frontend should fetch updated user details to see the new wallet balance
      }

      // 5. Free the driver if assigned
      if (ride.driver_id) {
        await db.query("UPDATE drivers SET is_available = true WHERE user_id = $1", [ride.driver_id]);
        
        // Notify the driver that the ride was cancelled
        io.to(`user_${ride.driver_id}`).emit('ride_cancelled', {
          rideId,
          message: '🚨 The passenger has cancelled this ride request.'
        });
      }

      // 5. Notify the rider room
      const cancelledRide = { ...ride, status: 'cancelled' };
      io.to(`user_${ride.rider_id}`).emit('ride_status_update', { ride: cancelledRide });
      
      // Update public maps
      io.emit('drivers_changed');
      console.log(`✅ Ride ${rideId} successfully cancelled.`);

    } catch (err) {
      console.error('Cancel Ride Socket Error:', err.message);
    }
  });

  // Client updates location (primarily driver)
  socket.on('update_location', async (data) => {
    const { latitude, longitude } = data;
    const userId = socket.user.id;
    try {
      await db.query('UPDATE drivers SET latitude = $1, longitude = $2 WHERE user_id = $3', [
        latitude,
        longitude,
        userId
      ]);
      // Notify riders if there is an active ride
      io.emit('driver_location_changed', { driverId: userId, latitude, longitude });
    } catch (err) {
      console.error('Location update error:', err.message);
    }
  });

  // Chat System: Send Message
  socket.on('send_chat_message', async (data) => {
    const { rideId, senderId, receiverId, text } = data;
    try {
      // Save to database
      const res = await db.query(
        'INSERT INTO chat_messages (ride_id, sender_id, message_text) VALUES ($1, $2, $3) RETURNING *',
        [rideId, senderId, text]
      );
      const msg = res.rows[0];

      // Broadcast to both parties so their UI updates
      io.to(`user_${senderId}`).emit('receive_chat_message', msg);
      if (receiverId) {
        io.to(`user_${receiverId}`).emit('receive_chat_message', msg);
      }
    } catch (err) {
      console.error('Chat error:', err.message);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('🔌 Client socket disconnected:', socket.id);
    
    // Find who disconnected
    for (const [userId, socketId] of activeConnections.entries()) {
      if (socketId === socket.id) {
        activeConnections.delete(userId);
        console.log(`👤 User ${userId} disconnected`);
        
        // Mark driver offline
        db.query('SELECT role FROM users WHERE id = $1', [userId])
          .then(res => {
            if (res.rows.length > 0 && res.rows[0].role === 'driver') {
              db.query('UPDATE drivers SET is_online = false WHERE user_id = $1', [userId])
                .then(() => {
                  console.log(`🚗 Driver ${userId} is now OFFLINE`);
                  io.emit('drivers_changed');
                });
            }
          })
          .catch(err => console.error('Error on driver disconnect cleanup:', err.message));
        
        break;
      }
    }
  });
});

// Trip simulation logic completely removed to enable real manual driver mode

// Start Server
const PORT = process.env.PORT || 5000;
db.initDb().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 BharatOne API + Socket Server running on port ${PORT}`);
    console.log(`💡 Mode: ${db.getUseFallback() ? 'In-Memory Simulation' : 'PostgreSQL Database Connection'}`);
  });
});
