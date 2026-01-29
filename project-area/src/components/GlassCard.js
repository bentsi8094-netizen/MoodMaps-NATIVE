import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

/**
 * GlassCard - הקומפוננטה המרכזית להצגת תוכן בסגנון זכוכית.
 * הקומפוננטה שומרת על עיצוב נקי ושקוף בהתאם לדרישות המשתמש.
 */
export default function GlassCard({ children, style }) {
  return (
    <View style={[styles.wrapper, style]}>
      <View style={styles.safeContainer}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: width * 0.9,
    alignSelf: 'center',
    borderRadius: 28,
    marginVertical: 10,
    
    // עיצוב זכוכית (Glassmorphism) לפי העדפת המשתמש
    backgroundColor: 'rgba(255, 255, 255, 0.15)', 
    
    // מסגרת עדינה מאוד שנותנת תחושת עומק
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)', 
    
    // ללא צללים כבדים לשמירה על מראה מודרני וקליל
    shadowColor: 'transparent',
    elevation: 0, 
    
    // מבטיח שהתוכן (כמו המדבקה המונפשת בעתיד) לא יחרוג מהפינות המעוגלות
    overflow: 'hidden',
  },
  safeContainer: {
    padding: 20,
    width: '100%',
    // Flex direction כברירת מחדל הוא column, מתאים לסידור של מדבקה -> טקסט -> כפתור
    alignItems: 'stretch', 
  },
});