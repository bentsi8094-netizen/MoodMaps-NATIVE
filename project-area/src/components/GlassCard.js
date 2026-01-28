import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function GlassCard({ children, style }) {
  return (
    <View style={[styles.wrapper, style]}>
      {/* החלפנו את ה-BlurView ב-View רגיל עם צבע חצי שקוף לבדיקה */}
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
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // צבע רקע במקום בלור
    overflow: 'hidden',
  },
  safeContainer: {
    padding: 25,
    width: '100%',
  },
});
// import React from 'react';
// import { StyleSheet, View, Platform } from 'react-native';
// import { BlurView } from 'expo-blur';

// export default function GlassCard({ children, style }) {
//   return (
//     <View style={[styles.container, style]}>
//       {/* ב-Android ה-BlurView לפעמים בעייתי בגרסאות מסוימות, הוספנו גיבוי */}
//       <BlurView intensity={Platform.OS === 'ios' ? 40 : 100} tint="dark" style={styles.blur}>
//         <View style={styles.innerContent}>
//           {children}
//         </View>
//       </BlurView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     borderRadius: 20,
//     overflow: 'hidden',
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.2)',
//     backgroundColor: Platform.OS === 'android' ? 'rgba(255,255,255,0.1)' : 'transparent',
//     marginVertical: 10,
//     width: '100%',
//   },
//   blur: {
//     padding: 20,
//   },
//   innerContent: {
//     backgroundColor: 'transparent',
//   }
// });