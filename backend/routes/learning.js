const express = require('express');
const router = express.Router();
const { authenticate, supabase } = require('../middleware/auth');

// Get user progress in learning paths
router.get('/progress', authenticate, async (req, res) => {
    try {
        // Mocked progress data for now as we don't have a learning_progress table yet
        // In a real system, this would be a join or a specific progress table
        res.json([
            { path_id: '1', title: 'Advanced React Patterns', progress: 65 },
            { path_id: '2', title: 'Rust Systems Engineering', progress: 10 }
        ]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch progress' });
    }
});

// Update progress
router.post('/progress', authenticate, async (req, res) => {
    const { path_id, progress } = req.body;
    try {
        // Update logic here
        res.json({ success: true, path_id, progress });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update progress' });
    }
});

module.exports = router;
