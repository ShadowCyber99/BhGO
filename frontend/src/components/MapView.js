import React, { useEffect, useState, useMemo, useRef } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { MapContainer, TileLayer, Marker, Polyline, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER = { lat: 28.6139, lng: 77.2090 };

const svgIcons = {
  car: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="8" width="20" height="11" rx="2" ry="2"></rect><path d="M4 8L6 4h12l2 4"></path><circle cx="7" cy="19" r="2"></circle><circle cx="17" cy="19" r="2"></circle></svg>`,
  ambulance: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="6" width="20" height="12" rx="2"></rect><path d="M12 9v6M9 12h6"></path><circle cx="7" cy="18" r="2"></circle><circle cx="17" cy="18" r="2"></circle></svg>`,
  bike: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="6" cy="16" r="4"></circle><circle cx="18" cy="16" r="4"></circle><path d="M6 16l4-8h4"></path><path d="M14 8l4 8"></path><path d="M10 8h-3"></path></svg>`,
  parcel: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="M3 10h18"></path><path d="M12 5v5"></path></svg>`,
  food: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9v1h14V9c0-3.87-3.13-7-7-7z"></path><path d="M3 14h18v3c0 1.66-1.34 3-3 3H6c-1.66 0-3-1.34-3-3v-3z"></path><path d="M4 11h16v1H4z"></path></svg>`,
  pickup: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="6"></circle></svg>`,
  dropoff: `<svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="16" height="16"></rect></svg>`
};

const createMarkerIcon = (color, svgContent) => {
  const svg = `
    <svg width="38" height="48" viewBox="0 0 38 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 48L11 38C4.5 30 0 24 0 19C0 8.5 8.5 0 19 0C29.5 0 38 8.5 38 19C38 24 33.5 30 27 38L19 48Z" fill="${color}"/>
      <circle cx="19" cy="19" r="14" fill="black" fill-opacity="0.2"/>
      <g transform="translate(9, 9)">
        ${svgContent}
      </g>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: 'custom-leaflet-icon',
    iconSize: [38, 48],
    iconAnchor: [19, 48]
  });
};

const icons = {
  ride: createMarkerIcon('#6366F1', svgIcons.car),
  ambulance: createMarkerIcon('#EF4444', svgIcons.ambulance),
  parcel: createMarkerIcon('#8B5CF6', svgIcons.parcel),
  food: createMarkerIcon('#F97316', svgIcons.food),
  bike: createMarkerIcon('#F59E0B', svgIcons.bike),
  pickup: createMarkerIcon('#10B981', svgIcons.pickup),
  dropoff: createMarkerIcon('#EF4444', svgIcons.dropoff)
};

const getDriverIcon = (driverObj) => {
  if (!driverObj) return icons.ride;
  if (driverObj.serviceCategory === 'ambulance' || driverObj.vehicleType === 'ambulance') return icons.ambulance;
  if (driverObj.vehicleType === 'bike' || driverObj.vehiclePreference === 'bike') return icons.bike;
  if (driverObj.serviceCategory === 'food') return icons.food;
  return icons.ride;
};

// Component to handle dynamic map panning
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.flyTo([center.lat, center.lng], map.getZoom(), { animate: true, duration: 1.0 });
    }
  }, [center, map]);
  return null;
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    }
  });
  return null;
}

// Leaflet requires a custom implementation to update marker positions smoothly without React re-renders
function AnimatedDriverMarker({ initialPos, icon, osrmRoute, rideStatus, dropoff, pickup, driver, onDestinationReached }) {
  const markerRef = useRef(null);

  useEffect(() => {
    if (!markerRef.current) return;
    
    if (rideStatus === 'completed' && dropoff?.lat) {
      markerRef.current.setLatLng([dropoff.lat, dropoff.lng]);
    } else if (rideStatus === 'arrived' && pickup?.lat) {
      markerRef.current.setLatLng([pickup.lat, pickup.lng]);
    } else if (osrmRoute.length > 0 && (rideStatus === 'accepted' || rideStatus === 'started')) {
      let step = 0;
      markerRef.current.setLatLng([osrmRoute[0].lat, osrmRoute[0].lng]);
      
      const delay = Math.max(20, Math.floor(30000 / osrmRoute.length));

      const interval = setInterval(() => {
        step += 1;
        if (step < osrmRoute.length) {
          if (markerRef.current) {
            markerRef.current.setLatLng([osrmRoute[step].lat, osrmRoute[step].lng]);
          }
        } else {
          clearInterval(interval);
          if (onDestinationReached) {
            onDestinationReached();
          }
        }
      }, delay);
      
      return () => clearInterval(interval);
    } else if (driver?.lat && driver?.lng) {
      markerRef.current.setLatLng([driver.lat, driver.lng]);
    }
  }, [osrmRoute, rideStatus, dropoff?.lat, dropoff?.lng, pickup?.lat, pickup?.lng, driver?.lat, driver?.lng]);

  return <Marker ref={markerRef} position={initialPos} icon={icon} />;
}


