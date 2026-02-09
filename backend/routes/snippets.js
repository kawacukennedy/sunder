const express = require('express');
const router = express.Router();
const { authenticate, supabase } = require('../middleware/auth');
const { logAudit } = require('../lib/audit');

// Get all snippets (Public)
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('snippets')
            .select('*, author:users(username, avatar_url)')
            .eq('visibility', 'public')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get current user's snippets
router.get('/my', authenticate, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('snippets')
            .select('*')
            .eq('author_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user's starred snippets
router.get('/starred', authenticate, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('starred_snippets')
            .select('snippet_id, snippets(*, author:users(username, avatar_url))')
            .eq('user_id', req.user.id);

        if (error) throw error;
        res.json(data.map(item => item.snippets));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get snippet by ID
router.get('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('snippets')
            .select('*, author:users(username, avatar_url)')
            .eq('id', req.params.id)
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create snippet
router.post('/', authenticate, async (req, res) => {
    const { title, description, code, language, tags, visibility, organization_id } = req.body;
    try {
        const { data, error } = await supabase
            .from('snippets')
            .insert({
                title,
                description,
                code,
                language,
                tags: tags || [],
                visibility: visibility || 'public',
                author_id: req.user.id,
                organization_id
            })
            .select()
            .single();

        if (error) throw error;

        await logAudit({
            actor_id: req.user.id,
            action_type: 'create_snippet',
            entity_type: 'snippet',
            entity_id: data.id,
            new_values: { title, language, visibility }
        });

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update snippet
router.patch('/:id', authenticate, async (req, res) => {
    const { title, description, code, language, tags, visibility } = req.body;
    try {
        const { data, error } = await supabase
            .from('snippets')
            .update({ title, description, code, language, tags, visibility })
            .eq('id', req.params.id)
            .eq('author_id', req.user.id) // Ensure only author can edit
            .select()
            .single();

        if (error) throw error;

        await logAudit({
            actor_id: req.user.id,
            action_type: 'update_snippet',
            entity_type: 'snippet',
            entity_id: req.params.id,
            new_values: { title, language, visibility }
        });

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete snippet
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { error } = await supabase
            .from('snippets')
            .delete()
            .eq('id', req.params.id)
            .eq('author_id', req.user.id);

        if (error) throw error;

        await logAudit({
            actor_id: req.user.id,
            action_type: 'delete_snippet',
            entity_type: 'snippet',
            entity_id: req.params.id
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Star snippet
router.post('/:id/star', authenticate, async (req, res) => {
    try {
        const { error } = await supabase
            .from('starred_snippets')
            .insert({ user_id: req.user.id, snippet_id: req.params.id });

        if (error) throw error;

        // Increment star count on snippet
        await supabase.rpc('increment_star_count', { snippet_id: req.params.id });

        await logAudit({
            actor_id: req.user.id,
            action_type: 'star_snippet',
            entity_type: 'snippet',
            entity_id: req.params.id
        });

        res.json({ starred: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Unstar snippet
router.delete('/:id/star', authenticate, async (req, res) => {
    try {
        const { error } = await supabase
            .from('starred_snippets')
            .delete()
            .eq('user_id', req.user.id)
            .eq('snippet_id', req.params.id);

        if (error) throw error;

        // Decrement star count on snippet
        await supabase.rpc('decrement_star_count', { snippet_id: req.params.id });

        await logAudit({
            actor_id: req.user.id,
            action_type: 'unstar_snippet',
            entity_type: 'snippet',
            entity_id: req.params.id
        });

        res.json({ starred: false });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/snippets/:id/comments
router.post('/:id/comments', async (req, res) => {
    const { id } = req.params;
    const { content, user_id } = req.body;
    try {
        const { data, error } = await supabase
            .from('comments')
            .insert([{ snippet_id: id, user_id, content }])
            .select();
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/snippets/:id/comments
router.get('/:id/comments', async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabase
            .from('comments')
            .select('*, profiles(display_name, avatar_url)')
            .eq('snippet_id', id)
            .order('created_at', { ascending: true });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/snippets/:id/versions
router.post('/:id/versions', async (req, res) => {
    const { id } = req.params;
    const { code, change_summary, user_id } = req.body;
    try {
        const { data, error } = await supabase
            .from('snippet_versions')
            .insert([{ snippet_id: id, code, change_summary, user_id }])
            .select();
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
