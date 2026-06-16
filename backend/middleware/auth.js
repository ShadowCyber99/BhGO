const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'cabride-super-secret-key-change-in-prod';

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization token, access denied' });
  }

  // Parse Bearer Token
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Token format is invalid, must be Bearer <token>' });
  }

  const token = parts[1];

  if (!token || token === 'null' || token === 'undefined') {
    return res.status(401).json({ error: 'Token is missing or improperly formatted' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email
    };
    next();
  } catch (err) {
    console.error('JWT Verification Error:', err.message);
    res.status(401).json({ error: 'Token is invalid or has expired' });
  }
};

module.exports = authMiddleware;
