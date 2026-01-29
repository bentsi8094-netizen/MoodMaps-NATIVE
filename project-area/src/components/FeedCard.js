import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image'; // שימוש ב-Expo Image לביצועים
import * as Animatable from 'react-native-animatable';
import GlassCard from './GlassCard';

export default function FeedCard({ post }) {
  if (!post) return null;

  const formattedTime = useMemo(() => {
    if (!post.created_at) return '';
    const date = new Date(post.created_at);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [post.created_at]);

  return (
    <Animatable.View animation="fadeInUp" duration={600} useNativeDriver>
      <GlassCard style={styles.card}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {post.user_name ? post.user_name[0].toUpperCase() : '?'}
              </Text>
            </View>
            <View>
              <Text style={styles.userName}>{post.user_name || 'משתמש אנונימי'}</Text>
              <Text style={styles.time}>{formattedTime}</Text>
            </View>
          </View>
          
          <View style={styles.emojiWrapper}>
            {post.sticker_url ? (
              <Image 
                source={{ uri: post.sticker_url }} 
                style={styles.stickerSmall} 
                contentFit="contain"
                transition={500} // אפקט הופעה רכה
              />
            ) : (
              <Text style={styles.emoji}>{post.emoji}</Text>
            )}
          </View>
        </View>

        {post.content ? (
          <View style={styles.contentContainer}>
            <Text style={styles.contentText}>{post.content}</Text>
          </View>
        ) : null}
      </GlassCard>
    </Animatable.View>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12, width: '95%', alignSelf: 'center' },
  header: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  userInfo: { flexDirection: 'row-reverse', alignItems: 'center' },
  avatar: { 
    width: 36, height: 36, borderRadius: 18, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    justifyContent: 'center', alignItems: 'center', marginLeft: 10 
  },
  avatarText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  userName: { color: 'white', fontSize: 15, fontWeight: '700', textAlign: 'right' },
  time: { color: 'rgba(255,255,255,0.4)', fontSize: 11, textAlign: 'right' },
  emojiWrapper: { width: 50, height: 50, justifyContent: 'center', alignItems: 'center' },
  emoji: { fontSize: 32 },
  stickerSmall: { width: 50, height: 50 },
  contentContainer: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  contentText: { color: 'white', fontSize: 15, lineHeight: 22, textAlign: 'right', opacity: 0.9 },
});