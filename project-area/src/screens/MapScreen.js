import React, { useState, useEffect, useContext, useMemo } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Image } from 'expo-image';
import * as Animatable from 'react-native-animatable';
import { UserContext } from "../context/UserContext";
import { API_BASE_URL } from "../constants/Config";

export default function MapScreen() {
  const { currentUser } = useContext(UserContext);
  const [location, setLocation] = useState(null);
  const [usersWithLocations, setUsersWithLocations] = useState([]);

  const fetchMapUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/map-users`);
      const json = await response.json();
      if (json.success) setUsersWithLocations(json.users || []);
    } catch (e) { console.log("Map Fetch Error:", e); }
  };

  useEffect(() => {
    let sub;
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      
      const current = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      });

      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 50 },
        (newLoc) => {
          fetch(`${API_BASE_URL}/api/users/update-location`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                user_id: currentUser?.id, 
                latitude: newLoc.coords.latitude, 
                longitude: newLoc.coords.longitude 
            }),
          });
        }
      );
    })();

    fetchMapUsers();
    const interval = setInterval(fetchMapUsers, 15000);
    return () => { sub?.remove(); clearInterval(interval); };
  }, [currentUser?.id]);

  const renderMarkers = useMemo(() => {
    return usersWithLocations.map((user) => {
      const lat = Number(user.latitude);
      const lon = Number(user.longitude);
      if (isNaN(lat) || isNaN(lon)) return null;
      
      const isMe = user.id === currentUser?.id;
      // נרמול שדה המדבקה מהשרת (יכול להגיע כ-sticker_url במפה)
      const stickerToShow = user.sticker_url || user.stickerUrl;

      return (
        <Marker
          key={`${user.id}-${user.activeEmoji}`}
          coordinate={{ latitude: lat, longitude: lon }}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.markerWrapper}>
            <Animatable.View 
              animation={isMe ? "pulse" : "fadeIn"} 
              iterationCount={isMe ? "infinite" : 1}
              style={[styles.markerContainer, isMe && styles.myMarkerContainer]}
            >
              {stickerToShow ? (
                <Image 
                  source={{ uri: stickerToShow }} 
                  style={styles.markerSticker} 
                  contentFit="contain"
                />
              ) : (
                <Text style={styles.markerEmoji}>{user.activeEmoji || '📍'}</Text>
              )}
            </Animatable.View>
            <View style={styles.nameTag}>
              <Text style={styles.nameTagText}>{isMe ? "אני" : user.first_name}</Text>
            </View>
          </View>
        </Marker>
      );
    });
  }, [usersWithLocations, currentUser?.id]);

  return (
    <View style={styles.container}>
      {location ? (
        <MapView provider={PROVIDER_GOOGLE} style={styles.map} initialRegion={location}>
          {renderMarkers}
        </MapView>
      ) : (
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#00b4d8" /></View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', marginBottom: 80, borderRadius: 25, overflow: 'hidden', marginHorizontal: 10, marginTop: 10 },
  map: { width: '100%', height: '100%' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  markerWrapper: { width: 33, height: 55, alignItems: 'center', justifyContent: 'center' },
  markerContainer: {
    width: 32, height: 32, backgroundColor: 'white', borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'white',
    shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 3, elevation: 5,
  },
  myMarkerContainer: { borderColor: '#00b4d8', borderWidth: 3 },
  markerSticker: { width: 26, height: 26 },
  markerEmoji: { fontSize: 24 },
  nameTag: { backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginTop: 4 },
  nameTagText: { color: 'white', fontSize: 10, fontWeight: 'bold' }
});