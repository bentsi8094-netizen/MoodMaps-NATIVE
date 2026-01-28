import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

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
    
    // 1. הסרת הצבע הכהה והחלפתו בלבן שקוף מאוד
    backgroundColor: 'rgba(255, 255, 255, 0.15)', 
    
    // 2. שינוי המסגרת למשהו שכמעט לא רואים (לבן דק במקום שחור)
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)', 
    
    // 3. ביטול הצללים השחורים הכבדים
    shadowColor: 'transparent', // מעלים את הצל לחלוטין
    elevation: 0,               // מבטל את הצל באנדרואיד
    
    overflow: 'hidden',
  },
  safeContainer: {
    padding: 20,
    width: '100%',
  },

});