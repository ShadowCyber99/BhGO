import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Import Leaflet dependencies
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Circle } from 'react-leaflet';
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
  bike: new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1986/1986937.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  }),
  pickup: new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/10332/10332152.png', // Green start flag
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  }),
  dropoff: new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/10332/10332145.png', // Red finish flag
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  })
};

const getDriverIcon = (driverObj) => {
  if (!driverObj) return icons.ride;
  if (driverObj.serviceCategory === 'ambulance') return icons.ambulance;
  if (driverObj.vehicleType === 'bike' || driverObj.vehiclePreference === 'bike') return icons.bike;
  if (driverObj.serviceCategory === 'food') return icons.food;
  return icons.ride; // Cab/Car fallback
};

export default function MapView({ 
  pickup,     // { lat, lng, address }
  dropoff,    // { lat, lng, address }
  waypoints = [], // [ { lat, lng } ]
  demandZones = [], // [ { lat, lng, intensity, radius } ]
  driver,     // { lat, lng, name, vehicleType, serviceCategory }
  nearbyDrivers = [], // [ { latitude, longitude, vehicleType, serviceCategory } ]
  cityCenter, // { lat, lng }
  rideStatus, // 'requested', 'accepted', 'arrived', 'started', 'completed', 'cancelled'
}) {
  const { colors, isDarkMode } = useTheme();
  const styles = getStyles(colors);
  
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [hasCentered, setHasCentered] = useState(false);
  const [osrmRoute, setOsrmRoute] = useState([]);
  const [routeStats, setRouteStats] = useState({ distance: 0, duration: 0 });
  const [routeColor, setRouteColor] = useState(colors.primary);
  const [animatedDriverPos, setAnimatedDriverPos] = useState(null);
  const lastFetchedStatusRef = React.useRef(null);

  // Auto-center map
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

  // Fetch OSRM Route based on status
  useEffect(() => {
    let start = null;
    let end = null;
    let rColor = colors.primary;

    if (rideStatus === 'accepted' || rideStatus === 'arrived') {
      // Driver is going to pickup
      if (driver?.lat && pickup?.lat) {
        start = driver;
        end = pickup;
        rColor = '#F97316'; // Orange
      }
    } else if (rideStatus === 'started') {
      // Driver is going to dropoff. They should be at the pickup location.
      if (pickup?.lat && dropoff?.lat) {
        start = pickup;
        end = dropoff;
        rColor = '#10B981'; // Green
      }
    } else {
      // Default: show pickup to dropoff
      if (pickup?.lat && dropoff?.lat) {
        start = pickup;
        end = dropoff;
        rColor = colors.primary;
      }
    }

    setRouteColor(rColor);

    if (start && end) {
      if (lastFetchedStatusRef.current === rideStatus && osrmRoute.length > 0) {
        return; // Prevent recalculating route continuously as driver moves
      }
      
      const fetchRoute = async () => {
        try {
          // Only include waypoints if we are showing the full route (pickup to dropoff) or if the trip has started.
          const includeWaypoints = waypoints && waypoints.length > 0 && ((start === pickup && end === dropoff) || rideStatus === 'started');
          const wpString = includeWaypoints ? waypoints.map(w => `${w.lng},${w.lat}`).join(';') : '';
          const coordsString = wpString ? `${start.lng},${start.lat};${wpString};${end.lng},${end.lat}` : `${start.lng},${start.lat};${end.lng},${end.lat}`;
          
          const url = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;
          const res = await fetch(url);
          const data = await res.json();
          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            // OSRM returns [lng, lat], Leaflet needs [lat, lng]
            const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
            setOsrmRoute(coords);
            setRouteStats({
              distance: (route.distance / 1000).toFixed(1), // km
              duration: Math.ceil(route.duration / 60) // mins
            });
          }
        } catch (err) {
          console.error("OSRM Fetch Error:", err);
          // Fallback to straight line
          setOsrmRoute([[start.lat, start.lng], [end.lat, end.lng]]);
        }
        lastFetchedStatusRef.current = rideStatus;
      };
      fetchRoute();
    } else {
      setOsrmRoute([]);
      setRouteStats({ distance: 0, duration: 0 });
      lastFetchedStatusRef.current = null;
    }
  }, [rideStatus, pickup?.lat, pickup?.lng, dropoff?.lat, dropoff?.lng, driver?.lat, driver?.lng]);

  // Animate Driver Marker along the route
  useEffect(() => {
    if (rideStatus === 'completed' && dropoff?.lat) {
      setAnimatedDriverPos([dropoff.lat, dropoff.lng]);
    } else if (rideStatus === 'arrived' && pickup?.lat) {
      setAnimatedDriverPos([pickup.lat, pickup.lng]);
    } else if (osrmRoute.length > 0 && (rideStatus === 'accepted' || rideStatus === 'started')) {
      let step = 0;
      setAnimatedDriverPos(osrmRoute[0]);
      
      // Calculate delay to make the animation take about 30 seconds total for a smoother experience
      const delay = Math.max(20, Math.floor(30000 / osrmRoute.length));

      const interval = setInterval(() => {
        step += 1;
        if (step < osrmRoute.length) {
          setAnimatedDriverPos(osrmRoute[step]);
        } else {
          clearInterval(interval);
        }
      }, delay);
      
      return () => clearInterval(interval);
    } else if (driver?.lat && driver?.lng) {
      setAnimatedDriverPos([driver.lat, driver.lng]);
    } else {
      setAnimatedDriverPos(null);
    }
  }, [osrmRoute, rideStatus, dropoff?.lat, dropoff?.lng, pickup?.lat, pickup?.lng, driver?.lat, driver?.lng]);

  return (
    <View style={styles.container}>
      <MapContainer 
        center={mapCenter} 
        key={mapCenter.join(',')} 
        zoom={14} 
        style={{ height: '400px', width: '100%', borderRadius: 16 }}
        zoomControl={false}
      >
        <ChangeView center={mapCenter} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url={isDarkMode 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
            : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"}
        />

        {nearbyDrivers.map((dr, idx) => (
          dr.latitude && dr.longitude && (
            <Marker 
              key={idx} 
              position={[dr.latitude, dr.longitude]} 
              icon={getDriverIcon(dr)}
            >
              <Popup>{dr.name} - {dr.vehicleName}</Popup>
            </Marker>
          )
        ))}

        {pickup?.lat && pickup?.lng && (
          <Marker position={[pickup.lat, pickup.lng]} icon={icons.pickup}>
            <Popup>Pickup: {pickup.address}</Popup>
          </Marker>
        )}

        {waypoints.map((wp, idx) => (
          wp?.lat && wp?.lng && (
            <Marker key={`wp-${idx}`} position={[wp.lat, wp.lng]} icon={icons.pickup}>
              <Popup>Stop {idx + 1}</Popup>
            </Marker>
          )
        ))}

        {dropoff?.lat && dropoff?.lng && (
          <Marker position={[dropoff.lat, dropoff.lng]} icon={icons.dropoff}>
            <Popup>Dropoff: {dropoff.address}</Popup>
          </Marker>
        )}

        {demandZones.map((zone, idx) => (
          <Circle 
            key={`zone-${idx}`}
            center={[zone.lat, zone.lng]}
            radius={zone.radius || 1500}
            pathOptions={{ color: 'transparent', fillColor: '#ef4444', fillOpacity: zone.intensity || 0.4 }}
          />
        ))}

        {(animatedDriverPos || (driver?.lat && driver?.lng)) && (
          <Marker 
            position={animatedDriverPos || [driver.lat, driver.lng]} 
            icon={getDriverIcon(driver)}
          >
            <Popup>Active Driver: {driver?.name || 'Driver'}</Popup>
          </Marker>
        )}

        {osrmRoute.length > 1 && (
          <Polyline 
            positions={osrmRoute} 
            color={routeColor} 
            weight={5}
            opacity={0.8}
          />
        )}
      </MapContainer>
      
      {/* HUD Overlay */}
      <View style={styles.hud}>
        <Text style={styles.hudText}>🌍 Live Super App Map</Text>
        {routeStats.distance > 0 && (
          <View style={{ marginTop: 4, flexDirection: 'row', gap: 10 }}>
            <Text style={{ color: '#0f172a', fontSize: 11 }}>🛣️ {routeStats.distance} km</Text>
            <Text style={{ color: '#0f172a', fontSize: 11 }}>⏱️ {routeStats.duration} min</Text>
          </View>
        )}
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
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1000,
  },
  hudText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
});
