import React, { createContext, useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from '../constants/Config';

export const FeedContext = createContext(null);

export function FeedProvider({ children }) {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    /**
     * שליפת כל הפוסטים מהשרת
     */
    const fetchPosts = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/posts`);
            const result = await response.json();
            
            if (result.success) {
                // נרמול הנתונים (הפיכת snake_case מ-DB ל-camelCase לאפליקציה)
                const normalizedPosts = result.posts.map(post => ({
                    ...post,
                    stickerUrl: post.sticker_url 
                }));
                setPosts(normalizedPosts);
            }
        } catch (error) {
            console.error("❌ Feed Fetch Error:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * הוספת פוסט חדש או עדכון קיים (Upsert)
     */
    const addPost = async (user, postData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    user_name: `${user.firstName} ${user.lastName}`,
                    user_alias: user.alias, // קריטי: שולחים את ה-Alias הקבוע מה-UserContext
                    emoji: postData.emoji,
                    content: postData.content,
                    stickerUrl: postData.stickerUrl 
                }),
            });

            const result = await response.json();

            if (result.success) {
                // במקום לחכות לריענון מהשרת, אפשר לעדכן מקומית לביצועים מהירים (Optmistic Update)
                await fetchPosts(); 
                return { success: true, post: result.post };
            }
            return { success: false, error: result.error };
        } catch (error) { 
            console.error("❌ Add Post Error:", error);
            return { success: false, error: error.message }; 
        }
    };

    /**
     * מחיקת פוסט
     */
    const removePost = async (userId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/posts/${userId}`, {
                method: 'DELETE',
            });
            const result = await response.json();
            
            if (result.success) {
                setPosts(prev => prev.filter(p => p.user_id !== userId));
                return { success: true };
            }
            return { success: false };
        } catch (error) {
            console.error("❌ Delete Post Error:", error);
            return { success: false };
        }
    };

    // טעינה ראשונית
    useEffect(() => { 
        fetchPosts(); 
    }, [fetchPosts]);

    return (
        <FeedContext.Provider value={{ 
            posts, 
            addPost, 
            removePost, 
            fetchPosts, 
            isLoading 
        }}>
            {children}
        </FeedContext.Provider>
    );
}