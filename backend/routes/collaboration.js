const { authenticate, supabase } = require('../middleware/auth');
const { logAudit } = require('../lib/audit');

// Start peer matchmaking
router.post('/match', authenticate, async (req, res) => {
    const { snippet_id, topic } = req.body;
    try {
        // Simulate finding a peer after a delay or based on availability
        // In a real system, this would use a queue or Redis pub/sub
        const matchToken = Math.random().toString(36).substring(2, 10).toUpperCase();

        await logAudit({
            actor_id: req.user.id,
            action_type: 'start_matching',
            entity_type: 'collaboration',
            new_values: { snippet_id, topic, match_token: matchToken }
        });

        res.json({
            status: 'searching',
            match_token: matchToken,
            estimated_wait: '12s'
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Matchmaking failed' });
    }
});

// Confirm/Accept match
router.post('/match/accept', authenticate, async (req, res) => {
    const { match_token } = req.body;
    try {
        const session_token = `SESS_${Math.random().toString(36).substring(2, 12).toUpperCase()}`;

        // Create the actual session in the DB
        const { data: session, error } = await supabase
            .from('collaboration_sessions')
            .insert({
                session_token,
                host_id: req.user.id,
                is_active: true
            })
            .select()
            .single();

        if (error) throw error;

        await logAudit({
            actor_id: req.user.id,
            action_type: 'accept_match',
            entity_type: 'collaboration',
            entity_id: session.id,
            new_values: { session_token }
        });

        res.json({
            status: 'connected',
            session_token,
            websocket_url: `wss://api.sunder.app/collaboration/${session_token}`
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Acceptance failed' });
    }
});

// Get session details (Recovery)
router.get('/sessions/:token', authenticate, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('collaboration_sessions')
            .select('*, snippets(*)')
            .eq('session_token', req.params.token)
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(404).json({ status: 'error', message: 'Session not found' });
    }
});

// Update session state
router.patch('/sessions/:token', authenticate, async (req, res) => {
    const { cursor_positions, messages, code_delta } = req.body;
    try {
        const { data, error } = await supabase
            .from('collaboration_sessions')
            .update({
                cursor_positions,
                messages,
                last_activity_at: new Date()
            })
            .eq('session_token', req.params.token)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to update session' });
    }
});

module.exports = router;
