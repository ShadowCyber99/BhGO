-- PostgreSQL Database Schema for CabRide Clone App

-- Drop tables if they already exist (in reverse order of dependencies)
DROP TABLE IF EXISTS rides CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Create 'users' table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(10) NOT NULL CHECK (role IN ('rider', 'driver')),
    rating DECIMAL(3,2) DEFAULT 5.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for fast authentication lookups
CREATE INDEX idx_users_email ON users(email);

-- 2. Create 'drivers' table for tracking online status, availability, and real-time coordinates
CREATE TABLE drivers (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    vehicle_name VARCHAR(100) NOT NULL,
    vehicle_type VARCHAR(20) NOT NULL CHECK (vehicle_type IN ('economy', 'premium', 'suv')),
    vehicle_number VARCHAR(20) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL DEFAULT 40.7128, -- Default to New York coordinates
    longitude DOUBLE PRECISION NOT NULL DEFAULT -74.0060,
    is_online BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on location and online/availability status for fast spatial matching queries
CREATE INDEX idx_drivers_online_available ON drivers(is_online, is_available);

-- 3. Create 'rides' table for storing requests, trips, fares, and active statuses
CREATE TABLE rides (
    id SERIAL PRIMARY KEY,
    rider_id INT REFERENCES users(id) ON DELETE CASCADE,
    driver_id INT REFERENCES users(id) ON DELETE SET NULL,
    pickup_address VARCHAR(255) NOT NULL,
    dropoff_address VARCHAR(255) NOT NULL,
    pickup_lat DOUBLE PRECISION NOT NULL,
    pickup_lng DOUBLE PRECISION NOT NULL,
    dropoff_lat DOUBLE PRECISION NOT NULL,
    dropoff_lng DOUBLE PRECISION NOT NULL,
    fare DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('requested', 'accepted', 'arrived', 'started', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for querying ride history and active requests quickly
CREATE INDEX idx_rides_status ON rides(status);
CREATE INDEX idx_rides_rider ON rides(rider_id);
CREATE INDEX idx_rides_driver ON rides(driver_id);

-- =========================================================================
-- SEED TEST DATA
-- All passwords are encrypted equivalents of 'password123' using bcrypt (cost factor 10)
-- password_hash for 'password123': $2a$10$Z3c4pYnJvq7BvK8/TzBpeeyE512sF.Q8M6R9qD4N20pC0.G8uN7S2
-- =========================================================================

-- Insert Seed Rider
INSERT INTO users (name, email, password_hash, role, rating) 
VALUES ('John Rider', 'rider@cabride.com', '$2a$10$Z3c4pYnJvq7BvK8/TzBpeeyE512sF.Q8M6R9qD4N20pC0.G8uN7S2', 'rider', 4.9);

-- Insert Seed Drivers
INSERT INTO users (name, email, password_hash, role, rating) 
VALUES ('Sarah Economy Driver', 'driver_eco@cabride.com', '$2a$10$Z3c4pYnJvq7BvK8/TzBpeeyE512sF.Q8M6R9qD4N20pC0.G8uN7S2', 'driver', 4.8);

INSERT INTO users (name, email, password_hash, role, rating) 
VALUES ('Michael Premium Driver', 'driver_premium@cabride.com', '$2a$10$Z3c4pYnJvq7BvK8/TzBpeeyE512sF.Q8M6R9qD4N20pC0.G8uN7S2', 'driver', 4.95);

INSERT INTO users (name, email, password_hash, role, rating) 
VALUES ('Elena SUV Driver', 'driver_suv@cabride.com', '$2a$10$Z3c4pYnJvq7BvK8/TzBpeeyE512sF.Q8M6R9qD4N20pC0.G8uN7S2', 'driver', 4.75);

-- Link users to their driver vehicles and initial coordinates (New York City area)
-- Economy Driver (Tesla Model 3)
INSERT INTO drivers (user_id, vehicle_name, vehicle_type, vehicle_number, latitude, longitude, is_online, is_available) 
VALUES (
    (SELECT id FROM users WHERE email = 'driver_eco@cabride.com'),
    'Hyundai Ioniq 5',
    'economy',
    'CAB-ECO-99',
    40.7142,
    -74.0080,
    TRUE,
    TRUE
);

-- Premium Driver (Tesla Model S)
INSERT INTO drivers (user_id, vehicle_name, vehicle_type, vehicle_number, latitude, longitude, is_online, is_available) 
VALUES (
    (SELECT id FROM users WHERE email = 'driver_premium@cabride.com'),
    'Tesla Model S',
    'premium',
    'CAB-PRM-77',
    40.7100,
    -74.0020,
    TRUE,
    TRUE
);

-- SUV Driver (Chevrolet Suburban)
INSERT INTO drivers (user_id, vehicle_name, vehicle_type, vehicle_number, latitude, longitude, is_online, is_available) 
VALUES (
    (SELECT id FROM users WHERE email = 'driver_suv@cabride.com'),
    'Chevrolet Suburban',
    'suv',
    'CAB-SUV-55',
    40.7200,
    -74.0150,
    TRUE,
    TRUE
);