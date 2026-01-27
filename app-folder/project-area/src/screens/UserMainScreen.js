import React, { useState, useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import SignInScreen from "./SignInScreen";
import SignUpScreen from "./SignUpScreen";
import { UserContext } from "../context/UserContext";

export default function UserMainScreen() {
  const [showSignUp, setShowSignUp] = useState(false);
  const { loginUser } = useContext(UserContext);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{showSignUp ? 'Create Account' : 'Welcome Back'}</Text>
      
      {showSignUp ? (
        <SignUpScreen onRegister={loginUser} />
      ) : (
        <SignInScreen onLogin={loginUser} />
      )}

      <TouchableOpacity onPress={() => setShowSignUp(!showSignUp)} style={styles.toggle}>
        <Text style={styles.toggleText}>
          {showSignUp ? 'כבר יש חשבון? התחבר' : 'אין לך חשבון? הירשם עכשיו'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  header: { color: 'white', fontSize: 32, fontWeight: '900', textAlign: 'center', marginBottom: 30 },
  toggle: { marginTop: 20, alignItems: 'center' },
  toggleText: { color: 'white', textDecorationLine: 'underline' }
});