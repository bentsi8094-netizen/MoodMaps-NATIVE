import React, { useState, useContext } from 'react';
import { StyleSheet, View, StatusBar, Text, TouchableOpacity } from 'react-native'; // נוסף TouchableOpacity
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserProvider, UserContext } from './src/context/UserContext';
import { FeedProvider } from './src/context/FeedContext';

import UserMainScreen from './src/screens/UserMainScreen';
import FeedScreen from './src/screens/FeedScreen';
import NewPostScreen from './src/screens/NewPostScreen';
import MapScreen from './src/screens/MapScreen';
import MyPostsScreen from './src/screens/MyPostsScreen';

function MainNavigation() {
  const { currentUser } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('feed');

  if (!currentUser) {
    return (
      <View style={styles.fullScreen}>
        <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={StyleSheet.absoluteFill} />
        <UserMainScreen />
      </View>
    );
  }

  return (
    <View style={styles.fullScreen}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#00b4d8', '#9d4edd', '#f72585']} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentArea}>
          {activeTab === 'feed' && <FeedScreen />}
          {activeTab === 'map' && <MapScreen />}
          {activeTab === 'my' && <MyPostsScreen />}
          {activeTab === 'new' && <NewPostScreen onPostSuccess={() => setActiveTab('feed')} />}
        </View>

        <View style={styles.navBarContainer}>
          <View style={styles.navBar}>
            <TouchableOpacity onPress={() => setActiveTab('feed')}><Text style={styles.navText}>פיד</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('map')}><Text style={styles.navText}>מפה</Text></TouchableOpacity>
            <TouchableOpacity style={styles.specialBtn} onPress={() => setActiveTab('new')}>
              <Text style={{ color: 'white', fontSize: 30 }}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('my')}><Text style={styles.navText}>שלי</Text></TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

export default function App() {
  return (
    <UserProvider>
      <FeedProvider>
        <MainNavigation /> 
      </FeedProvider>
    </UserProvider>
  );
}


const styles = StyleSheet.create({
  fullScreen: { flex: 1 },
  safeArea: { flex: 1 },
  contentArea: { flex: 1 },
  navBarContainer: { position: 'absolute', bottom: 30, width: '100%', alignItems: 'center' },
  navBar: { flexDirection: 'row', width: '90%', height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'space-around', alignItems: 'center' , zIndex:15 },
  navText: { color: 'white', fontWeight: 'bold' },
  specialBtn: { backgroundColor: '#00b4d8', width: 55, height: 55, borderRadius: 28, justifyContent: 'center', alignItems: 'center', bottom: 15, elevation: 5 }
});