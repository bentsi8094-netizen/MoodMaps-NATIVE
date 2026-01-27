import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import GlassCard from "../components/GlassCard";
import { API_BASE_URL } from "../constants/Config";

export default function SignUpScreen({ onRegister }) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", password: ""
  });

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      return Alert.alert("שגיאה", "נא למלא את כל הפרטים");
    }

    setIsLoading(true);
    try {
      const dataToSend = {
        ...formData,
        email: formData.email.trim().toLowerCase()
      };

      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();

      if (result.success) {
        onRegister(result.user); // שומר את המשתמש החדש ב-Context ובזיכרון
      } else {
        Alert.alert("שגיאה", result.error || "הרישום נכשל");
      }
    } catch (err) {
      Alert.alert("שגיאת תקשורת", "השרת לא מגיב");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <GlassCard>
        <Text style={styles.title}>הרשמה</Text>
        {step === 1 ? (
          <View>
            <Text style={styles.stepText}>שלב 1: פרטים אישיים</Text>
            <TextInput style={styles.input} placeholder="שם פרטי" placeholderTextColor="#ccc"
              value={formData.firstName} onChangeText={(v) => setFormData({...formData, firstName: v})} />
            <TextInput style={styles.input} placeholder="שם משפחה" placeholderTextColor="#ccc"
              value={formData.lastName} onChangeText={(v) => setFormData({...formData, lastName: v})} />
            <TouchableOpacity style={styles.button} onPress={() => setStep(2)}>
              <Text style={styles.buttonText}>המשך</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.stepText}>שלב 2: פרטי התחברות</Text>
            <TextInput style={styles.input} placeholder="אימייל" keyboardType="email-address" placeholderTextColor="#ccc" autoCapitalize="none"
              value={formData.email} onChangeText={(v) => setFormData({...formData, email: v})} />
            <TextInput style={styles.input} placeholder="סיסמה" secureTextEntry placeholderTextColor="#ccc"
              value={formData.password} onChangeText={(v) => setFormData({...formData, password: v})} />
            <View style={styles.row}>
              <TouchableOpacity style={[styles.button, styles.backBtn]} onPress={() => setStep(1)}>
                <Text style={styles.buttonText}>חזור</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, {flex: 2}]} onPress={handleSubmit} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>סיום והרשמה</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10, width: '100%' },
  title: { color: 'white', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  stepText: { color: '#ddd', textAlign: 'center', marginBottom: 15, fontSize: 16 },
  input: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 15, color: 'white', marginBottom: 15, textAlign: 'right' },
  button: { backgroundColor: '#00b4d8', padding: 15, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  row: { flexDirection: 'row', gap: 10, marginTop: 10 },
  backBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.2)' }
});