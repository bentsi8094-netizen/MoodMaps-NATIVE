import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import * as Animatable from 'react-native-animatable';
import { UserContext } from "../context/UserContext";
import { FeedContext } from "../context/FeedContext";
import GlassCard from "../components/GlassCard";

export default function MyPostsScreen() {
  const { currentUser, updateUserMood } = useContext(UserContext);
  const { posts, removePost } = useContext(FeedContext);
  
  // מוצאים את הפוסט שלי מתוך הרשימה המנורמלת ב-Context
  const myPost = posts.find(p => p.user_id === currentUser?.id);

  const handleDelete = () => {
    Alert.alert("הסרת מוד", "להסיר את המוד שלך?", [
      { text: "ביטול", style: "cancel" },
      { 
        text: "הסר", style: "destructive", 
        onPress: async () => {
          await removePost(currentUser.id);
          await updateUserMood("😀", null);
        } 
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>הסטטוס שלי</Text>
      {myPost ? (
        <GlassCard>
          <View style={styles.postHeader}>
            {/* שימוש ב-stickerUrl המנורמל */}
            {myPost.stickerUrl ? (
              <Animatable.View animation="zoomIn" style={styles.stickerWrapper}>
                <Animatable.View animation="pulse" iterationCount="infinite" duration={3000}>
                  <Image 
                    source={{ uri: myPost.stickerUrl }} 
                    style={styles.mainSticker} 
                    contentFit="contain" 
                  />
                </Animatable.View>
              </Animatable.View>
            ) : (
              <Text style={styles.emoji}>{myPost.emoji}</Text>
            )}
            <View style={styles.textContainer}>
              <Text style={styles.content}>{myPost.content || "סטטוס ללא טקסט"}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteText}>הסר את המוד שלי 📍</Text>
          </TouchableOpacity>
        </GlassCard>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>אין לך מוד פעיל.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 40 },
  title: { color: 'white', fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  postHeader: { alignItems: 'center', marginBottom: 25 },
  emoji: { fontSize: 80, marginBottom: 15 },
  stickerWrapper: { alignItems: 'center', justifyContent: 'center' },
  mainSticker: { width: 160, height: 160, marginBottom: 15 },
  textContainer: { width: '100%', paddingVertical: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  content: { color: 'white', fontSize: 18, textAlign: 'center' },
  deleteBtn: { backgroundColor: 'rgba(255, 77, 77, 0.8)', padding: 16, borderRadius: 20, alignItems: 'center' },
  deleteText: { color: 'white', fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: 'rgba(255,255,255,0.5)', fontSize: 18 }
});