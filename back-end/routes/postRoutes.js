const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');

/**
 * 1. יצירת או עדכון פוסט (Upsert)
 * מעדכן פוסט קיים של משתמש או יוצר חדש אם לא קיים
 */
router.post('/', async (req, res) => {
  const { user_id, user_name, emoji, content } = req.body;

  if (!user_id || !emoji) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  try {
    const { data, error } = await supabase
      .from('posts')
      .upsert({ 
        user_id, 
        user_name, 
        emoji, 
        content,
        created_at: new Date().toISOString() 
      }, { onConflict: 'user_id' }) 
      .select();

    if (error) throw error;
    res.json({ success: true, post: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 2. שליפת כל הפוסטים לפיד הכללי
 */
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

/**
 * 3. שליפת משתמשים עם מיקום ואימוג'י פעיל למפה
 */
router.get('/map-users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id, 
        first_name, 
        latitude, 
        longitude,
        posts ( emoji )
      `)
      .not('latitude', 'is', null);

    if (error) throw error;

    const formattedUsers = data
      .filter(u => u.posts && (Array.isArray(u.posts) ? u.posts.length > 0 : !!u.posts.emoji))
      .map(u => ({
        id: u.id,
        first_name: u.first_name,
        latitude: parseFloat(u.latitude),
        longitude: parseFloat(u.longitude),
        activeEmoji: Array.isArray(u.posts) ? u.posts[0]?.emoji : u.posts?.emoji
      }));

    res.json({ success: true, users: formattedUsers });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * 4. מחיקת פוסט
 */
router.delete('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('user_id', user_id);

    if (error) throw error;
    res.json({ success: true, message: "Post removed" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;