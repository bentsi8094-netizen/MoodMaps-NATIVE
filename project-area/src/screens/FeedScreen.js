import React, { useContext } from 'react';
import { FlatList, StyleSheet, View, RefreshControl, Text } from 'react-native';
import { FeedContext } from '../context/FeedContext';
import FeedCard from '../components/FeedCard';

export default function FeedScreen() {
  const { posts, fetchPosts, isLoading } = useContext(FeedContext);

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={({ item }) => <FeedCard post={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => fetchPosts(true)}
            tintColor="#fff"
            title="מעדכן פוסטים..."
            titleColor="#fff"
          />
        }
        ListEmptyComponent={
          !isLoading && (
            <Text style={styles.emptyText}>
              אין פוסטים בינתיים... תהיו הראשונים!
            </Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  listContent: { 
    paddingVertical: 20, 
    paddingBottom: 120 
  },
  emptyText: { 
    color: 'white', 
    textAlign: 'center', 
    marginTop: 100, 
    fontSize: 16, 
    opacity: 0.7 
  }
});