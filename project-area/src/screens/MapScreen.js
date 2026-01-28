import React, { useState, useEffect, useContext, useMemo } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { UserContext } from "../context/UserContext";
import { API_BASE_URL } from "../constants/Config";

export default function MapScreen() {
  const { currentUser } = useContext(UserContext);
  const [location, setLocation] = useState(null);
  const [usersWithLocations, setUsersWithLocations] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchMapUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/map-users`);
      const json = await response.json();
      if (json.success) setUsersWithLocations(json.users || []);
    } catch (e) {
      console.log("Fetch Map Users Error:", e);
    }
  };

  const updateMyProviderLocation = async (lat, lon) => {
    try {
      await fetch(`${API_BASE_URL}/api/users/update-location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id, latitude: lat, longitude: lon }),
      });
    } catch (e) { console.log("Sync Location Error:", e); }
  };

  useEffect(() => {
    let locationSubscription;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('יש לאשר הרשאות מיקום');
        return;
      }

      const lastKnown = await Location.getLastKnownPositionAsync({});
      const current = lastKnown || await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });

      setLocation({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      });

      updateMyProviderLocation(current.coords.latitude, current.coords.longitude);

      locationSubscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 30 },
        (newLoc) => updateMyProviderLocation(newLoc.coords.latitude, newLoc.coords.longitude)
      );
    })();

    fetchMapUsers();
    const interval = setInterval(fetchMapUsers, 20000);

    return () => {
      if (locationSubscription) locationSubscription.remove();
      clearInterval(interval);
    };
  }, []);

  const renderMarkers = useMemo(() => {
    return usersWithLocations.map((user) => {
      if (!user.activeEmoji) return null;
      const isMe = user.id === currentUser.id;

      return (
        <Marker
          key={`${user.id}-${user.activeEmoji}`}
          coordinate={{ latitude: user.latitude, longitude: user.longitude }}
          anchor={{ x: 0.5, y: 0.5 }}
          zIndex={isMe ? 9999 : 1000}
          tracksViewChanges={true}
        >
          <View style={[styles.emojiContainer, isMe && styles.myEmojiContainer]}>
            <Text style={styles.preciseEmoji}>{user.activeEmoji}</Text>
          </View>
        </Marker>
      );
    });
  }, [usersWithLocations, currentUser.id]);

  return (
    <View style={styles.container}>
      {location ? (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={location}
          showsUserLocation={false}
          followsUserLocation={false}
        >
          {renderMarkers}
        </MapView>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00b4d8" />
          <Text style={styles.loadingText}>{errorMsg || "טוען מפה..."}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginBottom: 80,
    borderRadius: 25,
    overflow: 'hidden',
    marginHorizontal: 10,
    marginTop: 10
  },
  map: { width: '100%', height: '100%' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#333', marginTop: 15, fontSize: 16 },
  emojiContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  myEmojiContainer: {
    borderWidth: 2,
    borderColor: '#ff0099',
    borderRadius: 22,
    backgroundColor: 'rgba(255, 0, 153, 0.1)',
  },
  preciseEmoji: {
    fontSize: 26, // החזרתי לגודל קריא יותר, 16 היה קטן מדי למפה
    includeFontPadding: false,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  }
});