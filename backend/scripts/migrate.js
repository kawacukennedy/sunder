#!/usr/bin/env node

/**
 * Sunder ORM CLI
 * 
 * Usage:
 *   node scripts/migrate.js status     - Show migration status
 *   node scripts/migrate.js run        - Run pending migrations
 *   node scripts/migrate.js rollback   - Rollback last migration
 *   node scripts/migrate.js create     - Create new migration
 */

require('dotenv').config();
const { initSchemaManager, rollbackTo, getMigrationStatus } = require('../src/lib/schema');

const command = process.argv[2] || 'status';

async function main() {
    console.log('🔧 Sunder ORM Migration Tool\n');
    
    switch (command) {
        case 'status':
            await showStatus();
            break;
            
        case 'run':
            await runMigrations();
            break;
            
        case 'rollback':
            await rollback();
            break;
            
        case 'create':
            console.log('Usage: node scripts/migrate.js create <migration_name>');
            console.log('Example: node scripts/migrate.js create add_user_preferences');
            break;
            
        default:
            console.log('Unknown command:', command);
            console.log('Available commands: status, run, rollback, create');
            process.exit(1);
    }
    
    process.exit(0);
}

async function showStatus() {
    const status = await getMigrationStatus();
    
    console.log('Migration Status:');
    console.log('=================');
    console.log(`Current Version: ${status.currentVersion || 'none'}`);
    console.log(`Total Migrations: ${status.totalMigrations}`);
    console.log(`Applied: ${status.applied}`);
    console.log(`Pending: ${status.pending}`);
    
    if (status.pendingMigrations.length > 0) {
        console.log('\nPending Migrations:');
        status.pendingMigrations.forEach(m => {
            console.log(`  - ${m.version}: ${m.name}`);
        });
    }
}

async function runMigrations() {
    console.log('Running migrations...\n');
    await initSchemaManager();
    console.log('\n✅ Migrations complete');
}

async function rollback() {
    const status = await getMigrationStatus();
    
    if (!status.currentVersion) {
        console.log('No migrations to rollback');
        return;
    }
    
    const versions = status.currentVersion.split('.');
    const targetVersion = versions.slice(0, -1).join('.') || '0';
    
    console.log(`Rolling back to version ${targetVersion}...\n`);
    await rollbackTo(targetVersion);
    console.log('\n✅ Rollback complete');
}

main().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
