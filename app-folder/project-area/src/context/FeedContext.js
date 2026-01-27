import React, { createContext, useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from '../constants/Config';

export const FeedContext = createContext(null);

export function FeedProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState(null);

  // שימוש ב-useCallback כדי למנוע יצירה מחדש של הפונקציה בכל רינדור
  const fetchPosts = useCallback(async (force = false) => {
    // מניעת קריאות כפולות: אם אנחנו כבר טוענים, או אם טענו ב-30 שניות האחרונות (אלא אם זה רענון מאולץ)
    const now = Date.now();
    if (isLoading || (!force && lastFetched && now - lastFetched < 30000)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts`);
      const result = await response.json();

      if (result.success) {
        setPosts(result.posts);
        setLastFetched(now);
      }
    } catch (error) {
      console.error("FeedContext Error (fetchPosts):", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, lastFetched]);

  // טעינה ראשונית בלבד
  useEffect(() => {
    fetchPosts();
  }, []);


  const addPost = async (user, postData) => {
  try {
    if (!user || !user.id) {
      console.error("User object is missing or invalid");
      return { success: false, error: "משתמש לא מחובר" };
    }

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
      // עדכון הסטייט המקומי כדי שהפוסט יופיע מיד
      setPosts(prev => [result.post, ...prev]);
      return { success: true };
    } else {
      console.error("Server error:", result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error("Network error in addPost:", error);
    return { success: false, error: "שגיאת תקשורת" };
  }
};

  return (
    <FeedContext.Provider value={{ posts, addPost, fetchPosts, isLoading }}>
      {children}
    </FeedContext.Provider>
  );
}