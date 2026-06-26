const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const auth = require('../middleware/auth');

require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET || 'cabride-super-secret-key-change-in-prod';

// @route   POST /api/auth/register
// @desc    Register a rider or driver
router.post('/register', [
  body('name', 'Name is required and must be max 50 characters').not().isEmpty().trim().escape().isLength({ max: 50 }),
  body('email', 'Please include a valid email').isEmail().normalizeEmail(),
  body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  body('role', 'Role must be either rider or driver').isIn(['rider', 'driver']),
  body('vehicleName', 'Vehicle name is required for drivers').if(body('role').equals('driver')).not().isEmpty().trim().escape(),
  body('vehicleType', 'Vehicle type is required for drivers').if(body('role').equals('driver')).not().isEmpty().trim().escape(),
  body('vehicleNumber', 'Please enter a valid Indian number plate (e.g. MH 12 AB 1234)').if(body('role').equals('driver')).matches(/^[A-Z]{2}[ -]?[0-9]{1,2}[ -]?[A-Z]{1,2}[ -]?[0-9]{4}$/i),
  body('aadharNumber', 'Aadhar Number must be exactly 12 digits').if(body('role').equals('driver')).matches(/^\d{12}$/),
  body('drivingLicense', 'Driving License must be up to 16 characters').if(body('role').equals('driver')).isLength({ min: 5, max: 16 }).trim().escape()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return first error message to match frontend expectations
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { name, email, password, role, vehicleName, vehicleType, vehicleNumber, aadharNumber, drivingLicense } = req.body;

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
        'INSERT INTO drivers (user_id, service_category, vehicle_name, vehicle_type, vehicle_number, aadhar_number, driving_license) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [user.id, driverServiceCategory, vehicleName, vehicleType, vehicleNumber, aadharNumber, drivingLicense]
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
router.post('/login', [
  body('email', 'Please include a valid email').isEmail().normalizeEmail(),
  body('password', 'Password is required').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { email, password } = req.body;

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
