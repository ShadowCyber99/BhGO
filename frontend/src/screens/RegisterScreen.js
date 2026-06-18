import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import GlassCard from '../components/GlassCard';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';

export default function RegisterScreen({ onNavigateToLogin }) {
  const { register } = useAuth();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  
  // Registration States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('rider'); // 'rider' or 'driver'
  
  // Driver Vehicle States
  const [vehicleName, setVehicleName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('economy'); // 'economy', 'premium', 'suv'
  const [serviceCategory, setServiceCategory] = useState('ride'); // 'ride', 'ambulance', 'parcel'

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !role) {
      setError('Please fill in all core fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (role === 'driver' && (!vehicleName || !vehicleNumber)) {
      setError('Please enter your vehicle details');
      return;
    }

    if (role === 'driver') {
      const plateRegex = /^[A-Z]{2}[ -]?[0-9]{1,2}[ -]?[A-Z]{1,2}[ -]?[0-9]{4}$/i;
      if (!plateRegex.test(vehicleNumber)) {
        setError('Please enter a valid Indian number plate (e.g. MH 12 AB 1234)');
        return;
      }
    }

    setError('');
    setLoading(true);

    const payload = {
      name,
      email,
      password,
      role,
      ...(role === 'driver' ? { serviceCategory, vehicleName, vehicleNumber, vehicleType } : {})
    };

    try {
      await register(payload);
    } catch (err) {
      setError(err.message || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Background ambient glows */}
      <View style={[styles.glow, styles.glow1]} />
      <View style={[styles.glow, styles.glow2]} />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logoText}>Cab<Text style={styles.logoBold}>Ride</Text></Text>
          <Text style={styles.tagline}>Create your account to start traveling</Text>
        </View>

        <GlassCard style={styles.card}>
          <Text style={styles.title}>Join CabRide</Text>
          <Text style={styles.subtitle}>Select your transit role to get configured</Text>

          {error ? <Text style={styles.errorText}>⚠️ {error}</Text> : null}

          {/* Role selector tab */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, role === 'rider' && styles.activeTab]}
              onPress={() => { setRole('rider'); setError(''); }}
            >
              <Text style={[styles.tabText, role === 'rider' && styles.activeTabText]}>Passenger / Rider</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, role === 'driver' && styles.activeTab]}
              onPress={() => { setRole('driver'); setError(''); }}
            >
              <Text style={[styles.tabText, role === 'driver' && styles.activeTabText]}>Cab Driver</Text>
            </TouchableOpacity>
          </View>

          <CustomInput
            label="Full Name"
            placeholder="Jane Doe"
            value={name}
            onChangeText={setName}
          />

          <CustomInput
            label="Email Address"
            placeholder="jane@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <CustomInput
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* DYNAMIC VEHICLE SECTIONS FOR DRIVERS */}
          {role === 'driver' && (
            <View style={styles.driverSection}>
              <Text style={styles.sectionHeader}>🚗 Vehicle Details</Text>
              
              <CustomInput
                label="Vehicle Model"
                placeholder="Tesla Model Y"
                value={vehicleName}
                onChangeText={setVehicleName}
              />

              <CustomInput
                label="License Plate Number"
                placeholder="MH 12 AB 1234"
                value={vehicleNumber}
                onChangeText={(text) => setVehicleNumber(text.toUpperCase())}
                autoCapitalize="characters"
              />

              <Text style={styles.selectorLabel}>Service Category</Text>
              <View style={styles.vehicleTypeSelector}>
                {['ride', 'ambulance', 'parcel'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.typeButton,
                      serviceCategory === cat && styles.activeTypeButton
                    ]}
                    onPress={() => setServiceCategory(cat)}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      serviceCategory === cat && styles.activeTypeButtonText
                    ]}>
                      {cat.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.selectorLabel}>Vehicle Service Type</Text>
              <View style={styles.vehicleTypeSelector}>
                {['economy', 'premium', 'suv'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      vehicleType === type && styles.activeTypeButton
                    ]}
                    onPress={() => setVehicleType(type)}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      vehicleType === type && styles.activeTypeButtonText
                    ]}>
                      {type.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <CustomButton
            title={role === 'rider' ? 'Create Rider Account' : 'Register as Driver'}
            onPress={handleRegister}
            loading={loading}
            style={styles.button}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={onNavigateToLogin}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </View>
    </ScrollView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    width: '100%',
    maxWidth: 480,
    zIndex: 10,
    marginVertical: 20,
  },
  glow: {
    position: 'absolute',
    borderRadius: 1000,
    filter: 'blur(100px)',
    opacity: 0.12,
    zIndex: 1,
  },
  glow1: {
    width: 300,
    height: 300,
    backgroundColor: colors.primary,
    top: 50,
    left: -50,
  },
  glow2: {
    width: 300,
    height: 300,
    backgroundColor: colors.success,
    bottom: 50,
    right: -50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '300',
    letterSpacing: -1,
  },
  logoBold: {
    color: colors.primary,
    fontWeight: '900',
  },
  tagline: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 6,
  },
  card: {
    width: '100%',
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  activeTabText: {
    color: colors.background,
  },
  button: {
    marginTop: 16,
    marginBottom: 16,
  },
  errorText: {
    color: colors.danger,
    fontWeight: '600',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  driverSection: {
    borderTopWidth: 1,
    borderColor: colors.surfaceLight,
    paddingTop: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  sectionHeader: {
    color: colors.text,
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  selectorLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    paddingLeft: 2,
  },
  vehicleTypeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  typeButton: {
    flex: 1,
    height: 40,
    borderWidth: 1.5,
    borderColor: colors.surfaceLight,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  activeTypeButton: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
  typeButtonText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: 'bold',
  },
  activeTypeButtonText: {
    color: colors.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
});
