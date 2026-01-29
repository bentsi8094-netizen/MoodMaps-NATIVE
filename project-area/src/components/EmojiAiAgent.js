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
                onAiResult({
                    emoji: data.emoji,
                    stickerUrl: data.stickerUrl 
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
                placeholder={loading ? "ה-AI מחפש מדבקה..." : "בקש אימוג'י מAI"}
                placeholderTextColor="rgb(0, 213, 255)" 
                editable={!loading}
                value={inputValue}
                onChangeText={setInputValue}
                onSubmitEditing={handleProcessInput}
                textAlign="right"
                returnKeyType="done"
                multiline={true}
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
        padding: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 22,
        alignItems: 'flex-start', 
        width: '100%',
        minHeight: 90, 
        borderWidth: 1,
        borderColor: 'rgba(0, 213, 255, 0.72)', 
    },
    input: {
        flex: 1,
        color: 'white',
        paddingHorizontal: 12,
        paddingTop: 8, 
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'right',
        minHeight: 75,
    },
    btn: {
        backgroundColor: '', 
        height: 30, // התאמת גובה הכפתור לתיבה המוקטנת
        paddingHorizontal: 18,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-end', 
        marginBottom: 4,
    },
    btnDisabled: { backgroundColor: 'rgb(0, 213, 255)' },
    btnText: { color: 'white', fontWeight: 'bold', fontSize: 14 }
});