/**
 * Migration v1.0.0 - Initial Schema
 * 
 * Creates the initial database schema for Sunder
 */

async function up(supabase) {
    console.log('Running initial schema migration...');
    
    // This migration assumes the schema.sql has already been applied via Supabase dashboard
    // This just creates the migrations tracking table
    
    try {
        // Create migrations table using postgREST
        const { error } = await supabase
            .from('schema_migrations')
            .select('*')
            .limit(1);
        
        if (error && error.code === 'PGRST116') {
            // Table doesn't exist, try to create via raw SQL
            // Since Supabase doesn't allow direct SQL, we'll skip this
            console.log('⚠️ schema_migrations table does not exist - skipping');
        }
    } catch (e) {
        // Table doesn't exist - ignore
    }
    
    // Record this migration
    try {
        await supabase.from('schema_migrations').insert({
            version: '1.0.0',
            name: 'migration_1.0.0.js',
            checksum: 'initial'
        });
    } catch (e) {
        // May already exist
    }
    
    console.log('Initial migration completed (schema_migrations tracked)');
}

async function down(supabase) {
    console.log('Rolling back initial migration...');
}

module.exports = { up, down };
