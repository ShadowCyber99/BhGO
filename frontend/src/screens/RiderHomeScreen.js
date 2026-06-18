import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, ActivityIndicator, TextInput, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { logoSvgBase64 } from '../constants/logo';
import GlassCard from '../components/GlassCard';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import MapView from '../components/MapView';
const CITIES = [
  { id: 'DEL', name: 'Delhi', lat: 28.6139, lng: 77.2090 },
  { id: 'MUM', name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { id: 'BLR', name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  { id: 'HYD', name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  { id: 'CHE', name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { id: 'KOL', name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { id: 'PUN', name: 'Pune', lat: 18.5204, lng: 73.8567 },
  { id: 'AMD', name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { id: 'JAI', name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  { id: 'SUR', name: 'Surat', lat: 21.1702, lng: 72.8311 },
  // Punjab & Regional additions
  { id: 'CHD', name: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
  { id: 'MOH', name: 'Mohali', lat: 30.7046, lng: 76.7179 },
  { id: 'KHA', name: 'Kharar', lat: 30.7492, lng: 76.6433 },
  { id: 'LUD', name: 'Ludhiana', lat: 30.9010, lng: 75.8523 },
  { id: 'AMR', name: 'Amritsar', lat: 31.6340, lng: 74.8723 },
  { id: 'JAL', name: 'Jalandhar', lat: 31.3260, lng: 75.5762 }
];

const FAMOUS_PLACES = [
  { name: 'India Gate', city: 'Delhi', lat: 28.6129, lng: 77.2295 },
  { name: 'Red Fort', city: 'Delhi', lat: 28.6562, lng: 77.2410 },
  { name: 'Connaught Place', city: 'Delhi', lat: 28.6304, lng: 77.2177 },
  { name: 'Gateway of India', city: 'Mumbai', lat: 18.9220, lng: 72.8347 },
  { name: 'Marine Drive', city: 'Mumbai', lat: 18.9440, lng: 72.8227 },
  { name: 'Bandra Kurla Complex (BKC)', city: 'Mumbai', lat: 19.0655, lng: 72.8656 },
  { name: 'Vidhana Soudha', city: 'Bangalore', lat: 12.9796, lng: 77.5906 },
  { name: 'MG Road', city: 'Bangalore', lat: 12.9738, lng: 77.6119 },
  { name: 'Charminar', city: 'Hyderabad', lat: 17.3616, lng: 78.4747 },
  { name: 'HITEC City', city: 'Hyderabad', lat: 17.4435, lng: 78.3772 },
  { name: 'Marina Beach', city: 'Chennai', lat: 13.0500, lng: 80.2824 },
  { name: 'T Nagar', city: 'Chennai', lat: 13.0405, lng: 80.2337 },
  { name: 'Victoria Memorial', city: 'Kolkata', lat: 22.5448, lng: 88.3426 },
  { name: 'Howrah Bridge', city: 'Kolkata', lat: 22.5851, lng: 88.3468 },
  { name: 'Shaniwar Wada', city: 'Pune', lat: 18.5195, lng: 73.8553 },
  { name: 'Koregaon Park', city: 'Pune', lat: 18.5362, lng: 73.8939 },
  { name: 'Sabarmati Ashram', city: 'Ahmedabad', lat: 23.0607, lng: 72.5807 },
  { name: 'Hawa Mahal', city: 'Jaipur', lat: 26.9239, lng: 75.8267 },
  { name: 'Dumas Beach', city: 'Surat', lat: 21.0827, lng: 72.7093 }
];

const HOSPITALS = [
  { id: 1, name: '🏥 AIIMS', city: 'Delhi', address: 'Ansari Nagar, New Delhi', lat: 28.5659, lng: 77.2093 },
  { id: 2, name: '🏥 Safdarjung Hospital', city: 'Delhi', address: 'Ring Road, New Delhi', lat: 28.5684, lng: 77.2059 },
  { id: 3, name: '🏥 Apollo Hospital', city: 'Delhi', address: 'Sarita Vihar, Delhi', lat: 28.5360, lng: 77.2844 },
  { id: 4, name: '🏥 Lilavati Hospital', city: 'Mumbai', address: 'Bandra West, Mumbai', lat: 19.0514, lng: 72.8256 },
  { id: 5, name: '🏥 Tata Memorial', city: 'Mumbai', address: 'Parel, Mumbai', lat: 19.0044, lng: 72.8436 },
  { id: 6, name: '🏥 Fortis Hospital', city: 'Mumbai', address: 'Mulund, Mumbai', lat: 19.1601, lng: 72.9365 },
  { id: 7, name: '🏥 Manipal Hospital', city: 'Bangalore', address: 'Old Airport Road, Bangalore', lat: 12.9585, lng: 77.6496 },
  { id: 8, name: '🏥 Narayana Hrudayalaya', city: 'Bangalore', address: 'Bommasandra, Bangalore', lat: 12.8166, lng: 77.6835 },
  { id: 9, name: '🏥 NIMHANS', city: 'Bangalore', address: 'Hosur Road, Bangalore', lat: 12.9381, lng: 77.5936 },
  { id: 10, name: '🏥 Apollo Health City', city: 'Hyderabad', address: 'Jubilee Hills, Hyderabad', lat: 17.4124, lng: 78.4082 },
  { id: 11, name: '🏥 Yashoda Hospital', city: 'Hyderabad', address: 'Secunderabad, Hyderabad', lat: 17.4410, lng: 78.5042 },
  { id: 12, name: '🏥 CMC Vellore', city: 'Chennai', address: 'Vellore (Near Chennai)', lat: 12.9255, lng: 79.1352 },
  { id: 13, name: '🏥 MIOT International', city: 'Chennai', address: 'Manapakkam, Chennai', lat: 13.0183, lng: 80.1764 },
  { id: 14, name: '🏥 AMRI Hospital', city: 'Kolkata', address: 'Dhakuria, Kolkata', lat: 22.5074, lng: 88.3653 },
  { id: 15, name: '🏥 Ruby General', city: 'Kolkata', address: 'Kasba, Kolkata', lat: 22.5137, lng: 88.4037 },
  { id: 16, name: '🏥 Ruby Hall Clinic', city: 'Pune', address: 'Sassoon Road, Pune', lat: 18.5303, lng: 73.8749 },
  { id: 17, name: '🏥 Deenanath Mangeshkar', city: 'Pune', address: 'Erandwane, Pune', lat: 18.5040, lng: 73.8232 },
  { id: 18, name: '🏥 Zydus Hospital', city: 'Ahmedabad', address: 'Thaltej, Ahmedabad', lat: 23.0617, lng: 72.5222 },
  { id: 19, name: '🏥 SMS Hospital', city: 'Jaipur', address: 'Ashok Nagar, Jaipur', lat: 26.8996, lng: 75.8157 },
  { id: 20, name: '🏥 Kiran Hospital', city: 'Surat', address: 'Katargam, Surat', lat: 21.2173, lng: 72.8276 }
];

const DEMO_ROUTES = [
  {
    id: 1,
    name: 'Delhi Airport to India Gate',
    pickup: { address: 'Delhi Airport', lat: 28.5562, lng: 77.1000 },
    dropoff: { address: 'India Gate, Delhi', lat: 28.6129, lng: 77.2295 },
    baseDistance: 15.0
  },
  {
    id: 2,
    name: 'Mumbai Central to Gateway of India',
    pickup: { address: 'Mumbai Central', lat: 18.9696, lng: 72.8193 },
    dropoff: { address: 'Gateway of India, Mumbai', lat: 18.9220, lng: 72.8347 },
    baseDistance: 8.0
  },
  {
    id: 3,
    name: 'Bangalore Airport to MG Road',
    pickup: { address: 'Bangalore Airport', lat: 13.1989, lng: 77.7068 },
    dropoff: { address: 'MG Road, Bangalore', lat: 12.9738, lng: 77.6119 },
    baseDistance: 35.0
  }
];

export default function RiderHomeScreen({ onNavigateToActiveRide }) {
  const { user, logout, socket } = useAuth();
  const { colors, isDarkMode, toggleTheme, changeTheme, availableThemes, themeName } = useTheme();
  const styles = getStyles(colors);
  
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [dropoffCoords, setDropoffCoords] = useState(null);

  const [customPickup, setCustomPickup] = useState('');
  const [customDropoff, setCustomDropoff] = useState('');
  const [waypoints, setWaypoints] = useState([]); // Array of strings
  
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
  const [selectedCity, setSelectedCity] = useState(CITIES[0]); // Default to Delhi
  const [showCityPicker, setShowCityPicker] = useState(false);
  
  const [serviceCategory, setServiceCategory] = useState('ride'); 
  const [vehiclePreference, setVehiclePreference] = useState('any');
  const [baseDistance, setBaseDistance] = useState(0);
  const [fare, setFare] = useState(0);

  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState('');

  const [foodCategoryTab, setFoodCategoryTab] = useState('food'); // 'food' or 'grocery'
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);

  // Payment State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState('digital'); // 'digital' or 'cash'
  const [isSurgeActive, setIsSurgeActive] = useState(false);

  // Support State
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportTab, setSupportTab] = useState('contact'); // 'contact', 'complaint', 'faq', 'manual', 'refund'
  const [complaintText, setComplaintText] = useState('');
  const [complaintSubmitted, setComplaintSubmitted] = useState(false);
  const [faqQuery, setFaqQuery] = useState('');
  const [faqResponse, setFaqResponse] = useState(null);
  
  const [refundRefId, setRefundRefId] = useState('');
  const [refundData, setRefundData] = useState(null);
  const [refundError, setRefundError] = useState('');
  const [refundSuccess, setRefundSuccess] = useState(false);
  const [refundInvoice, setRefundInvoice] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleFaqSubmit = () => {
    if (!faqQuery.trim()) return;
    const query = faqQuery.toLowerCase();
    if (query.match(/refund|cancel|money|claim|return/)) {
      setFaqResponse("🤖 Refunds are processed automatically for digital payments. You can claim a manual refund on the Support -> Refunds tab if you cancel a digital trip.");
    } else if (query.match(/driver|report|complaint|bad|rude/)) {
      setFaqResponse("🤖 You can message your driver directly via Live Chat on an active ride. To report a driver, please use the Complaint tab under Profile -> Support.");
    } else if (query.match(/pay|cash|card|wallet|money/)) {
      setFaqResponse("🤖 We accept Digital Wallet and Cash. Make sure to have exact change for cash orders!");
    } else if (query.match(/book|ride|cab|taxi|how/)) {
      setFaqResponse("🤖 To book a ride: Select the 'Ride' tab, enter your Pickup and Dropoff locations, hit 'Calculate Route & Fare', and click 'Pay & Request'. We'll find you a driver instantly!");
    } else if (query.match(/food|grocery|eat|hungry|order/)) {
      setFaqResponse("🤖 To order food: Switch to the 'Food' tab at the top, select a restaurant or grocery store, add items to your cart, and click Checkout!");
    } else {
      setFaqResponse("🤖 I'm sorry, I couldn't understand that. Try asking about booking rides, ordering food, refunds, drivers, or payments. For anything else, please contact real Support.");
    }
  };

  const fetchRefundDetails = async () => {
    setRefundError('');
    setRefundSuccess(false);
    setRefundInvoice(null);
    setRefundData(null);
    if (!refundRefId.trim()) return setRefundError('Please enter a Booking Ref ID');
    try {
      const res = await fetch(`/api/rides/ref/${refundRefId.trim()}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('cabride_token')}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch details');
      setRefundData(data);
    } catch(err) {
      setRefundError(err.message);
    }
  };

  const processSupportRefund = async () => {
    try {
      setRefundError('');
      const res = await fetch(`/api/rides/${refundData.id}/refund`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('cabride_token')}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRefundSuccess(true);
      if (data.invoice) setRefundInvoice(data.invoice);
      setRefundData(prev => ({...prev, payment_status: 'refunded'}));
    } catch(err) {
      setRefundError(err.message);
    }
  };

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await fetch(`/api/rides/drivers?service=${serviceCategory}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('cabride_token')}` } });
        if (res.ok) setNearbyDrivers(await res.json());
      } catch (err) {}
    };
    fetchDrivers();
    if (socket) {
      socket.on('drivers_changed', fetchDrivers);
      return () => socket.off('drivers_changed', fetchDrivers);
    }
  }, [socket, serviceCategory]);

  useEffect(() => {
    const checkActiveRide = async () => {
      try {
        const data = await api.getActiveRide();
        if (data.ride) onNavigateToActiveRide();
      } catch (err) {}
    };
    checkActiveRide();
  }, []);

  useEffect(() => {
    if (serviceCategory === 'food') {
      fetch('/api/rides/restaurants', { headers: { 'Authorization': `Bearer ${localStorage.getItem('cabride_token')}` } })
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => { if (Array.isArray(data)) setRestaurants(data); })
      .catch(() => {});
    }
  }, [serviceCategory]);

  const calculateFare = (distanceInKm, category, vehicle) => {
    let baseFare = 40;
    let perKmRate = 12;

    if (category === 'ride' || category === 'parcel') {
      switch (vehicle) {
        case 'bike':
          baseFare = 20;
          perKmRate = 5;
          break;
        case 'auto':
          baseFare = 25;
          perKmRate = 10;
          break;
        case 'economy':
        case 'any':
          baseFare = 40;
          perKmRate = 12;
          break;
        case 'premium':
          baseFare = 50;
          perKmRate = 15;
          break;
        case 'suv':
          baseFare = 70;
          perKmRate = 20;
          break;
        case 'van':
          baseFare = 50;
          perKmRate = 15;
          break;
        default:
          baseFare = 40;
          perKmRate = 12;
      }
    } else if (category === 'ambulance') {
      baseFare = 500;
      perKmRate = 25;
    } else if (category === 'food') {
      baseFare = 0;
      perKmRate = 0;
    }

    let fare = baseFare + (distanceInKm * perKmRate);
    
    if (category === 'parcel') fare *= 0.8; // Parcel is slightly discounted

    // Surge Logic
    let multiplier = 1.0;
    const hour = new Date().getHours();
    // Rush hours: 8am-10am and 5pm-8pm (17-20)
    const isRushHour = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20);
    if (isRushHour && category !== 'food' && category !== 'grocery' && category !== 'ambulance') {
      multiplier = 1.5; // 1.5x surge pricing
      setIsSurgeActive(true);
    } else {
      setIsSurgeActive(false);
    }
    
    fare *= multiplier;

    return Math.max(fare, baseFare); // Minimum fare is the base fare
  };

  useEffect(() => {
    if (baseDistance > 0) {
      setFare(parseFloat(calculateFare(baseDistance, serviceCategory, vehiclePreference).toFixed(2)));
    }
  }, [baseDistance, serviceCategory, vehiclePreference]);

  const handleSelectRoute = (route) => {
    setError('');
    setPickupAddress(route.pickup.address);
    setPickupCoords({ lat: route.pickup.lat, lng: route.pickup.lng });
    setDropoffAddress(route.dropoff.address);
    setDropoffCoords({ lat: route.dropoff.lat, lng: route.dropoff.lng });
    setBaseDistance(route.baseDistance);
    setCustomPickup('');
    setCustomDropoff('');
    setWaypoints([]);
  };

  const generateCoordsFromText = (text, city) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) hash = text.charCodeAt(i) + ((hash << 5) - hash);
    const offsetLat = (hash % 100) / 2000;
    const offsetLng = ((hash >> 2) % 100) / 2000;
    return { lat: city.lat + offsetLat, lng: city.lng + offsetLng };
  };

  const handleCustomAddressChange = (type, text) => {
    if (type === 'pickup') {
      setCustomPickup(text);
      if (text.length > 2) {
        setPickupSuggestions(FAMOUS_PLACES.filter(p => p.name.toLowerCase().includes(text.toLowerCase()) || p.city.toLowerCase().includes(text.toLowerCase())));
        setPickupCoords(generateCoordsFromText(text, selectedCity));
      } else {
        setPickupSuggestions([]);
      }
    } else {
      setCustomDropoff(text);
      if (text.length > 2) {
        setDropoffSuggestions(FAMOUS_PLACES.filter(p => p.name.toLowerCase().includes(text.toLowerCase()) || p.city.toLowerCase().includes(text.toLowerCase())));
        setDropoffCoords(generateCoordsFromText(text, selectedCity));
      } else {
        setDropoffSuggestions([]);
      }
    }
  };

  const selectSuggestion = (type, place) => {
    if (type === 'pickup') {
      setCustomPickup(`${place.name}, ${place.city}`);
      setPickupCoords({ lat: place.lat, lng: place.lng });
      setPickupSuggestions([]);
    } else {
      setCustomDropoff(`${place.name}, ${place.city}`);
      setDropoffCoords({ lat: place.lat, lng: place.lng });
      setDropoffSuggestions([]);
    }
  };

  const handleCalculateCustomRoute = () => {
    if (!customPickup || !customDropoff) return setError('Please enter both pickup and dropoff addresses');
    setError('');
    
    // Check if custom string matches any famous place to grab exact coords, else mock it
    const pMatch = FAMOUS_PLACES.find(p => customPickup.includes(p.name));
    const dMatch = FAMOUS_PLACES.find(p => customDropoff.includes(p.name));

    const pLat = pMatch ? pMatch.lat : selectedCity.lat + (Math.random() * 0.05);
    const pLng = pMatch ? pMatch.lng : selectedCity.lng + (Math.random() * 0.05);
    const dLat = dMatch ? dMatch.lat : selectedCity.lat + (Math.random() * 0.05);
    const dLng = dMatch ? dMatch.lng : selectedCity.lng + (Math.random() * 0.05);
    
    const latDiff = pLat - dLat;
    const lngDiff = pLng - dLng;
    const distanceKm = Math.sqrt(latDiff*latDiff + lngDiff*lngDiff) * 111;
    const baseDist = Math.max(2.5, distanceKm);

    setPickupAddress(customPickup);
    setPickupCoords({ lat: pLat, lng: pLng });
    setDropoffAddress(customDropoff);
    setDropoffCoords({ lat: dLat, lng: dLng });
    setBaseDistance(baseDist);
  };

  const initiatePayment = () => {
    let amount = fare;
    if (serviceCategory === 'food') {
      const extraFees = foodCategoryTab === 'grocery' ? 20 : 40;
      amount = cartTotal + extraFees;
      if (cart.length === 0) return;
      setPaymentAmount(amount);
    } else {
      if (!pickupCoords || !dropoffCoords) return setError('Please select or calculate a route first!');
      setPaymentAmount(amount);
    }
    setError('');
    setShowPaymentModal(true);
  };

  const processPaymentAndRequest = async () => {
    setPaymentProcessing(true);
    // Simulate processing delay (shorter for cash)
    const delay = paymentMode === 'cash' ? 1000 : 2500;
    setTimeout(async () => {
      try {
        if (serviceCategory === 'food') {
          await doPlaceFoodOrder();
        } else {
          await doRequestRide();
        }
        setShowPaymentModal(false);
      } catch (err) {
        setError('Request failed after payment. Refund issued.');
      } finally {
        setPaymentProcessing(false);
      }
    }, delay);
  };

  const doRequestRide = async () => {
    const payload = {
      serviceCategory, vehiclePreference, pickupAddress, dropoffAddress,
      waypoints: waypoints.filter(w => w.trim() !== ''),
      pickupLat: pickupCoords.lat, pickupLng: pickupCoords.lng,
      dropoffLat: dropoffCoords.lat, dropoffLng: dropoffCoords.lng, fare, paymentMode
    };
    const ride = await api.requestRide(payload);
    if (socket) socket.emit('request_ride', ride);
    setTimeout(() => onNavigateToActiveRide(), 500);
  };

  const openRestaurant = async (rest) => {
    setSelectedRestaurant(rest);
    setCart([]);
    try {
      const res = await fetch(`/api/rides/restaurants/${rest.id}/menu`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('cabride_token')}` } });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setMenuItems(data);
      }
    } catch (err) {}
  };

  const addToCart = (item) => setCart([...cart, item]);
  const cartTotal = cart.reduce((sum, item) => sum + parseFloat(item.price), 0);

  const doPlaceFoodOrder = async () => {
    const deliveryFee = 5.00;
    const ridePayload = {
      serviceCategory: 'food', vehiclePreference: 'any',
      pickupAddress: selectedRestaurant.name, dropoffAddress: 'Home (Demo)',
      pickupLat: selectedCity.lat + 0.005, pickupLng: selectedCity.lng + 0.005, dropoffLat: selectedCity.lat, dropoffLng: selectedCity.lng,
      fare: deliveryFee, paymentMode
    };
    const ride = await api.requestRide(ridePayload);
    await fetch('/api/rides/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('cabride_token')}` },
      body: JSON.stringify({ rideId: ride.id, restaurantId: selectedRestaurant.id, totalAmount: cartTotal + deliveryFee, itemsJson: cart })
    });
    if (socket) socket.emit('request_ride', ride);
    setTimeout(() => onNavigateToActiveRide(), 500);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.nav}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Image source={{ uri: logoSvgBase64 }} style={{ width: 130, height: 40 }} resizeMode="contain" />
          <Text style={{fontSize: 14, color: colors.primary, fontWeight: 'bold'}}>🇮🇳 India</Text>
        </View>
        <View style={styles.userBox}>
          <TouchableOpacity onPress={() => setShowCityPicker(true)} style={styles.cityBtn}>
            <Text style={styles.cityBtnText}>📍 {selectedCity.name}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowProfileModal(true)} style={styles.profileBtn}>
            <Text style={styles.userName}>👤 Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.serviceSelectorRibbon}>
        <TouchableOpacity style={[styles.serviceTab, serviceCategory === 'ride' && { borderColor: colors.rideColor, backgroundColor: 'rgba(163,230,53,0.1)' }]} onPress={() => setServiceCategory('ride')}>
          <Text style={styles.serviceIcon}>🚕</Text>
          <Text style={[styles.serviceText, serviceCategory === 'ride' && { color: colors.rideColor }]}>Ride</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.serviceTab, serviceCategory === 'ambulance' && { borderColor: colors.ambulanceColor, backgroundColor: 'rgba(239,68,68,0.1)' }]} onPress={() => setServiceCategory('ambulance')}>
          <Text style={styles.serviceIcon}>🚑</Text>
          <Text style={[styles.serviceText, serviceCategory === 'ambulance' && { color: colors.ambulanceColor }]}>Ambulance</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.serviceTab, serviceCategory === 'parcel' && { borderColor: colors.parcelColor, backgroundColor: 'rgba(56,189,248,0.1)' }]} onPress={() => setServiceCategory('parcel')}>
          <Text style={styles.serviceIcon}>📦</Text>
          <Text style={[styles.serviceText, serviceCategory === 'parcel' && { color: colors.parcelColor }]}>Parcel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.serviceTab, serviceCategory === 'food' && { borderColor: colors.foodColor, backgroundColor: 'rgba(249,115,22,0.1)' }]} onPress={() => setServiceCategory('food')}>
          <Text style={styles.serviceIcon}>🍔</Text>
          <Text style={[styles.serviceText, serviceCategory === 'food' && { color: colors.foodColor }]}>Food</Text>
        </TouchableOpacity>
      </View>

      {/* FOOD MARKETPLACE VIEW */}
      {serviceCategory === 'food' ? (
        <View style={{ marginTop: 30 }}>
          {!selectedRestaurant ? (
            <GlassCard style={{ padding: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>Craving Something?</Text>
                
                <View style={styles.foodTabs}>
                  <TouchableOpacity style={[styles.foodTab, foodCategoryTab === 'food' && styles.foodTabActive]} onPress={() => setFoodCategoryTab('food')}>
                    <Text style={[styles.foodTabText, foodCategoryTab === 'food' && {color: colors.text}]}>🍽️ Restaurants</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.foodTab, foodCategoryTab === 'grocery' && styles.foodTabActive]} onPress={() => setFoodCategoryTab('grocery')}>
                    <Text style={[styles.foodTabText, foodCategoryTab === 'grocery' && {color: colors.text}]}>🛒 Groceries</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
                {restaurants.length === 0 ? (
                  <View style={{ padding: 20, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 12, borderWidth: 1, borderColor: colors.danger, width: '100%' }}>
                    <Text style={{ color: colors.danger, fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>⚠️ No Stores Found</Text>
                    <Text style={{ color: colors.text }}>Please re-seed your database with Indian locations.</Text>
                  </View>
                ) : (
                  restaurants.filter(r => {
                    const isMatchCategory = r.category === foodCategoryTab || (!r.category && foodCategoryTab === 'food');
                    const isCityMatch = (r.city && r.city === selectedCity.name) || r.category === 'grocery'; // Make groceries global for now, or use real city mapping if updated
                    return isMatchCategory && isCityMatch;
                  }).map(r => (
                    <TouchableOpacity key={r.id} style={styles.restaurantCard} onPress={() => openRestaurant(r)}>
                      <Text style={{ fontSize: 40 }}>{r.image_url}</Text>
                      <Text style={styles.restaurantName}>{r.name}</Text>
                      <Text style={styles.restaurantCuisine}>{r.cuisine} • ⭐ {r.rating}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </GlassCard>
          ) : (
            <View style={styles.dashboard}>
              <View style={styles.leftCol}>
                <GlassCard style={styles.glassCard}>
                  <TouchableOpacity onPress={() => setSelectedRestaurant(null)}>
                    <Text style={{ color: colors.primary, marginBottom: 16 }}>← Back to Restaurants</Text>
                  </TouchableOpacity>
                  <Text style={styles.cardTitle}>{selectedRestaurant.name} Menu</Text>
                  
                  {menuItems.map(item => (
                    <View key={item.id} style={styles.menuItem}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold' }}>{item.image_url} {item.name} {item.is_veg && '🌿'}</Text>
                        <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>{item.description}</Text>
                        <Text style={{ color: colors.foodColor, fontWeight: 'bold', marginTop: 8 }}>₹{item.price}</Text>
                      </View>
                      <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(item)}><Text style={{ color: colors.text, fontWeight: 'bold' }}>Add</Text></TouchableOpacity>
                    </View>
                  ))}
                </GlassCard>
              </View>

              <View style={styles.rightCol}>
                <GlassCard style={styles.glassCard}>
                  <Text style={styles.cardTitle}>Your Cart</Text>
                  {cart.length === 0 ? (
                    <Text style={{ color: colors.textMuted }}>Cart is empty.</Text>
                  ) : (
                    <View style={{ flex: 1 }}>
                      {cart.map((c, i) => (
                        <Text key={i} style={{ color: colors.text, marginBottom: 8 }}>• {c.name} - ₹{c.price}</Text>
                      ))}
                      <View style={{ marginTop: 'auto', borderTopWidth: 1, borderColor: colors.surfaceLight, paddingTop: 16 }}>
                        <Text style={{ color: colors.textMuted, fontSize: 16 }}>Items Total: ₹{cartTotal.toFixed(2)}</Text>
                        <Text style={{ color: colors.textMuted, fontSize: 14 }}>Delivery Partner Fee: ₹{foodCategoryTab === 'grocery' ? '15.00' : '30.00'}</Text>
                        <Text style={{ color: colors.textMuted, fontSize: 14 }}>Platform Fee: ₹{foodCategoryTab === 'grocery' ? '5.00' : '10.00'}</Text>
                        <Text style={{ color: colors.foodColor, fontSize: 24, fontWeight: '900', marginVertical: 12 }}>Total: ₹{(cartTotal + (foodCategoryTab === 'grocery' ? 20 : 40)).toFixed(2)}</Text>
                        <CustomButton title="Checkout & Pay" onPress={initiatePayment} variant="primary" />
                      </View>
                    </View>
                  )}
                </GlassCard>
              </View>
            </View>
          )}
        </View>
      ) : (
        /* STANDARD RIDE / PARCEL / AMBULANCE VIEW */
        <>
          <MapView cityCenter={selectedCity} pickup={pickupCoords} dropoff={dropoffCoords} nearbyDrivers={nearbyDrivers} />

          <View style={styles.dashboard}>
            <View style={styles.leftCol}>
              <GlassCard style={styles.glassCard}>
                <Text style={styles.helperHeader}>✍️ Custom Route (Smart Search)</Text>
                <View style={styles.customRouteBox}>
                  <View style={{zIndex: 20}}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ color: colors.textMuted, fontSize: 12 }}>Pickup Location</Text>
                      <TouchableOpacity onPress={() => {
                        setCustomPickup('Current Location');
                        setPickupCoords({ lat: selectedCity.lat + 0.002, lng: selectedCity.lng + 0.002 });
                      }}>
                        <Text style={{ color: colors.primary, fontSize: 12 }}>Use GPS</Text>
                      </TouchableOpacity>
                    </View>
                    <TextInput style={styles.routeInput} placeholder="Enter Pickup..." placeholderTextColor={colors.textMuted} value={customPickup} onChangeText={(val) => handleCustomAddressChange('pickup', val)} />
                    {pickupSuggestions.length > 0 && (
                      <View style={styles.suggestionsBox}>
                        {pickupSuggestions.map((p, i) => (
                          <TouchableOpacity key={i} style={styles.suggestionItem} onPress={() => selectSuggestion('pickup', p)}>
                            <Text style={styles.suggestionText}>📍 {p.name}, {p.city}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>

                  <View style={{ marginVertical: 8, zIndex: 15 }}>
                    {waypoints.map((wp, idx) => (
                      <View key={idx} style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <TextInput style={[styles.routeInput, {flex: 1, marginBottom: 0}]} placeholder={`Waypoint ${idx+1}`} placeholderTextColor={colors.textMuted} value={wp} onChangeText={(val) => { const w = [...waypoints]; w[idx] = val; setWaypoints(w); }} />
                        <TouchableOpacity onPress={() => setWaypoints(waypoints.filter((_, i) => i !== idx))}><Text style={{ color: colors.danger, fontSize: 18 }}>🗑️</Text></TouchableOpacity>
                      </View>
                    ))}
                    <TouchableOpacity onPress={() => setWaypoints([...waypoints, ''])}>
                      <Text style={{ color: colors.primary, fontWeight: 'bold' }}>+ Add Intermediate Stop</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={{zIndex: 10, marginTop: 4}}>
                    <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 4 }}>Dropoff Location</Text>
                    <TextInput style={styles.routeInput} placeholder="Enter Dropoff..." placeholderTextColor={colors.textMuted} value={customDropoff} onChangeText={(val) => handleCustomAddressChange('dropoff', val)} />
                    {dropoffSuggestions.length > 0 && (
                      <View style={styles.suggestionsBox}>
                        {dropoffSuggestions.map((p, i) => (
                          <TouchableOpacity key={i} style={styles.suggestionItem} onPress={() => selectSuggestion('dropoff', p)}>
                            <Text style={styles.suggestionText}>🏁 {p.name}, {p.city}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                  <CustomButton title="Calculate Route & Fare" onPress={handleCalculateCustomRoute} variant="outline" style={{ marginTop: 8 }} />
                </View>

                <View style={{ marginVertical: 16 }}>
                  <Text style={{ color: colors.textMuted, textAlign: 'center', fontSize: 12 }}>--- OR ---</Text>
                </View>

                {serviceCategory === 'ambulance' ? (
                  <>
                    <Text style={styles.helperHeader}>🏥 Top Hospitals in {selectedCity.name}</Text>
                    <View style={styles.routesWrapper}>
                      {HOSPITALS.filter(h => h.city === selectedCity.name).map(h => (
                        <TouchableOpacity
                          key={h.id}
                          style={[styles.routeCard, dropoffAddress === h.address && styles.activeRouteCard]}
                          onPress={() => {
                            setDropoffAddress(h.address);
                            setDropoffCoords({ lat: h.lat, lng: h.lng });
                            if (!pickupAddress) {
                              setPickupAddress('Current Location (Emergency)');
                              setPickupCoords({ lat: 40.73, lng: -73.99 });
                            }
                            setBaseDistance(8.5);
                          }}
                        >
                          <Text style={[styles.routeNameText, dropoffAddress === h.address && styles.activeRouteNameText]}>
                            {h.name}
                          </Text>
                          <Text style={{ color: colors.textDim, fontSize: 11, marginTop: 4 }}>{h.address}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.helperHeader}>✨ Quick Demo Routes</Text>
                    <View style={styles.routesWrapper}>
                      {DEMO_ROUTES.map(route => (
                        <TouchableOpacity
                          key={route.id}
                          style={[styles.routeCard, pickupAddress === route.pickup.address && styles.activeRouteCard]}
                          onPress={() => handleSelectRoute(route)}
                        >
                          <Text style={[styles.routeNameText, pickupAddress === route.pickup.address && styles.activeRouteNameText]}>
                            {route.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}

                {/* Vehicle Selection for Ride and Parcel */}
                {(serviceCategory === 'ride' || serviceCategory === 'parcel') && (
                  <View style={{ marginTop: 10, marginBottom: 20 }}>
                    <Text style={styles.helperHeader}>🚘 Select Vehicle Preference</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                      {['any', ...(serviceCategory === 'ride' ? ['auto', 'economy', 'premium', 'suv'] : ['bike', 'van'])].map(v => (
                        <TouchableOpacity 
                          key={v}
                          style={[styles.vehicleBtn, vehiclePreference === v && styles.vehicleBtnActive]}
                          onPress={() => setVehiclePreference(v)}
                        >
                          <Text style={[styles.vehicleBtnText, vehiclePreference === v && { color: colors.text }]}>{v.toUpperCase()}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </GlassCard>
            </View>

            <View style={styles.rightCol}>
              <GlassCard style={styles.glassCard}>
                <Text style={styles.cardTitle}>⚡ Confirmation</Text>

                <View style={styles.infoBox}>
                  <Text style={styles.infoTitle}>Service Type</Text>
                  <Text style={styles.infoValue}>{serviceCategory.toUpperCase()}</Text>
                </View>

                <View style={styles.bookingFooter}>
                  {pickupCoords && (
                    <View style={styles.fareBreakdown}>
                      {isSurgeActive && (
                        <View style={styles.surgeBadge}>
                          <Text style={styles.surgeText}>⚡ 1.5x Peak Hour Surge</Text>
                        </View>
                      )}
                      <Text style={styles.fareText}>Est. Fare: ₹{fare.toFixed(2)}</Text>
                      <Text style={styles.paymentInfoText}>Payment: {paymentMode === 'cash' ? '💵 Cash' : '💳 Digital (Card/Wallet)'}</Text>
                    </View>
                  )}
                  <CustomButton title={`Pay ₹${fare.toFixed(2)} & Request`} onPress={initiatePayment} variant="primary" style={styles.requestButton} />
                </View>
              </GlassCard>
            </View>
          </View>
        </>
      )}

      {/* SECURE PAYMENT MODAL */}
      <Modal visible={showPaymentModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalCard}>
            <Text style={{ color: colors.text, fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>Secure Checkout</Text>
            
            <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: colors.surfaceLight }}>
              <Text style={{ color: colors.textMuted, fontSize: 14 }}>Total Amount Due</Text>
              <Text style={{ color: colors.primary, fontSize: 36, fontWeight: '900', marginTop: 4 }}>₹{paymentAmount.toFixed(2)}</Text>
            </View>

            {paymentProcessing ? (
              <View style={{ alignItems: 'center', padding: 20 }}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ color: colors.text, marginTop: 16, fontSize: 16, fontWeight: 'bold' }}>{paymentMode === 'cash' ? 'Confirming Order...' : 'Processing Payment...'}</Text>
                <Text style={{ color: colors.textMuted, marginTop: 8, fontSize: 12 }}>{paymentMode === 'cash' ? 'Validating request.' : 'Authorizing digital wallet.'}</Text>
              </View>
            ) : (
              <>
                <Text style={{ color: colors.text, marginBottom: 12 }}>Payment Method</Text>
                
                <TouchableOpacity 
                  style={[styles.paymentMethodCard, paymentMode === 'digital' && styles.paymentMethodActive]} 
                  onPress={() => setPaymentMode('digital')}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Text style={{ fontSize: 24 }}>💳</Text>
                    <View>
                      <Text style={{ color: colors.text, fontWeight: 'bold' }}>Digital Wallet</Text>
                      <Text style={{ color: colors.textMuted, fontSize: 12 }}>Balance: ₹999.00</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.paymentMethodCard, paymentMode === 'cash' && styles.paymentMethodActive]} 
                  onPress={() => setPaymentMode('cash')}
                >
                  <Text style={{ fontSize: 24 }}>💵</Text>
                  <View>
                    <Text style={{ color: colors.text, fontWeight: 'bold' }}>Cash / Pay on Delivery</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>Have exact change ready.</Text>
                  </View>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <CustomButton title="Cancel" onPress={() => setShowPaymentModal(false)} variant="outline" style={{ flex: 1 }} />
                  <CustomButton title={paymentMode === 'cash' ? "Confirm Order" : "Confirm Pay"} onPress={processPaymentAndRequest} variant="primary" style={{ flex: 2 }} />
                </View>
              </>
            )}
          </GlassCard>
        </View>
      </Modal>

      {/* CITY PICKER MODAL */}
      <Modal visible={showCityPicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalCard}>
            <Text style={{ color: colors.text, fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>Select Your City</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
              {CITIES.map(c => (
                <TouchableOpacity 
                  key={c.id} 
                  style={[styles.cityOptionBtn, selectedCity.id === c.id && styles.cityOptionBtnActive]}
                  onPress={() => {
                    setSelectedCity(c);
                    setShowCityPicker(false);
                    // Reset custom routes
                    setCustomPickup(''); setCustomDropoff('');
                    setPickupAddress(''); setDropoffAddress('');
                    setPickupCoords(null); setDropoffCoords(null);
                  }}
                >
                  <Text style={[styles.cityOptionText, selectedCity.id === c.id && { color: colors.text }]}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <CustomButton title="Close" onPress={() => setShowCityPicker(false)} variant="outline" />
          </GlassCard>
        </View>
      </Modal>

      {/* SUPPORT MODAL */}
      <Modal visible={showSupportModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalCard}>
            <Text style={{ color: colors.text, fontSize: 22, fontWeight: 'bold', marginBottom: 12 }}>🎧 Help Center</Text>
            
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 16 }}>
              <TouchableOpacity style={[styles.supportTabBtn, supportTab === 'contact' && styles.supportTabActive]} onPress={() => setSupportTab('contact')}>
                <Text style={[styles.supportTabText, supportTab === 'contact' && {color: colors.text}]}>Contact</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.supportTabBtn, supportTab === 'complaint' && styles.supportTabActive]} onPress={() => setSupportTab('complaint')}>
                <Text style={[styles.supportTabText, supportTab === 'complaint' && {color: colors.text}]}>Complaint</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.supportTabBtn, supportTab === 'faq' && styles.supportTabActive]} onPress={() => setSupportTab('faq')}>
                <Text style={[styles.supportTabText, supportTab === 'faq' && {color: colors.text}]}>AI Bot</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.supportTabBtn, supportTab === 'manual' && styles.supportTabActive]} onPress={() => setSupportTab('manual')}>
                <Text style={[styles.supportTabText, supportTab === 'manual' && {color: colors.text}]}>Manual</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.supportTabBtn, supportTab === 'refund' && styles.supportTabActive]} onPress={() => setSupportTab('refund')}>
                <Text style={[styles.supportTabText, supportTab === 'refund' && {color: colors.text}]}>Refunds</Text>
              </TouchableOpacity>
            </View>

            {supportTab === 'contact' && (
              <View>
                <Text style={{ color: colors.textMuted, marginBottom: 20 }}>We are here to help you 24/7.</Text>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 12, marginBottom: 12 }}>
                  <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>📞 Call Us</Text>
                  <Text style={{ color: colors.primary, fontSize: 16, marginTop: 4 }}>+1 (800) CAB-HELP</Text>
                </View>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 12, marginBottom: 20 }}>
                  <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>✉️ Email Support</Text>
                  <Text style={{ color: colors.primary, fontSize: 16, marginTop: 4 }}>support@superapp.demo</Text>
                </View>
              </View>
            )}

            {supportTab === 'complaint' && (
              <View>
                {complaintSubmitted ? (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ fontSize: 40 }}>✅</Text>
                    <Text style={{ color: colors.success, fontSize: 18, fontWeight: 'bold', marginTop: 10 }}>Complaint Filed!</Text>
                    <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 8, marginBottom: 20 }}>Our team will review this and get back to you within 24 hours.</Text>
                  </View>
                ) : (
                  <>
                    <Text style={{ color: colors.textMuted, marginBottom: 12 }}>Please describe the issue you faced in detail:</Text>
                    <TextInput 
                      style={[styles.chatInput, { height: 100, textAlignVertical: 'top', marginBottom: 16, borderColor: colors.surfaceLight, borderWidth: 1 }]} 
                      multiline
                      placeholder="Type your complaint here..."
                      placeholderTextColor={colors.textMuted}
                      value={complaintText}
                      onChangeText={setComplaintText}
                    />
                    <CustomButton title="Submit Complaint" onPress={() => setComplaintSubmitted(true)} variant="primary" style={{ marginBottom: 16 }} />
                  </>
                )}
              </View>
            )}

            {supportTab === 'faq' && (
              <View>
                <Text style={{ color: colors.textMuted, marginBottom: 12 }}>Ask our AI Assistant about general or technical issues:</Text>
                {faqResponse && (
                  <View style={{ backgroundColor: 'rgba(163,230,53,0.1)', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.primary, marginBottom: 12 }}>
                    <Text style={{ color: colors.text }}>{faqResponse}</Text>
                  </View>
                )}
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
                  <TextInput 
                    style={[styles.chatInput, { flex: 1, borderWidth: 1, borderColor: colors.surfaceLight }]}
                    placeholder="Ask a question..."
                    placeholderTextColor={colors.textMuted}
                    value={faqQuery}
                    onChangeText={setFaqQuery}
                  />
                  <CustomButton title="Ask" onPress={handleFaqSubmit} variant="primary" />
                </View>
              </View>
            )}

            {supportTab === 'manual' && (
              <ScrollView style={{ maxHeight: 250, marginBottom: 20 }}>
                <Text style={{ color: colors.text, fontWeight: 'bold', marginBottom: 4 }}>📖 App Functional Manual</Text>
                <Text style={{ color: colors.textMuted, marginBottom: 12, fontSize: 12 }}>Welcome to SuperApp! Here is how to use the services:</Text>
                
                <Text style={{ color: colors.primary, fontWeight: 'bold' }}>1. Booking a Ride/Service</Text>
                <Text style={{ color: colors.textDim, marginBottom: 8, fontSize: 12 }}>Select a service (Ride, Ambulance, Parcel) at the top. Enter your pickup and dropoff locations, or select a demo route. Hit Calculate to see fare, then click Pay & Request.</Text>
                
                <Text style={{ color: colors.primary, fontWeight: 'bold' }}>2. Ordering Food & Groceries</Text>
                <Text style={{ color: colors.textDim, marginBottom: 8, fontSize: 12 }}>Click the Food tab. Toggle between Restaurants and Groceries. Click a store, add items to your cart, and proceed to checkout.</Text>
                
                <Text style={{ color: colors.primary, fontWeight: 'bold' }}>3. Refunds & Cancellations</Text>
                <Text style={{ color: colors.textDim, marginBottom: 8, fontSize: 12 }}>If you pay via Digital Wallet and cancel while the driver is en route, you will see a 'Claim Refund' button on the cancellation screen.</Text>
                
                <Text style={{ color: colors.primary, fontWeight: 'bold' }}>4. Viewing History</Text>
                <Text style={{ color: colors.textDim, marginBottom: 8, fontSize: 12 }}>Click 'History' in the top right to see past orders and generate invoices.</Text>
              </ScrollView>
            )}

            {supportTab === 'refund' && (
              <ScrollView style={{ maxHeight: 350, marginBottom: 20 }}>
                <Text style={{ color: colors.textMuted, marginBottom: 12 }}>Enter your Booking Ref ID to claim a refund for a cancelled trip:</Text>
                
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                  <TextInput 
                    style={[styles.chatInput, { flex: 1, borderWidth: 1, borderColor: colors.surfaceLight }]}
                    placeholder="e.g. REF-A1B2C3"
                    placeholderTextColor={colors.textMuted}
                    value={refundRefId}
                    onChangeText={setRefundRefId}
                  />
                  <CustomButton title="Search" onPress={fetchRefundDetails} variant="primary" />
                </View>

                {refundError ? <Text style={{ color: colors.danger, marginBottom: 12 }}>{refundError}</Text> : null}
                
                {refundSuccess && (
                  <View style={{ backgroundColor: 'rgba(163,230,53,0.1)', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.primary, marginBottom: 12 }}>
                    <Text style={{ color: colors.text, fontWeight: 'bold' }}>✅ Refund Successfully Processed</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>Funds have been returned to your Digital Wallet.</Text>
                    
                    {refundInvoice && (
                      <View style={{ marginTop: 12, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingTop: 12 }}>
                        <Text style={{ color: colors.text, fontWeight: 'bold', marginBottom: 4 }}>🧾 Refund Invoice ({refundInvoice.invoiceId})</Text>
                        <Text style={{ color: colors.textMuted, fontSize: 13 }}>Original Amount: <Text style={{color: colors.text}}>₹{refundInvoice.originalAmount}</Text></Text>
                        <Text style={{ color: colors.danger, fontSize: 13 }}>Cancellation Penalty (3%): <Text style={{fontWeight: 'bold'}}>-₹{refundInvoice.penaltyAmount}</Text></Text>
                        <Text style={{ color: colors.primary, fontSize: 14, fontWeight: 'bold', marginTop: 4 }}>Net Refunded: ₹{refundInvoice.refundedAmount}</Text>
                        <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 4 }}>Processed on: {new Date(refundInvoice.date).toLocaleString()}</Text>
                      </View>
                    )}
                  </View>
                )}

                {refundData && (
                  <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: colors.surfaceLight }}>
                    <Text style={{ color: colors.text, fontWeight: 'bold', borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingBottom: 8, marginBottom: 8 }}>Booking Details</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 4 }}>Service: <Text style={{color: colors.text}}>{refundData.serviceCategory.toUpperCase()}</Text></Text>
                    <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 4 }}>Status: <Text style={{color: refundData.status==='cancelled'?colors.danger:colors.primary}}>{refundData.status.toUpperCase()}</Text></Text>
                    <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 4 }}>Payment: <Text style={{color: colors.text}}>{refundData.payment_mode.toUpperCase()}</Text></Text>
                    <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 4 }}>Fare: <Text style={{color: colors.text}}>₹{refundData.fare.toFixed(2)}</Text></Text>
                    <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 16 }}>Billing Status: <Text style={{color: refundData.payment_status==='refunded'?colors.success:colors.text}}>{refundData.payment_status.toUpperCase()}</Text></Text>

                    {refundData.status === 'cancelled' && refundData.payment_mode === 'digital' && refundData.payment_status !== 'refunded' && !refundSuccess ? (
                      <CustomButton title="Process Refund Now" onPress={processSupportRefund} variant="primary" />
                    ) : null}
                    
                    {refundData.status !== 'cancelled' && <Text style={{ color: colors.warning, fontSize: 12 }}>Only cancelled trips are eligible for a refund.</Text>}
                    {refundData.payment_mode === 'cash' && <Text style={{ color: colors.warning, fontSize: 12 }}>Cash payments cannot be refunded digitally.</Text>}
                  </View>
                )}
              </ScrollView>
            )}

            <CustomButton title="Close Help Center" onPress={() => setShowSupportModal(false)} variant="outline" />
          </GlassCard>
        </View>
      </Modal>

      {/* PROFILE MODAL */}
      <Modal visible={showProfileModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalCard}>
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 48, marginBottom: 8 }}>👤</Text>
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
              
              <TouchableOpacity style={styles.profileMenuBtn} onPress={() => { setShowProfileModal(false); window.setRiderScreen?.('history'); }}>
                <Text style={styles.profileMenuIcon}>📜</Text>
                <Text style={styles.profileMenuText}>View Ride & Order History</Text>
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

    </ScrollView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingBottom: 60 },
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  logoText: { color: colors.text, fontSize: 26, fontWeight: '300' },
  logoBold: { color: colors.primary, fontWeight: '900' },
  userBox: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  userName: { color: colors.text, fontWeight: '700', fontSize: 14, marginRight: 6 },
  logoutBtn: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 },
  logoutText: { color: colors.danger, fontSize: 12, fontWeight: 'bold' },
  supportBtn: { backgroundColor: 'rgba(56, 189, 248, 0.1)', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 },
  supportText: { color: colors.parcelColor, fontSize: 12, fontWeight: 'bold' },
  historyBtn: { backgroundColor: 'rgba(163, 230, 53, 0.1)', borderWidth: 1, borderColor: 'rgba(163, 230, 53, 0.2)', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 },
  historyText: { color: colors.primary, fontSize: 12, fontWeight: 'bold' },
  cityBtn: { backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.primary, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 },
  cityBtnText: { color: colors.text, fontSize: 12, fontWeight: 'bold' },
  
  serviceSelectorRibbon: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 20, marginBottom: 20 },
  serviceTab: { flex: 1, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.surfaceLight, borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  serviceIcon: { fontSize: 28, marginBottom: 8 },
  serviceText: { color: colors.textMuted, fontWeight: '700', fontSize: 12 },
  
  dashboard: { flexDirection: 'row', gap: 20, flexWrap: 'wrap' },
  leftCol: { flex: 1.2, minWidth: 320, zIndex: 5 },
  rightCol: { flex: 1, minWidth: 320, zIndex: 1 },
  glassCard: { height: '100%', justifyContent: 'flex-start' },
  cardTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: 16 },
  
  helperHeader: { color: colors.textMuted, fontSize: 13, fontWeight: 'bold', marginBottom: 10 },
  customRouteBox: { backgroundColor: colors.surfaceLight, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.surfaceLight, gap: 10, zIndex: 50 },
  routeInput: { backgroundColor: 'rgba(255,255,255,0.05)', color: colors.text, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: colors.surfaceLight, marginBottom: 8 },
  suggestionsBox: { position: 'absolute', top: 52, left: 0, right: 0, backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.primary, maxHeight: 150, overflow: 'hidden', zIndex: 999 },
  suggestionItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: colors.surfaceLight },
  suggestionText: { color: colors.text, fontSize: 13 },

  routesWrapper: { flexDirection: 'column', gap: 8, marginBottom: 18 },
  routeCard: { backgroundColor: 'rgba(255, 255, 255, 0.02)', borderWidth: 1.5, borderColor: colors.surfaceLight, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 16 },
  activeRouteCard: { borderColor: colors.primary, backgroundColor: 'rgba(163, 230, 53, 0.08)' },
  routeNameText: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
  activeRouteNameText: { color: colors.text },
  
  vehicleBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  vehicleBtnActive: { backgroundColor: 'rgba(163,230,53,0.2)', borderColor: colors.primary },
  vehicleBtnText: { color: colors.textMuted, fontSize: 11, fontWeight: 'bold' },

  infoBox: { backgroundColor: colors.surfaceLight, borderRadius: 8, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.primary },
  infoTitle: { color: colors.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  infoValue: { color: colors.text, fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  
  bookingFooter: { borderTopWidth: 1, borderColor: colors.surfaceLight, paddingTop: 16, marginTop: 'auto' },
  fareContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  fareLabel: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
  fareValue: { color: colors.rideColor, fontSize: 28, fontWeight: '900' },
  requestButton: { width: '100%' },
  errorText: { color: colors.danger, fontWeight: '600', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 10, borderRadius: 8, marginBottom: 12, fontSize: 13 },

  foodTabs: { flexDirection: 'row', gap: 8, backgroundColor: 'rgba(255,255,255,0.05)', padding: 4, borderRadius: 12 },
  foodTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  foodTabActive: { backgroundColor: colors.foodColor },
  foodTabText: { color: colors.textMuted, fontWeight: 'bold', fontSize: 13 },

  restaurantCard: { backgroundColor: colors.surfaceLight, padding: 20, borderRadius: 16, width: 200, alignItems: 'center', borderWidth: 1, borderColor: colors.primary },
  restaurantName: { color: colors.text, fontSize: 18, fontWeight: 'bold', marginTop: 12 },
  restaurantCuisine: { color: colors.textMuted, fontSize: 12, marginTop: 4, textAlign: 'center' },
  
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  addBtn: { backgroundColor: 'rgba(163,230,53,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.primary },
  
  paymentMethodCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.surfaceLight, marginBottom: 12 },
  paymentMethodActive: { borderColor: colors.primary, backgroundColor: 'rgba(163,230,53,0.05)' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20, zIndex: 9999 },
  modalCard: { width: '100%', maxWidth: 450, padding: 24, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.glassBorder },
  cityOptionBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.glassBorder },
  cityOptionBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  cityOptionText: { color: colors.text, fontWeight: 'bold' },
  
  supportTabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.05)' },
  supportTabActive: { backgroundColor: colors.parcelColor },
  supportTabText: { color: colors.textMuted, fontSize: 12, fontWeight: 'bold' },
  chatInput: { backgroundColor: 'rgba(255,255,255,0.05)', color: colors.text, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  
  profileBtn: { backgroundColor: 'rgba(163, 230, 53, 0.1)', borderWidth: 1, borderColor: 'rgba(163, 230, 53, 0.2)', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 },
  profileMenuBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.glassBorder },
  profileMenuIcon: { fontSize: 24, marginRight: 16 },
  profileMenuText: { color: colors.text, fontSize: 16, fontWeight: '600' },

  fareBreakdown: { marginBottom: 16 },
  fareText: { color: colors.rideColor, fontSize: 24, fontWeight: '900', marginBottom: 4 },
  paymentInfoText: { color: colors.textMuted, fontSize: 13 },
  surgeBadge: { backgroundColor: 'rgba(234, 179, 8, 0.15)', borderWidth: 1, borderColor: '#EAB308', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 8 },
  surgeText: { color: '#FDE047', fontSize: 12, fontWeight: 'bold' }
});
