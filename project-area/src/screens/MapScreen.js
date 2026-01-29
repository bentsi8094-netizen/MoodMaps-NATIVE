import React, { useState, useEffect, useContext, useMemo } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Image } from 'expo-image';
import * as Animatable from 'react-native-animatable';
import { UserContext } from "../context/UserContext";
import { API_BASE_URL } from "../constants/Config";

export default function MapScreen({ setActiveTab, setTargetPostId }) {
  const { currentUser } = useContext(UserContext);
  const [location, setLocation] = useState(null);
  const [usersWithLocations, setUsersWithLocations] = useState([]);

  const fetchMapUsers = async () => {
    try {
      console.log("Fetching from:", `${API_BASE_URL}/api/posts/map-users`);
      const response = await fetch(`${API_BASE_URL}/api/posts/map-users`);
      const json = await response.json();
      
      if (json.success) {
        console.log("Users found:", json.users.length);
        setUsersWithLocations(json.users);
      }
    } catch (e) { 
      console.log("❌ Map Fetch Error:", e.message); 
      // אם יש שגיאת רשת, אל תרוקן את הרשימה כדי שהמרקרים הקיימים לא ייעלמו
    }
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
        latitudeDelta: 0.04, // זום קצת יותר רחוק כדי לראות אחרים
        longitudeDelta: 0.04,
      });

      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 50 },
        (newLoc) => {
          if (!currentUser?.id) return;
          fetch(`${API_BASE_URL}/api/users/update-location`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                user_id: currentUser.id, 
                latitude: newLoc.coords.latitude, 
                longitude: newLoc.coords.longitude 
            }),
          }).catch(err => console.log("Update Loc Error:", err));
        }
      );
    })();

    fetchMapUsers();
    const interval = setInterval(fetchMapUsers, 10000);
    return () => { sub?.remove(); clearInterval(interval); };
  }, [currentUser?.id]);

  const renderMarkers = useMemo(() => {
    return usersWithLocations.map((user) => {
      const isMe = user.id === currentUser?.id;
      
      return (
        <Marker
          key={`${user.id}-${user.activeEmoji}`}
          coordinate={{ latitude: user.latitude, longitude: user.longitude }}
          anchor={{ x: 0.5, y: 0.5 }}
          onPress={() => {
            if (setTargetPostId) setTargetPostId(user.id);
            setActiveTab('feed');
          }}
          zIndex={isMe ? 999 : 1}
        >
          <View style={styles.markerWrapper}>
            <Animatable.View 
              animation={isMe ? "pulse" : "fadeIn"} 
              iterationCount={isMe ? "infinite" : 1}
              style={[styles.markerContainer, isMe && styles.myMarkerContainer]}
            >
              {user.sticker_url ? (
                <Image 
                  source={{ uri: user.sticker_url }} 
                  style={styles.markerSticker} 
                  contentFit="contain"
                />
              ) : (
                <Text style={styles.markerEmoji}>{user.activeEmoji}</Text>
              )}
            </Animatable.View>
            <View style={styles.nameTag}>
              <Text style={styles.nameTagText}>
                {isMe ? "אני" : user.user_alias}
              </Text>
            </View>
          </View>
        </Marker>
      );
    });
  }, [usersWithLocations, currentUser?.id]);

  return (
    <View style={styles.container}>
      {location ? (
        <MapView 
          provider={PROVIDER_GOOGLE} 
          style={styles.map} 
          initialRegion={location}
          showsUserLocation={false} 
        >
          {renderMarkers}
        </MapView>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00b4d8" />
          <Text style={styles.loadingText}>מתחבר לרשת...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', marginBottom: 80, borderRadius: 25, overflow: 'hidden', marginHorizontal: 10, marginTop: 10 },
  map: { width: '100%', height: '100%' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  loadingText: { marginTop: 10, color: '#666' },
  markerWrapper: { alignItems: 'center', justifyContent: 'center', padding: 5 },
  markerContainer: {
    width: 28, height: 28, backgroundColor: 'white', borderRadius: 17,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ddd',
    shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 3, elevation: 5,
  },
  myMarkerContainer: { borderColor: '#00b4d8', borderWidth: 2 },
  markerSticker: { width: 28, height: 28 },
  markerEmoji: { fontSize: 22 },
  nameTag: { backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginTop: 4, borderWidth: 1, borderColor: '#eee' },
  nameTagText: { color: '#333', fontSize: 10, fontWeight: 'bold' }
});