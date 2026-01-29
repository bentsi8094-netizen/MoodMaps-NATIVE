import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import { Image } from 'expo-image';
import * as Animatable from 'react-native-animatable';
import { UserContext } from "../context/UserContext";
import { FeedContext } from "../context/FeedContext";
import GlassCard from "../components/GlassCard";
import EmojiAiAgent from "../components/EmojiAiAgent";
import * as Haptics from 'expo-haptics';

export default function NewPostScreen({ onPostSuccess }) {
  const { currentUser, updateUserMood } = useContext(UserContext);
  const { addPost } = useContext(FeedContext);
  const [currentMood, setCurrentMood] = useState({ emoji: "😀", stickerUrl: null });
  const [postContent, setPostContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePublish = async () => {
    if (!postContent.trim() && !currentMood.stickerUrl) {
      Alert.alert("רגע...", "כתוב משהו או בחר סטיקר בעזרת ה-AI");
      return;
    }

    setLoading(true);
    try {
      // שליחת הפוסט - משתמשים ב-Alias הקיים מה-Context
      const result = await addPost(currentUser, {
        emoji: currentMood.emoji,
        stickerUrl: currentMood.stickerUrl,
        content: postContent
      });

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await updateUserMood(currentMood.emoji, currentMood.stickerUrl);
        onPostSuccess();
      } else {
        Alert.alert("שגיאה", "לא הצלחנו לפרסם את המוד.");
      }
    } catch (e) {
      console.error("Publish Error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Animatable.View animation="fadeInUp" duration={800}>
        <GlassCard>
          <Text style={styles.userName}>היי {currentUser?.firstName}, מה המוד שלך?</Text>
          
          <View style={styles.preview}>
            {currentMood.stickerUrl ? (
              <Animatable.View animation="zoomIn" key={currentMood.stickerUrl}>
                <Image source={{ uri: currentMood.stickerUrl }} style={styles.sticker} contentFit="contain" />
              </Animatable.View>
            ) : (
              <Text style={styles.bigEmoji}>{currentMood.emoji}</Text>
            )}
          </View>

          <EmojiAiAgent onAiResult={(data) => setCurrentMood(data)} />

          <TextInput
            style={styles.input}
            placeholder="מה קורה עכשיו?"
            placeholderTextColor="#aaa"
            value={postContent}
            onChangeText={setPostContent}
            multiline
            maxLength={200}
          />

          <TouchableOpacity 
            style={[styles.btn, (!postContent.trim() && !currentMood.stickerUrl) && styles.btnDisabled]} 
            onPress={handlePublish}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>פרסם מוד ✨</Text>}
          </TouchableOpacity>
        </GlassCard>
      </Animatable.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 40, paddingBottom: 100 },
  userName: { color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  preview: { height: 180, alignItems: 'center', justifyContent: 'center', marginBottom: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20 },
  sticker: { width: 150, height: 150 },
  bigEmoji: { fontSize: 80 },
  input: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, padding: 15, color: 'white', marginTop: 20, minHeight: 100, textAlign: 'right', fontSize: 16 },
  btn: { backgroundColor: '#00b4d8', padding: 18, borderRadius: 20, marginTop: 20, alignItems: 'center' },
  btnDisabled: { backgroundColor: '#444' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 18 }
});