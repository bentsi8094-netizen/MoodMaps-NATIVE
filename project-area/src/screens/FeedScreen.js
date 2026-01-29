import React, { useContext, useCallback } from 'react';
import { FlatList, StyleSheet, View, RefreshControl, Text, ActivityIndicator } from 'react-native';
import { FeedContext } from '../context/FeedContext';
import FeedCard from '../components/FeedCard';

export default function FeedScreen() {
  const { posts, fetchPosts, isLoading } = useContext(FeedContext);

  const onRefresh = useCallback(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <View style={styles.container}>
      {/* תצוגת טעינה ראשונית רק אם הפיד ריק */}
      {isLoading && posts.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00b4d8" />
          <Text style={styles.loadingText}>טוען פוסטים מדהימים...</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={({ item }) => <FeedCard post={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={7}
          windowSize={5}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={onRefresh}
              tintColor="#fff"
              colors={['#00b4d8']} // לאנדרואיד
            />
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