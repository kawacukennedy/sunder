const express = require('express');
const router = express.Router();
const { authenticate, supabase } = require('../middleware/auth');

// Update profile
router.patch('/update', authenticate, async (req, res) => {
    const { display_name, bio, location, preferences } = req.body;
    try {
        const { data, error } = await supabase
            .from('users')
            .update({ display_name, bio, location, preferences })
            .eq('id', req.user.id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get profile by username
router.get('/:username', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', req.params.username)
            .single();

        if (error) throw error;

        // Also fetch snippets for this user
        const { data: snippets } = await supabase
            .from('snippets')
            .select('*')
            .eq('author_id', data.id)
            .order('created_at', { ascending: false });

        res.json({
            ...data,
            snippets: snippets || []
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
