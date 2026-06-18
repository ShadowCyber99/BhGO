const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../db');
const auth = require('../middleware/auth');

// @route   GET /api/rides/drivers
// @desc    Get nearby online and available drivers
router.get('/drivers', auth, async (req, res) => {
  try {
    const service = req.query.service || 'ride';
    const driversRes = await db.query(
      'SELECT d.*, u.name, u.rating FROM drivers d JOIN users u ON d.user_id = u.id WHERE d.is_online = true AND d.is_available = true AND (d.service_category = $1 OR d.service_category = \'all\')',
      [service]
    );
    
    // Map db names to camelCase for the React Native frontend
    const drivers = driversRes.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      rating: parseFloat(row.rating),
      serviceCategory: row.service_category,
      vehicleName: row.vehicle_name,
      vehicleType: row.vehicle_type,
      vehicleNumber: row.vehicle_number,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude)
    }));

    res.json(drivers);
  } catch (err) {
    console.error('Fetch Drivers Error:', err.message);
    res.status(500).json({ error: 'Server error fetching active drivers' });
  }
});

// @route   POST /api/rides/request
// @desc    Create a new ride request
router.post('/request', auth, [
  body('serviceCategory', 'Invalid service category').not().isEmpty().trim().escape(),
  body('pickupAddress', 'Pickup address is required').not().isEmpty().trim().escape(),
  body('dropoffAddress', 'Dropoff address is required').not().isEmpty().trim().escape(),
  body('pickupLat', 'Valid pickup latitude is required').isFloat({ min: -90, max: 90 }),
  body('pickupLng', 'Valid pickup longitude is required').isFloat({ min: -180, max: 180 }),
  body('dropoffLat', 'Valid dropoff latitude is required').isFloat({ min: -90, max: 90 }),
  body('dropoffLng', 'Valid dropoff longitude is required').isFloat({ min: -180, max: 180 }),
  body('fare', 'Fare must be a positive number').isFloat({ min: 0.1 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { serviceCategory, vehiclePreference, pickupAddress, dropoffAddress, pickupLat, pickupLng, dropoffLat, dropoffLng, fare, paymentMode } = req.body;

  try {
    const crypto = require('crypto');
    const ref_id = 'REF-' + crypto.randomBytes(3).toString('hex').toUpperCase() + Math.floor(Math.random()*1000);

    // Insert new ride request
    const rideRes = await db.query(
      `INSERT INTO rides (ref_id, rider_id, service_category, vehicle_preference, pickup_address, dropoff_address, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, fare, status, payment_mode) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'requested', $12) 
       RETURNING *`,
      [ref_id, req.user.id, serviceCategory, vehiclePreference || 'any', pickupAddress, dropoffAddress, pickupLat, pickupLng, dropoffLat, dropoffLng, fare, paymentMode || 'digital']
    );

    const ride = rideRes.rows[0];

    res.status(201).json({
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
      status: ride.status,
      paymentMode: ride.payment_mode,
      paymentStatus: ride.payment_status,
      createdAt: ride.created_at
    });

  } catch (err) {
    console.error('Request Ride Error:', err.message);
    res.status(500).json({ error: 'Server error creating ride request' });
  }
});

// @route   GET /api/rides/active
// @desc    Get currently active ride for rider or driver
router.get('/active', auth, async (req, res) => {
  try {
    const activeRes = await db.query(
      `SELECT r.*, 
              u_rider.name as rider_name,
              u_driver.name as driver_name, u_driver.rating as driver_rating,
              d.vehicle_name, d.vehicle_type, d.vehicle_number,
              d.latitude as driver_lat, d.longitude as driver_lng,
              o.items_json, o.total_amount
       FROM rides r
       JOIN users u_rider ON r.rider_id = u_rider.id
       LEFT JOIN users u_driver ON r.driver_id = u_driver.id
       LEFT JOIN drivers d ON r.driver_id = d.user_id
       LEFT JOIN orders o ON r.id = o.ride_id
       WHERE (r.rider_id = $1 OR r.driver_id = $1) 
         AND r.status IN ('requested', 'accepted', 'arrived', 'started')
       ORDER BY r.created_at DESC LIMIT 1`,
      [req.user.id]
    );

    if (activeRes.rows.length === 0) {
      return res.json({ ride: null });
    }

    const row = activeRes.rows[0];
    res.json({
      ride: {
        id: row.id,
        refId: row.ref_id,
        riderId: row.rider_id,
        riderName: row.rider_name,
        driverId: row.driver_id,
        driverName: row.driver_name,
        driverRating: row.driver_rating ? parseFloat(row.driver_rating) : null,
        serviceCategory: row.service_category,
        vehicleName: row.vehicle_name,
        vehicleType: row.vehicle_type,
        vehicleNumber: row.vehicle_number,
        pickupAddress: row.pickup_address,
        dropoffAddress: row.dropoff_address,
        pickupLat: parseFloat(row.pickup_lat),
        pickupLng: parseFloat(row.pickup_lng),
        dropoffLat: parseFloat(row.dropoff_lat),
        dropoffLng: parseFloat(row.dropoff_lng),
        driverLat: row.driver_lat ? parseFloat(row.driver_lat) : null,
        driverLng: row.driver_lng ? parseFloat(row.driver_lng) : null,
        fare: parseFloat(row.fare),
        status: row.status,
        payment_status: row.payment_status,
        payment_mode: row.payment_mode,
        itemsJson: row.items_json ? row.items_json : null,
        orderTotal: row.total_amount ? parseFloat(row.total_amount) : null,
        createdAt: row.created_at
      }
    });

  } catch (err) {
    console.error('Fetch Active Ride Error:', err.message);
    res.status(500).json({ error: 'Server error fetching active ride' });
  }
});

// @route   GET /api/rides/history
// @desc    Get ride history for rider or driver
router.get('/history', auth, async (req, res) => {
  try {
    const historyRes = await db.query(
      `SELECT r.*, 
              u_rider.name as rider_name,
              u_driver.name as driver_name
       FROM rides r
       JOIN users u_rider ON r.rider_id = u_rider.id
       LEFT JOIN users u_driver ON r.driver_id = u_driver.id
       WHERE r.rider_id = $1 OR r.driver_id = $1
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );

    const history = historyRes.rows.map(row => ({
      id: row.id,
      refId: row.ref_id,
      serviceCategory: row.service_category,
      pickupAddress: row.pickup_address,
      dropoffAddress: row.dropoff_address,
      fare: parseFloat(row.fare),
      status: row.status,
      payment_status: row.payment_status,
      payment_mode: row.payment_mode,
      riderName: row.rider_name,
      driverName: row.driver_name || 'Unassigned',
      createdAt: row.created_at
    }));

    res.json(history);
  } catch (err) {
    console.error('Fetch History Error:', err.message);
    res.status(500).json({ error: 'Server error fetching ride history' });
  }
});

// @route   GET /api/rides/driver/earnings
// @desc    Get aggregate earnings for driver based on category cuts
router.get('/driver/earnings', auth, async (req, res) => {
  try {
    const earningsRes = await db.query(
      `SELECT service_category, SUM(fare) as total_fare, COUNT(*) as ride_count
       FROM rides 
       WHERE driver_id = $1 AND status = 'completed'
       GROUP BY service_category`,
      [req.user.id]
    );

    const penaltyRes = await db.query(
      `SELECT SUM(driver_penalty) as total_penalty FROM rides WHERE driver_id = $1`,
      [req.user.id]
    );
    const totalPenalties = parseFloat(penaltyRes.rows[0].total_penalty || 0);

    let totalEarnings = 0;
    const breakdown = earningsRes.rows.map(row => {
      const cat = row.service_category;
      const gross = parseFloat(row.total_fare);
      let cutMultiplier = 0.8; // Default 80% for ride
      if (cat === 'ambulance') cutMultiplier = 0.95;
      else if (cat === 'parcel') cutMultiplier = 0.85;
      else if (cat === 'food') cutMultiplier = 0.90;
      
      const net = gross * cutMultiplier;
      totalEarnings += net;

      return {
        category: cat,
        gross: gross,
        net: net,
        rides: parseInt(row.ride_count),
        cutPercentage: cutMultiplier * 100
      };
    });

    totalEarnings = totalEarnings - totalPenalties;

    const weeklyRes = await db.query(
      `SELECT DATE(created_at) as date, SUM(fare) as daily_fare
       FROM rides
       WHERE driver_id = $1 AND status = 'completed' AND created_at >= NOW() - INTERVAL '7 days'
       GROUP BY DATE(created_at)
       ORDER BY DATE(created_at) ASC`,
      [req.user.id]
    );

    const weeklyStats = weeklyRes.rows.map(r => {
      // Create a nice short date like "Mon 12"
      const d = new Date(r.date);
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return {
        label: `${days[d.getDay()]} ${d.getDate()}`,
        earnings: parseFloat(r.daily_fare) * 0.85 // generic cut average for chart
      };
    });

    res.json({ totalEarnings, totalPenalties, breakdown, weeklyStats });
  } catch (err) {
    console.error('Fetch Earnings Error:', err.message);
    res.status(500).json({ error: 'Server error fetching earnings' });
  }
});

// @route   GET /api/rides/ref/:refId
// @desc    Get ride details by unique ref_id
router.get('/ref/:refId', auth, async (req, res) => {
  try {
    const rideRes = await db.query(
      `SELECT r.*, 
              u_rider.name as rider_name,
              u_driver.name as driver_name
       FROM rides r
       JOIN users u_rider ON r.rider_id = u_rider.id
       LEFT JOIN users u_driver ON r.driver_id = u_driver.id
       WHERE r.ref_id = $1 AND r.rider_id = $2`,
      [req.params.refId, req.user.id]
    );

    if (rideRes.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found or unauthorized' });
    }

    const row = rideRes.rows[0];
    res.json({
      id: row.id,
      refId: row.ref_id,
      serviceCategory: row.service_category,
      pickupAddress: row.pickup_address,
      dropoffAddress: row.dropoff_address,
      fare: parseFloat(row.fare),
      status: row.status,
      payment_status: row.payment_status,
      payment_mode: row.payment_mode,
      riderName: row.rider_name,
      driverName: row.driver_name || 'Unassigned',
      createdAt: row.created_at
    });
  } catch (err) {
    console.error('Fetch by Ref ID Error:', err.message);
    res.status(500).json({ error: 'Server error fetching booking by ref ID' });
  }
});

// @route   GET /api/rides/restaurants
// @desc    Get list of available restaurants for Food Delivery
router.get('/restaurants', auth, async (req, res) => {
  try {
    const rRes = await db.query('SELECT * FROM restaurants');
    res.json(rRes.rows);
  } catch (err) {
    console.error('Restaurants Error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/rides/restaurants/:id/menu
// @desc    Get menu items for a specific restaurant
router.get('/restaurants/:id/menu', auth, async (req, res) => {
  try {
    const mRes = await db.query('SELECT * FROM menu_items WHERE restaurant_id = $1', [req.params.id]);
    res.json(mRes.rows);
  } catch (err) {
    console.error('Menu Error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/rides/order
// @desc    Create a new food delivery order
router.post('/order', auth, async (req, res) => {
  try {
    const { rideId, restaurantId, totalAmount, itemsJson } = req.body;
    const orderRes = await db.query(
      'INSERT INTO orders (ride_id, restaurant_id, total_amount, items_json) VALUES ($1, $2, $3, $4) RETURNING *',
      [rideId, restaurantId, totalAmount, JSON.stringify(itemsJson)]
    );
    res.status(201).json(orderRes.rows[0]);
  } catch (err) {
    console.error('Order Error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/rides/:id/chat
// @desc    Get chat history for a ride
router.get('/:id/chat', auth, async (req, res) => {
  try {
    const chatRes = await db.query('SELECT * FROM chat_messages WHERE ride_id = $1 ORDER BY created_at ASC', [req.params.id]);
    res.json(chatRes.rows);
  } catch (err) {
    console.error('Chat History Error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/rides/:id/refund
// @desc    Manually claim a refund for a cancelled ride
router.post('/:id/refund', auth, async (req, res) => {
  try {
    const rideId = req.params.id;
    // Check if ride is actually cancelled and paid by digital mode
    const rideRes = await db.query('SELECT * FROM rides WHERE id = $1 AND rider_id = $2', [rideId, req.user.id]);
    if (rideRes.rows.length === 0) return res.status(404).json({ error: 'Ride not found' });
    
    const ride = rideRes.rows[0];
    if (ride.status !== 'cancelled') return res.status(400).json({ error: 'Trip must be cancelled to claim refund' });
    if (ride.payment_mode !== 'digital') return res.status(400).json({ error: 'Only digital payments can be refunded' });
    if (ride.payment_status === 'refunded') return res.status(400).json({ error: 'Refund already processed' });

    // Calculate 3% penalty
    const originalAmount = parseFloat(ride.fare);
    let penaltyAmount = 0;
    if (ride.cancelled_by === 'rider' || !ride.cancelled_by) {
      penaltyAmount = originalAmount * 0.03;
    }
    const refundedAmount = originalAmount - penaltyAmount;
    
    const crypto = require('crypto');
    const invoiceId = 'INV-RFND-' + crypto.randomBytes(4).toString('hex').toUpperCase();

    await db.query("UPDATE rides SET payment_status = 'refunded' WHERE id = $1", [rideId]);
    res.json({ 
      success: true, 
      message: ride.cancelled_by === 'driver' ? 'Full Refund Processed (Driver Cancelled)' : 'Refund Processed with 3% Cancellation Penalty',
      invoice: {
        invoiceId,
        originalAmount: originalAmount.toFixed(2),
        penaltyAmount: penaltyAmount.toFixed(2),
        refundedAmount: refundedAmount.toFixed(2),
        date: new Date()
      }
    });
  } catch (err) {
    console.error('Refund Error:', err.message);
    res.status(500).json({ error: 'Server error during refund claim' });
  }
});

// @route   POST /api/rides/:id/review
// @desc    Submit detailed driver rating and review after ride completion
router.post('/:id/review', auth, async (req, res) => {
  try {
    const { rating, tags, comment, driverId } = req.body;
    const rideId = req.params.id;
    const riderId = req.user.id;

    // Insert the review
    await db.query(
      'INSERT INTO reviews (ride_id, driver_id, rider_id, rating, tags, comment) VALUES ($1, $2, $3, $4, $5, $6)',
      [rideId, driverId, riderId, rating, JSON.stringify(tags || []), comment]
    );

    // Calculate new average rating for the driver
    const avgRes = await db.query(
      'SELECT AVG(rating) as avg_rating FROM reviews WHERE driver_id = $1',
      [driverId]
    );
    
    let newAvg = parseFloat(avgRes.rows[0].avg_rating);
    if (!isNaN(newAvg)) {
      await db.query('UPDATE users SET rating = $1 WHERE id = $2', [newAvg.toFixed(2), driverId]);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Review Error:', err.message);
    res.status(500).json({ error: 'Server error submitting review' });
  }
});

module.exports = router;
