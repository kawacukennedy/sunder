const ADMIN_SECRET = process.env.ADMIN_SECRET_PASSWORD || 'sunder_admin_2024';

// Middleware for Admin Secret or Role
const adminOnly = async (req, res, next) => {
    const secret = req.headers['x-admin-secret'];
    if (secret === ADMIN_SECRET) {
        req.user = { id: '00000000-0000-0000-0000-000000000000', role: 'super_admin' };
        return next();
    }

    // In a real app, we check the role. For this demo, let's assume 'admin' role in JWT or metadata
    if (req.user && (req.user.user_metadata?.role === 'admin' || req.user.app_metadata?.role === 'admin')) {
        return next();
    }

    res.status(403).json({ error: 'Admin access required' });
};

// Get System Metrics
router.get('/metrics', authenticate, adminOnly, async (req, res) => {
    try {
        const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
        const { count: snippetCount } = await supabase.from('snippets').select('*', { count: 'exact', head: true });
        const { data: aiUsage } = await supabase.from('ai_usage_logs').select('total_cost');

        res.json({
            users: { total: userCount || 0 },
            snippets: { total: snippetCount || 0 },
            ai: {
                total_cost: aiUsage?.reduce((acc, log) => acc + (parseFloat(log.total_cost) || 0), 0) || 0
            },
            system: {
                uptime: process.uptime(),
                memory: process.memoryUsage().heapUsed,
                status: 'healthy'
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Audit Logs
router.get('/audit', authenticate, adminOnly, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*, actor:users(username)')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Content Moderation: Get Flags
router.get('/moderation/flags', authenticate, adminOnly, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('content_flags')
            .select('*, snippet:snippets(title), reporter:users(username)')
            .eq('status', 'pending');

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Resolve Flag
router.post('/moderation/flags/:id/resolve', authenticate, adminOnly, async (req, res) => {
    const { status, action } = req.body;
    try {
        const { data: flag, error: flagError } = await supabase
            .from('content_flags')
            .update({ status, resolved_by: req.user.id, resolved_at: new Date() })
            .eq('id', req.params.id)
            .select()
            .single();

        if (flagError) throw flagError;

        if (action === 'delete_snippet' && flag.snippet_id) {
            await supabase.from('snippets').delete().eq('id', flag.snippet_id);
        }

        res.json({ success: true, flag });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
