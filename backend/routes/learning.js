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

// Skill Assessment (Simulated)
router.post('/assess', authenticate, async (req, res) => {
    try {
        // Simulated AI analysis of snippets to determine skill level
        const skills = {
            react: 'advanced',
            typescript: 'intermediate',
            postgres: 'expert',
            system_design: 'intermediate'
        };
        await supabase.from('users').update({ coding_style_signature: skills }).eq('id', req.user.id);
        res.json({ success: true, skills });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
