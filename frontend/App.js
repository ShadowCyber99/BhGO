import React, { useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import ErrorBoundary from './src/components/ErrorBoundary';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import RiderHomeScreen from './src/screens/RiderHomeScreen';
import RideActiveScreen from './src/screens/RideActiveScreen';
import DriverHomeScreen from './src/screens/DriverHomeScreen';

import HistoryScreen from './src/screens/HistoryScreen';

function MainApp() {
  const { user, loading, isAuthenticated } = useAuth();
  
  // Custom light navigation state triggers
  const [authScreen, setAuthScreen] = useState('login'); // 'login' | 'register'
  const [riderScreen, setRiderScreen] = useState('home'); // 'home' | 'active_ride' | 'history'

  // Global hack for RiderHomeScreen to access setRiderScreen without prop drilling
  window.setRiderScreen = setRiderScreen;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#040508' }}>
        <ActivityIndicator size="large" color="#A3E635" />
        <Text style={{ color: '#94A3B8', marginTop: 16, fontSize: 16, fontWeight: '600' }}>Initializing BharatGo Space...</Text>
      </View>
    );
  }

  // --- 1. UNAUTHENTICATED ROUTING (Login / Register) ---
  if (!isAuthenticated) {
    return authScreen === 'login' ? (
      <LoginScreen onNavigateToRegister={() => setAuthScreen('register')} />
    ) : (
      <RegisterScreen onNavigateToLogin={() => setAuthScreen('login')} />
    );
  }

  // --- 2. AUTHENTICATED DRIVER ROUTING ---
  if (user.role === 'driver') {
    return <DriverHomeScreen />;
  }

  // --- 3. AUTHENTICATED RIDER ROUTING ---
  if (riderScreen === 'history') {
    return <HistoryScreen onNavigateBack={() => setRiderScreen('home')} />;
  }

  return riderScreen === 'home' ? (
    <RiderHomeScreen onNavigateToActiveRide={() => setRiderScreen('active_ride')} />
  ) : (
    <RideActiveScreen onNavigateToHome={() => setRiderScreen('home')} />
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <View style={{ flex: 1 }}>
            <StatusBar style="auto" />
            <MainApp />
          </View>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

