const express = require('express');
const router = express.Router();
const { supabase } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret';

// Register
router.post('/register', async (req, res) => {
    const { email, password, username, displayName, preferences } = req.body;

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                    display_name: displayName,
                    preferences
                }
            }
        });

        if (error) throw error;

        // Also create a entry in our local 'users' table if needed, 
        // though Supabase Auth handles metadata, the schema has a separate 'users' table.
        // Usually, a trigger in Postgres handles this, but for this demo:
        await supabase.from('users').insert({
            id: data.user.id,
            username,
            email,
            password_hash: 'managed_by_supabase',
            display_name: displayName,
            preferences
        });

        res.json({
            user: data.user,
            access_token: data.session?.access_token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        res.json({
            user: data.user,
            access_token: data.session.access_token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
