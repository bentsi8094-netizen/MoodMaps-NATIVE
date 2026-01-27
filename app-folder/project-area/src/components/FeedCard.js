import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GlassCard from './GlassCard';

export default function FeedCard({ post }) {
  // הגנה: אם אין פוסט, אל תרנדר כלום
  if (!post) return null;

  // פונקציה לעיצוב זמן הפרסום - מחושבת רק כשהתאריך משתנה
  const formattedTime = useMemo(() => {
    if (!post.created_at) return '';
    const date = new Date(post.created_at);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [post.created_at]);

  return (
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
        <Text style={styles.emoji}>{post.emoji}</Text>
      </View>

      {post.content ? (
        <View style={styles.contentContainer}>
          <Text style={styles.contentText}>{post.content}</Text>
        </View>
      ) : null}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 15,
    width: '95%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  time: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
  emoji: {
    fontSize: 32,
  },
  contentContainer: {
    marginTop: 5,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  contentText: {
    color: 'white',
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'left',
  },
});