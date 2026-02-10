// Get all learning paths
router.get('/paths', async (req, res) => {
    try {
        const { data, error } = await supabase.from('learning_paths').select('*');
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user progress in learning paths
router.get('/progress', authenticate, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('user_learning_progress')
            .select('*, learning_paths(*)')
            .eq('user_id', req.user.id);

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Enroll in a path
router.post('/enroll', authenticate, async (req, res) => {
    const { path_id } = req.body;
    try {
        const { data, error } = await supabase
            .from('user_learning_progress')
            .insert({ user_id: req.user.id, path_id, progress_percent: 0 })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update progress
router.patch('/progress/:pathId', authenticate, async (req, res) => {
    const { progress_percent, completed_modules } = req.body;
    try {
        const { data, error } = await supabase
            .from('user_learning_progress')
            .update({
                progress_percent,
                completed_modules,
                last_accessed_at: new Date(),
                completed_at: progress_percent === 100 ? new Date() : null
            })
            .eq('user_id', req.user.id)
            .eq('path_id', req.params.pathId)
            .select()
            .single();

        if (error) throw error;

        // If completed, award XP (simulated)
        if (progress_percent === 100) {
            await supabase.rpc('award_achievement_points', { user_id: req.user.id, points: 500 });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Skill Assessment (Absolute Spec Parity)
router.post('/assess', authenticate, async (req, res) => {
    try {
        // Real logic: analyze the user's snippets to determine skill distribution
        const { data: snippets } = await supabase
            .from('snippets')
            .select('language')
            .eq('author_id', req.user.id);

        const languageCounts = {};
        snippets?.forEach(s => {
            languageCounts[s.language] = (languageCounts[s.language] || 0) + 1;
        });

        const skills = {};
        Object.entries(languageCounts).forEach(([lang, count]) => {
            if (count > 10) skills[lang] = 'expert';
            else if (count > 5) skills[lang] = 'advanced';
            else skills[lang] = 'intermediate';
        });

        // Default if no snippets
        if (Object.keys(skills).length === 0) {
            skills['general'] = 'novice';
        }

        await supabase.from('users').update({ coding_style_signature: skills }).eq('id', req.user.id);

        await logAudit({
            actor_id: req.user.id,
            action_type: 'skill_assessment',
            entity_type: 'user',
            new_values: { skills }
        });

        res.json({ success: true, skills });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Global XP Awarding System
 */
router.post('/xp/award', authenticate, async (req, res) => {
    const { points, reason } = req.body;
    try {
        await supabase.rpc('award_achievement_points', { user_id: req.user.id, points });

        await logAudit({
            actor_id: req.user.id,
            action_type: 'award_xp',
            entity_type: 'user',
            new_values: { points, reason }
        });

        res.json({ success: true, points_awarded: points });
    } catch (error) {
        res.status(500).json({ error: 'Failed to award XP' });
    }
});

module.exports = router;
