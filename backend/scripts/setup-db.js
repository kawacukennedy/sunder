/**
 * Database Setup - Instructions
 * 
 * Due to Supabase's security model, raw SQL cannot be executed via the API.
 * 
 * TO SET UP THE DATABASE:
 * 1. Go to your Supabase Dashboard
 * 2. Navigate to the SQL Editor
 * 3. Copy and paste the contents of: ../../scripts/db/schema.sql
 * 4. Run the SQL
 * 
 * OR use the Supabase CLI:
 * supabase db push
 */

require('dotenv').config();

const { supabase } = require('../src/middleware/auth');

async function checkDatabase() {
    console.log('🔍 Checking database status...\n');
    
    const requiredTables = [
        'users', 'organizations', 'snippets'
    ];
    
    let allExist = true;
    
    for (const table of requiredTables) {
        try {
            const { data, error } = await supabase
                .from(table)
                .select('*', { head: true, count: 'exact' })
                .limit(1);
            
            if (!error) {
                console.log(`  ✅ ${table} exists`);
            } else {
                console.log(`  ❌ ${table} - MISSING`);
                allExist = false;
            }
        } catch (e) {
            console.log(`  ❌ ${table} - ERROR: ${e.message}`);
            allExist = false;
        }
    }
    
    if (!allExist) {
        console.log('\n⚠️  Database tables are missing!');
        console.log('\n📋 To set up the database:');
        console.log('   1. Go to Supabase Dashboard > SQL Editor');
        console.log('   2. Copy contents from: scripts/db/schema.sql');
        console.log('   3. Run the SQL');
        console.log('\n   Or use Supabase CLI:');
        console.log('   npx supabase db push\n');
    } else {
        console.log('\n✅ Database is ready!');
    }
}

checkDatabase().then(() => process.exit(0));
