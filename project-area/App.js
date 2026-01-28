import React, { useState, useContext } from 'react';
import { StyleSheet, View, StatusBar, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { registerRootComponent } from 'expo';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Context Providers
import { UserProvider, UserContext } from './src/context/UserContext';
import { FeedProvider } from './src/context/FeedContext';

// Screens
import UserMainScreen from './src/screens/UserMainScreen';
import FeedScreen from './src/screens/FeedScreen';
import NewPostScreen from './src/screens/NewPostScreen';
import MapScreen from './src/screens/MapScreen';
import MyPostsScreen from './src/screens/MyPostsScreen';

function MainNavigation() {
  const { currentUser, logout } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('feed');

  // מסך התחברות (Auth Flow)
  if (!currentUser) {
    return (
      <View style={styles.fullScreen}>
        <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={StyleSheet.absoluteFill} />
        <UserMainScreen />
      </View>
    );
  }

  // ניווט ראשי (Main App)
  return (
    <View style={styles.fullScreen}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#00b4d8', '#9d4edd', '#f72585']} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topHeader}>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>התנתק</Text>
          </TouchableOpacity>
          <Text style={styles.userName}>היי, {currentUser.firstName} 👋</Text>
        </View>

        <View style={styles.contentArea}>
          {activeTab === 'feed' && <FeedScreen />}
          {activeTab === 'my' && <MyPostsScreen />}
          {activeTab === 'new' && <NewPostScreen onPostSuccess={() => setActiveTab('feed')} />}
          {activeTab === 'map' && <MapScreen />}
        </View>

        <View style={styles.navBarContainer}>
          <View style={styles.navBar}>
            <TouchableOpacity style={styles.specialBtn} onPress={() => setActiveTab('new')}>
              <Text style={styles.specialBtnText}>+</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setActiveTab('my')}>
              <Text style={[styles.navText, activeTab === 'my' && styles.activeNavText]}>המוד שלי</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setActiveTab('feed')}>
              <Text style={[styles.navText, activeTab === 'feed' && styles.activeNavText]}>פיד</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setActiveTab('map')}>
              <Text style={[styles.navText, activeTab === 'map' && styles.activeNavText]}>מפה</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <FeedProvider>
          <MainNavigation />
        </FeedProvider>
      </UserProvider>
    </SafeAreaProvider>
  );
}


// רישום האפליקציה
registerRootComponent(App);

const styles = StyleSheet.create({
  fullScreen: { flex: 1 },
  safeArea: { flex: 1 },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  userName: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15
  },
  logoutText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  contentArea: { flex: 1 },
  navBarContainer: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    alignItems: 'center'
  },
  navBar: {
    flexDirection: 'row-reverse', // סדר כפתורים עברית
    width: '92%',
    height: 65,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  navText: { color: 'white', fontWeight: '600', opacity: 0.7 },
  activeNavText: { opacity: 1, textDecorationLine: 'underline' },
  specialBtn: {
    backgroundColor: '#00b4d8',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  specialBtnText: { color: 'white', fontSize: 30, fontWeight: 'bold' }
});