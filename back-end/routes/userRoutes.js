const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const supabase = require('../config/supabaseClient');

const SALT_ROUNDS = 10;

/**
 * פונקציית עזר ליצירת Alias ייחודי (למשל: Ben#A92B)
 */
const generateAlias = (firstName) => {
    const randomID = crypto.randomBytes(2).toString('hex').toUpperCase();
    return `${firstName}#${randomID}`;
};

/**
 * 1. הרשמה (Register) - כולל יצירת Alias ראשוני
 */
router.post('/register', async (req, res) => {
    const { email, password, firstName, lastName } = req.body;

    try {
        if (!email || !password || !firstName) {
            return res.status(400).json({ success: false, error: "נא למלא את כל שדות החובה" });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const userAlias = generateAlias(firstName);

        // שמירה לטבלת אבטחה (auth_manual)
        const { data: authUser, error: authError } = await supabase
            .from('auth_manual')
            .insert([{ email: email.toLowerCase(), password_hash: hashedPassword }])
            .select();

        if (authError) throw authError;
        const userId = authUser[0].id;

        // שמירה לטבלת פרופיל (profiles) עם ה-Alias החדש
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([{ 
                id: userId, 
                first_name: firstName, 
                last_name: lastName,
                user_alias: userAlias 
            }]);

        if (profileError) throw profileError;

        res.json({
            success: true,
            user: { 
                id: userId, 
                firstName, 
                lastName, 
                email, 
                alias: userAlias 
            }
        });
    } catch (err) {
        console.error("Register Error:", err.message);
        res.status(500).json({ success: false, error: "ההרשמה נכשלה. ייתכן והאימייל כבר קיים." });
    }
});

/**
 * 2. התחברות (Login) - מחזיר את ה-Alias מהפרופיל
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

        // שליפת נתוני הפרופיל כולל ה-Alias
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
                email: authUser.email,
                alias: profile.user_alias
            }
        });
    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).json({ success: false, error: "שגיאת שרת פנימית" });
    }
});

/**
 * 3. עדכון מיקום
 */
router.post('/update-location', async (req, res) => {
    const { user_id, latitude, longitude } = req.body;

    try {
        if (!user_id) throw new Error("User ID is required");

        const { error } = await supabase
            .from('profiles')
            .update({ 
                latitude, 
                longitude, 
                last_seen: new Date().toISOString() 
            })
            .eq('id', user_id);

        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        console.error("Location Update Error:", err.message);
        res.status(400).json({ success: false, error: err.message });
    }
});

module.exports = router;