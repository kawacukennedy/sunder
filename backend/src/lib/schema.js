/**
 * Sunder ORM - Hibernate-like Database Schema Manager
 * 
 * This module provides automatic database schema management:
 * - Tracks schema versions
 * - Runs pending migrations on startup
 * - Provides model definitions and repository patterns
 */

const { supabase } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

const MIGRATIONS_TABLE = 'schema_migrations';

/**
 * Initialize the migrations system
 */
async function initSchemaManager() {
    console.log('🔄 Initializing Sunder ORM Schema Manager...');
    
    try {
        // Create migrations tracking table if not exists
        await ensureMigrationsTable();
        
        // Get current schema version
        const currentVersion = await getCurrentVersion();
        console.log(`📊 Current schema version: ${currentVersion || 'none'}`);
        
        // Get all migration files
        const migrations = getMigrationFiles();
        console.log(`📁 Found ${migrations.length} migration files`);
        
        // Run pending migrations
        await runPendingMigrations(migrations, currentVersion);
        
        // Verify schema integrity
        await verifySchema();
        
        console.log('✅ Schema Manager initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Schema Manager initialization failed:', error.message);
        throw error;
    }
}

/**
 * Create the migrations tracking table
 */
async function ensureMigrationsTable() {
    try {
        // Try to query the table - if it doesn't exist, this will fail
        const { error } = await supabase
            .from(MIGRATIONS_TABLE)
            .select('version')
            .limit(1);
        
        if (!error) {
            console.log('📋 Migration tracking table exists');
            return;
        }
    } catch (e) {
        // Table doesn't exist, will create via SQL
    }
    
    // Log that we'll need to run initial migration
    console.log('📋 Migration tracking will be initialized on first run');
}

/**
 * Get the current schema version
 */
async function getCurrentVersion() {
    try {
        const { data, error } = await supabase
            .from(MIGRATIONS_TABLE)
            .select('version')
            .order('id', { ascending: false })
            .limit(1)
            .single();
        
        if (error) return null;
        return data?.version;
    } catch {
        return null;
    }
}

/**
 * Get all migration files
 */
function getMigrationFiles() {
    // Migrations are in backend/src/migrations, not backend/src/lib/migrations
    const migrationsDir = path.join(__dirname, '../migrations');
    
    if (!fs.existsSync(migrationsDir)) {
        console.log('⚠️ Migrations directory not found:', migrationsDir);
        return [];
    }
    
    const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.js') && f.startsWith('migration_'))
        .sort();
    
    console.log(`📁 Found ${files.length} migration files in ${migrationsDir}`);
    
    return files.map(f => ({
        name: f,
        path: path.join(migrationsDir, f),
        version: f.replace('migration_', '').replace('.js', '')
    }));
}

/**
 * Run all pending migrations
 */
async function runPendingMigrations(migrations, currentVersion) {
    const pending = migrations.filter(m => !currentVersion || m.version > currentVersion);
    
    if (pending.length === 0) {
        console.log('✅ Database schema is up to date');
        return;
    }
    
    console.log(`🚀 Running ${pending.length} pending migrations...`);
    
    for (const migration of pending) {
        try {
            await runMigration(migration);
        } catch (error) {
            console.error(`⚠️ Migration ${migration.name} failed:`, error.message);
            console.log('⚠️ Continuing without migration - schema may need manual setup');
            // Don't throw - allow server to start anyway
            break;
        }
    }
}

/**
 * Run a single migration
 */
async function runMigration(migration) {
    console.log(`📦 Running migration: ${migration.name}`);
    
    try {
        // Load migration module
        const migrationModule = require(migration.path);
        
        // Execute up migration
        if (typeof migrationModule.up === 'function') {
            await migrationModule.up(supabase);
        }
        
        // Record migration
        await recordMigration(migration);
        
        console.log(`✅ Migration completed: ${migration.version}`);
    } catch (error) {
        console.error(`❌ Migration failed: ${migration.name}`, error.message);
        throw error;
    }
}

/**
 * Record a successful migration
 */
async function recordMigration(migration) {
    try {
        await supabase.from(MIGRATIONS_TABLE).insert({
            version: migration.version,
            name: migration.name,
            checksum: 'pending'
        });
    } catch (error) {
        // Ignore duplicate errors
        console.warn('Warning: Could not record migration:', error.message);
    }
}

/**
 * Verify schema integrity
 */
