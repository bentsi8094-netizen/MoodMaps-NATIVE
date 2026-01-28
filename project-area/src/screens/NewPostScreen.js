import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Dimensions } from "react-native";
import EmojiPicker from 'rn-emoji-keyboard';import { UserContext } from "../context/UserContext";
import { FeedContext } from "../context/FeedContext";
import GlassCard from "../components/GlassCard";

const { height } = Dimensions.get('window');

export default function NewPostScreen({ onPostSuccess }) {
  const { currentUser } = useContext(UserContext);
  const { addPost } = useContext(FeedContext);
  
  const [content, setContent] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("😀");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handlePick = (emojiObject) => {
    setSelectedEmoji(emojiObject.emoji); 
    setIsOpen(false);
  };

  const handleSubmit = async () => {
    if (!content.trim()) return Alert.alert("שגיאה", "אי אפשר לפרסם פוסט ריק");
    setIsSubmitting(true);
    const result = await addPost(currentUser, { 
      emoji: selectedEmoji, 
      content: content.trim() 
    });
    setIsSubmitting(false);

    if (result?.success) {
      Alert.alert("הצלחה", "המצב שלך עודכן! ✨");
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
        // הגדרות טעינה וביצועים
        enableRecentlyUsed
        categoryPosition="top" // ניווט למעלה להרגשה של אפליקציית צ'אט
        // עיצוב ושיפורים לפי הבקשה שלך:
        theme={{
          backdrop: 'rgba(0,0,0,0.5)',
          container: {
            backgroundColor: '#1a1a2e', // צבע רקע כהה שמתאים ל-Glass
            borderRadius: 30,
            marginBottom: 40, // מעלה את החלון קצת יותר למעלה מהקצה
            height: height * 0.5, // גובה מותאם
          },
          header: {
            color: '#00b4d8', // כחול מותג
          },
          knob: {
            backgroundColor: '#00b4d8', // פס כחול בראש המקלדת
          },
          category: {
            container: {
              backgroundColor: '#00b4d8', // הופך את שורת הקטגוריות לכחולה
              borderRadius: 20,
              marginVertical: 10,
              height: 45, // קיצור הגובה של שורת הניווט
            },
            icon: {
              active: '#ffffff',
              inactive: 'rgba(255,255,255,0.5)',
            }
          }
        }}
      />
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
  emojiPreviewContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  previewEmoji: { 
    fontSize: 100, 
    textAlign: 'center',
  },
  changeBadge: {
    backgroundColor: '#00b4d8', // שינוי לכחול המותג
    paddingVertical: 12, // הגדלת הגובה (יותר רחב לגובה)
    paddingHorizontal: 25,
    borderRadius: 25,
    marginTop: 15,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    elevation: 4,
  },
  changeBadgeText: {
    color: 'white',
    fontSize: 16, // הגדלת פונט
    fontWeight: 'bold',
  },
  input: { 
    backgroundColor: 'rgba(0,0,0,0.2)', 
    borderRadius: 15, 
    padding: 15, 
    color: 'white', 
    minHeight: 100, 
    marginBottom: 20,
    textAlign: 'right',
    fontSize: 18,
  },
  submitBtn: { 
    backgroundColor: '#00b4d8', 
    padding: 18, 
    borderRadius: 35, 
    alignItems: 'center',
  },
  submitText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 20 
  }
});