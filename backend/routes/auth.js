const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const auth = require('../middleware/auth');

require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET || 'cabride-super-secret-key-change-in-prod';

// @route   POST /api/auth/register
// @desc    Register a rider or driver
router.post('/register', async (req, res) => {
  const { name, email, password, role, vehicleName, vehicleType, vehicleNumber } = req.body;

  // Basic validation
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Please enter all required fields' });
  }

  if (role !== 'rider' && role !== 'driver') {
    return res.status(400).json({ error: 'Role must be either rider or driver' });
  }

  if (role === 'driver' && (!vehicleName || !vehicleType || !vehicleNumber)) {
    return res.status(400).json({ error: 'Drivers must provide vehicle details' });
  }

  try {
    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Save user
    const userRes = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, rating, created_at',
      [name, email, passwordHash, role]
    );

    const user = userRes.rows[0];

    // If driver, save vehicle details
    if (role === 'driver') {
      const driverServiceCategory = req.body.serviceCategory || 'ride';
      await db.query(
        'INSERT INTO drivers (user_id, service_category, vehicle_name, vehicle_type, vehicle_number) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [user.id, driverServiceCategory, vehicleName, vehicleType, vehicleNumber]
      );
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        rating: parseFloat(user.rating),
        createdAt: user.created_at
      }
    });

  } catch (err) {
    console.error('Registration Error:', err.message);
    if (err.message.includes('unique constraint') || err.message.includes('users_email_key')) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter all fields' });
  }

  try {
    // Fetch user
    const userRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user = userRes.rows[0];

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Fetch driver details if driver
    let driverDetails = null;
    if (user.role === 'driver') {
      const driverRes = await db.query('SELECT * FROM drivers WHERE user_id = $1', [user.id]);
      if (driverRes.rows.length > 0) {
        driverDetails = driverRes.rows[0];
      }
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        rating: parseFloat(user.rating),
        driverDetails: driverDetails ? {
          serviceCategory: driverDetails.service_category,
          vehicleName: driverDetails.vehicle_name,
          vehicleType: driverDetails.vehicle_type,
          vehicleNumber: driverDetails.vehicle_number,
          isOnline: driverDetails.is_online,
          isAvailable: driverDetails.is_available,
          latitude: driverDetails.latitude,
          longitude: driverDetails.longitude
        } : null
      }
    });

  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// @route   GET /api/auth/profile
// @desc    Get user profile data (requires token)
router.get('/profile', auth, async (req, res) => {
  try {
    const userRes = await db.query(
      'SELECT u.*, d.service_category, d.vehicle_name, d.vehicle_type, d.vehicle_number, d.is_online, d.is_available, d.latitude, d.longitude FROM users u LEFT JOIN drivers d ON u.id = d.user_id WHERE u.id = $1',
      [req.user.id]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const row = userRes.rows[0];
    res.json({
      user: {
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        rating: parseFloat(row.rating),
        createdAt: row.created_at,
        driverDetails: row.role === 'driver' ? {
          serviceCategory: row.service_category,
          vehicleName: row.vehicle_name,
          vehicleType: row.vehicle_type,
          vehicleNumber: row.vehicle_number,
          isOnline: row.is_online,
          isAvailable: row.is_available,
          latitude: row.latitude,
          longitude: row.longitude
        } : null
      }
    });

  } catch (err) {
    console.error('Profile Error:', err.message);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

module.exports = router;
