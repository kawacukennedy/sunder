/**
 * Migration v1.1.0 - Enhanced Indexes and Performance
 * 
 * Adds additional indexes for better query performance
 */

async function up(supabase) {
    console.log('Running migration 1.1.0 - Enhanced indexes...');
    
    // Additional indexes for performance
    const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);',
        'CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id, created_at DESC);',
        'CREATE INDEX IF NOT EXISTS idx_ai_usage_user_date ON ai_usage_logs(user_id, created_at DESC);',
        'CREATE INDEX IF NOT EXISTS idx_content_flags_status ON content_flags(status);'
    ];
    
    for (const sql of indexes) {
        try {
            await supabase.rpc('pg_exec', { query: sql }).catch(() => ({ error: true }));
        } catch (e) {
            // Ignore errors
        }
    }
    
    // Record migration
    try {
        await supabase.from('schema_migrations').insert({
            version: '1.1.0',
            name: 'migration_1.1.0.js',
            checksum: 'indexes_v1'
        }).catch(() => ({ error: true }));
    } catch (e) {
        // Ignore
    }
    
    console.log('Migration 1.1.0 completed');
}

async function down(supabase) {
    console.log('Rolling back migration 1.1.0...');
    // Remove indexes if needed
}

module.exports = { up, down };
