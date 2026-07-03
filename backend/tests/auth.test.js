const request = require('supertest');
const express = require('express');
const authRoutes = require('../routes/auth');
const db = require('../db');

// Mock the DB module
jest.mock('../db', () => ({
  query: jest.fn()
}));

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return error for invalid registration data', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: '', // Invalid empty name
        email: 'invalid-email',
        password: '123', // Too short
        role: 'invalid_role'
      });
    
    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toBeDefined();
  });

  it('should successfully register a valid rider', async () => {
    // Mock the db.query for checking existing user (returns 0 rows)
    db.query.mockResolvedValueOnce({ rows: [] });
    
    // Mock the db.query for inserting user
    db.query.mockResolvedValueOnce({
      rows: [{
        id: 99,
        name: 'Test Rider',
        email: 'test@bharatone.com',
        role: 'rider',
        wallet_balance: 0
      }]
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Rider',
        email: 'test@bharatone.com',
        password: 'securepassword123',
        role: 'rider'
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'test@bharatone.com');
  });
});
