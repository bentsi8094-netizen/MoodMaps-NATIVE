require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt'); 
const crypto = require('crypto'); 
const supabase = require('./config/supabaseClient');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.post('/api/register', async (req, res) => {
    const { firstName, lastName, password } = req.body;
    const email = req.body.email?.trim().toLowerCase();

    if (!email || !password || !firstName) {
        return res.status(400).json({ success: false, error: "חסרים פרטי חובה לרישום" });
    }

    try {
        // 1. בדיקה אם המשתמש כבר קיים
        const { data: existingUser } = await supabase
            .from('auth_manual')
            .select('email')
            .eq('email', email)
            .maybeSingle();

        if (existingUser) {
            return res.status(400).json({ success: false, error: "האימייל כבר קיים במערכת" });
        }

        const userId = crypto.randomUUID();
        const hashedPassword = await bcrypt.hash(password, 10);

        const { error: authError } = await supabase
            .from('auth_manual')
            .insert([{ id: userId, email, password_hash: hashedPassword }]);
        
        if (authError) throw authError;

        const { error: profError } = await supabase
            .from('profiles')
            .insert([{ id: userId, first_name: firstName, last_name: lastName }]);
        
        if (profError) throw profError;

        res.status(201).json({ 
            success: true, 
            user: { id: userId, firstName, lastName, email } 
        });

    } catch (err) {
        console.error("Register Error:", err.message);
        res.status(500).json({ success: false, error: "שגיאה בתהליך ההרשמה" });
    }
});

app.post('/api/login', async (req, res) => {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;

    try {
        const { data: authUser, error: authError } = await supabase
            .from('auth_manual')
            .select('*')
            .eq('email', email)
            .maybeSingle();

        if (authError || !authUser) {
            return res.status(401).json({ success: false, error: "פרטי התחברות שגויים" });
        }

        const isMatch = await bcrypt.compare(password, authUser.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: "פרטי התחברות שגויים" });
        }

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();

        if (profileError) throw profileError;

        res.json({ 
            success: true, 
            user: { 
                id: profile.id, 
                firstName: profile.first_name, 
                lastName: profile.last_name, 
                email: authUser.email 
            } 
        });

    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).json({ success: false, error: "שגיאת שרת פנימית" });
    }
});

app.post('/api/posts', async (req, res) => {
  const { user_id, user_name, emoji, content } = req.body;

  if (!user_id || !emoji) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  const { data, error } = await supabase
    .from('posts')
    .insert([
      { 
        user_id: user_id, 
        user_name: user_name, 
        emoji: emoji, 
        content: content 
      }
    ])
    .select();

  if (error) {
    console.error("Supabase Insert Error:", error);
    return res.status(400).json({ success: false, error: error.message });
  }

  res.json({ success: true, post: data[0] });
});

app.get('/api/posts', async (req, res) => {
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, posts: data || [] });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server is running on http://192.168.43.235:${PORT}`);
});