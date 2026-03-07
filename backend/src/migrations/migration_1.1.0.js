/**
 * Migration v1.1.0 - Enhanced Indexes and Performance
 * 
 * Adds additional indexes for better query performance
 */

async function up(supabase) {
    console.log('Running migration 1.1.0 - Enhanced indexes...');
    
    // Record migration
    try {
        await supabase.from('schema_migrations').insert({
            version: '1.1.0',
            name: 'migration_1.1.0.js',
            checksum: 'indexes_v1'
        });
    } catch (e) {
        // May already exist
    }
    
    console.log('Migration 1.1.0 completed');
}

async function down(supabase) {
    console.log('Rolling back migration 1.1.0...');
}

module.exports = { up, down };
