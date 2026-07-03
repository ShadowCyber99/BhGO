import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { NavigationProvider, useNavigation } from './src/context/NavigationContext';
import ErrorBoundary from './src/components/ErrorBoundary';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import RiderHomeScreen from './src/screens/RiderHomeScreen';
import RideActiveScreen from './src/screens/RideActiveScreen';
import DriverHomeScreen from './src/screens/DriverHomeScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import HistoryScreen from './src/screens/HistoryScreen';

function MainApp() {
  const { user, loading, isAuthenticated } = useAuth();
  const { authScreen, setAuthScreen, riderScreen, setRiderScreen } = useNavigation();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#040508' }}>
        <ActivityIndicator size="large" color="#A3E635" />
        <Text style={{ color: '#94A3B8', marginTop: 16, fontSize: 16, fontWeight: '600' }}>Initializing BharatOne Space...</Text>
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

  // --- 2. AUTHENTICATED ADMIN ROUTING ---
  if (user.role === 'admin') {
    return <AdminDashboardScreen />;
  }

  // --- 3. AUTHENTICATED DRIVER ROUTING ---
  if (user.role === 'driver') {
    return <DriverHomeScreen />;
  }

  // --- 4. AUTHENTICATED RIDER ROUTING ---
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
          <NavigationProvider>
            <View style={{ flex: 1 }}>
              <StatusBar style="auto" />
              <MainApp />
            </View>
          </NavigationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

