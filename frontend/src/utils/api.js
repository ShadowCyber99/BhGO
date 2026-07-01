// Backend API URL loaded from Expo environment variables
const API_URL = process.env.EXPO_PUBLIC_API_URL || '/api';

let userToken = null;

export const setAuthToken = (token) => {
  userToken = token;
};

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (userToken) {
    headers['Authorization'] = `Bearer ${userToken}`;
  }
  return headers;
};

export const api = {
  // Authentication Requests
  async register(userData) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  async login(credentials) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async getProfile() {
    const res = await fetch(`${API_URL}/auth/profile`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch profile');
    return data;
  },

  // Rides & Booking Requests
  async getNearbyDrivers() {
    const res = await fetch(`${API_URL}/rides/drivers`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch drivers');
    return data;
  },

  async requestRide(rideDetails) {
    const res = await fetch(`${API_URL}/rides/request`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(rideDetails),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to request ride');
    return data;
  },

  async getActiveRide() {
    const res = await fetch(`${API_URL}/rides/active`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch active ride');
    return data;
  },

  async getRideHistory() {
    const res = await fetch(`${API_URL}/rides/history`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch ride history');
    return data;
  }
};
