const fs = require('fs');

const content = fs.readFileSync('frontend/src/screens/RiderHomeScreen.js', 'utf8');

const startMarker = "      {activeFlow === 'services' ? (\n        <View style={{ flex: 1, width: '100%' }}>";
const endMarker = "      {/* FOOD MARKETPLACE VIEW */}\n      {serviceCategory === 'food' ? (";

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx !== -1 && endIdx !== -1) {
    const newServicesUi = `      {activeFlow === 'services' ? (
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
      ) : activeFlow === 'grocery' ? (
        <View style={{ flex: 1, padding: 16 }}>
          <TouchableOpacity onPress={() => setActiveFlow('dashboard')} style={{ marginBottom: 16 }}>
            <Text style={{ color: colors.primary, fontWeight: 'bold' }}>← Back</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }}>Grocery Deliveries Not Available</Text>
        </View>
      ) : activeFlow === 'medicine' ? (
        <View style={{ flex: 1, padding: 16 }}>
          <TouchableOpacity onPress={() => setActiveFlow('dashboard')} style={{ marginBottom: 16 }}>
            <Text style={{ color: colors.primary, fontWeight: 'bold' }}>← Back</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }}>Pharmacy Deliveries Not Available</Text>
        </View>
      ) : \n`;

    const newContent = content.substring(0, startIdx) + newServicesUi + content.substring(endIdx);
    fs.writeFileSync('frontend/src/screens/RiderHomeScreen.js', newContent, 'utf8');
    console.log("Successfully patched services flow via Node!");
} else {
    console.log("Could not find boundaries for patching services flow.");
    console.log("startIdx:", startIdx, "endIdx:", endIdx);
}
