import React, { useContext, useCallback, useEffect, useRef } from 'react';
import { FlatList, StyleSheet, View, RefreshControl, Text, ActivityIndicator } from 'react-native';
import { FeedContext } from '../context/FeedContext';
import FeedCard from '../components/FeedCard';

export default function FeedScreen({ targetPostId, onTargetReached }) {
  const { posts, fetchPosts, isLoading } = useContext(FeedContext);
  const flatListRef = useRef(null);

  const onRefresh = useCallback(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (targetPostId && posts.length > 0) {
      const index = posts.findIndex(p => p.user_id === targetPostId);
      if (index !== -1) {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index, animated: true });
          onTargetReached();
        }, 500);
      }
    }
  }, [targetPostId, posts]);

  return (
    <View style={styles.container}>
      {isLoading && posts.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00b4d8" />
          <Text style={styles.loadingText}>טוען פוסטים מדהימים...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={posts}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={({ item }) => <FeedCard post={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onScrollToIndexFailed={() => {}} // מונע קריסה אם האינדקס לא נטען עדיין
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#fff" />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🕶️</Text>
              <Text style={styles.emptyText}>הפיד ריק כרגע. תהיו הראשונים להעלות מוד!</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: 'white', marginTop: 10, opacity: 0.8 },
  listContent: { paddingVertical: 20, paddingBottom: 140 },
  emptyContainer: { marginTop: 100, alignItems: 'center' },
  emptyEmoji: { fontSize: 50, marginBottom: 10 },
  emptyText: { color: 'white', opacity: 0.6, textAlign: 'center', paddingHorizontal: 40 }
});
// עיצוב לילה למפה
// const mapStyle = [
//   { "elementType": "geometry", "stylers": [{ "color": "#1d2c4d" }] },
//   { "elementType": "labels.text.fill", "stylers": [{ "color": "#8ec3b9" }] },
//   { "elementType": "labels.text.stroke", "stylers": [{ "color": "#1a3646" }] },
//   { "featureType": "administrative.country", "elementType": "geometry.stroke", "stylers": [{ "color": "#4b6878" }] },
//   { "featureType": "landscape.man_made", "elementType": "geometry.stroke", "stylers": [{ "color": "#334e87" }] },
//   { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
//   { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#304a7d" }] },
//   { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#98a5be" }] },
//   { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0e1626" }] },
//   { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#4e6d70" }] }
// ];