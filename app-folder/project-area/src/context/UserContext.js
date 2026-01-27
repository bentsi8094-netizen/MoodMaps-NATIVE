import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from "../constants/Config";

export const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. טעינת משתמש מהזיכרון ברגע שהאפליקציה עולה
  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user_data');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Failed to load user from storage", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadStoredUser();
  }, []);

  // 2. פונקציית התחברות מסודרת
  const loginUser = async (user) => {
    try {
      setCurrentUser(user);
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
    } catch (e) {
      console.error("Failed to save user session", e);
    }
  };

  // 3. יציאה מהחשבון וניקוי הזיכרון
  const logoutUser = async () => {
    try {
      setCurrentUser(null);
      await AsyncStorage.removeItem('user_data');
    } catch (e) {
      console.error("Failed to clear user session", e);
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, loginUser, logoutUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}