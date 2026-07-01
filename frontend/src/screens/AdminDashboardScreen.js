import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import GlassCard from '../components/GlassCard';

export default function AdminDashboardScreen() {
  const { user, logout, socket } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const styles = getStyles(colors);

  const [stats, setStats] = useState({
    activeDrivers: 0,
    activeAmbulances: 0,
    totalRidesToday: 0,
    totalRevenueToday: 0
  });

  const [systemHealth, setSystemHealth] = useState({
    status: 'Operational',
    uptime: '99.9%',
    latency: '42ms'
  });

  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    // Simulated fetching for the mock backend
    setStats({
      activeDrivers: 42,
      activeAmbulances: 8,
      totalRidesToday: 156,
      totalRevenueToday: 42500
    });

    setRecentBookings([
      { id: 'REF-1', service: 'ride', status: 'completed', amount: 450, time: '10 mins ago' },
      { id: 'REF-2', service: 'ambulance', status: 'started', amount: 1200, time: '15 mins ago' },
      { id: 'REF-3', service: 'food', status: 'requested', amount: 350, time: '22 mins ago' },
      { id: 'REF-4', service: 'parcel', status: 'completed', amount: 200, time: '1 hour ago' }
    ]);
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.nav}>
        <Text style={styles.logoText}>Bharat<Text style={styles.logoBold}>One</Text> Admin</Text>
        <View style={styles.userBox}>
          <Text style={styles.userName}>Admin {user?.name.split(' ')[0]}</Text>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.header}>Dashboard Overview</Text>

      <View style={styles.statsGrid}>
        <GlassCard style={styles.statCard}>
          <Text style={styles.statLabel}>Active Drivers</Text>
          <Text style={styles.statValue}>{stats.activeDrivers}</Text>
        </GlassCard>
        
        <GlassCard style={styles.statCard}>
          <Text style={styles.statLabel}>Active Ambulances</Text>
          <Text style={[styles.statValue, { color: colors.ambulanceColor }]}>{stats.activeAmbulances}</Text>
        </GlassCard>

        <GlassCard style={styles.statCard}>
          <Text style={styles.statLabel}>Total Rides (Today)</Text>
          <Text style={[styles.statValue, { color: colors.rideColor }]}>{stats.totalRidesToday}</Text>
        </GlassCard>

        <GlassCard style={styles.statCard}>
          <Text style={styles.statLabel}>Total Revenue</Text>
          <Text style={[styles.statValue, { color: colors.success }]}>₹{stats.totalRevenueToday.toLocaleString()}</Text>
        </GlassCard>
      </View>

      <View style={styles.row}>
        <View style={styles.columnLeft}>
          <Text style={styles.subHeader}>Live Heatmap (Simulated)</Text>
          <GlassCard style={styles.mapMock}>
            <Text style={{ fontSize: 40, marginBottom: 16 }}>🗺️</Text>
            <Text style={{ color: colors.textMuted }}>Map integration would display live active drivers and demand heatmaps here.</Text>
          </GlassCard>
        </View>

        <View style={styles.columnRight}>
          <Text style={styles.subHeader}>System Health</Text>
          <GlassCard style={styles.healthCard}>
            <View style={styles.healthRow}>
              <Text style={styles.healthLabel}>Status:</Text>
              <Text style={[styles.healthValue, { color: colors.success }]}>🟢 {systemHealth.status}</Text>
            </View>
            <View style={styles.healthRow}>
              <Text style={styles.healthLabel}>Uptime:</Text>
              <Text style={styles.healthValue}>{systemHealth.uptime}</Text>
            </View>
            <View style={styles.healthRow}>
              <Text style={styles.healthLabel}>Latency:</Text>
              <Text style={styles.healthValue}>{systemHealth.latency}</Text>
            </View>
          </GlassCard>
        </View>
      </View>

      <Text style={styles.subHeader}>Recent Bookings</Text>
      <GlassCard style={styles.listCard}>
        {recentBookings.map((b, i) => (
          <View key={i} style={styles.listItem}>
            <View>
              <Text style={styles.listTitle}>{b.id} ({b.service.toUpperCase()})</Text>
              <Text style={styles.listSubtitle}>{b.time}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.listStatus, b.status === 'completed' ? { color: colors.success } : b.status === 'started' ? { color: colors.primary } : { color: colors.warning }]}>
                {b.status.toUpperCase()}
              </Text>
              <Text style={styles.listAmount}>₹{b.amount}</Text>
            </View>
          </View>
        ))}
      </GlassCard>
    </ScrollView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingBottom: 60 },
  nav: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 32,
    backgroundColor: colors.navGlass,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.glassBorder
  },
  logoText: { color: colors.text, fontSize: 26, fontWeight: '300' },
  logoBold: { color: colors.primary, fontWeight: '900' },
  userBox: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  userName: { color: colors.text, fontWeight: '700', fontSize: 16 },
  logoutBtn: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16 },
  logoutText: { color: colors.danger, fontSize: 14, fontWeight: 'bold' },
  
  header: { fontSize: 28, fontWeight: 'bold', color: colors.text, marginBottom: 24 },
  subHeader: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 16, marginTop: 16 },
  
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 32 },
  statCard: { flex: 1, minWidth: 200, padding: 24, alignItems: 'center' },
  statLabel: { color: colors.textMuted, fontSize: 14, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  statValue: { color: colors.text, fontSize: 36, fontWeight: '900' },

  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 24 },
  columnLeft: { flex: 2, minWidth: 300 },
  columnRight: { flex: 1, minWidth: 250 },

  mapMock: { height: 250, justifyContent: 'center', alignItems: 'center', padding: 24 },
  
  healthCard: { padding: 24 },
  healthRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  healthLabel: { color: colors.textMuted, fontSize: 16 },
  healthValue: { color: colors.text, fontSize: 16, fontWeight: 'bold' },

  listCard: { padding: 16 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderColor: colors.surfaceLight },
  listTitle: { color: colors.text, fontSize: 16, fontWeight: 'bold' },
  listSubtitle: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  listStatus: { fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  listAmount: { color: colors.text, fontSize: 16, fontWeight: 'bold' },
});
