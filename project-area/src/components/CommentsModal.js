import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { API_BASE_URL } from '../constants/Config';
import { UserContext } from '../context/UserContext';
import * as Haptics from 'expo-haptics';

export default function CommentsModal({ visible, onClose, postId, postAlias }) {
  const { currentUser } = useContext(UserContext);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && postId) {
      fetchComments();
    }
  }, [visible, postId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`);
      const data = await res.json();
      if (data.success) {
        setComments(data.comments);
      }
    } catch (e) {
      console.error("Fetch Comments Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const sendComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          user_alias: currentUser.alias || "אנונימי", 
          content: newComment
        })
      });

      if (res.ok) {
        setNewComment('');
        fetchComments();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (e) {
      console.error("Send Comment Error:", e);
    }
  };

  const renderCommentItem = ({ item }) => {
    const isMe = item.user_id === currentUser?.id;
    
    return (
      <View style={[styles.commentWrapper, isMe ? styles.myCommentWrapper : styles.otherCommentWrapper]}>
        <View style={[styles.commentBubble, isMe ? styles.myBubble : styles.otherBubble]}>
          <Text style={[styles.commentAlias, isMe && styles.myAliasText]}>
            {isMe ? "אני" : item.user_alias}
          </Text>
          <Text style={styles.commentText}>{item.content}</Text>
          <Text style={styles.commentTime}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.overlay}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>שיחה בפוסט של {postAlias}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Text style={styles.closeBtn}>סגור</Text>
            </TouchableOpacity>
          </View>
          
          {loading && comments.length === 0 ? (
            <ActivityIndicator size="small" color="#00b4d8" style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
              renderItem={renderCommentItem}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={<Text style={styles.emptyText}>אין עדיין תגובות. תהיו הראשונים!</Text>}
            />
          )}

          <View style={styles.inputArea}>
            <TextInput 
              style={styles.input} 
              placeholder="כתוב תגובה..." 
              placeholderTextColor="#aaa"
              value={newComment}
              onChangeText={setNewComment}
              multiline={false}
              returnKeyType="send"
              onSubmitEditing={sendComment}
            />
            <TouchableOpacity onPress={sendComment} style={styles.sendBtn}>
              <Text style={styles.sendText}>שלח</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { maxHeight: '100%',flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0)' ,paddingVertical: 0},
  container: { 
    position: 'fixed',
    height: '70%', 
    backgroundColor: 'rgb(190, 130, 163)', 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    paddingTop: 20,
    paddingHorizontal: 15,
    opacity:1,
  },
  header: { 
    flexDirection: 'row-reverse', 
    justifyContent: 'space-between', 
    marginBottom: 15, 
    alignItems: 'center',
    paddingHorizontal: 10
  },
  title: { color: 'white', fontSize: 17, fontWeight: 'bold', textAlign: 'right' },
  closeBtn: { color: '#7dffdf', fontWeight: 'bold', fontSize: 16 },
  listContent: { paddingBottom: 30 },
  
  // לוגיקת בועות הצ'אט
  commentWrapper: { width: '100%', marginVertical: 5, flexDirection: 'row' },
  myCommentWrapper: { justifyContent: 'flex-start' }, // צד ימין (בעברית)
  otherCommentWrapper: { justifyContent: 'flex-end' }, // צד שמאל
  
  commentBubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 18,
  },
  myBubble: {
    backgroundColor: '#00b4d8',
    borderBottomRightRadius: 2,
  },
  otherBubble: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderBottomLeftRadius: 2,
  },
  
  commentAlias: { fontSize: 12, fontWeight: 'bold', marginBottom: 2, color: '#90e0ef', textAlign: 'right' },
  myAliasText: { color: '#ffffff', opacity: 0.9 },
  commentText: { color: 'white', fontSize: 15, textAlign: 'right' },
  commentTime: { color: 'rgba(255,255,255,0.5)', fontSize: 9, marginTop: 4, textAlign: 'left' },

  emptyText: { color: 'rgba(255, 255, 255, 0.4)', textAlign: 'center', marginTop: 40 },
  inputArea: { 
    flexDirection: 'row-reverse', 
    alignItems: 'center', 
    paddingVertical: 15,
    paddingHorizontal: 5,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
  input: { 
    flex: 1, 
    backgroundColor: 'rgba(255,255,255,0.08)', 
    color: 'white', 
    borderRadius: 25, 
    paddingHorizontal: 18, 
    height: 48,
    textAlign: 'right',
    fontSize: 16
  },
  sendBtn: { marginRight: 10, backgroundColor: '#00b4d8', borderRadius: 25, width: 60, height: 48, justifyContent: 'center', alignItems: 'center' },
  sendText: { color: 'white', fontWeight: 'bold' }
});