export default function MapView({ 
  pickup,
  dropoff,
  waypoints = [],
  demandZones = [],
  driver,
  nearbyDrivers = [],
  cityCenter,
  rideStatus,
  onDestinationReached,
  onMapClick,
}) {
  const { colors, isDarkMode } = useTheme();
  const styles = getStyles(colors);

  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [hasCentered, setHasCentered] = useState(false);
  const [osrmRoute, setOsrmRoute] = useState([]);
  const [routeStats, setRouteStats] = useState({ distance: 0, duration: 0 });
  const [routeColor, setRouteColor] = useState(colors.primary);
  const lastFetchedStatusRef = useRef(null);

  useEffect(() => {
    let newCenter = null;
    if (cityCenter?.lat && cityCenter?.lng) {
      newCenter = { lat: cityCenter.lat, lng: cityCenter.lng };
    } else if (!hasCentered) {
      if (pickup?.lat && pickup?.lng) {
        newCenter = { lat: pickup.lat, lng: pickup.lng };
        setHasCentered(true);
      } else if (driver?.lat && driver?.lng) {
        newCenter = { lat: driver.lat, lng: driver.lng };
        setHasCentered(true);
      } else if (nearbyDrivers.length > 0) {
        newCenter = { lat: nearbyDrivers[0].latitude, lng: nearbyDrivers[0].longitude };
        setHasCentered(true);
      }
    }
    
    if (newCenter) {
      setMapCenter(newCenter);
    }
  }, [pickup, driver, nearbyDrivers, hasCentered, cityCenter]);

  useEffect(() => {
    let start = null;
    let end = null;
    let rColor = colors.primary;

    if (rideStatus === 'accepted' || rideStatus === 'arrived') {
      if (driver?.lat && pickup?.lat) {
        start = driver;
        end = pickup;
        rColor = '#F97316'; 
      }
    } else if (rideStatus === 'started') {
      if (pickup?.lat && dropoff?.lat) {
        start = pickup;
        end = dropoff;
        rColor = '#10B981'; 
      }
    } else {
      if (pickup?.lat && dropoff?.lat) {
        start = pickup;
        end = dropoff;
        rColor = colors.primary;
      }
    }

    setRouteColor(rColor);

    if (start && end) {
      if (lastFetchedStatusRef.current === rideStatus && osrmRoute.length > 0) return;
      
      const fetchRoute = async () => {
        try {
          const includeWaypoints = waypoints && waypoints.length > 0 && ((start === pickup && end === dropoff) || rideStatus === 'started');
          const wpString = includeWaypoints ? waypoints.map(w => `${w.lng},${w.lat}`).join(';') : '';
          const coordsString = wpString ? `${start.lng},${start.lat};${wpString};${end.lng},${end.lat}` : `${start.lng},${start.lat};${end.lng},${end.lat}`;
          
          const url = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;
          const res = await fetch(url);
          const data = await res.json();
          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const coords = route.geometry.coordinates.map(c => ({ lat: c[1], lng: c[0] }));
            setOsrmRoute(coords);
            setRouteStats({
              distance: (route.distance / 1000).toFixed(1),
              duration: Math.ceil(route.duration / 60)
            });
          }
        } catch (err) {
          console.error("OSRM Fetch Error:", err);
          setOsrmRoute([{ lat: start.lat, lng: start.lng }, { lat: end.lat, lng: end.lng }]);
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

  const tileUrl = isDarkMode 
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  const routePositions = osrmRoute.map(r => [r.lat, r.lng]);

  return (
    <View style={styles.container}>
      <style>{`
        .leaflet-container {
          width: 100%;
          height: 400px;
          border-radius: 16px;
        }
        .custom-leaflet-icon {
          background: transparent;
          border: none;
        }
      `}</style>
      
      <MapContainer 
        center={[mapCenter.lat, mapCenter.lng]} 
        zoom={14} 
        zoomControl={false}
      >
        <MapClickHandler onMapClick={onMapClick} />
        <TileLayer url={tileUrl} />
        <MapUpdater center={mapCenter} />

        {nearbyDrivers.map((dr, idx) => (
          dr.latitude && dr.longitude && (
            <Marker 
              key={idx} 
              position={[dr.latitude, dr.longitude]} 
              icon={getDriverIcon(dr)}
            />
          )
        ))}

        {pickup?.lat && pickup?.lng && (
          <Marker position={[pickup.lat, pickup.lng]} icon={icons.pickup} />
        )}

        {waypoints.map((wp, idx) => (
          wp?.lat && wp?.lng && (
            <Marker key={`wp-${idx}`} position={[wp.lat, wp.lng]} icon={icons.pickup} />
          )
        ))}

        {dropoff?.lat && dropoff?.lng && (
          <Marker position={[dropoff.lat, dropoff.lng]} icon={icons.dropoff} />
        )}

        {demandZones.map((zone, idx) => (
          <Circle 
            key={`zone-${idx}`}
            center={[zone.lat, zone.lng]}
            radius={zone.radius || 1500}
            pathOptions={{ color: 'transparent', fillColor: '#ef4444', fillOpacity: zone.intensity || 0.4 }}
          />
        ))}

        {(driver?.lat && driver?.lng || osrmRoute.length > 0) && (
          <AnimatedDriverMarker 
            initialPos={[driver?.lat || mapCenter.lat, driver?.lng || mapCenter.lng]}
            icon={getDriverIcon(driver)}
            osrmRoute={osrmRoute}
            rideStatus={rideStatus}
            dropoff={dropoff}
            pickup={pickup}
            driver={driver}
            onDestinationReached={onDestinationReached}
          />
        )}

        {routePositions.length > 1 && (
          <Polyline 
            positions={routePositions} 
            pathOptions={{ color: routeColor, weight: 5, opacity: 0.8 }}
          />
        )}
      </MapContainer>
      
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
