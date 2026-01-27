import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import GlassCard from "../components/GlassCard";
import { API_BASE_URL } from "../constants/Config";

export default function SignInScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    // ניקוי רווחים מיותרים
    const cleanEmail = email.trim().toLowerCase();
    
    if (!cleanEmail || !password) return Alert.alert("שגיאה", "נא למלא אימייל וסיסמה");
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const result = await response.json();

      if (result.success) {
        onLogin(result.user); // מפעיל את loginUser בתוך UserContext
      } else {
        Alert.alert("שגיאה", result.error || "פרטי התחברות שגויים");
      }
    } catch (err) {
      Alert.alert("שגיאת תקשורת", "וודא שהשרת רץ וכתובת ה-IP תקינה");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <GlassCard>
        <Text style={styles.title}>כניסה</Text>
        <TextInput
          style={styles.input}
          placeholder="אימייל"
          placeholderTextColor="#ccc"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="סיסמה"
          placeholderTextColor="#ccc"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>התחברות</Text>}
        </TouchableOpacity>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10, width: '100%' },
  title: { color: 'white', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 15, color: 'white', marginBottom: 15, textAlign: 'right' },
  button: { backgroundColor: '#00b4d8', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});