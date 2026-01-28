import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import { UserContext } from "../context/UserContext";
import { FeedContext } from "../context/FeedContext";
import GlassCard from "../components/GlassCard";

const EMOJIS = ["😀", "😢", "😡", "😍", "😴", "🤔"];

export default function NewPostScreen({ onPostSuccess }) {
  const { currentUser } = useContext(UserContext);
  const { addPost } = useContext(FeedContext);
  const [content, setContent] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJIS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return Alert.alert("שגיאה", "אי אפשר לפרסם פוסט ריק");
    
    setIsSubmitting(true);
    const result = await addPost(currentUser, { 
      emoji: selectedEmoji, 
      content: content.trim() 
    });
    setIsSubmitting(false);

    if (result?.success) {
      Alert.alert("הצלחה", "המוד עודכן! ✨");
      setContent("");
      if (onPostSuccess) onPostSuccess(); 
    } else {
      Alert.alert("שגיאה", "העדכון נכשל.");
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.scrollContainer} 
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.mainTitle}>מה המצב שלך?</Text>
      
      <GlassCard>
        <Text style={styles.previewEmoji}>{selectedEmoji}</Text>
        
        <View style={styles.emojiSelector}>
          {EMOJIS.map(emoji => (
            <TouchableOpacity 
              key={emoji} 
              onPress={() => setSelectedEmoji(emoji)} 
              style={[styles.emojiBtn, selectedEmoji === emoji && styles.activeEmoji]}
            >
              <Text style={styles.emojiText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput 
          style={styles.input} 
          placeholder="מה קורה?" 
          placeholderTextColor="rgba(255,255,255,0.5)"
          value={content} 
          onChangeText={setContent} 
          multiline 
          textAlign="right"
        />

        <TouchableOpacity 
          style={styles.submitBtn} 
          onPress={handleSubmit} 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitText}>עדכן מצב</Text>
          )}
        </TouchableOpacity>
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { 
    paddingBottom: 120, 
    paddingTop: 40, 
    alignItems: 'center' 
  },
  mainTitle: { 
    color: 'white', 
    fontSize: 26, 
    fontWeight: '900', 
    marginBottom: 20 
  },
  previewEmoji: { 
    fontSize: 80, 
    textAlign: 'center', 
    marginBottom: 20 
  },
  emojiSelector: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    width: '100%', 
    marginBottom: 20 
  },
  emojiBtn: { 
    padding: 8, 
    borderRadius: 12 
  },
  emojiText: {
    fontSize: 28
  },
  activeEmoji: { 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    borderWidth: 1, 
    borderColor: 'white' 
  },
  input: { 
    backgroundColor: 'rgba(0,0,0,0.2)', 
    borderRadius: 15, 
    padding: 15, 
    color: 'white', 
    minHeight: 80, 
    marginBottom: 20,
    textAlign: 'right' 
  },
  submitBtn: { 
    backgroundColor: '#00b4d8', 
    padding: 16, 
    borderRadius: 30, 
    alignItems: 'center' 
  },
  submitText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 18 
  }
});