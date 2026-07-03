const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ msg: 'Access denied. Admins only.' });
  }
};

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private (Admin only)
router.get('/stats', [auth, isAdmin], async (req, res) => {
  try {
    // 1. Get total riders
    const ridersRes = await db.query("SELECT COUNT(*) FROM users WHERE role = 'rider'");
    const totalRiders = parseInt(ridersRes.rows[0].count);

    // 2. Get total and active drivers
    const driversRes = await db.query("SELECT COUNT(*) FROM users WHERE role = 'driver'");
    const totalDrivers = parseInt(driversRes.rows[0].count);
    
    const activeDriversRes = await db.query("SELECT COUNT(*) FROM drivers WHERE is_online = true");
    const activeDrivers = parseInt(activeDriversRes.rows[0].count);

    // 3. Get total revenue (10% of completed ride fares for platform)
    const revenueRes = await db.query("SELECT SUM(fare) FROM rides WHERE status = 'completed'");
    const totalFare = parseFloat(revenueRes.rows[0].sum || 0);
    const platformRevenue = totalFare * 0.10;

    // 4. Get recent 5 rides
    const recentRidesRes = await db.query(`
      SELECT r.id, r.ref_id, r.status, r.fare, r.service_category, r.created_at, u.name as rider_name 
      FROM rides r 
      JOIN users u ON r.rider_id = u.id 
      ORDER BY r.created_at DESC 
      LIMIT 5
    `);

    res.json({
      metrics: {
        totalRiders,
        totalDrivers,
        activeDrivers,
        platformRevenue: platformRevenue.toFixed(2)
      },
      recentRides: recentRidesRes.rows
    });

  } catch (err) {
    console.error('Admin Stats Error:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
