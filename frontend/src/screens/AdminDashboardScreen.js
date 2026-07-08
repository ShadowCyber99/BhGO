import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import GlassCard from '../components/GlassCard';
import { IconText } from '../components/Icon';

export default function AdminDashboardScreen() {
  const { logout } = useAuth();
  const { colors, isDarkMode } = useTheme();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState(null);
  const [rides, setRides] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const res = await fetch('/api/admin/dashboard');
        const data = await res.json();
        setStats(data);
      } else if (activeTab === 'monitoring') {
        const res = await fetch('/api/admin/rides');
        const data = await res.json();
        setRides(data);
      } else if (activeTab === 'complaints') {
        const res = await fetch('/api/admin/complaints');
        const data = await res.json();
        setComplaints(data);
      } else if (activeTab === 'users') {
        const res = await fetch('/api/admin/users');
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Admin Fetch Error:', err);
    }
    setLoading(false);
  };

  const resolveComplaint = async (id) => {
    try {
      const res = await fetch(`/api/admin/complaints/${id}/resolve`, { method: 'POST' });
      if (res.ok) {
        Alert.alert('Success', 'Complaint resolved successfully');
        fetchData(); // refresh
      }
    } catch (err) {
      Alert.alert('Error', 'Could not resolve complaint');
    }
  };

  const suspendUser = async (id) => {
    try {
      const res = await fetch(`/api/admin/users/${id}/suspend`, { method: 'POST' });
      if (res.ok) {
        Alert.alert('Suspended', 'User account has been suspended.');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not suspend user');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: colors.background,
    },
    sidebar: {
      width: 250,
      backgroundColor: colors.surface,
      borderRightWidth: 1,
      borderColor: colors.surfaceLight,
      padding: 20,
      paddingTop: 40,
    },
    sidebarLogo: {
      fontSize: 24,
      fontWeight: '900',
      color: colors.primary,
      marginBottom: 40,
    },
    navItem: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginBottom: 8,
    },
    navItemActive: {
      backgroundColor: 'rgba(99,102,241,0.1)',
    },
    navText: {
      color: colors.textMuted,
      fontSize: 16,
      fontWeight: '600',
    },
    navTextActive: {
      color: colors.primary,
      fontWeight: 'bold',
    },
    content: {
      flex: 1,
      padding: 40,
      overflow: 'scroll',
    },
    headerText: {
      color: colors.text,
      fontSize: 32,
      fontWeight: '900',
      marginBottom: 30,
    },
    statGrid: {
      flexDirection: 'row',
      gap: 20,
      flexWrap: 'wrap',
      marginBottom: 40,
    },
    statCard: {
      flex: 1,
      minWidth: 200,
      padding: 24,
      alignItems: 'center',
    },
    statTitle: {
      color: colors.textMuted,
      fontSize: 14,
      textTransform: 'uppercase',
      fontWeight: 'bold',
      marginBottom: 8,
    },
    statValue: {
      color: colors.text,
      fontSize: 36,
      fontWeight: '900',
    },
    tableHeader: {
      flexDirection: 'row',
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderColor: colors.surfaceLight,
      marginBottom: 12,
    },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)',
      alignItems: 'center',
    },
    th: { color: colors.textMuted, fontWeight: 'bold', flex: 1 },
    td: { color: colors.text, flex: 1 },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      alignSelf: 'flex-start',
    },
    btnResolve: {
      backgroundColor: colors.success,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 4,
    },
    btnDanger: {
      backgroundColor: colors.danger,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 4,
    }
  });

  return (
    <View style={styles.container}>
      {/* SIDEBAR */}
      <View style={styles.sidebar}>
        <Text style={styles.sidebarLogo}>BharatGo Admin</Text>
        
        <TouchableOpacity style={[styles.navItem, activeTab === 'dashboard' && styles.navItemActive]} onPress={() => setActiveTab('dashboard')}>
          <IconText name="barChart" color={activeTab === 'dashboard' ? colors.primary : colors.textMuted} size={18} textStyle={[styles.navText, activeTab === 'dashboard' && styles.navTextActive]}>
            Dashboard
          </IconText>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.navItem, activeTab === 'monitoring' && styles.navItemActive]} onPress={() => setActiveTab('monitoring')}>
          <IconText name="car" color={activeTab === 'monitoring' ? colors.primary : colors.textMuted} size={18} textStyle={[styles.navText, activeTab === 'monitoring' && styles.navTextActive]}>
            Active Rides
          </IconText>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navItem, activeTab === 'users' && styles.navItemActive]} onPress={() => setActiveTab('users')}>
          <IconText name="user" color={activeTab === 'users' ? colors.primary : colors.textMuted} size={18} textStyle={[styles.navText, activeTab === 'users' && styles.navTextActive]}>
            User Management
          </IconText>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.navItem, activeTab === 'complaints' && styles.navItemActive]} onPress={() => setActiveTab('complaints')}>
          <IconText name="headset" color={activeTab === 'complaints' ? colors.primary : colors.textMuted} size={18} textStyle={[styles.navText, activeTab === 'complaints' && styles.navTextActive]}>
            Complaints
          </IconText>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navItem, { marginTop: 'auto' }]} onPress={logout}>
          <IconText name="logOut" color={colors.danger} size={18} textStyle={[styles.navText, { color: colors.danger }]}>
            Logout
          </IconText>
        </TouchableOpacity>
      </View>

      {/* CONTENT AREA */}
      <ScrollView style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 100 }} />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <View>
                <Text style={styles.headerText}>Overview Dashboard</Text>
                {stats && (
                  <View style={styles.statGrid}>
                    <GlassCard style={styles.statCard}>
                      <Text style={styles.statTitle}>Total Revenue</Text>
                      <Text style={[styles.statValue, { color: colors.success }]}>₹{stats.totalRevenue?.toFixed(2) || '0.00'}</Text>
                    </GlassCard>
                    <GlassCard style={styles.statCard}>
                      <Text style={styles.statTitle}>Active Rides</Text>
                      <Text style={[styles.statValue, { color: colors.primary }]}>{stats.activeRides}</Text>
                    </GlassCard>
                    <GlassCard style={styles.statCard}>
                      <Text style={styles.statTitle}>Completed</Text>
                      <Text style={[styles.statValue, { color: colors.text }]}>{stats.completedRides}</Text>
                    </GlassCard>
                    <GlassCard style={styles.statCard}>
                      <Text style={styles.statTitle}>Users</Text>
                      <Text style={styles.statValue}>{stats.totalRiders} R / {stats.totalDrivers} D</Text>
                    </GlassCard>
                  </View>
                )}
              </View>
            )}

            {activeTab === 'monitoring' && (
              <View>
                <Text style={styles.headerText}>Ride Monitoring</Text>
                <GlassCard style={{ padding: 20 }}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.th, { flex: 0.5 }]}>ID</Text>
                    <Text style={[styles.th, { flex: 0.8 }]}>Service</Text>
                    <Text style={styles.th}>Rider & Driver</Text>
                    <Text style={[styles.th, { flex: 1.5 }]}>Route Details (Pickup → Dropoff)</Text>
                    <Text style={[styles.th, { flex: 0.8 }]}>Status</Text>
                    <Text style={[styles.th, { flex: 0.5 }]}>Fare</Text>
                  </View>
                  {rides.map(r => (
                    <View key={r.id} style={styles.tableRow}>
                      <Text style={[styles.td, { flex: 0.5 }]}>#{r.id}</Text>
                      <Text style={[styles.td, { flex: 0.8 }]}>{r.service_category.toUpperCase()}</Text>
                      <View style={styles.td}>
                        <Text style={{ fontWeight: 'bold', color: colors.text }}>{r.rider_name}</Text>
                        <Text style={{ fontSize: 12, color: colors.textMuted }}>{r.driver_name || 'Searching...'}</Text>
                      </View>
                      <View style={[styles.td, { flex: 1.5 }]}>
                        <Text style={{ fontSize: 12, color: colors.textMuted }}>🟢 {r.pickup_address}</Text>
                        <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>🏁 {r.dropoff_address}</Text>
                      </View>
                      <View style={[styles.td, { flex: 0.8, justifyContent: 'center' }]}>
                        <View style={[styles.badge, { backgroundColor: r.status === 'completed' ? 'rgba(34,197,94,0.2)' : r.status === 'cancelled' ? 'rgba(239,68,68,0.2)' : 'rgba(99,102,241,0.2)' }]}>
                           <Text style={{ color: r.status === 'completed' ? colors.success : r.status === 'cancelled' ? colors.danger : colors.primary, fontSize: 12, fontWeight: 'bold' }}>{r.status.toUpperCase()}</Text>
                        </View>
                      </View>
                      <Text style={[styles.td, { flex: 0.5 }]}>₹{r.fare}</Text>
                    </View>
                  ))}
                  {rides.length === 0 && <Text style={{ color: colors.textMuted, marginTop: 20, textAlign: 'center' }}>No rides found.</Text>}
                </GlassCard>
              </View>
            )}

            {activeTab === 'users' && (
              <View>
                <Text style={styles.headerText}>User Management</Text>
                <GlassCard style={{ padding: 20 }}>
                  <View style={styles.tableHeader}>
                    <Text style={styles.th}>Name</Text>
                    <Text style={styles.th}>Email</Text>
                    <Text style={[styles.th, { flex: 0.5 }]}>Role</Text>
                    <Text style={[styles.th, { flex: 0.5 }]}>Rating</Text>
                    <Text style={styles.th}>Action</Text>
                  </View>
                  {users.map(u => (
                    <View key={u.id} style={styles.tableRow}>
                      <Text style={styles.td}>{u.name}</Text>
                      <Text style={styles.td}>{u.email}</Text>
                      <Text style={[styles.td, { flex: 0.5, color: u.role === 'driver' ? colors.primary : colors.success, fontWeight: 'bold' }]}>{u.role.toUpperCase()}</Text>
                      <Text style={[styles.td, { flex: 0.5 }]}>⭐ {u.rating}</Text>
                      <View style={styles.td}>
                        <TouchableOpacity style={styles.btnDanger} onPress={() => suspendUser(u.id)}>
                          <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Suspend</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                  {users.length === 0 && <Text style={{ color: colors.textMuted, marginTop: 20, textAlign: 'center' }}>No users found.</Text>}
                </GlassCard>
              </View>
            )}

            {activeTab === 'complaints' && (
              <View>
                <Text style={styles.headerText}>Support Queries</Text>
                <GlassCard style={{ padding: 20 }}>
                  <View style={styles.tableHeader}>
                    <Text style={styles.th}>User</Text>
                    <Text style={[styles.th, { flex: 1.5 }]}>Subject</Text>
                    <Text style={styles.th}>Status</Text>
                    <Text style={styles.th}>Action</Text>
                  </View>
                  {complaints.map(c => (
                    <View key={c.id} style={styles.tableRow}>
                      <View style={styles.td}>
                        <Text style={{ color: colors.text, fontWeight: 'bold' }}>{c.user_name}</Text>
                        <Text style={{ color: colors.textMuted, fontSize: 12 }}>{c.user_role.toUpperCase()}</Text>
                      </View>
                      <View style={[styles.td, { flex: 1.5 }]}>
                        <Text style={{ color: colors.text, fontWeight: 'bold' }}>{c.subject}</Text>
                        <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>{c.message}</Text>
                      </View>
                      <View style={styles.td}>
                        <Text style={{ color: c.status === 'resolved' ? colors.success : colors.danger, fontWeight: 'bold' }}>
                          {c.status.toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.td}>
                        {c.status === 'open' ? (
                          <TouchableOpacity style={styles.btnResolve} onPress={() => resolveComplaint(c.id)}>
                            <Text style={{ color: '#000', fontWeight: 'bold', textAlign: 'center' }}>Resolve</Text>
                          </TouchableOpacity>
                        ) : (
                          <Text style={{ color: colors.textMuted }}>Resolved</Text>
                        )}
                      </View>
                    </View>
                  ))}
                  {complaints.length === 0 && <Text style={{ color: colors.textMuted, marginTop: 20, textAlign: 'center' }}>No complaints open.</Text>}
                </GlassCard>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
