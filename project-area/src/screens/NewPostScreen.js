import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import { Image } from 'expo-image'; 
import * as Animatable from 'react-native-animatable';
import { UserContext } from "../context/UserContext";
import { FeedContext } from "../context/FeedContext";
import GlassCard from "../components/GlassCard";
import EmojiAiAgent from "../components/EmojiAiAgent";

export default function NewPostScreen({ onPostSuccess }) {
    const { currentUser, updateUserMood } = useContext(UserContext);
    const { addPost } = useContext(FeedContext);
    const [currentMood, setCurrentMood] = useState({ emoji: "😀", stickerUrl: null });
    const [postContent, setPostContent] = useState("");
    const [loading, setLoading] = useState(false);

    const handlePublish = async () => {
        if (!postContent.trim() && !currentMood.stickerUrl) return;
        setLoading(true);
        const result = await addPost(currentUser, { 
            emoji: currentMood.emoji, 
            stickerUrl: currentMood.stickerUrl,
            content: postContent 
        });
        if (result.success) {
            await updateUserMood(currentMood.emoji, currentMood.stickerUrl);
            onPostSuccess();
        }
        setLoading(false);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <GlassCard>
                <View style={styles.preview}>
                    {currentMood.stickerUrl ? (
                        <Image source={{ uri: currentMood.stickerUrl }} style={styles.sticker} contentFit="contain" />
                    ) : (
                        <Text style={styles.bigEmoji}>{currentMood.emoji}</Text>
                    )}
                </View>
                <EmojiAiAgent onAiResult={(data) => setCurrentMood(data)} />
                <TextInput 
                    style={styles.input} 
                    placeholder="מה המצב?" 
                    placeholderTextColor="#aaa"
                    value={postContent}
                    onChangeText={setPostContent}
                    multiline
                />
                <TouchableOpacity style={styles.btn} onPress={handlePublish} disabled={loading}>
                    {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>פרסם מוד ✨</Text>}
                </TouchableOpacity>
            </GlassCard>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, paddingTop: 40 },
    preview: { height: 180, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    sticker: { width: 150, height: 150 },
    bigEmoji: { fontSize: 80 },
    input: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, padding: 15, color: 'white', marginTop: 20, minHeight: 80, textAlign: 'right' },
    btn: { backgroundColor: '#00b4d8', padding: 18, borderRadius: 20, marginTop: 20, alignItems: 'center' },
    btnText: { color: 'white', fontWeight: 'bold', fontSize: 18 }
});