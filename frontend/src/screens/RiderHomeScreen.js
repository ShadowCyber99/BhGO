import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, ActivityIndicator, TextInput, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '../context/NavigationContext';
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
  { id: 1, name: '🏥 AIIMS (Govt)', city: 'Delhi', address: 'Ansari Nagar, New Delhi', lat: 28.5659, lng: 77.2093 },
  { id: 2, name: '🏥 Safdarjung Hospital (Govt)', city: 'Delhi', address: 'Ring Road, New Delhi', lat: 28.5684, lng: 77.2059 },
  { id: 3, name: '🏥 Apollo Hospital (Private)', city: 'Delhi', address: 'Sarita Vihar, Delhi', lat: 28.5360, lng: 77.2844 },
  { id: 4, name: '🏥 Max Super Speciality (Private)', city: 'Delhi', address: 'Saket, Delhi', lat: 28.5273, lng: 77.2140 },
  { id: 5, name: '🏥 KEM Hospital (Govt)', city: 'Mumbai', address: 'Parel, Mumbai', lat: 19.0028, lng: 72.8422 },
  { id: 6, name: '🏥 Lilavati Hospital (Private)', city: 'Mumbai', address: 'Bandra West, Mumbai', lat: 19.0514, lng: 72.8256 },
  { id: 7, name: '🏥 Victoria Hospital (Govt)', city: 'Bangalore', address: 'Fort Road, Bangalore', lat: 12.9622, lng: 77.5755 },
  { id: 8, name: '🏥 Manipal Hospital (Private)', city: 'Bangalore', address: 'Old Airport Road, Bangalore', lat: 12.9585, lng: 77.6496 },
  { id: 9, name: '🏥 Osmania General Hospital (Govt)', city: 'Hyderabad', address: 'Afzal Gunj, Hyderabad', lat: 17.3768, lng: 78.4719 },
  { id: 10, name: '🏥 Apollo Health City (Private)', city: 'Hyderabad', address: 'Jubilee Hills, Hyderabad', lat: 17.4124, lng: 78.4082 },
  { id: 11, name: '🏥 Rajiv Gandhi Govt General Hospital', city: 'Chennai', address: 'Park Town, Chennai', lat: 13.0818, lng: 80.2764 },
  { id: 12, name: '🏥 MIOT International (Private)', city: 'Chennai', address: 'Manapakkam, Chennai', lat: 13.0183, lng: 80.1764 },
  { id: 13, name: '🏥 SSKM Hospital (Govt)', city: 'Kolkata', address: 'Bhowanipore, Kolkata', lat: 22.5398, lng: 88.3444 },
  { id: 14, name: '🏥 AMRI Hospital (Private)', city: 'Kolkata', address: 'Dhakuria, Kolkata', lat: 22.5074, lng: 88.3653 },
  { id: 15, name: '🏥 Sassoon General Hospital (Govt)', city: 'Pune', address: 'Near Pune Station, Pune', lat: 18.5284, lng: 73.8732 },
  { id: 16, name: '🏥 Ruby Hall Clinic (Private)', city: 'Pune', address: 'Sassoon Road, Pune', lat: 18.5303, lng: 73.8749 },
  { id: 17, name: '🏥 Civil Hospital (Govt)', city: 'Ahmedabad', address: 'Asarwa, Ahmedabad', lat: 23.0526, lng: 72.6033 },
  { id: 18, name: '🏥 Zydus Hospital (Private)', city: 'Ahmedabad', address: 'Thaltej, Ahmedabad', lat: 23.0617, lng: 72.5222 },
  { id: 19, name: '🏥 SMS Hospital (Govt)', city: 'Jaipur', address: 'Ashok Nagar, Jaipur', lat: 26.8996, lng: 75.8157 },
  { id: 20, name: '🏥 Fortis Escorts (Private)', city: 'Jaipur', address: 'Malviya Nagar, Jaipur', lat: 26.8458, lng: 75.8078 },
  { id: 21, name: '🏥 New Civil Hospital (Govt)', city: 'Surat', address: 'Khatodra Wadi, Surat', lat: 21.1824, lng: 72.8123 },
  { id: 22, name: '🏥 Kiran Hospital (Private)', city: 'Surat', address: 'Katargam, Surat', lat: 21.2173, lng: 72.8276 },
  { id: 23, name: '🏥 PGIMER (Govt)', city: 'Chandigarh', address: 'Sector 12, Chandigarh', lat: 30.7675, lng: 76.7725 },
  { id: 24, name: '🏥 Fortis Hospital (Private)', city: 'Chandigarh', address: 'Phase 8, Mohali', lat: 30.6974, lng: 76.7214 },
  { id: 25, name: '🏥 Civil Hospital (Govt)', city: 'Mohali', address: 'Phase 6, Mohali', lat: 30.7302, lng: 76.7118 },
  { id: 26, name: '🏥 Civil Hospital (Govt)', city: 'Ludhiana', address: 'Near Bharat Nagar Chowk', lat: 30.9006, lng: 75.8453 },
  { id: 27, name: '🏥 DMC Hospital (Private)', city: 'Ludhiana', address: 'Civil Lines, Ludhiana', lat: 30.9168, lng: 75.8286 },
  { id: 28, name: '🏥 Civil Hospital (Govt)', city: 'Amritsar', address: 'Rambagh, Amritsar', lat: 31.6360, lng: 74.8812 },
  { id: 29, name: '🏥 SGRD Institute (Private)', city: 'Amritsar', address: 'Mehta Road, Amritsar', lat: 31.6429, lng: 74.9126 },
  { id: 30, name: '🏥 Civil Hospital (Govt)', city: 'Jalandhar', address: 'Central Town, Jalandhar', lat: 31.3216, lng: 75.5802 },
  { id: 31, name: '🏥 PIMS Hospital (Private)', city: 'Jalandhar', address: 'Garha Road, Jalandhar', lat: 31.2987, lng: 75.5940 }
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

const svgIcons = {
  ride: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="8" width="20" height="11" rx="2" ry="2"></rect><path d="M4 8L6 4h12l2 4"></path><circle cx="7" cy="19" r="2"></circle><circle cx="17" cy="19" r="2"></circle></svg>'),
  ambulance: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="6" width="20" height="12" rx="2"></rect><path d="M12 9v6M9 12h6"></path><circle cx="7" cy="18" r="2"></circle><circle cx="17" cy="18" r="2"></circle></svg>'),
  parcel: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="M3 10h18"></path><path d="M12 5v5"></path></svg>'),
  food: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F97316" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9v1h14V9c0-3.87-3.13-7-7-7z"></path><path d="M3 14h18v3c0 1.66-1.34 3-3 3H6c-1.66 0-3-1.34-3-3v-3z"></path><path d="M4 11h16v1H4z"></path></svg>')
};

