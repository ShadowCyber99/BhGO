import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import GlassCard from '../components/GlassCard';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import Icon, { IconText } from '../components/Icon';

export default function LoginScreen({ onNavigateToRegister }) {
  const { login } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const styles = getStyles(colors);
  
  const [email, setEmail] = useState('rider@example.com'); // Default pre-filled for easy testing!
  const [password, setPassword] = useState('Rider@123'); // Default pre-filled!
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Visual background ambient glow circles */}
      <View style={[styles.glow, styles.glow1]} />
      <View style={[styles.glow, styles.glow2]} />

      <View style={styles.content}>
        {/* Brand Logo & Header */}
        <View style={styles.header}>
          <Image source={isDarkMode ? require('../../assets/logo_dark.jpg') : require('../../assets/logo_light.jpg')} style={{ width: 220, height: 70, marginBottom: 12, mixBlendMode: isDarkMode ? 'screen' : 'multiply' }} resizeMode="contain" />
          <Text style={styles.tagline}>Future-forward urban transit, simulated live.</Text>
        </View>

        {/* Login Frosted Glass Card */}
        <GlassCard style={styles.card}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Log in to request rides and track drivers instantly</Text>

          {error ? <Text style={styles.errorText}>⚠️ {error}</Text> : null}

          <CustomInput
            label="Email Address"
            placeholder="rider@BharatGo.com"
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

          <CustomButton
            title="Log In to Ride"
            icon="logOut"
            onPress={handleLogin}
            loading={loading}
            style={styles.button}
          />

          {/* Quick Demo Pre-fill helpers */}
          <View style={styles.demoBox}>
            <IconText name="activity" color={colors.textMuted} size={14} style={{ justifyContent: 'center', marginBottom: 8 }} textStyle={styles.demoTitle}>
              Quick Test Accounts
            </IconText>
            <View style={styles.demoButtons}>
              <TouchableOpacity 
                style={styles.demoBadge}
                onPress={() => {
                  setEmail('rider@example.com');
                  setPassword('Rider@123');
                }}
              >
                <IconText name="user" color={colors.primary} size={14} textStyle={styles.demoBadgeText}>
                  Rider Demo
                </IconText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.demoBadge, { borderColor: colors.secondary }]}
                onPress={() => {
                  setEmail('driver@example.com');
                  setPassword('Driver@123');
                }}
              >
                <IconText name="car" color={colors.secondary} size={14} textStyle={[styles.demoBadgeText, { color: colors.secondary }]}>
                  Driver Demo
                </IconText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.demoBadge, { borderColor: colors.danger }]}
                onPress={() => {
                  setEmail('admin@BharatGo.com');
                  setPassword('Admin@123');
                }}
              >
                <IconText name="shield" color={colors.danger} size={14} textStyle={[styles.demoBadgeText, { color: colors.danger }]}>
                  Admin Demo
                </IconText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>New to BharatGo? </Text>
            <TouchableOpacity onPress={onNavigateToRegister}>
              <Text style={styles.footerLink}>Create Account</Text>
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
    maxWidth: 450,
    zIndex: 10,
  },
  glow: {
    position: 'absolute',
    borderRadius: 1000,
    filter: 'blur(100px)',
    opacity: 0.15,
    zIndex: 1,
  },
  glow1: {
    width: 300,
    height: 300,
    backgroundColor: colors.primary,
    top: -50,
    left: -50,
  },
  glow2: {
    width: 300,
    height: 300,
    backgroundColor: colors.secondary,
    bottom: -50,
    right: -50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoText: {
    color: colors.text,
    fontSize: 42,
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
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
    width: '100%',
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    marginTop: 12,
    marginBottom: 20,
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
  demoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: colors.surfaceLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  demoTitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  demoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  demoBadge: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  demoBadgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
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
