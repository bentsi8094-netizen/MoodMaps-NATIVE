import React, { createContext, useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from '../constants/Config';

export const FeedContext = createContext(null);

export function FeedProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState(null);

  const fetchPosts = useCallback(async (force = false) => {
    const now = Date.now();
    if (isLoading || (!force && lastFetched && now - lastFetched < 30000)) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts`);
      const result = await response.json();
      if (result.success) {
        setPosts(result.posts || []);
        setLastFetched(now);
      }
    } catch (error) {
      console.error("FeedContext Error (fetchPosts):", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, lastFetched]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const addPost = async (user, postData) => {
    if (!user?.id) return { success: false, error: "משתמש לא מחובר" };

    try {
      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          user_name: `${user.firstName} ${user.lastName}`,
          emoji: postData.emoji,
          content: postData.content 
        }),
      });
      
      const result = await response.json();

      if (result.success) {
        setPosts(prev => {
          // אם המשתמש כבר קיים בפיד - מעדכנים אותו, אם לא - מוסיפים להתחלה
          const exists = prev.find(p => p.user_id === user.id);
          if (exists) {
            return prev.map(p => p.user_id === user.id ? result.post : p);
          }
          return [result.post, ...prev];
        });
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: "שגיאת תקשורת" };
    }
  };

  const removePost = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${userId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (data.success) {
        setPosts(prev => prev.filter(post => post.user_id !== userId));
        return { success: true };
      }
      return { success: false };
    } catch (e) {
      return { success: false };
    }
  };

  return (
    <FeedContext.Provider value={{ posts, addPost, fetchPosts, isLoading, removePost }}>
      {children}
    </FeedContext.Provider>
  );
}