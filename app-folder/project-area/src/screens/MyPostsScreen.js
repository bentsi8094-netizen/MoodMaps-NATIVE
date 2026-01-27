import React, { useContext } from 'react';
import { FlatList, Text, StyleSheet, View } from 'react-native';
import { FeedContext } from '../context/FeedContext'; // שים לב לשורה הזו!
import { UserContext } from '../context/UserContext';
import FeedCard from '../components/FeedCard';

export default function MyPostsScreen() {
  const { posts } = useContext(FeedContext);
  const { currentUser } = useContext(UserContext);

  // סינון מדויק לפי ה-ID של המשתמש המחובר
  const myPosts = posts ? posts.filter(post => post?.user_id === currentUser?.id) : [];

  return (
    <View style={styles.container}>
      <FlatList
        data={myPosts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <FeedCard post={item} />}
        ListHeaderComponent={<Text style={styles.title}>הפוסטים שלי</Text>}
        ListEmptyComponent={<Text style={styles.emptyText}>עדיין לא פרסמת כלום...</Text>}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  title: { 
    color: 'white', 
    fontSize: 32, 
    fontWeight: '900', 
    textAlign: 'center', 
    marginTop: 40, 
    marginBottom: 20 
  },
  listPadding: { 
    paddingBottom: 120, 
    paddingHorizontal: 15 
  },
  emptyText: { 
    color: 'rgba(255,255,255,0.6)', 
    textAlign: 'center', 
    marginTop: 100, 
    fontSize: 18 
  }
});