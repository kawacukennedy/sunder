const express = require('express');
const router = express.Router();
const { supabase } = require('../middleware/auth');

// Get leaderboard
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('username, display_name, avatar_url, achievement_points, coding_streak')
            .order('achievement_points', { ascending: false })
            .order('coding_streak', { ascending: false })
            .limit(50);

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
