import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Image, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import GlassCard from '../components/GlassCard';
import CustomButton from '../components/CustomButton';
import MapView from '../components/MapView';

export default function RideActiveScreen({ onNavigateToHome }) {
  const { user, socket } = useAuth();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [eta, setEta] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [sosOpen, setSosOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatText, setChatText] = useState('');
  
  const [rating, setRating] = useState(5);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [reviewTags, setReviewTags] = useState([]);
  const [reviewComment, setReviewComment] = useState('');
  
  const [requestTimeElapsed, setRequestTimeElapsed] = useState(0);

  const POSITIVE_TAGS = ['Clean Car', 'Polite', 'Safe Driving', 'Great Route', 'Fast'];
  const NEGATIVE_TAGS = ['Rude', 'Late', 'Unsafe Driving', 'Dirty Car', 'Wrong Route'];

  const toggleTag = (tag) => {
    setReviewTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const fetchActiveRide = async () => {
    try {
      const data = await api.getActiveRide();
      if (data.ride) {
        setRide(data.ride);
        fetchChatHistory(data.ride.id);
      } else {
        onNavigateToHome();
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch ride status');
    } finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = async (rideId) => {
    try {
      const res = await fetch(`/api/rides/${rideId}/chat`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('BharatOne_token')}` }
      });
      if (res.ok) {
        setChatMessages(await res.json());
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchActiveRide();
    if (typeof window !== 'undefined' && "Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (ride?.status === 'completed') {
      if (typeof window !== 'undefined' && "Notification" in window && Notification.permission === "granted") {
        new Notification("Trip Completed!", { body: "You have arrived safely at your destination." });
      }
    }
  }, [ride?.status]);

  useEffect(() => {
    let interval;
    if (ride?.status === 'requested') {
      interval = setInterval(() => {
        setRequestTimeElapsed(prev => {
          if (prev >= 180) {
            setRide(r => ({ ...r, status: 'cancelled' }));
            setError('No drivers available. Request timed out.');
            return 180;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      setRequestTimeElapsed(0);
    }
    return () => clearInterval(interval);
  }, [ride?.status]);

  useEffect(() => {
    if (socket && ride) {
      socket.on('ride_status_update', (data) => setRide(prev => ({ ...prev, ...data.ride })));
      socket.on('driver_location_changed', (data) => {
        if (ride.driverId && parseInt(data.driverId) === parseInt(ride.driverId)) {
          setRide(prev => prev ? { ...prev, driverLat: parseFloat(data.latitude), driverLng: parseFloat(data.longitude) } : null);
        }
      });
      socket.on('eta_update', (data) => setEta(data.minutes));
      socket.on('receive_chat_message', (msg) => {
        if (msg.ride_id === ride.id) {
          setChatMessages(prev => [...prev, msg]);
        }
      });
      socket.on('ride_timeout', (data) => {
        if (ride.id === data.rideId) {
          setRide(prev => ({ ...prev, status: 'cancelled' }));
          setError('No drivers available. Request timed out.');
        }
      });

      return () => {
        socket.off('ride_status_update');
        socket.off('driver_location_changed');
        socket.off('eta_update');
        socket.off('receive_chat_message');
        socket.off('ride_timeout');
      };
    }
  }, [socket, ride?.id]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Fetching Ride Telemetry...</Text>
      </View>
    );
  }

  if (error || !ride) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>⚠️ {error || 'No active trip found'}</Text>
        <CustomButton title="Try Again / Back to Dashboard" onPress={onNavigateToHome} style={styles.backBtn} />
      </View>
    );
  }

  const handleCancelRide = () => {
    if (socket && ride) {
      socket.emit('cancel_ride', { rideId: ride.id, userId: user.id });
    }
  };

  const sendChat = () => {
    if (!chatText.trim()) return;
    socket.emit('send_chat_message', { rideId: ride.id, senderId: user.id, receiverId: ride.driverId, text: chatText });
    setChatText('');
  };

  const submitRating = async () => {
    try {
      await fetch(`/api/rides/${ride.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('BharatOne_token')}`
        },
        body: JSON.stringify({ rating, tags: reviewTags, comment: reviewComment, driverId: ride.driverId })
      });
      setRatingSubmitted(true);
      setTimeout(onNavigateToHome, 1000);
    } catch (e) {
      console.error(e);
      onNavigateToHome();
    }
  };

  const getStatusDetails = () => {
    const service = ride.serviceCategory || 'ride';
    const driverTerm = service === 'ambulance' ? 'Paramedic' : service === 'parcel' ? 'Courier' : service === 'food' ? 'Delivery Partner' : 'Driver';
    const vehicleTerm = service === 'ambulance' ? 'Ambulance' : service === 'parcel' ? 'Courier Van' : service === 'food' ? 'Food Delivery' : 'Cab';

    switch (ride.status) {
      case 'requested': return { title: `🚨 Searching for Nearby ${driverTerm}s`, subtitle: 'Dispatching matching request...', color: colors.warning };
      case 'accepted': return { title: `⚡ ${driverTerm} En Route`, subtitle: `${ride.driverName || driverTerm} is driving to pickup.`, color: colors.info };
      case 'arrived': return { title: `👋 Your ${vehicleTerm} Has Arrived!`, subtitle: 'Please proceed to the vehicle.', color: colors.success };
      case 'started': return { title: `🚗 Active ${service} in Progress`, subtitle: 'Cruising smoothly.', color: colors.primary };
      case 'completed': return { title: '🎉 Arrived Safely', subtitle: `Thank you for choosing SuperApp.`, color: colors.success };
      case 'cancelled': return { title: '🚫 Request Cancelled', subtitle: `This ${service} has been cancelled.`, color: colors.danger };
      default: return { title: 'Active Request', subtitle: 'Syncing details...', color: colors.textMuted };
    }
  };

  const statusMeta = getStatusDetails();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <MapView
        pickup={{ lat: ride.pickupLat, lng: ride.pickupLng, address: ride.pickupAddress }}
        dropoff={{ lat: ride.dropoffLat, lng: ride.dropoffLng, address: ride.dropoffAddress }}
        driver={ride.driverName || ride.serviceCategory === 'ambulance' ? { 
          lat: ride.driverLat || ride.pickupLat, 
          lng: ride.driverLng || ride.pickupLng, 
          name: ride.driverName || 'Driver', 
          vehicleType: ride.vehicleType, 
          serviceCategory: ride.serviceCategory, 
          vehiclePreference: ride.vehiclePreference 
        } : null}
        rideStatus={ride.status}
      />

      <GlassCard style={styles.consoleCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
          <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '800', letterSpacing: 0.5 }}>BOOKING REF:</Text>
          <Text style={{ color: colors.text, fontSize: 15, fontWeight: '900', letterSpacing: 1 }}>{ride.refId}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <View style={[styles.statusHeader, { flex: 1 }]}>
            <Text style={{ color: statusMeta.color, fontSize: 24, fontWeight: '900', marginBottom: 6 }}>{statusMeta.title}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 14, fontWeight: '500' }}>{statusMeta.subtitle}</Text>
          </View>
          {eta !== null && !['completed', 'cancelled', 'requested'].includes(ride.status) && (
            <View style={styles.etaBadge}>
              <Text style={{ color: colors.text, fontWeight: 'bold' }}>ETA</Text>
              <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '900' }}>{eta} min</Text>
            </View>
          )}
        </View>

        <View style={{ marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
          <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 8 }}>Pickup</Text>
          <Text style={{ color: colors.text, fontWeight: '500' }}>{ride.pickupAddress}</Text>
          
          <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 8 }}>Dropoff</Text>
          <Text style={{ color: colors.text, fontWeight: '500' }}>{ride.dropoffAddress}</Text>

          {ride.driverName && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
              <View>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>Driver</Text>
                <Text style={{ color: colors.text, fontWeight: 'bold' }}>{ride.driverName}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>Vehicle</Text>
                <Text style={{ color: colors.text, fontWeight: 'bold' }}>{ride.vehicleName} ({ride.vehicleNumber})</Text>
              </View>
            </View>
          )}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
            <View>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>Amount {ride.status === 'completed' ? 'Paid' : 'Estimate'}</Text>
              <Text style={{ color: colors.primary, fontSize: 18, fontWeight: 'bold' }}>₹{ride.fare?.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {ride.status === 'requested' && (
          <View style={styles.searchPulseBox}>
            <View style={styles.radarRing} />
            <Text style={styles.radarText}>📡 Sending coordinate ping...</Text>
            <Text style={{ color: colors.warning, fontWeight: 'bold', fontSize: 18, marginTop: 8 }}>
              ⏳ {Math.floor((180 - requestTimeElapsed) / 60)}:{(180 - requestTimeElapsed) % 60 < 10 ? '0' : ''}{(180 - requestTimeElapsed) % 60}
            </Text>
          </View>
        )}

        {ride.status !== 'requested' && ride.status !== 'completed' && ride.status !== 'cancelled' && (
          <View style={styles.driverProfile}>
            <View style={styles.avatarCol}>
              <View style={styles.avatar}><Text style={styles.avatarInitial}>{ride.driverName?.charAt(0) || 'D'}</Text></View>
              <Text style={styles.ratingBadge}>★ {ride.driverRating || '4.9'}</Text>
            </View>
            <View style={styles.detailsCol}>
              <Text style={styles.driverNameText}>{ride.driverName}</Text>
              <Text style={styles.vehicleText}>{ride.vehicleName} ({ride.vehicleType?.toUpperCase()})</Text>
              <Text style={styles.plateText}>{ride.vehicleNumber}</Text>
            </View>
            <View style={styles.actionCol}>
              <TouchableOpacity style={styles.sosToggleBtn} onPress={() => setSosOpen(true)}>
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>🚨 SOS</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.chatToggleBtn} onPress={() => setChatOpen(!chatOpen)}>
                <Text style={{ color: colors.text }}>💬 Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {ride.status === 'arrived' && (
          <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.danger, marginBottom: 16 }}>
            <Text style={{ color: colors.danger, fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>🛡️ Pre-Ride Safety Checklist</Text>
            {ride.serviceCategory === 'ambulance' ? (
              <Text style={{ color: colors.text, fontSize: 14 }}>• Ensure seatbelts are buckled securely{'\n'}• Check stretcher is secured & medical equipment is ready</Text>
            ) : ride.vehicleType === 'bike' || ride.vehiclePreference === 'bike' ? (
              <Text style={{ color: colors.text, fontSize: 14 }}>• helmet wear both riders for bike ride</Text>
            ) : (
              <Text style={{ color: colors.text, fontSize: 14 }}>• Ensure seatbelts are buckled securely</Text>
            )}
            <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 12, fontStyle: 'italic' }}>Please ensure these safety measures are met before the driver starts the trip.</Text>
          </View>
        )}

        {(ride.status === 'accepted' || ride.status === 'arrived') && ride.otp && (
          <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.success, marginBottom: 16, alignItems: 'center' }}>
            <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 4, textTransform: 'uppercase' }}>Secure Ride PIN</Text>
            <Text style={{ color: colors.success, fontSize: 32, fontWeight: '900', letterSpacing: 8 }}>{ride.otp}</Text>
            <Text style={{ color: colors.text, fontSize: 14, marginTop: 8, textAlign: 'center' }}>Share this PIN with your driver to start the trip.</Text>
          </View>
        )}

        {/* LIVE CHAT BOX */}
        {chatOpen && (
          <KeyboardAvoidingView behavior="padding" style={styles.chatBox}>
            <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 8, fontWeight: 'bold' }}>Live Chat</Text>
            <ScrollView style={styles.chatHistory}>
              {chatMessages.map(m => (
                <View key={m.id} style={[styles.chatMsg, m.sender_id === user.id ? styles.chatMsgSelf : styles.chatMsgOther]}>
                  <Text style={{ color: colors.text }}>{m.message_text}</Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.chatInputRow}>
              <TextInput 
                style={styles.chatInput} 
                value={chatText} 
                onChangeText={setChatText} 
                placeholder="Message driver..." 
                placeholderTextColor={colors.textMuted}
                onSubmitEditing={sendChat}
              />
              <TouchableOpacity style={styles.sendBtn} onPress={sendChat}>
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Send</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}

        {ride.status === 'completed' && (
          <View style={styles.receiptBox}>
            <View style={{ marginBottom: 20, borderBottomWidth: 1, borderColor: colors.surfaceLight, paddingBottom: 16 }}>
              <Text style={{ color: colors.success, fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
                {ride.serviceCategory === 'ambulance' ? '🚑 ' : '✅ '}Arrived Safely
              </Text>
            </View>

            {ratingSubmitted ? (
              <Text style={{ color: colors.success, fontSize: 20, textAlign: 'center', fontWeight: 'bold' }}>Thanks for your feedback!</Text>
            ) : (
              <>
                <Text style={styles.receiptHeader}>🎫 HOW WAS YOUR TRIP?</Text>
                <Text style={{ color: colors.text, textAlign: 'center', marginBottom: 16 }}>Rate {ride.driverName}</Text>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <TouchableOpacity key={s} onPress={() => setRating(s)}>
                      <Text style={{ fontSize: 32, opacity: rating >= s ? 1 : 0.3 }}>⭐</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {rating > 0 && (
                  <>
                    <View style={styles.tagsContainer}>
                      {(rating >= 4 ? POSITIVE_TAGS : NEGATIVE_TAGS).map(tag => {
                        const isSelected = reviewTags.includes(tag);
                        return (
                          <TouchableOpacity 
                            key={tag} 
                            style={[styles.tagBadge, isSelected && styles.tagBadgeActive]}
                            onPress={() => toggleTag(tag)}
                          >
                            <Text style={[styles.tagText, isSelected && styles.tagTextActive]}>{tag}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    <TextInput
                      style={styles.reviewInput}
                      placeholder="Add a comment..."
                      placeholderTextColor={colors.textMuted}
                      value={reviewComment}
                      onChangeText={setReviewComment}
                      multiline
                    />
                  </>
                )}

                <CustomButton title="Submit Feedback" onPress={submitRating} variant="primary" style={styles.doneBtn} />
                <CustomButton 
                  title="📄 View Full Invoice" 
                  onPress={() => window.setRiderScreen?.('history')} 
                  variant="outline" 
                  style={{ width: '100%', marginTop: 12 }} 
                />
              </>
            )}
          </View>
        )}

        {ride.status === 'cancelled' && (
          <View style={styles.receiptBox}>
            <Text style={[styles.receiptHeader, { color: colors.danger }]}>🚫 TRIP CANCELLED</Text>
            
            {ride.payment_status === 'refunded' ? (
              <View style={{ backgroundColor: 'rgba(163,230,53,0.1)', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: colors.primary, marginBottom: 16 }}>
                <Text style={{ color: colors.text, fontWeight: 'bold', textAlign: 'center', marginBottom: 6, fontSize: 16 }}>💸 Refund Processed</Text>
                <Text style={{ color: colors.textMuted, textAlign: 'center', fontSize: 13 }}>
                  ₹{ride.fare?.toFixed(2)} has been successfully returned to your Digital Wallet.
                </Text>
              </View>
            ) : ride.payment_mode === 'digital' ? (
              <View style={{ marginBottom: 16, backgroundColor: colors.overlay, padding: 16, borderRadius: 8 }}>
                <Text style={{ color: colors.text, textAlign: 'center', fontWeight: 'bold', marginBottom: 6 }}>Refund Eligible</Text>
                <Text style={{ color: colors.textMuted, textAlign: 'center', fontSize: 13 }}>
                  To claim your refund, go to <Text style={{color: colors.primary, fontWeight: 'bold'}}>Support &gt; Claim Refund</Text> and enter your Booking Ref ID (<Text style={{color: colors.text}}>{ride.refId}</Text>).
                </Text>
              </View>
            ) : null}

            <CustomButton title="Return to Dashboard" onPress={onNavigateToHome} variant="outline" style={styles.doneBtn} />
          </View>
        )}

        {['requested', 'accepted', 'arrived'].includes(ride.status) && (
          <CustomButton title="Cancel Request" onPress={handleCancelRide} variant="danger" style={styles.cancelBtn} />
        )}
      </GlassCard>

      {/* SOS MODAL */}
      {sosOpen && (
        <View style={styles.sosModalOverlay}>
          <GlassCard style={styles.sosModal}>
            <Text style={styles.sosTitle}>🚨 EMERGENCY SOS</Text>
            <Text style={styles.sosDesc}>Your live location coordinates ({ride.pickupLat?.toFixed(4)}, {ride.pickupLng?.toFixed(4)}) are ready to be shared.</Text>
            
            <CustomButton title="📞 Call Police (100)" onPress={() => { alert('Dialing Police...'); setSosOpen(false); }} variant="danger" style={{marginBottom: 12, backgroundColor: '#FF003C'}} />
            <CustomButton title="🚑 Call Ambulance (108)" onPress={() => { alert('Dialing Ambulance...'); setSosOpen(false); }} variant="danger" style={{marginBottom: 12, backgroundColor: '#FF1111'}} />
            <CustomButton title="🎧 BharatOne 24/7 Support" onPress={() => { alert('Connecting to Live Support...'); setSosOpen(false); }} variant="primary" style={{marginBottom: 20}} />
            
            <CustomButton title="Cancel SOS" onPress={() => setSosOpen(false)} variant="outline" />
          </GlassCard>
        </View>
      )}
    </ScrollView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 24, paddingBottom: 60 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: 24 },
  loadingText: { color: colors.textMuted, marginTop: 16, fontSize: 16, fontWeight: '600' },
  consoleCard: { marginTop: 20 },
  statusHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingBottom: 16, marginBottom: 16 },
  statusIndicator: { width: 12, height: 12, borderRadius: 6 },
  statusTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  statusSubtitle: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  etaBadge: { backgroundColor: 'rgba(163,230,53,0.1)', borderWidth: 1, borderColor: colors.primary, borderRadius: 8, padding: 8, alignItems: 'center' },
  searchPulseBox: { alignItems: 'center', paddingVertical: 20, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.surfaceLight },
  radarRing: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: colors.primary, backgroundColor: 'rgba(99, 102, 241, 0.1)', marginBottom: 16 },
  radarText: { color: colors.textDim, fontSize: 12, fontFamily: 'monospace' },
  driverProfile: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, borderWidth: 1.5, borderColor: colors.surfaceLight, borderRadius: 12, padding: 16, marginBottom: 16 },
  avatarCol: { alignItems: 'center', marginRight: 16 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold' },
  ratingBadge: { color: colors.secondary, fontSize: 11, fontWeight: 'bold', marginTop: 6, backgroundColor: 'rgba(245, 158, 11, 0.1)', paddingVertical: 2, paddingHorizontal: 6, borderRadius: 4 },
  detailsCol: { flex: 1 },
  driverNameText: { color: colors.text, fontSize: 16, fontWeight: 'bold' },
  vehicleText: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  plateText: { color: colors.textDim, fontSize: 12, fontFamily: 'monospace', marginTop: 4 },
  actionCol: { alignItems: 'flex-end', gap: 8 },
  sosToggleBtn: { backgroundColor: '#FF003C', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, shadowColor: '#FF003C', shadowOpacity: 0.8, shadowRadius: 10, elevation: 5 },
  chatToggleBtn: { backgroundColor: 'rgba(56,189,248,0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.parcelColor },
  chatBox: { backgroundColor: colors.surface, borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: colors.surfaceLight },
  chatHistory: { maxHeight: 150, marginBottom: 10 },
  chatMsg: { padding: 8, borderRadius: 8, marginBottom: 6, maxWidth: '80%' },
  chatMsgSelf: { alignSelf: 'flex-end', backgroundColor: 'rgba(163,230,53,0.2)', borderBottomRightRadius: 2 },
  chatMsgOther: { alignSelf: 'flex-start', backgroundColor: colors.surfaceLight, borderBottomLeftRadius: 2 },
  chatInputRow: { flexDirection: 'row', gap: 8 },
  chatInput: { flex: 1, backgroundColor: colors.surfaceLight, color: colors.text, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  sendBtn: { backgroundColor: colors.parcelColor, justifyContent: 'center', paddingHorizontal: 16, borderRadius: 8 },
  receiptBox: { marginTop: 24, backgroundColor: colors.surface, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: colors.surfaceLight },
  receiptHeader: { color: colors.textMuted, fontSize: 13, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 },
  starsContainer: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 16 },
  doneBtn: { width: '100%', marginTop: 24 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 16 },
  tagBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.surfaceLight },
  tagBadgeActive: { backgroundColor: 'rgba(163,230,53,0.2)', borderColor: colors.primary },
  tagText: { color: colors.textMuted, fontSize: 12 },
  tagTextActive: { color: colors.primary, fontWeight: 'bold' },
  reviewInput: { backgroundColor: colors.surfaceLight, color: colors.text, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: colors.surfaceLight, height: 80, textAlignVertical: 'top' },
  cancelBtn: { width: '100%', marginBottom: 16 },
  errorText: { color: colors.danger, fontWeight: 'bold', marginBottom: 16 },
  backBtn: { marginTop: 16 },
  sosModalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20, zIndex: 9999 },
  sosModal: { width: '100%', maxWidth: 400, borderColor: '#FF003C', borderWidth: 2, shadowColor: '#FF003C', shadowOpacity: 0.5, shadowRadius: 20 },
  sosTitle: { color: '#FF003C', fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 8, textShadowColor: 'rgba(255,0,60,0.5)', textShadowOffset: {width: 0, height: 0}, textShadowRadius: 10 },
  sosDesc: { color: colors.textMuted, textAlign: 'center', marginBottom: 24, fontSize: 14, lineHeight: 20 },
});
