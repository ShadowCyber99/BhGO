import re

file_path = 'frontend/src/screens/RiderHomeScreen.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the start of the return statement
start_idx = content.find('  return (\n    <ScrollView style={styles.container}')
if start_idx == -1:
    print("Could not find start of return statement")
    exit(1)

# We want to replace the entire return block up to the end of the file.
# Wait, actually let's just replace the `dashboard` and `services` flow rendering to implement the map-first UI.
# A safer approach is to replace the main ScrollView container with a flex View, put MapView first, and conditionally render the overlays.

new_render = """  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* GLOBAL MAP VIEW as Hero */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: activeFlow === 'dashboard' ? '40%' : 0 }}>
        <MapView 
          cityCenter={selectedCity} 
          pickup={pickupCoords} 
          dropoff={dropoffCoords} 
          waypoints={waypointCoords} 
          nearbyDrivers={nearbyDrivers} 
          onMapClick={handleMapClick}
        />
      </View>

      {/* Top Navigation Overlay */}
      <View style={[styles.nav, { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: 'transparent', borderBottomWidth: 0, zIndex: 10 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Image source={isDarkMode ? require('../../assets/logo_dark.jpg') : require('../../assets/logo_light.jpg')} style={{ width: 60, height: 60, mixBlendMode: isDarkMode ? 'screen' : 'multiply' }} resizeMode="contain" />
          <Text style={{fontSize: 14, color: colors.primary, fontWeight: 'bold'}}>🇮🇳 India</Text>
        </View>
        <View style={styles.userBox}>
          <TouchableOpacity onPress={() => setShowCityPicker(true)} style={styles.cityBtn}>
            <Text style={[styles.cityBtnText, { backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 }]}>📍 {selectedCity.name}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowProfileModal(true)} style={styles.profileBtn}>
            <Text style={[styles.userName, { backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 }]}>👤 Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Overlay */}
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
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
              ].map(s => (
                <TouchableOpacity key={s.id} style={{ width: '22%', alignItems: 'center', marginBottom: 12 }} onPress={s.action}>
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

        {activeFlow === 'services' && (
          <ScrollView style={{ backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' }}>
            <TouchableOpacity onPress={() => setActiveFlow('dashboard')} style={{ marginBottom: 16 }}>
              <Text style={{ color: colors.primary, fontWeight: 'bold' }}>← Back</Text>
            </TouchableOpacity>
            
            {/* SEARCH BARS (Pickup/Dropoff) */}
            <View style={styles.searchContainer}>
              <View style={styles.searchRow}>
                <View style={styles.searchDot} />
                <TextInput 
                  style={[styles.searchInput, { color: colors.text, borderColor: colors.border }]} 
                  placeholder="Pickup Location" 
                  placeholderTextColor={colors.textMuted}
                  value={pickupAddress}
                  onChangeText={searchPickup}
                />
              </View>
              {pickupSuggestions.length > 0 && (
                <View style={styles.suggestionsCard}>
                  {pickupSuggestions.map((s, i) => (
                    <TouchableOpacity key={i} style={styles.suggestionItem} onPress={() => selectPickupSuggestion(s)}>
                      <Text style={{ color: colors.text }}>{s.address}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              
              <View style={styles.searchRow}>
                <View style={[styles.searchDot, { backgroundColor: colors.primary }]} />
                <TextInput 
                  style={[styles.searchInput, { color: colors.text, borderColor: colors.border }]} 
                  placeholder="Dropoff Location" 
                  placeholderTextColor={colors.textMuted}
                  value={dropoffAddress}
                  onChangeText={searchDropoff}
                />
              </View>
              {dropoffSuggestions.length > 0 && (
                <View style={styles.suggestionsCard}>
                  {dropoffSuggestions.map((s, i) => (
                    <TouchableOpacity key={i} style={styles.suggestionItem} onPress={() => selectDropoffSuggestion(s)}>
                      <Text style={{ color: colors.text }}>{s.address}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* If locations selected, show Fare/Booking UI */}
            {baseDistance > 0 && (
              <View style={{ marginTop: 24 }}>
                <Text style={{ fontSize: 16, color: colors.text, marginBottom: 16 }}>Distance: {baseDistance.toFixed(1)} km</Text>
                
                {serviceCategory === 'ride' && (
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    {['cab', 'bike'].map(v => (
                      <TouchableOpacity key={v} style={[styles.vehicleBtn, vehiclePreference === v && styles.vehicleBtnActive, { flex: 1, padding: 16 }]} onPress={() => setVehiclePreference(v)}>
                        <Text style={{ color: vehiclePreference === v ? '#FFF' : colors.text, fontWeight: 'bold', textAlign: 'center' }}>{v === 'cab' ? 'Ride' : 'Bike'}</Text>
                        <Text style={{ color: vehiclePreference === v ? '#FFF' : colors.textMuted, textAlign: 'center', marginTop: 4 }}>₹{(baseDistance * (v === 'bike' ? 8 : 15)).toFixed(0)}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {serviceCategory === 'ambulance' && (
                  <View style={{ backgroundColor: '#FEE2E2', padding: 16, borderRadius: 12, marginBottom: 16 }}>
                    <Text style={{ color: colors.danger, fontWeight: 'bold', fontSize: 16 }}>Emergency Ambulance</Text>
                    <Text style={{ color: colors.danger, marginTop: 4 }}>Fastest route priority. Est: ₹{(baseDistance * 25).toFixed(0)}</Text>
                  </View>
                )}
                
                <CustomButton 
                  title={serviceCategory === 'ambulance' ? 'Request Ambulance NOW' : 'Book Ride'} 
                  onPress={requestRide} 
                  loading={loading}
                  style={serviceCategory === 'ambulance' ? { backgroundColor: colors.danger, marginTop: 24 } : { marginTop: 24 }}
                />
              </View>
            )}
          </ScrollView>
        )}

        {/* Existing Grocery/Medicine flows remain mostly unchanged but wrapped appropriately if activeFlow matches */}
"""

# Let's write a smarter Python script to extract and replace just what we need, or I can just use replace_file_content for specific pieces.
