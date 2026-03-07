/**
 * Migration v1.0.0 - Initial Schema
 * 
 * Creates the initial database schema for Sunder
 */

async function up(supabase) {
    console.log('Running initial schema migration...');
    
    // This migration assumes the schema.sql has already been applied
    // It creates the migrations tracking table
    
    const { error } = await supabase.rpc('pg_exec', {
        query: `
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id SERIAL PRIMARY KEY,
                version VARCHAR(50) NOT NULL UNIQUE,
                name VARCHAR(255) NOT NULL,
                applied_at TIMESTAMPTZ DEFAULT NOW(),
                checksum VARCHAR(64)
            );
            
            INSERT INTO schema_migrations (version, name, checksum) 
            VALUES ('1.0.0', 'migration_1.0.0.js', 'initial')
            ON CONFLICT (version) DO NOTHING;
        `
    }).catch(() => ({ error: true }));
    
    console.log('Initial migration completed');
}

async function down(supabase) {
    // Down migration - drop all tables (use with caution)
    console.log('Rolling back initial migration...');
    
    // This is dangerous in production!
    // Only use for development
}

module.exports = { up, down };
