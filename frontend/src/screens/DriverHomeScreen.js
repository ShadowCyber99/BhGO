import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, KeyboardAvoidingView, Modal, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { logoSvgBase64 } from '../constants/logo';
import GlassCard from '../components/GlassCard';
import CustomButton from '../components/CustomButton';
import MapView from '../components/MapView';

export default function DriverHomeScreen() {
  const { user, logout, socket, refreshProfile } = useAuth();
  const { colors, isDarkMode, toggleTheme, changeTheme, availableThemes, themeName } = useTheme();
  const styles = getStyles(colors);
  
  const [isOnline, setIsOnline] = useState(user?.driverDetails?.isOnline || false);
  const [activeRide, setActiveRide] = useState(null);
  const [incomingRequests, setIncomingRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [safetyChecked, setSafetyChecked] = useState(false);

  // Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatText, setChatText] = useState('');

  // Driver Preference
  const [serviceFilter, setServiceFilter] = useState(user?.driverDetails?.serviceCategory || 'all');
  const [routeMode, setRouteMode] = useState('any'); // 'any' or 'specific'
  const [specificRouteStart, setSpecificRouteStart] = useState('');
  const [specificRouteEnd, setSpecificRouteEnd] = useState('');

  const INDIAN_CITIES = [
    { name: 'Delhi', lat: 28.6139, lng: 77.2090 },
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
    { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
    { name: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
    { name: 'Mohali', lat: 30.7046, lng: 76.7179 },
    { name: 'Kharar', lat: 30.7414, lng: 76.6525 },
    { name: 'Ludhiana', lat: 30.9010, lng: 75.8573 },
    { name: 'Amritsar', lat: 31.6340, lng: 74.8723 },
    { name: 'Jalandhar', lat: 31.3260, lng: 75.5762 }
  ];
  const [selectedCity, setSelectedCity] = useState(INDIAN_CITIES[0]);
  const [showCityPicker, setShowCityPicker] = useState(false);

  // Earnings State
  const [showEarningsModal, setShowEarningsModal] = useState(false);
  const [earningsData, setEarningsData] = useState(null);

  // Profile & Support State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportTab, setSupportTab] = useState('faq');
  const [botMessages, setBotMessages] = useState([{ text: 'Hi Driver! I am your AI assistant. Need help with a trip, penalty, or earnings?', sender: 'bot' }]);
  const [botInput, setBotInput] = useState('');
  
  const [complaintText, setComplaintText] = useState('');
  const [complaintSubmitted, setComplaintSubmitted] = useState(false);

  const [ticker, setTicker] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTicker(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setIncomingRequests(prev => prev.filter(req => {
      const timeElapsed = Math.floor((Date.now() - (req.requestedAt || Date.now())) / 1000);
      return timeElapsed < 180;
    }));
  }, [ticker]);

  const sendBotMessage = () => {
    if(!botInput.trim()) return;
    const newMsg = { text: botInput, sender: 'user' };
    setBotMessages(prev => [...prev, newMsg]);
    setBotInput('');
    setTimeout(() => {
      let reply = "I've noted your complaint in our system and an agent will review it.";
      if(newMsg.text.toLowerCase().includes('penalty')) reply = "If you cancel a ride after accepting, a 3% cancellation penalty is deducted from your next earnings. This ensures reliability for our riders.";
      else if(newMsg.text.toLowerCase().includes('earning')) reply = "You can view your detailed earnings and the weekly statistics bar chart right here in your profile under 'My Earnings'.";
      
      setBotMessages(prev => [...prev, { text: reply, sender: 'bot' }]);
    }, 1000);
  };

  const fetchEarnings = async () => {
    try {
      const res = await fetch('/api/rides/driver/earnings', { headers: { 'Authorization': `Bearer ${localStorage.getItem('cabride_token')}` } });
      if (res.ok) {
        setEarningsData(await res.json());
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (showEarningsModal) fetchEarnings();
  }, [showEarningsModal]);

  const fetchActiveAssignment = async () => {
    try {
      const data = await api.getActiveRide();
      if (data.ride) {
        setActiveRide(data.ride);
        fetchChatHistory(data.ride.id);
      } else {
        setActiveRide(null);
      }
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = async (rideId) => {
    try {
      const res = await fetch(`/api/rides/${rideId}/chat`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('cabride_token')}` }
      });
      if (res.ok) setChatMessages(await res.json());
    } catch (e) {}
  };

  useEffect(() => {
    fetchActiveAssignment();
  }, []);

  useEffect(() => {
    if (socket && isOnline) {
      socket.on('new_ride_requested', (data) => {
        // Enforce Driver's Service Preference
        if (serviceFilter !== 'all' && data.serviceCategory !== serviceFilter) return;

        // Enforce Driver's Route Preference
        if (routeMode === 'specific') {
          const pAddr = (data.pickupAddress || '').toLowerCase();
          const dAddr = (data.dropoffAddress || '').toLowerCase();
          
          const startFilter = specificRouteStart.toLowerCase().trim();
          const destFilter = specificRouteEnd.toLowerCase().trim();
          
          let matchesStart = true;
          let matchesDest = true;
          
          if (startFilter) matchesStart = pAddr.includes(startFilter);
          if (destFilter) matchesDest = dAddr.includes(destFilter);
          
          if (!matchesStart || !matchesDest) return; // Ignore this request
        }

        if (!activeRide) {
          setIncomingRequests(prev => {
            if (prev.find(r => r.id === data.id)) return prev;
            // Attach a requestedAt timestamp to power the local UI countdown if desired
            return [...prev, { ...data, requestedAt: Date.now() }];
          });
        }
      });

      socket.on('ride_status_update', (data) => {
        setActiveRide(prevActiveRide => {
          // If we already have this ride active
          if (prevActiveRide && prevActiveRide.id === data.ride.id) {
            if (data.ride.status === 'completed' || data.ride.status === 'cancelled') {
              return null;
            }
            return { ...prevActiveRide, ...data.ride };
          }
          
          // If we don't have an active ride, and this update is assigned to us (we just accepted it)
          if (!prevActiveRide && data.ride.driverId === user.id) {
            if (data.ride.status !== 'completed' && data.ride.status !== 'cancelled') {
              return data.ride;
            }
          }
          
          return prevActiveRide;
        });
      });

      socket.on('ride_cancelled', (data) => {
        setError(data.message);
        setActiveRide(null);
        setIncomingRequests([]);
        setTimeout(() => setError(''), 6000);
      });

      socket.on('ride_unavailable', (data) => {
        setIncomingRequests(prev => prev.filter(r => r.id !== data.rideId));
      });


      socket.on('receive_chat_message', (msg) => {
        if (activeRide && msg.ride_id === activeRide.id) {
          setChatMessages(prev => [...prev, msg]);
        }
      });

      socket.on('driver_location_changed', (data) => {
        if (activeRide && parseInt(data.driverId) === parseInt(user.id)) {
          setActiveRide(prev => prev ? { ...prev, driverLat: parseFloat(data.latitude), driverLng: parseFloat(data.longitude) } : null);
        }
      });

      return () => {
        socket.off('new_ride_requested');
        socket.off('ride_status_update');
        socket.off('ride_cancelled');
        socket.off('ride_unavailable');
        socket.off('receive_chat_message');
        socket.off('driver_location_changed');
      };
    }
  }, [socket, isOnline, activeRide?.id, routeMode, specificRouteStart, specificRouteEnd, serviceFilter]);

  const handleToggleOnline = async () => {
    setActionLoading(true);
    const newStatus = !isOnline;
    try {
      if (socket) socket.emit('join', { userId: user.id, role: 'driver', serviceFilter });
      setIsOnline(newStatus);
      await refreshProfile();
    } catch (err) {
      setError('Failed to update online status');
    } finally {
      setActionLoading(false);
    }
  };

  const changeServiceFilter = (filter) => {
    setServiceFilter(filter);
    if (isOnline && socket) {
      socket.emit('join', { userId: user.id, role: 'driver', serviceFilter: filter });
    }
  };

  const handleAcceptOffer = async (req) => {
    setActionLoading(true);
    try {
      if (socket) socket.emit('accept_ride', { rideId: req.id, driverId: user.id });
      setIncomingRequests([]);
    } catch(err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (nextStatus) => {
    if (!activeRide) return;
    setActionLoading(true);
    try {
      if (socket) {
        socket.emit('update_ride_status', { rideId: activeRide.id, status: nextStatus });
        setActiveRide(prev => ({ ...prev, status: nextStatus }));
      }
      if (nextStatus === 'completed') {
        setTimeout(() => {
          setActiveRide(null);
          setSafetyChecked(false);
        }, 500);
      }
    } catch(err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Removed manual simulatedPos calculation to prevent NaN crashes on the map component.
  // The MapView.js now natively interpolates the route path point-by-point.

  const handleDeclineOffer = (reqId) => {
    setIncomingRequests(prev => prev.filter(r => r.id !== reqId));
  };

  const sendChat = () => {
    if (!chatText.trim() || !activeRide) return;
    socket.emit('send_chat_message', { rideId: activeRide.id, senderId: user.id, receiverId: activeRide.riderId, text: chatText });
    setChatText('');
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Configuring Driver Telemetry...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.nav}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Image source={{ uri: logoSvgBase64 }} style={{ width: 110, height: 35 }} resizeMode="contain" />
              <Text style={{fontSize: 14, color: colors.primary, fontWeight: 'bold'}}>Driver</Text>
            </View>
            <Text style={styles.vehicleSubtitle}>{user?.driverDetails?.vehicleName} ({user?.driverDetails?.vehicleNumber})</Text>
          </View>
          <TouchableOpacity onPress={() => setShowCityPicker(true)} style={styles.cityBtn}>
            <Text style={styles.cityBtnText}>📍 {selectedCity.name}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.userBox}>
          <TouchableOpacity 
            style={[styles.onlineBtn, isOnline ? styles.onlineActive : styles.onlineOffline]}
            onPress={handleToggleOnline}
            disabled={actionLoading}
          >
            <Text style={styles.onlineBtnText}>{isOnline ? '🟢 ONLINE' : '⚫ OFFLINE'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowProfileModal(true)} style={styles.profileBtn}>
            <Text style={{ fontSize: 20 }}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 8, fontWeight: 'bold' }}>📍 Service Filter Preference:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
          {['all', 'ride', 'parcel', 'ambulance', 'food'].map(f => (
            <TouchableOpacity 
              key={f}
              onPress={() => changeServiceFilter(f)}
              style={{
                paddingVertical: 6, paddingHorizontal: 16, borderRadius: 16, marginRight: 8,
                backgroundColor: serviceFilter === f ? colors.primary : colors.surfaceLight,
              }}
            >
              <Text style={{ color: serviceFilter === f ? '#000' : colors.text, fontSize: 13, fontWeight: 'bold' }}>
                {f.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* NEW: Route Preference UI (Hidden for Ambulance) */}
      {serviceFilter !== 'ambulance' && (
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 8, fontWeight: 'bold' }}>🛣️ Route Preference:</Text>
          <View style={{ flexDirection: 'row', marginBottom: routeMode === 'specific' ? 8 : 0 }}>
            <TouchableOpacity 
              onPress={() => setRouteMode('any')}
              style={{
                paddingVertical: 6, paddingHorizontal: 16, borderRadius: 16, marginRight: 8,
                backgroundColor: routeMode === 'any' ? colors.primary : colors.surfaceLight,
              }}
            >
              <Text style={{ color: routeMode === 'any' ? '#000' : colors.text, fontSize: 13, fontWeight: 'bold' }}>ANY ROUTE</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setRouteMode('specific')}
              style={{
                paddingVertical: 6, paddingHorizontal: 16, borderRadius: 16,
                backgroundColor: routeMode === 'specific' ? colors.primary : colors.surfaceLight,
              }}
            >
              <Text style={{ color: routeMode === 'specific' ? '#000' : colors.text, fontSize: 13, fontWeight: 'bold' }}>SPECIFIC ROUTE</Text>
            </TouchableOpacity>
          </View>
          
          {routeMode === 'specific' && (
            <View style={{ flexDirection: 'column', gap: 8 }}>
              <TextInput
                style={{ backgroundColor: colors.surfaceLight, color: colors.text, padding: 12, borderRadius: 8, fontSize: 13, borderWidth: 1, borderColor: colors.primary }}
                placeholder="Start Point (e.g., Delhi, Airport)"
                placeholderTextColor={colors.textMuted}
                value={specificRouteStart}
                onChangeText={setSpecificRouteStart}
              />
              <TextInput
                style={{ backgroundColor: colors.surfaceLight, color: colors.text, padding: 12, borderRadius: 8, fontSize: 13, borderWidth: 1, borderColor: colors.primary }}
                placeholder="Destination Point (e.g., Mumbai, Station)"
                placeholderTextColor={colors.textMuted}
                value={specificRouteEnd}
                onChangeText={setSpecificRouteEnd}
              />
            </View>
          )}
        </View>
      )}

      {/* MAP DASHBOARD */}
      <View style={{ height: 350, borderRadius: 16, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: colors.surfaceLight }}>
        <MapView 
          cityCenter={selectedCity} 
          pickup={(activeRide || incomingRequests.length > 0) ? { lat: activeRide ? activeRide.pickupLat : incomingRequests[0].pickupLat, lng: activeRide ? activeRide.pickupLng : incomingRequests[0].pickupLng } : null}
          dropoff={(activeRide || incomingRequests.length > 0) ? { lat: activeRide ? activeRide.dropoffLat : incomingRequests[0].dropoffLat, lng: activeRide ? activeRide.dropoffLng : incomingRequests[0].dropoffLng } : null}
          driver={(activeRide?.driverLat && activeRide?.driverLng) ? { lat: activeRide.driverLat, lng: activeRide.driverLng, name: 'You', vehicleType: user?.driverDetails?.vehicleType, serviceCategory: user?.driverDetails?.service_category } : user?.driverDetails ? { lat: parseFloat(user.driverDetails.latitude) || selectedCity.lat + 0.005, lng: parseFloat(user.driverDetails.longitude) || selectedCity.lng + 0.005, name: 'You', vehicleType: user.driverDetails.vehicleType, serviceCategory: user.driverDetails.service_category } : null}
          nearbyDrivers={[]} 
          rideStatus={activeRide?.status || (incomingRequests.length > 0 ? 'requested' : null)}
        />
      </View>

      {error ? <Text style={styles.errorText}>⚠️ {error}</Text> : null}

      {incomingRequests.length > 0 && !activeRide && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>⚡ INCOMING DISPATCH OFFERS ({incomingRequests.length})</Text>
          {incomingRequests.map((req) => {
            const timeElapsed = Math.floor((Date.now() - (req.requestedAt || Date.now())) / 1000);
            const timeLeft = Math.max(0, 180 - timeElapsed); // 3 minutes = 180 seconds

            return (
              <GlassCard key={req.id} style={[styles.offerCard, { marginBottom: 16 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.offerTag}>🔥 {req.serviceCategory.toUpperCase()} REQUEST</Text>
                  <Text style={{ color: colors.danger, fontWeight: 'bold' }}>⏳ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</Text>
                </View>
                <Text style={styles.offerAddress}>Pickup: {req.pickupAddress}</Text>
                {req.waypoints && req.waypoints.length > 0 && (
                  <Text style={styles.offerAddress}>Stops: {req.waypoints.join(' ➡️ ')}</Text>
                )}
                <Text style={styles.offerAddress}>Dropoff: {req.dropoffAddress}</Text>
                
                <View style={styles.offerFooter}>
                  <View>
                    <Text style={styles.offerFareLabel}>Guaranteed Fare</Text>
                    <Text style={styles.offerFareVal}>₹{req.fare}</Text>
                  </View>
                  <View style={styles.offerButtons}>
                    <TouchableOpacity onPress={() => handleDeclineOffer(req.id)} style={styles.declineBtn}><Text style={styles.declineText}>Decline</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => handleAcceptOffer(req)} style={styles.acceptBtn}><Text style={styles.acceptText}>Accept</Text></TouchableOpacity>
                  </View>
                </View>
              </GlassCard>
            );
          })}
        </View>
      )}

      <Modal visible={showCityPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalCard}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Select Your Active City</Text>
            {INDIAN_CITIES.map(city => (
              <TouchableOpacity 
                key={city.name}
                style={{ padding: 16, borderBottomWidth: 1, borderColor: colors.surfaceLight }}
                onPress={() => {
                  setSelectedCity(city);
                  setShowCityPicker(false);
                }}
              >
                <Text style={{ color: colors.text, fontSize: 16 }}>{city.name === selectedCity.name ? '✓ ' : ''}{city.name}</Text>
              </TouchableOpacity>
            ))}
            <CustomButton title="Cancel" onPress={() => setShowCityPicker(false)} variant="outline" style={{ marginTop: 16 }} />
          </GlassCard>
        </View>
      </Modal>

      {/* EARNINGS MODAL */}
      <Modal visible={showEarningsModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>My Earnings Dashboard</Text>
              
              {earningsData ? (
                <View>
                  <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: colors.surfaceLight }}>
                    <Text style={{ color: colors.textMuted, textAlign: 'center', marginBottom: 8, fontSize: 16 }}>Total Net Earnings</Text>
                    <Text style={{ color: colors.primary, fontSize: 42, fontWeight: '900', textAlign: 'center', marginBottom: 8 }}>₹{earningsData.totalEarnings.toFixed(2)}</Text>
                    {earningsData.totalPenalties > 0 && (
                      <Text style={{ color: colors.danger, textAlign: 'center', fontSize: 13, fontWeight: 'bold' }}>
                        Includes -₹{earningsData.totalPenalties.toFixed(2)} Driver Cancellation Penalties
                      </Text>
                    )}
                  </View>

                  {/* WEEKLY STATS BAR CHART */}
                  {earningsData.weeklyStats && earningsData.weeklyStats.length > 0 && (
                    <View style={{ marginBottom: 24 }}>
                      <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Weekly Statistics</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 160, backgroundColor: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.surfaceLight }}>
                        {earningsData.weeklyStats.map((stat, idx) => {
                          // Simple dynamic height calculation based on max earning
                          const maxEarning = Math.max(...earningsData.weeklyStats.map(s => s.earnings), 1);
                          const barHeight = (stat.earnings / maxEarning) * 100;
                          return (
                            <View key={idx} style={{ alignItems: 'center', flex: 1 }}>
                              <Text style={{ color: colors.text, fontSize: 10, marginBottom: 4, fontWeight: 'bold' }}>₹{Math.round(stat.earnings)}</Text>
                              <View style={{ width: '60%', height: `${barHeight}%`, backgroundColor: colors.primary, borderRadius: 4, minHeight: 4 }} />
                              <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 8 }}>{stat.label.split(' ')[0]}</Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  )}

                  <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Earnings Breakdown</Text>
                  {earningsData.breakdown.map((b) => (
                    <View key={b.category} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderColor: colors.surfaceLight }}>
                      <View>
                        <Text style={{ color: colors.text, fontSize: 16, textTransform: 'uppercase', fontWeight: 'bold' }}>{b.category}</Text>
                        <Text style={{ color: colors.textMuted, fontSize: 12 }}>{b.rides} Completed • {b.cutPercentage}% Driver Cut</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold' }}>₹{b.net.toFixed(2)}</Text>
                        <Text style={{ color: colors.textMuted, fontSize: 12, textDecorationLine: 'line-through' }}>Gross: ₹{b.gross.toFixed(2)}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <ActivityIndicator size="large" color={colors.primary} />
              )}

              <CustomButton title="Close" onPress={() => setShowEarningsModal(false)} variant="primary" style={{ marginTop: 24 }} />
            </ScrollView>
          </GlassCard>
        </View>
      </Modal>

      {/* PROFILE MODAL */}
      <Modal visible={showProfileModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalCard}>
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 48, marginBottom: 8 }}>👨‍✈️</Text>
              <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold' }}>{user?.name}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 14 }}>{user?.email}</Text>
              <Text style={{ color: colors.primary, fontWeight: 'bold', marginTop: 8 }}>⭐ {user?.rating || '5.00'} Rating</Text>
            </View>

            <View style={{ gap: 12, marginBottom: 24 }}>
              <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 8, marginTop: 4, fontWeight: 'bold' }}>App Theme</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12, flexDirection: 'row' }}>
                {availableThemes.map(t => (
                  <TouchableOpacity 
                    key={t.id} 
                    onPress={() => changeTheme(t.id)}
                    style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: themeName === t.id ? colors.primary : colors.surfaceLight, backgroundColor: themeName === t.id ? 'rgba(255,255,255,0.1)' : 'transparent', marginRight: 8 }}
                  >
                    <Text style={{ color: colors.text, fontSize: 13, fontWeight: themeName === t.id ? 'bold' : 'normal' }}>{t.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity style={styles.profileMenuBtn} onPress={() => { setShowProfileModal(false); setShowEarningsModal(true); }}>
                <Text style={styles.profileMenuIcon}>💰</Text>
                <Text style={styles.profileMenuText}>My Earnings & Weekly Stats</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.profileMenuBtn} onPress={() => { setShowProfileModal(false); setShowSupportModal(true); }}>
                <Text style={styles.profileMenuIcon}>🎧</Text>
                <Text style={styles.profileMenuText}>Help & Support Center</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.profileMenuBtn, { borderColor: 'rgba(239,68,68,0.3)' }]} onPress={() => { setShowProfileModal(false); logout(); }}>
                <Text style={styles.profileMenuIcon}>🚪</Text>
                <Text style={[styles.profileMenuText, { color: colors.danger }]}>Log Out</Text>
              </TouchableOpacity>
            </View>

            <CustomButton title="Close Profile" onPress={() => setShowProfileModal(false)} variant="outline" />
          </GlassCard>
        </View>
      </Modal>

      {/* SUPPORT MODAL */}
      <Modal visible={showSupportModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalCard}>
            <Text style={{ color: colors.text, fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>Driver Support Center</Text>
            
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              <TouchableOpacity onPress={() => setSupportTab('faq')} style={[styles.supportTabBtn, supportTab === 'faq' && styles.supportTabActive]}>
                <Text style={styles.supportTabText}>Guides</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSupportTab('bot')} style={[styles.supportTabBtn, supportTab === 'bot' && styles.supportTabActive]}>
                <Text style={styles.supportTabText}>Assistant</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSupportTab('complaint')} style={[styles.supportTabBtn, supportTab === 'complaint' && styles.supportTabActive]}>
                <Text style={styles.supportTabText}>Complaint</Text>
              </TouchableOpacity>
            </View>

            {supportTab === 'bot' && (
              <View style={{ flex: 1, minHeight: 300, maxHeight: 400 }}>
                <ScrollView style={{ flex: 1, marginBottom: 12 }} showsVerticalScrollIndicator={false}>
                  {botMessages.map((msg, i) => (
                    <View key={i} style={{ 
                      alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      backgroundColor: msg.sender === 'user' ? colors.primary : 'rgba(255,255,255,0.05)',
                      padding: 12, borderRadius: 12, marginBottom: 8, maxWidth: '85%'
                    }}>
                      <Text style={{ color: msg.sender === 'user' ? '#000' : colors.text }}>{msg.text}</Text>
                    </View>
                  ))}
                </ScrollView>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TextInput 
                    style={[styles.chatInput, { flex: 1, borderWidth: 1, borderColor: colors.surfaceLight }]}
                    placeholder="Describe your issue..."
                    placeholderTextColor={colors.textMuted}
                    value={botInput}
                    onChangeText={setBotInput}
                  />
                  <CustomButton title="Send" onPress={sendBotMessage} variant="primary" />
                </View>
              </View>
            )}

            {supportTab === 'faq' && (
              <ScrollView style={{ maxHeight: 350, marginBottom: 20 }}>
                <Text style={{ color: colors.primary, fontWeight: 'bold' }}>1. Driver Cancellations</Text>
                <Text style={{ color: colors.textDim, marginBottom: 8, fontSize: 12 }}>If you cancel a ride that you have already accepted, a 3% cancellation penalty based on the trip's estimated fare will be deducted from your next earnings. Try to complete accepted rides to maximize earnings!</Text>
                
                <Text style={{ color: colors.primary, fontWeight: 'bold' }}>2. Commission Rates</Text>
                <Text style={{ color: colors.textDim, marginBottom: 8, fontSize: 12 }}>You keep a generous portion of every fare! Rates vary by service: Ambulance (95%), Food/Grocery (90%), Parcel (85%), Ride (80%).</Text>
                
                <Text style={{ color: colors.primary, fontWeight: 'bold' }}>3. Route Preferences</Text>
                <Text style={{ color: colors.textDim, marginBottom: 8, fontSize: 12 }}>You can filter requests by Specific Route from the home screen! This does not apply to Ambulances, which are always ready for any emergency route.</Text>
                
                <Text style={{ color: colors.primary, fontWeight: 'bold' }}>4. Weekly Payouts</Text>
                <Text style={{ color: colors.textDim, marginBottom: 8, fontSize: 12 }}>Earnings are aggregated and transferred weekly. Check your 'My Earnings' tab for a visual breakdown of your weekly statistics.</Text>
              </ScrollView>
            )}

            {supportTab === 'complaint' && (
              <ScrollView style={{ maxHeight: 350, marginBottom: 20 }}>
                {complaintSubmitted ? (
                  <View style={{ padding: 20, backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 12, borderWidth: 1, borderColor: colors.success }}>
                    <Text style={{ color: colors.success, fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>Complaint Submitted Successfully!</Text>
                    <Text style={{ color: colors.text, textAlign: 'center', marginTop: 8 }}>Our support team will review this and contact you within 24 hours.</Text>
                  </View>
                ) : (
                  <View>
                    <Text style={{ color: colors.text, marginBottom: 8 }}>Describe your issue or complaint:</Text>
                    <TextInput
                      style={[styles.chatInput, { height: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: colors.surfaceLight }]}
                      placeholder="Passenger behavior, app issues, payment disputes..."
                      placeholderTextColor={colors.textMuted}
                      multiline
                      value={complaintText}
                      onChangeText={setComplaintText}
                    />
                    <CustomButton 
                      title="Submit Complaint" 
                      onPress={() => {
                        if (complaintText.trim()) setComplaintSubmitted(true);
                      }} 
                      variant="danger" 
                      style={{ marginTop: 12 }} 
                    />
                  </View>
                )}
              </ScrollView>
            )}

            <CustomButton title="Close Help Center" onPress={() => setShowSupportModal(false)} variant="outline" />
          </GlassCard>
        </View>
      </Modal>

      {activeRide && (
        <GlassCard style={styles.ridePanel}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderColor: colors.surfaceLight, paddingBottom: 10, marginBottom: 12 }}>
            <Text style={styles.panelTitle}>📌 Active {activeRide.serviceCategory.toUpperCase()} #00{activeRide.id}</Text>
            <TouchableOpacity style={styles.chatToggleBtn} onPress={() => setChatOpen(!chatOpen)}>
                <Text style={{ color: colors.text, fontSize: 12 }}>💬 Message</Text>
            </TouchableOpacity>
          </View>
          
          {/* LIVE CHAT BOX */}
          {chatOpen && (
            <KeyboardAvoidingView behavior="padding" style={styles.chatBox}>
              <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 8, fontWeight: 'bold' }}>Live Chat with Customer</Text>
              <ScrollView style={styles.chatHistory}>
                {chatMessages.map(m => (
                  <View key={m.id} style={[styles.chatMsg, m.sender_id === user.id ? styles.chatMsgSelf : styles.chatMsgOther]}>
                    <Text style={{ color: colors.text }}>{m.message_text}</Text>
                  </View>
                ))}
              </ScrollView>
              <View style={styles.chatInputRow}>
                <TextInput style={styles.chatInput} value={chatText} onChangeText={setChatText} placeholder="Reply to customer..." placeholderTextColor={colors.textMuted} onSubmitEditing={sendChat} />
                <TouchableOpacity style={styles.sendBtn} onPress={sendChat}><Text style={{ color: colors.text, fontWeight: 'bold' }}>Send</Text></TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          )}

          <View style={styles.legs}>
            <Text style={styles.addressLine}>🟢 Pickup: {activeRide.pickupAddress}</Text>
            {activeRide.waypoints && activeRide.waypoints.length > 0 && (
              <Text style={styles.addressLine}>📍 Stops: {activeRide.waypoints.join(' ➡️ ')}</Text>
            )}
            <Text style={styles.addressLine}>🔴 Dropoff: {activeRide.dropoffAddress}</Text>
            <Text style={styles.passengerText}>👤 Customer: {activeRide.riderName || 'Passenger'}</Text>
            
            {activeRide.serviceCategory === 'food' && activeRide.itemsJson && (
              <View style={{ marginTop: 12, backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.surfaceLight }}>
                <Text style={{ color: colors.text, fontWeight: 'bold', marginBottom: 8 }}>🍔 Order Items (Total: ₹{activeRide.orderTotal})</Text>
                {activeRide.itemsJson.map((item, idx) => (
                  <Text key={idx} style={{ color: colors.textMuted, fontSize: 13 }}>• {item.name} {item.is_veg && '🌿'} (₹{item.price})</Text>
                ))}
              </View>
            )}
          </View>

          <View style={styles.actionBlock}>
            <View>
              <Text style={styles.fareLabel}>Payout</Text>
              <Text style={styles.fareAmount}>₹{activeRide.fare}</Text>
            </View>

            {activeRide.status === 'accepted' && <CustomButton title="I Have Arrived at Pickup" onPress={() => handleUpdateStatus('arrived')} style={styles.actionBtn} />}
            
            {activeRide.status === 'arrived' && (
              <View style={{ flex: 1, marginLeft: 16 }}>
                <TouchableOpacity 
                  onPress={() => setSafetyChecked(!safetyChecked)}
                  style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: safetyChecked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: safetyChecked ? colors.success : colors.danger, marginBottom: 8 }}
                >
                  <Text style={{ marginRight: 8, fontSize: 18 }}>{safetyChecked ? '✅' : '⬜'}</Text>
                  <Text style={{ color: colors.text, fontSize: 12, flex: 1 }}>
                    {activeRide.serviceCategory === 'ambulance' ? 'Seatbelts buckled, Stretcher & Medical kit ready' :
                     (activeRide.vehicleType === 'bike' || activeRide.vehiclePreference === 'bike' || activeRide.serviceCategory === 'bike') ? 'helmet wear both riders for bike ride' :
                     'Seatbelts buckled securely'}
                  </Text>
                </TouchableOpacity>
                <CustomButton 
                  title="Start Trip / Board Passenger" 
                  onPress={() => handleUpdateStatus('started')} 
                  style={[styles.actionBtn, !safetyChecked && { opacity: 0.5 }]} 
                  disabled={!safetyChecked}
                />
              </View>
            )}

            {activeRide.status === 'started' && <CustomButton title="Complete Trip & Collect Payout" onPress={() => handleUpdateStatus('completed')} style={[styles.actionBtn, { backgroundColor: colors.success }]} />}
          </View>
        </GlassCard>
      )}

      {!activeRide && incomingRequests.length === 0 && (
        <GlassCard style={styles.idleCard}>
          <Text style={styles.idleTitle}>{isOnline ? '⏳ Standing by for incoming requests...' : '💤 You are currently offline'}</Text>
          <Text style={styles.idleSub}>{isOnline ? 'Keep this console open. Dispatches will display here immediately.' : 'Toggle your status to ONLINE at the top right to start receiving service requests.'}</Text>
        </GlassCard>
      )}
    </ScrollView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingBottom: 60 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: 24 },
  loadingText: { color: colors.textMuted, marginTop: 16, fontSize: 16, fontWeight: '600' },
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  logoText: { color: colors.text, fontSize: 26, fontWeight: '300' },
  logoBold: { color: colors.primary, fontWeight: '900' },
  vehicleSubtitle: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  userBox: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  onlineBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1.5 },
  onlineActive: { borderColor: colors.success, backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  onlineOffline: { borderColor: colors.textDim, backgroundColor: colors.surfaceLight },
  onlineBtnText: { color: colors.text, fontSize: 12, fontWeight: 'bold' },
  logoutBtn: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  logoutText: { color: colors.danger, fontSize: 12, fontWeight: 'bold' },
  offerCard: { marginTop: 20, borderColor: colors.primary, backgroundColor: 'rgba(99, 102, 241, 0.1)' },
  offerTag: { color: colors.primary, fontSize: 14, fontWeight: '900', letterSpacing: 1, marginBottom: 12 },
  offerAddress: { color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: 6 },
  offerFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: colors.surfaceLight, paddingTop: 12, marginTop: 12 },
  offerFareLabel: { color: colors.textDim, fontSize: 11, fontWeight: '600' },
  offerFareVal: { color: colors.secondary, fontSize: 22, fontWeight: '900' },
  offerButtons: { flexDirection: 'row', gap: 8 },
  declineBtn: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, justifyContent: 'center' },
  declineText: { color: colors.danger, fontSize: 13, fontWeight: 'bold' },
  acceptBtn: { backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 18, justifyContent: 'center' },
  acceptText: { color: colors.text, fontSize: 13, fontWeight: 'bold' },
  ridePanel: { marginTop: 20 },
  panelTitle: { color: colors.text, fontSize: 16, fontWeight: 'bold' },
  legs: { flexDirection: 'column', gap: 8, marginBottom: 16 },
  addressLine: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  passengerText: { color: colors.primary, fontSize: 13, fontWeight: 'bold', marginTop: 4 },
  actionBlock: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: colors.surfaceLight, paddingTop: 14 },
  fareLabel: { color: colors.textDim, fontSize: 11 },
  fareAmount: { color: colors.secondary, fontSize: 22, fontWeight: '900' },
  actionBtn: { height: 44 },
  idleCard: { marginTop: 20, alignItems: 'center', paddingVertical: 32 },
  idleTitle: { color: colors.text, fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  idleSub: { color: colors.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 18, maxWidth: 360 },
  errorText: { color: colors.danger, marginTop: 12, fontWeight: 'bold' },
  
  chatToggleBtn: { backgroundColor: 'rgba(56,189,248,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: colors.parcelColor },
  chatBox: { backgroundColor: colors.surfaceLight, borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: colors.primary },
  chatHistory: { maxHeight: 150, marginBottom: 10 },
  chatMsg: { padding: 8, borderRadius: 8, marginBottom: 6, maxWidth: '80%' },
  chatMsgSelf: { backgroundColor: colors.primary, alignSelf: 'flex-end' },
  chatMsgOther: { backgroundColor: colors.surface, alignSelf: 'flex-start' },
  chatInputRow: { flexDirection: 'row', gap: 8 },
  chatInput: { flex: 1, backgroundColor: colors.surface, color: colors.text, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  sendBtn: { backgroundColor: colors.parcelColor, justifyContent: 'center', paddingHorizontal: 16, borderRadius: 8 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20, zIndex: 9999 },
  modalCard: { width: '100%', maxWidth: 450, padding: 24, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.glassBorder },
  profileBtn: { backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.primary, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 },
  profileMenuBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.surfaceLight },
  profileMenuIcon: { fontSize: 24, marginRight: 16 },
  profileMenuText: { color: colors.text, fontSize: 16, fontWeight: '600' },
  supportTabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6, backgroundColor: colors.surfaceLight },
  supportTabActive: { backgroundColor: colors.parcelColor },
  supportTabText: { color: colors.text, fontSize: 12, fontWeight: 'bold' }
});