async function verifySchema() {
    const requiredTables = [
        'users', 'organizations', 'snippets', 'snippet_versions',
        'collaboration_sessions', 'organization_members', 'code_reviews',
        'starred_snippets', 'snippet_analyses', 'ai_translations',
        'ai_pair_sessions', 'achievements', 'audit_logs', 'ai_usage_logs',
        'content_flags', 'learning_paths', 'user_learning_progress',
        'user_followers', 'system_backups'
    ];
    
    try {
        const { data, error } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .in('table_name', requiredTables);
        
        if (error) {
            console.log('⚠️ Could not verify schema integrity');
            return;
        }
        
        const existingTables = new Set(data?.map(t => t.table_name) || []);
        const missing = requiredTables.filter(t => !existingTables.has(t));
        
        if (missing.length > 0) {
            console.warn(`⚠️ Missing tables: ${missing.join(', ')}`);
        } else {
            console.log('✅ Schema integrity verified');
        }
    } catch {
        console.log('⚠️ Schema verification skipped');
    }
}

/**
 * Rollback to a specific version
 */
async function rollbackTo(targetVersion) {
    console.log(`🔄 Rolling back to version: ${targetVersion}`);
    
    const migrations = getMigrationFiles();
    const applied = migrations.filter(m => m.version > targetVersion).reverse();
    
    for (const migration of applied) {
        try {
            const migrationModule = require(migration.path);
            if (typeof migrationModule.down === 'function') {
                await migrationModule.down(supabase);
            }
            
            await supabase.from(MIGRATIONS_TABLE)
                .delete()
                .eq('version', migration.version);
            
            console.log(`✅ Rolled back: ${migration.version}`);
        } catch (error) {
            console.error(`❌ Rollback failed: ${migration.version}`, error.message);
            throw error;
        }
    }
}

/**
 * Get migration status
 */
async function getMigrationStatus() {
    const currentVersion = await getCurrentVersion();
    const migrations = getMigrationFiles();
    
    const applied = migrations.filter(m => !currentVersion || m.version <= currentVersion);
    const pending = migrations.filter(m => currentVersion && m.version > currentVersion);
    
    return {
        currentVersion,
        totalMigrations: migrations.length,
        applied: applied.length,
        pending: pending.length,
        pendingMigrations: pending
    };
}

/**
 * Model Repository - Base class for data access
 */
class Repository {
    constructor(tableName) {
        this.tableName = tableName;
    }
    
    async findById(id) {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return data;
    }
    
    async findAll(filters = {}, options = {}) {
        let query = supabase.from(this.tableName).select('*', { count: options.count });
        
        if (filters.where) {
            Object.entries(filters.where).forEach(([key, value]) => {
                query = query.eq(key, value);
            });
        }
        
        if (options.orderBy) {
            const [column, direction = 'asc'] = options.orderBy.split(':');
            query = query.order(column, { ascending: direction === 'asc' });
        }
        
        if (options.limit) {
            query = query.limit(options.limit);
        }
        
        if (options.offset) {
            query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
        }
        
        const result = await query;
        if (result.error) throw result.error;
        
        return {
            data: result.data,
            count: result.count
        };
    }
    
    async create(data) {
        const { data: result, error } = await supabase
            .from(this.tableName)
            .insert(data)
            .select()
            .single();
        
        if (error) throw error;
        return result;
    }
    
    async update(id, data) {
        const { data: result, error } = await supabase
            .from(this.tableName)
            .update(data)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return result;
    }
    
    async delete(id) {
        const { error } = await supabase
            .from(this.tableName)
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return true;
    }
    
    async count(filters = {}) {
        let query = supabase.from(this.tableName).select('*', { count: 'exact', head: true });
        
        if (filters.where) {
            Object.entries(filters.where).forEach(([key, value]) => {
                query = query.eq(key, value);
            });
        }
        
        const { count, error } = await query;
        if (error) throw error;
        return count;
    }
}

/**
 * Model Base Class
 */
class Model {
    constructor(data = {}) {
        Object.assign(this, data);
    }
    
    static get repository() {
        return new Repository(this.tableName);
    }
    
    static findById(id) {
        return this.repository.findById(id);
    }
    
    static findAll(filters, options) {
        return this.repository.findAll(filters, options);
    }
    
    static create(data) {
        return this.repository.create(data);
    }
    
    async save() {
        if (this.id) {
            return this.constructor.repository.update(this.id, this);
        }
        return this.constructor.repository.create(this);
    }
    
    async delete() {
        return this.constructor.repository.delete(this.id);
    }
}

// Export all
module.exports = {
    initSchemaManager,
    rollbackTo,
    getMigrationStatus,
    Repository,
    Model,
    MIGRATIONS_TABLE
};
