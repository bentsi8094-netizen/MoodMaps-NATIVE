import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Keyboard } from 'react-native';
import { API_BASE_URL } from '../constants/Config';

export default function EmojiAiAgent({ onAiResult }) {
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);

    const handleProcessInput = async () => {
        if (!inputValue.trim() || loading) return;

        setLoading(true);
        Keyboard.dismiss();

        try {
            const response = await fetch(`${API_BASE_URL}/api/ai/generate-mood`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: inputValue.trim() }),
            });

            const data = await response.json();
            
            if (data.success) {
                // שולח למסך האב את הנתונים החדשים מה-AI
                onAiResult({
                    emoji: data.emoji,
                    stickerUrl: data.stickerUrl // זה ה-URL מה-Giphy/AI
                });
                setInputValue('');
            }
        } catch (e) {
            console.error("AI Agent Error:", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder={loading ? "ה-AI מחפש מדבקה..." : "מה המוד שלך?"}
                placeholderTextColor="rgba(255,255,255,0.4)"
                editable={!loading}
                value={inputValue}
                onChangeText={setInputValue}
                onSubmitEditing={handleProcessInput}
                textAlign="right"
                returnKeyType="done"
            />

            <TouchableOpacity
                style={[styles.btn, (loading || !inputValue.trim()) && styles.btnDisabled]}
                onPress={handleProcessInput}
                disabled={loading || !inputValue.trim()}
            >
                {loading ? (
                    <ActivityIndicator color="white" size="small" />
                ) : (
                    <Text style={styles.btnText}>צור</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row-reverse',
        padding: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 22,
        alignItems: 'center',
        width: '100%',
        height: 62,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    input: {
        flex: 1,
        color: 'white',
        paddingHorizontal: 15,
        height: '100%',
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'right'
    },
    btn: {
        backgroundColor: '#00b4d8',
        height: '100%',
        paddingHorizontal: 25,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnDisabled: { backgroundColor: 'rgba(0, 180, 216, 0.3)' },
    btnText: { color: 'white', fontWeight: '900', fontSize: 16 }
});