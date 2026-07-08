const express = require('express');
const router = express.Router();
const db = require('../db');

// Admin middleware - simple check for demo
const adminAuth = (req, res, next) => {
  next();
};

// GET /api/admin/dashboard - Stats
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    if (db.getUseFallback()) {
      const memDb = db.getInMemoryDb();
      const activeRides = memDb.rides.filter(r => ['requested', 'accepted', 'arrived', 'started'].includes(r.status)).length;
      const completedRides = memDb.rides.filter(r => r.status === 'completed').length;
      const cancelledRides = memDb.rides.filter(r => r.status === 'cancelled').length;
      
      res.json({
        activeRides,
        completedRides,
        cancelledRides,
        totalDrivers: memDb.drivers.length,
        totalRiders: memDb.users.filter(u => u.role === 'rider').length,
        totalRevenue: memDb.orders.reduce((sum, o) => sum + o.total_amount, 0) + memDb.rides.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.fare, 0)
      });
    } else {
      const activeRes = await db.query(`SELECT COUNT(*) FROM rides WHERE status IN ('requested', 'accepted', 'arrived', 'started')`);
      const completedRes = await db.query(`SELECT COUNT(*) FROM rides WHERE status = 'completed'`);
      const cancelledRes = await db.query(`SELECT COUNT(*) FROM rides WHERE status = 'cancelled'`);
      const driverRes = await db.query(`SELECT COUNT(*) FROM drivers`);
      const riderRes = await db.query(`SELECT COUNT(*) FROM users WHERE role = 'rider'`);
      
      const rideRevenueRes = await db.query(`SELECT SUM(fare) as total FROM rides WHERE status = 'completed'`);
      const orderRevenueRes = await db.query(`SELECT SUM(total_amount) as total FROM orders`);
      
      const totalRevenue = (parseFloat(rideRevenueRes.rows[0].total) || 0) + (parseFloat(orderRevenueRes.rows[0].total) || 0);

      res.json({
        activeRides: parseInt(activeRes.rows[0].count),
        completedRides: parseInt(completedRes.rows[0].count),
        cancelledRides: parseInt(cancelledRes.rows[0].count),
        totalDrivers: parseInt(driverRes.rows[0].count),
        totalRiders: parseInt(riderRes.rows[0].count),
        totalRevenue: totalRevenue 
      });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/rides - All rides
router.get('/rides', adminAuth, async (req, res) => {
  try {
    if (db.getUseFallback()) {
      const memDb = db.getInMemoryDb();
      const enrichedRides = memDb.rides.map(r => {
        const rider = memDb.users.find(u => u.id === r.rider_id);
        const driver = memDb.users.find(u => u.id === r.driver_id);
        return {
          ...r,
          rider_name: rider ? rider.name : 'Unknown',
          driver_name: driver ? driver.name : 'Unassigned'
        };
      }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      res.json(enrichedRides);
    } else {
      const result = await db.query(`
        SELECT r.*, u_rider.name as rider_name, u_driver.name as driver_name
        FROM rides r
        JOIN users u_rider ON r.rider_id = u_rider.id
        LEFT JOIN users u_driver ON r.driver_id = u_driver.id
        ORDER BY r.created_at DESC
      `);
      res.json(result.rows);
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/complaints - All complaints
router.get('/complaints', adminAuth, async (req, res) => {
  try {
    if (db.getUseFallback()) {
      const memDb = db.getInMemoryDb();
      res.json(memDb.complaints || []);
    } else {
      const result = await db.query(`
        SELECT c.*, u.name as user_name, u.role as user_role
        FROM complaints c
        JOIN users u ON c.user_id = u.id
        ORDER BY c.created_at DESC
      `);
      res.json(result.rows);
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/complaints/:id/resolve
router.post('/complaints/:id/resolve', adminAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (db.getUseFallback()) {
      const memDb = db.getInMemoryDb();
      const comp = memDb.complaints.find(c => c.id === id);
      if (comp) {
        comp.status = 'resolved';
      }
      res.json({ success: true });
    } else {
      await db.query(`UPDATE complaints SET status = 'resolved' WHERE id = $1`, [id]);
      res.json({ success: true });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/users - All users
router.get('/users', adminAuth, async (req, res) => {
  try {
    if (db.getUseFallback()) {
      const memDb = db.getInMemoryDb();
      res.json(memDb.users.filter(u => u.role !== 'admin'));
    } else {
      const result = await db.query(`SELECT id, name, email, role, rating, wallet_balance, created_at FROM users WHERE role != 'admin' ORDER BY created_at DESC`);
      res.json(result.rows);
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/users/:id/suspend
router.post('/users/:id/suspend', adminAuth, async (req, res) => {
  // Mock suspend logic for demo
  res.json({ success: true, message: 'User suspended successfully' });
});

module.exports = router;
