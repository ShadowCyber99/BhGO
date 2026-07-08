import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import GlassCard from '../components/GlassCard';
import CustomButton from '../components/CustomButton';
import Icon, { IconText } from '../components/Icon';

export default function HistoryScreen({ onNavigateBack }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/rides/history', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('BharatGo_token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch history');
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (service) => {
    switch (service) {
      case 'ambulance': return 'ambulance';
      case 'parcel': return 'package';
      case 'food': return 'restaurant';
      default: return 'car';
    }
  };

  const handleShareInvoice = () => {
    Alert.alert("Invoice Shared", "The invoice has been downloaded and shared successfully!");
    setSelectedInvoice(null);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateBack} style={styles.backBtn}>
          <IconText name="arrowLeft" color={colors.text} size={16} textStyle={{ color: colors.text, fontWeight: 'bold' }}>
            Back
          </IconText>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile & History</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Personal Details Profile Card */}
        <GlassCard style={styles.profileCard}>
          <IconText name="user" color={colors.primary} size={20} textStyle={styles.profileSectionTitle}>
            Personal Details
          </IconText>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Name</Text>
            <Text style={styles.profileValue}>{user?.name}</Text>
          </View>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Email</Text>
            <Text style={styles.profileValue}>{user?.email}</Text>
          </View>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Account Type</Text>
            <Text style={styles.profileValue}>{user?.role?.toUpperCase()}</Text>
          </View>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>User Rating</Text>
            <IconText name="star" color={colors.warning} size={15} textStyle={styles.profileValue}>
              {user?.rating || '5.0'}
            </IconText>
          </View>
        </GlassCard>

        <IconText name="clock" color={colors.primary} size={20} style={{ marginTop: 20, marginBottom: 10 }} textStyle={styles.profileSectionTitle}>
          Recent Activity
        </IconText>

        {error ? (
          <Text style={{ color: colors.danger }}>{error}</Text>
        ) : history.length === 0 ? (
          <Text style={styles.emptyText}>No past activity found.</Text>
        ) : (
          history.map(item => (
            <GlassCard key={item.id} style={styles.historyCard}>
              <View style={styles.cardHeader}>
                <IconText name={getServiceIcon(item.serviceCategory)} color={colors.primary} size={18} textStyle={styles.serviceTitle}>
                  {item.serviceCategory.toUpperCase()}
                </IconText>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'completed' ? colors.success : item.status === 'cancelled' ? colors.danger : colors.warning }]}>
                  <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleString()}</Text>
                <Text style={{ color: colors.textDim, fontSize: 11, fontWeight: 'bold' }}>REF: {item.refId}</Text>
              </View>
              
              <View style={styles.routeBox}>
                <IconText name="mapPin" color={colors.success} size={15} textStyle={styles.addressText}>
                  {item.pickupAddress}
                </IconText>
                <IconText name="location" color={colors.danger} size={15} textStyle={styles.addressText}>
                  {item.dropoffAddress}
                </IconText>
              </View>

              <View style={styles.footerRow}>
                <View>
                  <Text style={styles.fareText}>₹{item.fare?.toFixed(2)}</Text>
                  <IconText name={item.payment_mode === 'digital' ? 'creditCard' : 'wallet'} color={colors.textDim} size={14} textStyle={styles.paymentText}>
                    {item.payment_mode === 'digital' ? 'Digital' : 'Cash'} - {item.payment_status?.toUpperCase()}
                  </IconText>
                </View>
                <TouchableOpacity style={styles.invoiceBtn} onPress={() => setSelectedInvoice(item)}>
                  <IconText name="invoice" color="#000" size={14} textStyle={styles.invoiceBtnText}>
                    Invoice
                  </IconText>
                </TouchableOpacity>
              </View>
            </GlassCard>
          ))
        )}
      </ScrollView>

      {/* Invoice Modal Overlay */}
      {selectedInvoice && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.invoiceHeader}>INVOICE</Text>
            <Text style={styles.invoiceSub}>Booking Ref: {selectedInvoice.refId}</Text>
            
            <View style={styles.invoiceDivider} />
            
            <View style={styles.invoiceRow}>
              <Text style={styles.invoiceLabel}>Date:</Text>
              <Text style={styles.invoiceValue}>{new Date(selectedInvoice.createdAt).toLocaleDateString()}</Text>
            </View>
            <View style={styles.invoiceRow}>
              <Text style={styles.invoiceLabel}>Service:</Text>
              <Text style={styles.invoiceValue}>{selectedInvoice.serviceCategory.toUpperCase()}</Text>
            </View>
            <View style={styles.invoiceRow}>
              <Text style={styles.invoiceLabel}>Provider:</Text>
              <Text style={styles.invoiceValue}>{selectedInvoice.driverName}</Text>
            </View>
            
            <View style={styles.invoiceDivider} />
            
            <View style={styles.invoiceRow}>
              <Text style={styles.invoiceLabel}>Pickup:</Text>
              <Text style={styles.invoiceValue}>{selectedInvoice.pickupAddress}</Text>
            </View>
            <View style={styles.invoiceRow}>
              <Text style={styles.invoiceLabel}>Dropoff:</Text>
              <Text style={styles.invoiceValue}>{selectedInvoice.dropoffAddress}</Text>
            </View>
            
            <View style={styles.invoiceDivider} />
            
            <View style={styles.invoiceRow}>
              <Text style={styles.invoiceLabel}>Status:</Text>
              <Text style={[styles.invoiceValue, { color: selectedInvoice.status === 'cancelled' ? colors.danger : colors.text }]}>{selectedInvoice.status.toUpperCase()}</Text>
            </View>
            <View style={styles.invoiceRow}>
              <Text style={styles.invoiceLabel}>Payment Method:</Text>
              <Text style={styles.invoiceValue}>{selectedInvoice.payment_mode}</Text>
            </View>
            <View style={styles.invoiceRow}>
              <Text style={styles.invoiceLabel}>Billing Status:</Text>
              <Text style={styles.invoiceValue}>{selectedInvoice.payment_status}</Text>
            </View>

            <View style={styles.invoiceDivider} />

            <View style={styles.invoiceRow}>
              <Text style={[styles.invoiceLabel, { fontSize: 18, color: colors.text }]}>TOTAL FARE:</Text>
              <Text style={[styles.invoiceValue, { fontSize: 18, color: colors.primary }]}>₹{selectedInvoice.fare?.toFixed(2)}</Text>
            </View>

            <View style={styles.modalActions}>
              <CustomButton title="Share / Download" onPress={handleShareInvoice} variant="primary" style={{ flex: 1, marginRight: 10 }} />
              <CustomButton title="Close" onPress={() => setSelectedInvoice(null)} variant="outline" style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  loadingText: { color: colors.textMuted, marginTop: 10 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: 'rgba(0,0,0,0.3)', borderBottomWidth: 1, borderBottomColor: colors.surfaceLight },
  backBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, marginRight: 16 },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  emptyText: { color: colors.textMuted, textAlign: 'center', marginTop: 40 },
  historyCard: { marginBottom: 16, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  serviceTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  dateText: { color: colors.textMuted, fontSize: 12, marginBottom: 12 },
  routeBox: { backgroundColor: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 8, marginBottom: 12 },
  addressText: { color: colors.textDim, fontSize: 13, marginBottom: 4 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fareText: { color: colors.primary, fontSize: 18, fontWeight: 'bold' },
  paymentText: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  invoiceBtn: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: colors.surfaceLight },
  invoiceBtnText: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },

  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20, zIndex: 100 },
  modalContent: { backgroundColor: colors.surface, width: '100%', maxWidth: 400, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: colors.surfaceLight },
  invoiceHeader: { color: '#FFF', fontSize: 22, fontWeight: 'bold', textAlign: 'center', letterSpacing: 1 },
  invoiceSub: { color: colors.textMuted, textAlign: 'center', marginBottom: 20 },
  invoiceDivider: { height: 1, backgroundColor: colors.surfaceLight, borderStyle: 'dashed', marginVertical: 12 },
  invoiceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  invoiceLabel: { color: colors.textMuted, fontSize: 14, flex: 1 },
  invoiceValue: { color: '#FFF', fontSize: 14, fontWeight: '500', flex: 2, textAlign: 'right' },
  modalActions: { flexDirection: 'row', marginTop: 24 },

  profileCard: { padding: 20, marginBottom: 10, backgroundColor: 'rgba(255,255,255,0.02)' },
  profileSectionTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: 16 },
  profileRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.glassBorder },
  profileLabel: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
  profileValue: { color: colors.text, fontSize: 16, fontWeight: 'bold' }
});
