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

          {/* רכיב ה-AI - תיבה גדולה, פלייסאולדר תכלת */}
          <View style={styles.aiAgentWrapper}>
            <EmojiAiAgent 
              onAiResult={(data) => setCurrentMood(data)} 
              placeholder="בקש אימוג'י מAI" 
              placeholderTextColor="#00b4d8" 
              inputStyle={styles.aiInputLarge}
            />
          </View>

          {/* אינפוט טקסט חופשי - קטן, פלייסאולדר ורוד */}
          <TextInput
            style={styles.contentInputSmall}
            placeholder="איך זה שאתה ככה..."
            placeholderTextColor="#f72585"
            value={postContent}
            onChangeText={setPostContent}
            multiline={false}
            maxLength={200}
          />

          {/* כפתור פרסום - קטן, תכלת, רק המילה "פרסם" */}
          <TouchableOpacity 
            style={[styles.publishBtn, (!postContent.trim() && !currentMood.stickerUrl) && styles.btnDisabled]} 
            onPress={handlePublish}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.publishBtnText}>פרסם</Text>}
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
  
  aiAgentWrapper: {
    marginTop: 10,
  },
  
  aiInputLarge: {
    minHeight: 100, // גובה גדול
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
    color: 'white',
    textAlign: 'right',
    fontSize: 16,
  },

  contentInputSmall: { 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    borderRadius: 15, 
    padding: 12, 
    color: 'white', 
    marginTop: 20, 
    height: 50, // גובה קטן
    textAlign: 'right', 
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(247, 37, 133, 0.3)' 
  },

  publishBtn: { 
    backgroundColor: '#00b4d8', // צבע תכלת מובהק
    paddingVertical: 12, 
    paddingHorizontal: 50, 
    borderRadius: 25, 
    marginTop: 25, 
    alignSelf: 'center',
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5
  },
  
  btnDisabled: { backgroundColor: '#444' },
  publishBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});