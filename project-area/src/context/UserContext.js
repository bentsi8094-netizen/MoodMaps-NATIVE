import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // טעינת משתמש שמור מהזיכרון המקומי בהפעלת האפליקציה
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

  /**
   * התחברות או הרשמה - שמירת נתוני המשתמש כולל ה-Alias
   */
  const loginUser = async (user) => {
    try {
      // מוודאים שהאובייקט שנשמר מכיל את כל השדות מהשרת:
      // id, firstName, lastName, email, alias
      setCurrentUser(user);
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
    } catch (e) {
      console.error("UserContext: Error saving session", e);
    }
  };

  /**
   * התנתקות
   */
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user_data'); 
      setCurrentUser(null);
    } catch (e) {
      console.error("UserContext: Error during logout", e);
    }
  };

  /**
   * עדכון המוד והמדבקה - שומר על ה-Alias ועל שאר הפרטים
   */
  const updateUserMood = async (newMood, stickerUrl = null) => {
    try {
      if (!currentUser) return;

      // שימוש ב-Functional Update של useState מבטיח שאנחנו עובדים על המידע הכי עדכני
      setCurrentUser(prevUser => {
        const updated = { 
          ...prevUser, 
          mood: newMood, 
          stickerUrl: stickerUrl 
        };
        
        // שמירה ל-AsyncStorage בתוך הבלוק כדי להבטיח סנכרון
        AsyncStorage.setItem('user_data', JSON.stringify(updated));
        return updated;
      });

    } catch (e) {
      console.error("Error updating user data in context", e);
    }
  };

  return (
    <UserContext.Provider value={{ 
      currentUser, 
      loginUser, 
      logout, 
      isLoading, 
      updateUserMood 
    }}>
      {children}
    </UserContext.Provider>
  );
}