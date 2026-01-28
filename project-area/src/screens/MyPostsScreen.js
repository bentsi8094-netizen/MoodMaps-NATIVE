import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { UserContext } from "../context/UserContext";
import { FeedContext } from "../context/FeedContext";
import GlassCard from "../components/GlassCard";

export default function MyPostsScreen() {
  const { currentUser } = useContext(UserContext);
  const { posts, removePost } = useContext(FeedContext);
  
  // מציאת הפוסט של המשתמש הנוכחי
  const myPost = posts.find(p => p.user_id === currentUser?.id);

  const handleDelete = () => {
    Alert.alert("הסרת מוד", "להסיר את המוד שלך מהמפה?", [
      { text: "ביטול", style: "cancel" },
      { 
        text: "הסר", 
        style: "destructive", 
        onPress: () => removePost(currentUser.id) 
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>הסטטוס שלי</Text>

      {myPost ? (
        <GlassCard>
          <View style={styles.postHeader}>
            <Text style={styles.emoji}>{myPost.emoji}</Text>
            <Text style={styles.content}>{myPost.content}</Text>
          </View>

          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteText}>הסר את המוד שלי 📍</Text>
          </TouchableOpacity>
        </GlassCard>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>אין לך מוד פעיל כרגע.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    paddingTop: 40 
  },
  title: { 
    color: 'white', 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  postHeader: { 
    alignItems: 'center', 
    marginBottom: 20 
  },
  emoji: { 
    fontSize: 60, 
    marginBottom: 10 
  },
  content: { 
    color: 'white', 
    fontSize: 18, 
    textAlign: 'center' 
  },
  deleteBtn: { 
    backgroundColor: '#ff4d4d', 
    padding: 15, 
    borderRadius: 25, 
    alignItems: 'center' 
  },
  deleteText: { 
    color: 'white', 
    fontWeight: 'bold' 
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  emptyText: { 
    color: 'white', 
    fontSize: 18, 
    opacity: 0.6 
  }
});