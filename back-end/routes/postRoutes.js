const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');
const crypto = require('crypto');

/**
 * פונקציית עזר ליצירת Alias אנונימי וקצר
 */
const generateAlias = (fullName) => {
    const firstName = fullName?.split(' ')[0] || 'User';
    const randomID = crypto.randomBytes(2).toString('hex').toUpperCase();
    return `${firstName}#${randomID}`;
};

// 1. יצירת/עדכון פוסט (Upsert)
router.post('/', async (req, res) => {
    const { user_id, user_name, emoji, content, stickerUrl, user_alias: existingAlias } = req.body;
    
    // שימוש ב-Alias קיים מה-Context או יצירת חדש אם זו פעם ראשונה
    const user_alias = existingAlias || generateAlias(user_name);

    try {
        const { data, error } = await supabase
            .from('posts')
            .upsert({ 
                user_id, 
                user_alias, 
                user_name,
                emoji, 
                content,
                sticker_url: stickerUrl,
                created_at: new Date().toISOString() 
            }, { onConflict: 'user_id' }) 
            .select();

        if (error) throw error;
        res.json({ success: true, post: data[0] });
    } catch (err) {
        console.error("DB Error:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2. שליפת כל הפוסטים
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select('id, user_id, user_alias, emoji, content, sticker_url, created_at')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        res.json({ success: true, posts: data || [] });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// 3. שליפת משתמשים למפה - מותאם בדיוק ל-MapScreen
router.get('/map-users', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select(`
                user_id,
                user_alias,
                emoji,
                sticker_url,
                profiles:user_id (latitude, longitude)
            `);

        if (error) throw error;

        // בניית אובייקט נקי למפה - מוודאים שכל השדות קיימים
        const mapUsers = data
            .filter(p => p.profiles && p.profiles.latitude != null)
            .map(p => ({
                id: p.user_id,
                user_alias: p.user_alias, // השם שיופיע במפה
                activeEmoji: p.emoji,
                sticker_url: p.sticker_url,
                latitude: p.profiles.latitude,
                longitude: p.profiles.longitude
            }));

        res.json({ success: true, users: mapUsers });
    } catch (err) {
        console.error("Map Users Error:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// 4. הוספת תגובה
router.post('/:postId/comments', async (req, res) => {
    const { postId } = req.params;
    const { user_id, user_alias, content } = req.body;
    try {
        const { data, error } = await supabase
            .from('comments')
            .insert([{ 
                post_id: postId, 
                user_id, 
                user_alias: user_alias || "אנונימי", 
                content,
                created_at: new Date().toISOString()
            }])
            .select();
        if (error) throw error;
        res.json({ success: true, comment: data[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 5. שליפת תגובות
router.get('/:postId/comments', async (req, res) => {
    const { postId } = req.params;
    try {
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('post_id', postId)
            .order('created_at', { ascending: true });
        if (error) throw error;
        res.json({ success: true, comments: data || [] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 6. מחיקה
router.delete('/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const { error } = await supabase.from('posts').delete().eq('user_id', userId);
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;