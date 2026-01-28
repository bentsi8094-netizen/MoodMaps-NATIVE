import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user_data');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("UserContext: Error loading session", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadStoredUser();
  }, []);

  const loginUser = async (user) => {
    try {
      setCurrentUser(user);
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
    } catch (e) {
      console.error("UserContext: Error saving session", e);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user_data'); 
      setCurrentUser(null);
    } catch (e) {
      console.error("UserContext: Error during logout", e);
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, loginUser, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}