const vehicleIcons = {
  cab: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>'),
  bike: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 19a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" /><path d="M18.5 19a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" /><path d="M12 17.5V14l-3-3 4-3 2 3h2" /></svg>'),
  economy: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>'),
  premium: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/><path d="M10 11l4-2"/></svg>'),
  suv: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="8" width="20" height="9" rx="2" ry="2"/><circle cx="6" cy="17" r="2"/><circle cx="18" cy="17" r="2"/><path d="M6 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/></svg>')
};

export default function RiderHomeScreen({ onNavigateToActiveRide }) {
  const { user, logout, socket, refreshProfile } = useAuth();
  const { setRiderScreen } = useNavigation();
  const { colors, themeName, changeTheme, availableThemes, isDarkMode } = useTheme();
  const styles = getStyles(colors);
  const [activeFlow, setActiveFlow] = useState('dashboard');

  
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [dropoffCoords, setDropoffCoords] = useState(null);

  const [customPickup, setCustomPickup] = useState('');
  const [customDropoff, setCustomDropoff] = useState('');
  const [waypoints, setWaypoints] = useState([]); // Array of strings
  const [waypointCoords, setWaypointCoords] = useState([]); // Array of {lat, lng}
  
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
  const [selectedCity, setSelectedCity] = useState(CITIES[0]); // Default to Delhi
  const [showCityPicker, setShowCityPicker] = useState(false);
  
  const [serviceCategory, setServiceCategory] = useState('ride'); 
  const [vehiclePreference, setVehiclePreference] = useState('economy');
  const [parcelWeight, setParcelWeight] = useState('');
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
  
  const [supermarkets, setSupermarkets] = useState([]);
  const [selectedSupermarket, setSelectedSupermarket] = useState(null);
  const [groceryItems, setGroceryItems] = useState([]);

  const [pharmacies, setPharmacies] = useState([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [medicineItems, setMedicineItems] = useState([]);

  // Payment State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState('upi'); // 'digital', 'cash', or 'upi'
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
      const res = await fetch(`/api/rides/ref/${refundRefId.trim()}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('BharatOne_token')}` } });
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
        headers: { 'Authorization': `Bearer ${localStorage.getItem('BharatOne_token')}` }
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
        const res = await fetch(`/api/rides/drivers?service=${serviceCategory}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('BharatOne_token')}` } });
        if (res.ok) setNearbyDrivers(await res.json());
      } catch (err) {}
    };
    fetchDrivers();
    if (socket) {
      socket.on('drivers_changed', fetchDrivers);
      
      const handleWalletUpdate = (data) => {
        alert(`💰 ${data.reason}: ₹${data.amountAdded} has been refunded to your wallet!`);
        refreshProfile();
      };
      socket.on('wallet_updated', handleWalletUpdate);
      
      return () => {
        socket.off('drivers_changed', fetchDrivers);
        socket.off('wallet_updated', handleWalletUpdate);
      }
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
      fetch('/api/rides/restaurants', { headers: { 'Authorization': `Bearer ${localStorage.getItem('BharatOne_token')}` } })
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => { if (Array.isArray(data)) setRestaurants(data); })
      .catch(() => {});
    }
  }, [serviceCategory]);

  useEffect(() => {
    if (activeFlow === 'grocery') {
      fetch('/api/rides/supermarkets', { headers: { 'Authorization': `Bearer ${localStorage.getItem('BharatOne_token')}` } })
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => { if (Array.isArray(data)) setSupermarkets(data); })
      .catch(() => {});
    } else if (activeFlow === 'medicine') {
      fetch('/api/rides/pharmacies', { headers: { 'Authorization': `Bearer ${localStorage.getItem('BharatOne_token')}` } })
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => { if (Array.isArray(data)) setPharmacies(data); })
      .catch(() => {});
    }
  }, [activeFlow]);

  const [emergencyConsent, setEmergencyConsent] = useState(false);
  const [patientSecurityConsent, setPatientSecurityConsent] = useState(false);

  useEffect(() => {
    // When serviceCategory changes to ambulance, reset vehiclePreference to the default
    if (serviceCategory === 'ambulance') {
      setVehiclePreference('non_emergency');
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
        case 'cab':
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
      baseFare = vehicle === 'medical_emergency' ? 750 : 400;
      perKmRate = vehicle === 'medical_emergency' ? 35 : 20;
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
      } else {
        setPickupSuggestions([]);
      }
    } else {
      setCustomDropoff(text);
      if (text.length > 2) {
        setDropoffSuggestions(FAMOUS_PLACES.filter(p => p.name.toLowerCase().includes(text.toLowerCase()) || p.city.toLowerCase().includes(text.toLowerCase())));
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

  const geocodeAddress = async (address, city) => {
    try {
      const cleanAddress = address.trim();
      
      // 1. Try with city
      let query = `${cleanAddress}, ${city.name}, India`;
      let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
      let res = await fetch(url, { headers: { 'User-Agent': 'BharatOne-App/1.0' } });
      let data = await res.json();
      
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
      
      // Wait 1 second to respect Nominatim rate limits before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 2. Try without city (useful for suburbs like Mohali when Chandigarh is selected)
      query = `${cleanAddress}, India`;
      url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
      res = await fetch(url, { headers: { 'User-Agent': 'BharatOne-App/1.0' } });
      data = await res.json();
      
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
      
    } catch (err) {
      console.warn('Geocoding error:', err);
    }
    return null;
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, { headers: { 'User-Agent': 'BharatOne-App/1.0' } });
      const data = await res.json();
      if (data && data.display_name) {
        return data.display_name.split(',').slice(0, 3).join(',');
      }
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
    }
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  };

  const handleMapClick = async ({ lat, lng }) => {
    if (!pickupCoords && !customPickup) {
      const address = await reverseGeocode(lat, lng);
      setPickupCoords({ lat, lng });
      setCustomPickup(address);
      setPickupAddress(address);
    } else {
      const address = await reverseGeocode(lat, lng);
      setDropoffCoords({ lat, lng });
      setCustomDropoff(address);
      setDropoffAddress(address);
      if (pickupCoords) {
        const distance = Math.sqrt(Math.pow((lat - pickupCoords.lat)*111, 2) + Math.pow((lng - pickupCoords.lng)*111, 2));
        setBaseDistance(distance);
      }
    }
  };

  const handleCalculateCustomRoute = async () => {
    if (!customPickup || !customDropoff) return setError('Please enter both pickup and dropoff addresses');
    setError('');
    setLoading(true);
    
    // Check if custom string matches any famous place to grab exact coords, else geocode
    const pMatch = FAMOUS_PLACES.find(p => customPickup.toLowerCase().includes(p.name.toLowerCase()));
    const dMatch = FAMOUS_PLACES.find(p => customDropoff.toLowerCase().includes(p.name.toLowerCase()));

    let pCoords = pMatch ? { lat: pMatch.lat, lng: pMatch.lng } : await geocodeAddress(customPickup, selectedCity);
    let dCoords = dMatch ? { lat: dMatch.lat, lng: dMatch.lng } : await geocodeAddress(customDropoff, selectedCity);
    
    // Fallback to random offset if geocoding yields no results for highly obscure inputs
    if (!pCoords) pCoords = generateCoordsFromText(customPickup, selectedCity);
    if (!dCoords) dCoords = generateCoordsFromText(customDropoff, selectedCity);

    const pLat = pCoords.lat;
    const pLng = pCoords.lng;
    const dLat = dCoords.lat;
    const dLng = dCoords.lng;
    
    // Geocode waypoint coords
    const activeWps = waypoints.filter(w => w.trim() !== '');
    const wCoords = [];
    for (const wp of activeWps) {
      let wpCoord = await geocodeAddress(wp, selectedCity);
      if (!wpCoord) wpCoord = generateCoordsFromText(wp, selectedCity);
      wCoords.push(wpCoord);
    }
    setWaypointCoords(wCoords);

    let baseDist = 2.5;
    try {
      // True Distance Calculation using OSRM
      const wpString = wCoords.length > 0 ? wCoords.map(w => `${w.lng},${w.lat}`).join(';') : '';
      const coordsString = wpString ? `${pLng},${pLat};${wpString};${dLng},${dLat}` : `${pLng},${pLat};${dLng},${dLat}`;
      const url = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=false`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.routes && data.routes.length > 0) {
        baseDist = data.routes[0].distance / 1000; // OSRM returns meters, convert to km
      } else {
        // Fallback to Euclidean
        const latDiff = pLat - dLat;
        const lngDiff = pLng - dLng;
        baseDist = Math.max(2.5, Math.sqrt(latDiff*latDiff + lngDiff*lngDiff) * 111 + (wCoords.length * 5));
      }
    } catch (err) {
      // Fallback
      const latDiff = pLat - dLat;
      const lngDiff = pLng - dLng;
      baseDist = Math.max(2.5, Math.sqrt(latDiff*latDiff + lngDiff*lngDiff) * 111 + (wCoords.length * 5));
    }

    setPickupAddress(customPickup);
    setPickupCoords({ lat: pLat, lng: pLng });
    setDropoffAddress(customDropoff);
    setDropoffCoords({ lat: dLat, lng: dLng });
    setBaseDistance(baseDist);
    setLoading(false);
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
    let fullPickup = pickupAddress;
    const activeWps = waypoints.filter(w => w.trim() !== '');
    if (activeWps.length > 0) {
      fullPickup += ` (via ${activeWps.join(', ')})`;
    }

    const payload = {
      serviceCategory, vehiclePreference, pickupAddress: fullPickup, dropoffAddress,
      waypoints: activeWps,
      waypointCoords: waypointCoords,
      pickupLat: pickupCoords.lat, pickupLng: pickupCoords.lng,
      dropoffLat: dropoffCoords.lat, dropoffLng: dropoffCoords.lng, fare, paymentMode,
      parcelWeight: serviceCategory === 'parcel' ? parseFloat(parcelWeight) || 0 : undefined
    };
    const ride = await api.requestRide(payload);
    if (socket) socket.emit('request_ride', { ...ride, parcelWeight: payload.parcelWeight });
    setTimeout(() => onNavigateToActiveRide(), 500);
  };

  const openRestaurant = async (rest) => {
    setSelectedRestaurant(rest);
    setCart([]);
    try {
      const res = await fetch(`/api/rides/restaurants/${rest.id}/menu`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('BharatOne_token')}` } });
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
      serviceCategory: activeFlow === 'grocery' ? 'grocery' : activeFlow === 'medicine' ? 'medicine' : 'food', 
      vehiclePreference: (activeFlow === 'grocery' || activeFlow === 'medicine') ? 'bike' : 'any',
      pickupAddress: selectedRestaurant.name, dropoffAddress: 'Home (Demo)',
      pickupLat: selectedCity.lat + 0.005, pickupLng: selectedCity.lng + 0.005, dropoffLat: selectedCity.lat, dropoffLng: selectedCity.lng,
      fare: deliveryFee, paymentMode
    };
    const ride = await api.requestRide(ridePayload);
    await fetch('/api/rides/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('BharatOne_token')}` },
      body: JSON.stringify({ rideId: ride.id, restaurantId: selectedRestaurant.id, totalAmount: cartTotal + deliveryFee, itemsJson: cart })
    });
    if (socket) socket.emit('request_ride', ride);
    setTimeout(() => onNavigateToActiveRide(), 500);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Main Map Background */}
      {activeFlow === 'dashboard' || activeFlow === 'services' ? (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: activeFlow === 'dashboard' ? '45%' : 0 }}>
          <MapView 
            cityCenter={selectedCity} 
            pickup={pickupCoords} 
            dropoff={dropoffCoords} 
            waypoints={waypointCoords} 
            nearbyDrivers={nearbyDrivers} 
            onMapClick={handleMapClick}
          />
        </View>
      ) : null}

      <View style={[styles.nav, { backgroundColor: 'transparent', borderBottomWidth: 0, zIndex: 10 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surface, paddingHorizontal: 12, borderRadius: 24, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }}>
          <Image source={isDarkMode ? require('../../assets/logo_dark.jpg') : require('../../assets/logo_light.jpg')} style={{ width: 30, height: 30, mixBlendMode: isDarkMode ? 'screen' : 'multiply' }} resizeMode="contain" />
          <Text style={{fontSize: 14, color: colors.primary, fontWeight: 'bold'}}>BharatOne</Text>
        </View>
        <View style={styles.userBox}>
          <TouchableOpacity onPress={() => setShowCityPicker(true)} style={[styles.cityBtn, { backgroundColor: colors.surface, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }]}>
            <Text style={styles.cityBtnText}>📍 {selectedCity.name}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowProfileModal(true)} style={[styles.profileBtn, { backgroundColor: colors.surface, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }]}>
            <Text style={styles.userName}>👤 Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Overlay */}
      <View style={{ flex: 1, justifyContent: 'flex-end', marginTop: 100 }}>
        {activeFlow === 'dashboard' && (
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: -5 } }}>
            <Text style={{ fontSize: 24, fontWeight: '900', color: colors.text }}>Hello {user?.name?.split(' ')[0] || 'User'} 👋</Text>
            <Text style={{ fontSize: 16, color: colors.textMuted, marginTop: 4, marginBottom: 20 }}>Where to?</Text>
            
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'flex-start' }}>
              {[
                { id: 'ride', label: 'Ride', icon: svgIcons.ride, color: colors.rideColor, action: () => { setServiceCategory('ride'); setActiveFlow('services'); } },
                { id: 'bike', label: 'Bike', icon: vehicleIcons.bike, color: colors.rideColor, action: () => { setServiceCategory('ride'); setActiveFlow('services'); } },
                { id: 'auto', label: 'Auto', icon: vehicleIcons.cab, color: colors.rideColor, action: () => { setServiceCategory('ride'); setActiveFlow('services'); } },
                { id: 'parcel', label: 'Parcel', icon: svgIcons.parcel, color: colors.parcelColor, action: () => { setServiceCategory('parcel'); setActiveFlow('services'); } },
                { id: 'food', label: 'Food', icon: svgIcons.food, color: colors.foodColor, action: () => { setServiceCategory('food'); setFoodCategoryTab('food'); setActiveFlow('services'); } },
                { id: 'grocery', label: 'Grocery', emoji: '🛒', color: colors.foodColor, action: () => setActiveFlow('grocery') },
                { id: 'medicine', label: 'Pharmacy', emoji: '💊', color: colors.foodColor, action: () => setActiveFlow('medicine') },
                { id: 'ambulance', label: 'Ambulance', icon: svgIcons.ambulance, color: colors.ambulanceColor, action: () => { setServiceCategory('ambulance'); setActiveFlow('services'); }, isRed: true }
              ].map((s, idx) => (
                <TouchableOpacity key={idx} style={{ width: '22%', alignItems: 'center', marginBottom: 12 }} onPress={s.action}>
                  <View style={[styles.iconCircle, { backgroundColor: s.isRed ? '#FEE2E2' : colors.surfaceLight, borderColor: s.isRed ? colors.danger : 'transparent', borderWidth: s.isRed ? 2 : 0, width: 60, height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center' }]}>
                    {s.emoji ? <Text style={{ fontSize: 28 }}>{s.emoji}</Text> : (
                       s.icon.includes('svg') ? <Image source={{ uri: s.icon }} style={{ width: 32, height: 32, tintColor: s.isRed ? colors.danger : colors.primary }} /> : <Image source={{ uri: s.icon }} style={{ width: 32, height: 32 }} />
                    )}
                  </View>
                  <Text style={{ fontSize: 12, color: colors.text, marginTop: 8, fontWeight: s.isRed ? 'bold' : '500' }}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

      {activeFlow === 'services' ? (
        <View style={{ flex: 1, width: '100%', justifyContent: 'flex-end', marginTop: 100 }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: -5 }, maxHeight: '90%' }}>
            <TouchableOpacity onPress={() => setActiveFlow('dashboard')} style={{ marginBottom: 16 }}>
              <Text style={{ color: colors.primary, fontWeight: 'bold' }}>← Back</Text>
            </TouchableOpacity>
            
            {/* SEARCH BARS (Pickup/Dropoff) */}
            <View style={{ backgroundColor: colors.surfaceLight, borderRadius: 12, padding: 12, marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.textMuted, marginRight: 12 }} />
                <TextInput 
                  style={{ flex: 1, fontSize: 16, color: colors.text, padding: 8 }} 
                  placeholder="Pickup Location" 
                  placeholderTextColor={colors.textMuted}
                  value={pickupAddress}
                  onChangeText={searchPickup}
                />
              </View>
              {pickupSuggestions.length > 0 && (
                <View style={{ backgroundColor: colors.surface, borderRadius: 8, marginBottom: 12, padding: 8 }}>
                  {pickupSuggestions.map((s, i) => (
                    <TouchableOpacity key={i} style={{ paddingVertical: 8, borderBottomWidth: i !== pickupSuggestions.length -1 ? 1 : 0, borderColor: colors.surfaceLight }} onPress={() => selectPickupSuggestion(s)}>
                      <Text style={{ color: colors.text }}>{s.address}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginRight: 12 }} />
                <TextInput 
                  style={{ flex: 1, fontSize: 16, color: colors.text, padding: 8 }} 
                  placeholder="Where to?" 
                  placeholderTextColor={colors.textMuted}
                  value={dropoffAddress}
                  onChangeText={searchDropoff}
                />
              </View>
              {dropoffSuggestions.length > 0 && (
                <View style={{ backgroundColor: colors.surface, borderRadius: 8, marginTop: 12, padding: 8 }}>
                  {dropoffSuggestions.map((s, i) => (
                    <TouchableOpacity key={i} style={{ paddingVertical: 8, borderBottomWidth: i !== dropoffSuggestions.length -1 ? 1 : 0, borderColor: colors.surfaceLight }} onPress={() => selectDropoffSuggestion(s)}>
                      <Text style={{ color: colors.text }}>{s.address}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* If locations selected, show Fare/Booking UI */}
            {baseDistance > 0 && (
              <ScrollView style={{ marginTop: 8 }}>
                <Text style={{ fontSize: 16, color: colors.text, marginBottom: 16, fontWeight: 'bold' }}>Distance: {baseDistance.toFixed(1)} km</Text>
                
                {serviceCategory === 'ride' && (
                  <View style={{ flexDirection: 'column', gap: 12 }}>
                    {[
                      { id: 'bike', label: 'Moto', price: 8, icon: vehicleIcons.bike, time: '2 min' },
                      { id: 'cab', label: 'Ride Go', price: 15, icon: vehicleIcons.cab, time: '4 min' },
                      { id: 'premium', label: 'Ride Premier', price: 22, icon: vehicleIcons.premium, time: '6 min' },
                      { id: 'suv', label: 'Ride XL', price: 30, icon: vehicleIcons.suv, time: '8 min' }
                    ].map(v => (
                      <TouchableOpacity key={v.id} style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 2, borderColor: vehiclePreference === v.id ? colors.primary : 'transparent', backgroundColor: vehiclePreference === v.id ? 'rgba(249,115,22,0.1)' : colors.surfaceLight }} onPress={() => setVehiclePreference(v.id)}>
                        <View style={{ width: 40, height: 40, backgroundColor: colors.surface, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                          {v.icon.includes('svg') ? <Image source={{ uri: v.icon }} style={{ width: 24, height: 24, tintColor: colors.primary }} /> : <Image source={{ uri: v.icon }} style={{ width: 24, height: 24 }} />}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>{v.label} <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: 'normal' }}>• {v.time}</Text></Text>
                        </View>
                        <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>₹{(baseDistance * v.price).toFixed(0)}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {serviceCategory === 'ambulance' && (
                  <View style={{ backgroundColor: '#FEE2E2', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: colors.danger }}>
                    <Text style={{ color: colors.danger, fontWeight: '900', fontSize: 18 }}>🚨 Emergency Ambulance</Text>
                    <Text style={{ color: colors.danger, marginTop: 4, fontWeight: 'bold' }}>Priority Dispatch & Routing.</Text>
                    <Text style={{ color: colors.text, marginTop: 8, fontSize: 24, fontWeight: 'bold' }}>Est: ₹{(baseDistance * 25).toFixed(0)}</Text>
                  </View>
                )}
                
                <TouchableOpacity 
                  onPress={requestRide}
                  style={{ backgroundColor: serviceCategory === 'ambulance' ? colors.danger : colors.primary, padding: 16, borderRadius: 12, marginTop: 24, alignItems: 'center' }}
                >
                  <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>{serviceCategory === 'ambulance' ? 'Request Ambulance NOW' : 'Book Ride'}</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      ): null}

      {/* FOOD MARKETPLACE VIEW */}
      {serviceCategory === 'food' ? (
        <View style={{ marginTop: 30 }}>
          {!selectedRestaurant ? (
            <GlassCard style={{ padding: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>Craving Something?</Text>
                
                <View style={styles.foodTabs}>
                  <TouchableOpacity style={[styles.foodTab, styles.foodTabActive]}>
                    <Text style={[styles.foodTabText, {color: colors.text}]}>🍽️ Restaurants</Text>
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
                  restaurants.filter(r => (r.city && r.city === selectedCity.name)).map(r => (
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
                              setPickupCoords({ lat: selectedCity.lat, lng: selectedCity.lng });
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

                {/* Vehicle Selection for Ride */}
                {serviceCategory === 'ride' && (
                  <View style={{ marginTop: 10, marginBottom: 20 }}>
                    <Text style={styles.helperHeader}>🚘 Select Vehicle Preference</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                      {['cab', 'bike'].map(v => {
                        const isCabSelected = ['economy', 'premium', 'suv'].includes(vehiclePreference);
                        const isActive = v === 'cab' ? isCabSelected : vehiclePreference === v;
                        return (
                          <TouchableOpacity 
                            key={v}
                            style={[styles.vehicleBtn, isActive && styles.vehicleBtnActive, { padding: 16, alignItems: 'center' }]}
                            onPress={() => {
                              if (v === 'bike') {
                                setVehiclePreference('bike');
                              } else {
                                setVehiclePreference('economy');
                              }
                            }}
                          >
                            <Image source={{ uri: vehicleIcons[v] }} style={{ width: 40, height: 40, opacity: isActive ? 1 : 0.4, marginBottom: 8 }} />
                            <Text style={[styles.vehicleBtnText, isActive && { color: colors.text }]}>{v.toUpperCase()}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {['economy', 'premium', 'suv'].includes(vehiclePreference) && (
                      <View style={{ marginTop: 16 }}>
                        <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 8, marginLeft: 4 }}>Select Cab Tier</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                          {['economy', 'premium', 'suv'].map(tier => (
                             <TouchableOpacity 
                               key={tier}
                               style={[
                                 styles.vehicleBtn, 
                                 vehiclePreference === tier && styles.vehicleBtnActive, 
                                 { paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center' }
                               ]}
                               onPress={() => setVehiclePreference(tier)}
                             >
                               <Image source={{ uri: vehicleIcons[tier] }} style={{ width: 40, height: 40, opacity: vehiclePreference === tier ? 1 : 0.4, marginBottom: 8 }} />
                               <Text style={[styles.vehicleBtnText, vehiclePreference === tier && { color: colors.text }]}>{tier.toUpperCase()}</Text>
                             </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {/* Vehicle Selection for Ambulance */}
                {serviceCategory === 'ambulance' && (
                  <View style={{ marginTop: 10, marginBottom: 20 }}>
                    <Text style={styles.helperHeader}>🚑 Select Ambulance Type</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                      <TouchableOpacity 
                        style={[styles.vehicleBtn, vehiclePreference === 'medical_emergency' && styles.vehicleBtnActive]}
                        onPress={() => setVehiclePreference('medical_emergency')}
                      >
                        <Text style={[styles.vehicleBtnText, vehiclePreference === 'medical_emergency' && { color: colors.danger, fontWeight: 'bold' }]}>🚨 MEDICAL EMERGENCY</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.vehicleBtn, vehiclePreference === 'non_emergency' && styles.vehicleBtnActive]}
                        onPress={() => setVehiclePreference('non_emergency')}
                      >
                        <Text style={[styles.vehicleBtnText, vehiclePreference === 'non_emergency' && { color: colors.text }]}>🏥 NON-EMERGENCY</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Parcel Weight Input */}
                {serviceCategory === 'parcel' && (
                  <View style={{ marginTop: 10, marginBottom: 20 }}>
                    <Text style={styles.helperHeader}>📦 Parcel Details</Text>
                    <TextInput 
                      style={styles.routeInput} 
                      placeholder="Parcel Weight in kg (e.g., 15)"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                      value={parcelWeight}
                      onChangeText={(val) => {
                        setParcelWeight(val);
                        if (parseFloat(val) <= 25) {
                          setVehiclePreference('bike');
                        } else {
                          setVehiclePreference('cab');
                        }
                      }}
                    />
                    <Text style={{color: colors.textMuted, fontSize: 12, marginTop: 4, paddingHorizontal: 12}}>
                      {parcelWeight ? `Vehicle auto-assigned: ${parseFloat(parcelWeight) <= 25 ? 'Bike' : 'Cab'} (based on weight)` : 'Enter weight to auto-assign vehicle'}
                    </Text>
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

                {serviceCategory === 'ambulance' && vehiclePreference === 'medical_emergency' && (
                  <TouchableOpacity 
                    style={{ marginTop: 16, marginBottom: 8, padding: 12, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: emergencyConsent ? colors.danger : colors.surfaceLight, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => setEmergencyConsent(!emergencyConsent)}
                  >
                    <View style={{ width: 20, height: 20, borderWidth: 2, borderColor: colors.danger, borderRadius: 4, marginRight: 10, alignItems: 'center', justifyContent: 'center' }}>
                      {emergencyConsent && <Text style={{ color: colors.danger, fontSize: 14, fontWeight: 'bold', marginTop: -2 }}>✓</Text>}
                    </View>
                    <Text style={{ flex: 1, color: colors.text, fontSize: 12 }}>
                      I acknowledge this is a critical medical emergency. I understand priority pricing applies and false reports may incur penalties.
                    </Text>
                  </TouchableOpacity>
                )}

                {serviceCategory === 'ambulance' && (
                  <TouchableOpacity 
                    style={{ marginTop: 8, marginBottom: 8, padding: 12, backgroundColor: 'rgba(59, 130, 246, 0.1)', borderWidth: 1, borderColor: patientSecurityConsent ? colors.primary : colors.surfaceLight, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => setPatientSecurityConsent(!patientSecurityConsent)}
                  >
                    <View style={{ width: 20, height: 20, borderWidth: 2, borderColor: colors.primary, borderRadius: 4, marginRight: 10, alignItems: 'center', justifyContent: 'center' }}>
                      {patientSecurityConsent && <Text style={{ color: colors.primary, fontSize: 14, fontWeight: 'bold', marginTop: -2 }}>✓</Text>}
                    </View>
                    <Text style={{ flex: 1, color: colors.text, fontSize: 12 }}>
                      I agree to the Patient Security and Privacy terms. I consent to securely share necessary medical transport details with the assigned driver.
                    </Text>
                  </TouchableOpacity>
                )}

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
                  <CustomButton 
                    title={`Pay ₹${fare.toFixed(2)} & Request`} 
                    onPress={initiatePayment} 
                    variant="primary" 
                    style={styles.requestButton} 
                    disabled={
                      (serviceCategory === 'ambulance' && !patientSecurityConsent) || 
                      (serviceCategory === 'ambulance' && vehiclePreference === 'medical_emergency' && !emergencyConsent)
                    }
                  />
                </View>
              </GlassCard>
            </View>
          </View>
        </>
      )}
      </View>
      ) : activeFlow === 'grocery' || activeFlow === 'medicine' ? (
        <View style={{ flex: 1, width: '100%', paddingHorizontal: 16 }}>
           <View style={{ flexDirection: 'row', marginBottom: 20, marginTop: 16 }}>
            <TouchableOpacity onPress={() => setActiveFlow('dashboard')}>
              <Text style={{ color: colors.primary, fontWeight: 'bold' }}>← Back to Dashboard</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 24, color: colors.text, fontWeight: 'bold', marginBottom: 20 }}>
            {activeFlow === 'grocery' ? '🛒 Grocery Delivery' : '💊 Medicine Delivery'}
          </Text>
          
          <GlassCard style={{ padding: 20, flex: 1 }}>
            {activeFlow === 'grocery' ? (
              <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
                {supermarkets.length === 0 ? (
                   <View style={{ padding: 20, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 12, borderWidth: 1, borderColor: colors.danger, width: '100%' }}>
                     <Text style={{ color: colors.danger, fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>⚠️ No Supermarkets Found</Text>
                     <Text style={{ color: colors.text }}>Please re-seed your database with Indian locations.</Text>
                   </View>
                ) : (
                  supermarkets.map(s => (
                    <TouchableOpacity key={s.id} style={styles.restaurantCard} onPress={() => { setSelectedSupermarket(s); fetch(`/api/rides/supermarkets/${s.id}/items`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('BharatOne_token')}` } }).then(res=>res.json()).then(setGroceryItems).catch(console.error); }}>
                      <Text style={{ fontSize: 40 }}>{s.image_url}</Text>
                      <Text style={styles.restaurantName}>{s.name}</Text>
                      <Text style={styles.restaurantCuisine}>{s.city} • ⭐ {s.rating}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            ) : (
              <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
                {pharmacies.length === 0 ? (
                   <View style={{ padding: 20, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 12, borderWidth: 1, borderColor: colors.danger, width: '100%' }}>
                     <Text style={{ color: colors.danger, fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>⚠️ No Pharmacies Found</Text>
                     <Text style={{ color: colors.text }}>Please re-seed your database with Indian locations.</Text>
                   </View>
                ) : (
                  pharmacies.map(p => (
                    <TouchableOpacity key={p.id} style={styles.restaurantCard} onPress={() => { setSelectedPharmacy(p); fetch(`/api/rides/pharmacies/${p.id}/items`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('BharatOne_token')}` } }).then(res=>res.json()).then(setMedicineItems).catch(console.error); }}>
                      <Text style={{ fontSize: 40 }}>{p.image_url}</Text>
                      <Text style={styles.restaurantName}>{p.name}</Text>
                      <Text style={styles.restaurantCuisine}>{p.city} • ⭐ {p.rating}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          </GlassCard>
        </View>
      ) : null}
      {/* PAYMENT MODAL */}
      <Modal visible={showPaymentModal} transparent animationType="slide">
        <View style={[styles.modalOverlay, { justifyContent: 'flex-end', margin: 0 }]}>
          <View style={{ backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 20, width: '100%', maxHeight: '90%' }}>
            
            {/* Handle Bar */}
            <View style={{ width: 40, height: 5, backgroundColor: colors.border, borderRadius: 3, alignSelf: 'center', marginBottom: 20 }} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ color: colors.text, fontSize: 24, fontWeight: '900' }}>Complete Payment</Text>
                <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                  <Text style={{ color: colors.textMuted, fontSize: 24 }}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <View style={{ backgroundColor: 'rgba(34, 197, 94, 0.05)', padding: 24, borderRadius: 20, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(34, 197, 94, 0.2)', alignItems: 'center' }}>
                <Text style={{ color: colors.textMuted, fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Total to Pay</Text>
                <Text style={{ color: colors.primary, fontSize: 48, fontWeight: '900', marginTop: 8 }}>₹{paymentAmount.toFixed(2)}</Text>
                <Text style={{ color: colors.success, fontSize: 12, marginTop: 8, fontWeight: 'bold' }}>✓ Secure checkout verified by BharatOne</Text>
              </View>

              {paymentProcessing ? (
                <View style={{ alignItems: 'center', padding: 40 }}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={{ color: colors.text, marginTop: 24, fontSize: 20, fontWeight: 'bold' }}>{paymentMode === 'cash' ? 'Confirming Order...' : 'Processing Payment...'}</Text>
                  <Text style={{ color: colors.textMuted, marginTop: 8, fontSize: 14 }}>{paymentMode === 'cash' ? 'Validating request securely.' : 'Connecting to your bank...'}</Text>
                </View>
              ) : (
                <>
                  <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Select Payment Method</Text>
                  
                  <TouchableOpacity 
                    style={[styles.paymentMethodCard, paymentMode === 'upi' && { borderColor: colors.primary, backgroundColor: 'rgba(59, 130, 246, 0.05)', borderWidth: 2 }]} 
                    onPress={() => setPaymentMode('upi')}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                      <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(59, 130, 246, 0.1)', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 24 }}>📱</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>UPI / QR Code</Text>
                        <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 2 }}>Instant payment via any UPI app</Text>
                      </View>
                      <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: paymentMode === 'upi' ? colors.primary : colors.border, alignItems: 'center', justifyContent: 'center' }}>
                        {paymentMode === 'upi' && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary }} />}
                      </View>
                    </View>
                  </TouchableOpacity>

                  {paymentMode === 'upi' && (
                    <View style={{ backgroundColor: colors.surfaceLight, padding: 24, borderRadius: 20, marginBottom: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.glassBorder, marginTop: 8 }}>
                      
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24, justifyContent: 'center', width: '100%' }}>
                        <View style={{ backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#e0e0e0', shadowColor: '#000', shadowOffset:{width:0, height:2}, shadowOpacity: 0.05, elevation: 2, flex: 1, alignItems: 'center' }}>
                          <Text style={{ color: '#002970', fontWeight: '900', fontSize: 16 }}>Pay<Text style={{color: '#00BAF2'}}>tm</Text></Text>
                        </View>
                        <View style={{ backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#e0e0e0', shadowColor: '#000', shadowOffset:{width:0, height:2}, shadowOpacity: 0.05, elevation: 2, flex: 1, alignItems: 'center' }}>
                          <Text style={{ color: '#5E35B1', fontWeight: '900', fontSize: 16 }}>पे PhonePe</Text>
                        </View>
                        <View style={{ backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#e0e0e0', shadowColor: '#000', shadowOffset:{width:0, height:2}, shadowOpacity: 0.05, elevation: 2, flex: 1, alignItems: 'center' }}>
                          <Text style={{ color: '#3C4043', fontWeight: '900', fontSize: 16 }}><Text style={{color:'#4285F4'}}>G</Text><Text style={{color:'#EA4335'}}>P</Text><Text style={{color:'#FBBC05'}}>a</Text><Text style={{color:'#34A853'}}>y</Text></Text>
                        </View>
                      </View>

                      <View style={{ width: 220, height: 220, backgroundColor: '#FFF', padding: 16, borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 10, marginBottom: 16 }}>
                        <Image source={{ uri: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><rect x="0" y="0" width="10" height="10" fill="#FFF"/><rect x="1" y="1" width="3" height="3" fill="#000"/><rect x="1.5" y="1.5" width="2" height="2" fill="#FFF"/><rect x="2" y="2" width="1" height="1" fill="#000"/><rect x="6" y="1" width="3" height="3" fill="#000"/><rect x="6.5" y="1.5" width="2" height="2" fill="#FFF"/><rect x="7" y="2" width="1" height="1" fill="#000"/><rect x="1" y="6" width="3" height="3" fill="#000"/><rect x="1.5" y="6.5" width="2" height="2" fill="#FFF"/><rect x="2" y="7" width="1" height="1" fill="#000"/><rect x="5" y="1" width="1" height="1" fill="#000"/><rect x="5" y="3" width="1" height="2" fill="#000"/><rect x="2" y="5" width="2" height="1" fill="#000"/><rect x="5" y="6" width="1" height="1" fill="#000"/><rect x="6" y="5" width="3" height="1" fill="#000"/><rect x="7" y="7" width="2" height="1" fill="#000"/><rect x="5" y="8" width="1" height="1" fill="#000"/><rect x="8" y="8" width="1" height="1" fill="#000"/><rect x="6" y="9" width="1" height="1" fill="#000"/></svg>') }} style={{ width: '100%', height: '100%' }} />
                      </View>
                      <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>Scan to Pay ₹{paymentAmount.toFixed(2)}</Text>
                      <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 4 }}>Scan with any UPI app on your phone</Text>
                    </View>
                  )}

                  <TouchableOpacity 
                    style={[styles.paymentMethodCard, paymentMode === 'digital' && { borderColor: colors.primary, backgroundColor: 'rgba(59, 130, 246, 0.05)', borderWidth: 2 }]} 
                    onPress={() => setPaymentMode('digital')}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                      <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(59, 130, 246, 0.1)', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 24 }}>💳</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>BharatOne Wallet</Text>
                        <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 2 }}>Available Balance: ₹{(user?.walletBalance || 0).toFixed(2)}</Text>
                      </View>
                      <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: paymentMode === 'digital' ? colors.primary : colors.border, alignItems: 'center', justifyContent: 'center' }}>
                        {paymentMode === 'digital' && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary }} />}
                      </View>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.paymentMethodCard, paymentMode === 'cash' && { borderColor: colors.primary, backgroundColor: 'rgba(59, 130, 246, 0.05)', borderWidth: 2 }]} 
                    onPress={() => setPaymentMode('cash')}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                      <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(34, 197, 94, 0.1)', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 24 }}>💵</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>Cash on Delivery</Text>
                        <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 2 }}>Pay with cash to the partner</Text>
                      </View>
                      <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: paymentMode === 'cash' ? colors.primary : colors.border, alignItems: 'center', justifyContent: 'center' }}>
                        {paymentMode === 'cash' && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary }} />}
                      </View>
                    </View>
                  </TouchableOpacity>

                  <View style={{ marginTop: 16 }}>
                    <CustomButton 
                      title={paymentMode === 'cash' ? "Place Cash Order" : `Pay ₹${paymentAmount.toFixed(2)} & Proceed`} 
                      onPress={processPaymentAndRequest} 
                      variant="primary" 
                      style={{ height: 64, borderRadius: 32 }}
                      textStyle={{ fontSize: 20 }}
                    />
                  </View>
                </>
              )}
            </ScrollView>
          </View>
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
              <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
                <Text style={{ color: colors.primary, fontWeight: 'bold' }}>⭐ {user?.rating || '5.00'} Rating</Text>
                <Text style={{ color: colors.success, fontWeight: 'bold' }}>💰 Wallet: ₹{(user?.walletBalance || 0).toFixed(2)}</Text>
              </View>
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
              
              <TouchableOpacity style={styles.profileMenuBtn} onPress={() => { setShowProfileModal(false); setRiderScreen('history'); }}>
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
  superAppCard: {
    backgroundColor: colors.surfaceLight,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    width: '47%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5
  },
  superAppCardText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold'
  },
  nav: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20,
    backgroundColor: colors.navGlass,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5
  },
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
  
  serviceSelectorRibbon: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 16, marginBottom: 24, paddingHorizontal: 4 },
  serviceTab: { flex: 1, backgroundColor: colors.overlay, borderWidth: 1, borderColor: colors.surfaceLight, borderRadius: 20, paddingVertical: 18, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  serviceIcon: { fontSize: 32, marginBottom: 10 },
  serviceText: { color: colors.textMuted, fontWeight: '800', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 },
  
  dashboard: { flexDirection: 'row', gap: 24, flexWrap: 'wrap' },
  leftCol: { flex: 1.2, minWidth: 320, zIndex: 5 },
  rightCol: { flex: 1, minWidth: 320, zIndex: 1 },
  glassCard: { height: '100%', justifyContent: 'flex-start', padding: 24, borderRadius: 24 },
  cardTitle: { color: colors.text, fontSize: 20, fontWeight: '900', marginBottom: 20, letterSpacing: 0.5 },
  
  helperHeader: { color: colors.textMuted, fontSize: 13, fontWeight: 'bold', marginBottom: 10 },
  customRouteBox: { backgroundColor: colors.surfaceLight, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.surfaceLight, gap: 10, zIndex: 50 },
  routeInput: { backgroundColor: colors.overlay, color: colors.text, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: colors.surfaceLight, marginBottom: 8 },
  suggestionsBox: { position: 'absolute', top: 52, left: 0, right: 0, backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.primary, maxHeight: 150, overflow: 'hidden', zIndex: 999 },
  suggestionItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: colors.surfaceLight },
  suggestionText: { color: colors.text, fontSize: 13 },

  routesWrapper: { flexDirection: 'column', gap: 8, marginBottom: 18 },
  routeCard: { backgroundColor: colors.overlay, borderWidth: 1.5, borderColor: colors.surfaceLight, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 16 },
  activeRouteCard: { borderColor: colors.primary, backgroundColor: 'rgba(163, 230, 53, 0.08)' },
  routeNameText: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
  activeRouteNameText: { color: colors.text },
  
  vehicleBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: colors.overlay, borderWidth: 1, borderColor: colors.overlayBorder },
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

  foodTabs: { flexDirection: 'row', gap: 8, backgroundColor: colors.overlay, padding: 4, borderRadius: 12 },
  foodTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  foodTabActive: { backgroundColor: colors.foodColor },
  foodTabText: { color: colors.textMuted, fontWeight: 'bold', fontSize: 13 },

  restaurantCard: { backgroundColor: colors.surfaceLight, padding: 20, borderRadius: 16, width: 200, alignItems: 'center', borderWidth: 1, borderColor: colors.primary },
  restaurantName: { color: colors.text, fontSize: 18, fontWeight: 'bold', marginTop: 12 },
  restaurantCuisine: { color: colors.textMuted, fontSize: 12, marginTop: 4, textAlign: 'center' },
  
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderColor: colors.overlay },
  addBtn: { backgroundColor: 'rgba(163,230,53,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.primary },
  
  paymentMethodCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.overlay, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.surfaceLight, marginBottom: 12 },
  paymentMethodActive: { borderColor: colors.primary, backgroundColor: 'rgba(163,230,53,0.05)' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20, zIndex: 9999 },
  modalCard: { width: '100%', maxWidth: 450, padding: 24, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.glassBorder },
  cityOptionBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.glassBorder },
  cityOptionBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  cityOptionText: { color: colors.text, fontWeight: 'bold' },
  
  supportTabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6, backgroundColor: colors.overlay },
  supportTabActive: { backgroundColor: colors.parcelColor },
  supportTabText: { color: colors.textMuted, fontSize: 12, fontWeight: 'bold' },
  chatInput: { backgroundColor: colors.overlay, color: colors.text, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  
  profileBtn: { backgroundColor: 'rgba(163, 230, 53, 0.1)', borderWidth: 1, borderColor: 'rgba(163, 230, 53, 0.2)', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 },
  profileMenuBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.overlay, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.glassBorder },
  profileMenuIcon: { fontSize: 24, marginRight: 16 },
  profileMenuText: { color: colors.text, fontSize: 16, fontWeight: '600' },

  fareBreakdown: { marginBottom: 16 },
  iconCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  fareText: { color: colors.rideColor, fontSize: 24, fontWeight: '900', marginBottom: 4 },
  paymentInfoText: { color: colors.textMuted, fontSize: 13 },
  surgeBadge: { backgroundColor: 'rgba(234, 179, 8, 0.15)', borderWidth: 1, borderColor: '#EAB308', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 8 },
  surgeText: { color: '#FDE047', fontSize: 12, fontWeight: 'bold' }
});
