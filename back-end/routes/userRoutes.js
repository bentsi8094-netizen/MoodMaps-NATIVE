const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const supabase = require('../config/supabaseClient');

/**
 * 1. הרשמה (Register)
 */
router.post('/register', async (req, res) => {
    const { email, password, firstName, lastName } = req.body;
    const userId = crypto.randomUUID();

    try {
        await supabase.from('auth_manual').insert([{ id: userId, email, password_hash: password }]);
        await supabase.from('profiles').insert([{ id: userId, first_name: firstName, last_name: lastName }]);

        res.json({
            success: true,
            user: { id: userId, firstName, lastName, email }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * 2. התחברות (Login)
 */
router.post('/login', async (req, res) => {
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
        res.status(500).json({ success: false, error: "שגיאת שרת פנימית" });
    }
});

/**
 * 3. עדכון מיקום
 */
router.post('/update-location', async (req, res) => {
    const { user_id, latitude, longitude } = req.body;

    const { error } = await supabase
        .from('profiles')
        .update({ 
            latitude, 
            longitude, 
            last_seen: new Date().toISOString() 
        })
        .eq('id', user_id);

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true });
});

module.exports = router;