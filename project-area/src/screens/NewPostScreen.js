import React, { useState, useContext, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Dimensions } from "react-native";
import EmojiPicker from 'rn-emoji-keyboard';
import { UserContext } from "../context/UserContext";
import { FeedContext } from "../context/FeedContext";
import GlassCard from "../components/GlassCard";

const { height } = Dimensions.get('window');

export default function NewPostScreen({ onPostSuccess }) {
  const { currentUser, updateUserMood } = useContext(UserContext); // הוספנו את פונקציית העדכון
  const { addPost } = useContext(FeedContext);
  
  // אתחול האימוג'י לפי מה ששמור ב-Context או ברירת מחדל
  const [selectedEmoji, setSelectedEmoji] = useState(currentUser?.mood || "😀");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // מוודא שאם הנתונים נטענו אחרי שהמסך עלה, האימוג'י יתעדכן
  useEffect(() => {
    if (currentUser?.mood) {
      setSelectedEmoji(currentUser.mood);
    }
  }, [currentUser?.mood]);

  const handlePick = (emojiObject) => {
    setSelectedEmoji(emojiObject.emoji); 
    setIsOpen(false);
  };

  const handleSubmit = async () => {
    if (!content.trim()) return Alert.alert("שגיאה", "אי אפשר לפרסם פוסט ריק");
    setIsSubmitting(true);
    
    try {
      const result = await addPost(currentUser, { 
        emoji: selectedEmoji, 
        content: content.trim() 
      });
      
      if (result?.success) {
        // שמירת האימוג'י החדש ב-Context וב-AsyncStorage
        await updateUserMood(selectedEmoji);
        
        Alert.alert("הצלחה", "המצב שלך עודכן! ✨");
        setContent("");
        if (onPostSuccess) onPostSuccess(); 
      }
    } catch (e) {
      Alert.alert("שגיאה", "העדכון נכשל.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.mainTitle}>מה המצב שלך?</Text>
      
      <GlassCard>
        <TouchableOpacity 
          style={styles.emojiPreviewContainer} 
          onPress={() => setIsOpen(true)}
        >
          <Text style={styles.previewEmoji}>{selectedEmoji}</Text>
          <View style={styles.changeBadge}>
            <Text style={styles.changeBadgeText}>החלף אימוג'י</Text>
          </View>
        </TouchableOpacity>

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

      <EmojiPicker 
        onEmojiSelected={handlePick} 
        open={isOpen} 
        onClose={() => setIsOpen(false)}
        categoryPosition="bottom"
        theme={{
          backdrop: 'rgba(0,0,0,0.5)',
          container: {
            backgroundColor: '#121212',
            borderRadius: 30,
            height: height * 0.5,
          }
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { paddingBottom: 120, paddingTop: 40, alignItems: 'center' },
  mainTitle: { color: 'white', fontSize: 26, fontWeight: '900', marginBottom: 20 },
  emojiPreviewContainer: { alignItems: 'center', marginBottom: 30 },
  previewEmoji: { fontSize: 100 },
  changeBadge: {
    backgroundColor: '#00b4d8', 
    paddingVertical: 12, 
    paddingHorizontal: 25,
    borderRadius: 25,
    marginTop: 15,
  },
  changeBadgeText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  input: { 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    borderRadius: 15, 
    padding: 15, 
    color: 'white', 
    minHeight: 100, 
    marginBottom: 20,
    textAlign: 'right',
    fontSize: 18,
  },
  submitBtn: { backgroundColor: '#00b4d8', padding: 18, borderRadius: 35, alignItems: 'center' },
  submitText: { color: 'white', fontWeight: 'bold', fontSize: 20 }
});