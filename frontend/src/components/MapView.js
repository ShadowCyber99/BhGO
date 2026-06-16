import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Import Leaflet dependencies
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Import Leaflet CSS (required for proper map rendering)
import 'leaflet/dist/leaflet.css';

// Default Map Center (Delhi, India)
const DEFAULT_CENTER = [28.6139, 77.2090];

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.length === 2 && center[0] && center[1]) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
}

// Custom map markers for different service categories
const icons = {
  ride: new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1048/1048314.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  }),
  ambulance: new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1118/1118128.png',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  }),
  parcel: new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2769/2769339.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  }),
  food: new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/737/737967.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  }),
  pickup: new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1483/1483336.png',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  }),
  dropoff: new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1483/1483155.png',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  })
};

export default function MapView({ 
  pickup,     // { lat, lng, address }
  dropoff,    // { lat, lng, address }
  driver,     // { lat, lng, name, vehicleType, serviceCategory }
  nearbyDrivers = [], // [ { latitude, longitude, vehicleType, serviceCategory } ]
  cityCenter, // { lat, lng }
}) {
  const { colors, isDarkMode } = useTheme();
  const styles = getStyles(colors);
  
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [hasCentered, setHasCentered] = useState(false);

  // Auto-center map only ONCE when data first becomes available, or explicitly when city changes
  useEffect(() => {
    if (cityCenter?.lat && cityCenter?.lng) {
      setMapCenter([cityCenter.lat, cityCenter.lng]);
    } else if (!hasCentered) {
      if (pickup?.lat && pickup?.lng) {
        setMapCenter([pickup.lat, pickup.lng]);
        setHasCentered(true);
      } else if (driver?.lat && driver?.lng) {
        setMapCenter([driver.lat, driver.lng]);
        setHasCentered(true);
      } else if (nearbyDrivers.length > 0) {
        setMapCenter([nearbyDrivers[0].latitude, nearbyDrivers[0].longitude]);
        setHasCentered(true);
      }
    }
  }, [pickup, driver, nearbyDrivers, hasCentered, cityCenter]);

  // Route path coordinates
  const polylineCoords = [];
  if (pickup?.lat && pickup?.lng) polylineCoords.push([pickup.lat, pickup.lng]);
  if (driver?.lat && driver?.lng && !dropoff) polylineCoords.unshift([driver.lat, driver.lng]); // Driver to pickup
  if (dropoff?.lat && dropoff?.lng) polylineCoords.push([dropoff.lat, dropoff.lng]); // Pickup to dropoff

  return (
    <View style={styles.container}>
      <MapContainer 
        center={mapCenter} 
        key={mapCenter.join(',')} // Force map to initially center, but allow free panning later
        zoom={14} 
        style={{ height: '400px', width: '100%', borderRadius: 16 }}
        zoomControl={false}
      >
        <ChangeView center={mapCenter} />
        {/* Beautiful high-quality OpenStreetMap layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url={isDarkMode 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
            : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"}
        />

        {/* 1. Draw Nearby Drivers */}
        {nearbyDrivers.map((dr, idx) => (
          dr.latitude && dr.longitude && (
            <Marker 
              key={idx} 
              position={[dr.latitude, dr.longitude]} 
              icon={icons[dr.serviceCategory] || icons.ride}
            >
              <Popup>{dr.name} - {dr.vehicleName}</Popup>
            </Marker>
          )
        ))}

        {/* 2. Draw Pickup Marker */}
        {pickup?.lat && pickup?.lng && (
          <Marker position={[pickup.lat, pickup.lng]} icon={icons.pickup}>
            <Popup>Pickup: {pickup.address}</Popup>
          </Marker>
        )}

        {/* 3. Draw Dropoff Marker */}
        {dropoff?.lat && dropoff?.lng && (
          <Marker position={[dropoff.lat, dropoff.lng]} icon={icons.dropoff}>
            <Popup>Dropoff: {dropoff.address}</Popup>
          </Marker>
        )}

        {/* 4. Draw Active Assigned Driver */}
        {driver?.lat && driver?.lng && (
          <Marker 
            position={[driver.lat, driver.lng]} 
            icon={icons[driver.serviceCategory] || icons.ride}
          >
            <Popup>Active Driver: {driver.name}</Popup>
          </Marker>
        )}

        {/* 5. Draw Active Route Line */}
        {polylineCoords.length > 1 && (
          <Polyline 
            positions={polylineCoords} 
            color={colors.primary} 
            weight={4}
            dashArray="10, 10"
          />
        )}
      </MapContainer>
      
      {/* HUD Overlay */}
      <View style={styles.hud}>
        <Text style={styles.hudText}>🌍 Live Super App Map</Text>
      </View>
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.surfaceLight,
    position: 'relative',
    backgroundColor: '#0F1015',
  },
  hud: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  hudText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
});
