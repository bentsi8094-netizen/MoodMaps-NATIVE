import React, { createContext, useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from '../constants/Config';

export const FeedContext = createContext(null);

export function FeedProvider({ children }) {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchPosts = useCallback(async () => {
        setIsLoading(true);
        console.log("📡 Connecting to:", `${API_BASE_URL}/api/posts`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
            const response = await fetch(`${API_BASE_URL}/api/posts`, {
                signal: controller.signal
            });
            const result = await response.json();
            
            if (result.success) {
                const normalizedPosts = result.posts.map(post => ({
                    ...post,
                    stickerUrl: post.sticker_url 
                }));
                setPosts(normalizedPosts);
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error("❌ Feed Error: Request timed out");
            } else {
                console.error("❌ Feed Error Details:", error);
            }
        } finally {
            clearTimeout(timeoutId);
            setIsLoading(false);
        }
    }, []);

    const addPost = async (user, postData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    user_name: `${user.firstName} ${user.lastName}`,
                    emoji: postData.emoji,
                    content: postData.content,
                    stickerUrl: postData.stickerUrl 
                }),
            });
            const result = await response.json();
            if (result.success) {
                await fetchPosts(); 
                return { success: true };
            }
        } catch (error) { 
            console.error("Add Post Error:", error);
            return { success: false }; 
        }
    };

    const removePost = async (userId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/posts/${userId}`, {
                method: 'DELETE',
            });
            const result = await response.json();
            if (result.success) {
                // עדכון הסטייט המקומי כדי שהפוסט יימחק מהמסך מיד
                setPosts(prev => prev.filter(p => p.user_id !== userId));
                return { success: true };
            }
        } catch (error) {
            console.error("Delete Error:", error);
            return { success: false };
        }
    };

    useEffect(() => { fetchPosts(); }, [fetchPosts]);

    return (
        <FeedContext.Provider value={{ posts, addPost, removePost, fetchPosts, isLoading }}>
            {children}
        </FeedContext.Provider>
    );
}