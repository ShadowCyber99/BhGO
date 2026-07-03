import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { api, setAuthToken } from '../utils/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  // Initialize socket on token change
  useEffect(() => {
    if (token && user) {
      console.log('🔌 Connecting socket client for user:', user.id);
      
      // Connect to WebSocket server (extract base URL from API environment variable)
      const socketUrl = process.env.EXPO_PUBLIC_API_URL 
        ? process.env.EXPO_PUBLIC_API_URL.replace('/api', '') 
        : '/';
      const newSocket = io(socketUrl, {
        auth: { token }
      });
      
      newSocket.on('connect', () => {
        console.log('✅ WebSocket Client Connected to Backend');
        // Join user room for private ride notifications
        newSocket.emit('join', { 
          userId: user.id, 
          role: user.role,
          serviceFilter: user.driverDetails?.serviceCategory
        });
      });

      newSocket.on('connect_error', (err) => {
        console.warn('⚠️ WebSocket Connection Error:', err.message);
      });

      setSocket(newSocket);

      return () => {
        console.log('🔌 Disconnecting socket client...');
        newSocket.disconnect();
      };
    } else {
      setSocket(null);
    }
  }, [token, user?.id]);

  // Check login status on launch
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const storedToken = localStorage.getItem('BharatOne_token');
        if (storedToken) {
          setAuthToken(storedToken);
          setToken(storedToken);
          const profileData = await api.getProfile();
          setUser(profileData.user);
        }
      } catch (e) {
        console.warn('Failed to load storage/profile:', e.message);
        localStorage.removeItem('BharatOne_token');
      } finally {
        setLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.login({ email, password });
      localStorage.setItem('BharatOne_token', data.token);
      setAuthToken(data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await api.register(userData);
      localStorage.setItem('BharatOne_token', data.token);
      setAuthToken(data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('BharatOne_token');
    setAuthToken(null);
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const profileData = await api.getProfile();
      setUser(profileData.user);
    } catch (err) {
      console.error('Error refreshing profile:', err.message);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      socket,
      login,
      register,
      logout,
      refreshProfile,
      isAuthenticated: !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
