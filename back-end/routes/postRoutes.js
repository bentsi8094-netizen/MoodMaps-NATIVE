const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');

// 1. יצירת/עדכון פוסט (Upsert)
router.post('/', async (req, res) => {
    const { user_id, user_name, emoji, content, stickerUrl } = req.body;

    try {
        const { data, error } = await supabase
            .from('posts')
            .upsert({ 
                user_id, 
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

// 2. שליפת כל הפוסטים (עם מיון לפי זמן)
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        res.json({ success: true, posts: data || [] });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// 3. שליפת משתמשים למפה
router.get('/map-users', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select(`
                user_id,
                user_name,
                emoji,
                sticker_url,
                profiles:user_id (latitude, longitude, first_name)
            `);

        if (error) throw error;

        const mapUsers = data.map(p => ({
            id: p.user_id,
            first_name: p.user_name?.split(' ')[0] || 'User',
            activeEmoji: p.emoji,
            sticker_url: p.sticker_url,
            latitude: p.profiles?.latitude,
            longitude: p.profiles?.longitude
        })).filter(u => u.latitude && u.longitude);

        res.json({ success: true, users: mapUsers });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 4. הסרת פוסט לפי ID משתמש
router.delete('/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('user_id', userId);

        if (error) throw error;
        res.json({ success: true, message: "Post deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;