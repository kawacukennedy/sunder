/**
 * User Model - Repository Pattern for Hibernate-like ORM
 */

const { Model, Repository } = require('../lib/schema');

class User extends Model {
    static tableName = 'users';
    
    static async findByUsername(username) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();
        
        if (error) throw error;
        return data;
    }
    
    static async findByEmail(email) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        
        if (error) throw error;
        return data;
    }
    
    static async getLeaderboard(limit = 100) {
        const { data, error } = await supabase
            .from('users')
            .select('id, username, display_name, avatar_url, achievement_points')
            .order('achievement_points', { ascending: false })
            .limit(limit);
        
        if (error) throw error;
        return data;
    }
    
    static async updateAchievementPoints(userId, points) {
        const { data, error } = await supabase.rpc('award_achievement_points', {
            user_id: userId,
            points: points
        });
        
        if (error) throw error;
        return data;
    }
}

class Snippet extends Model {
    static tableName = 'snippets';
    
    static async findByAuthor(authorId, options = {}) {
        const { data, error } = await supabase
            .from('snippets')
            .select('*')
            .eq('author_id', authorId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    }
    
    static async findPublic(language, search, limit = 20, offset = 0) {
        let query = supabase
            .from('snippets')
            .select('*', { count: 'exact' })
            .eq('visibility', 'public');
        
        if (language) {
            query = query.eq('language', language);
        }
        
        if (search) {
            query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
        }
        
        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        
        if (error) throw error;
        return { snippets: data, pagination: { total: count, limit, offset } };
    }
    
    static async star(snippetId, userId) {
        const { data, error } = await supabase
            .from('starred_snippets')
            .insert({ snippet_id: snippetId, user_id: userId })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
    
    static async unstar(snippetId, userId) {
        const { error } = await supabase
            .from('starred_snippets')
            .delete()
            .eq('snippet_id', snippetId)
            .eq('user_id', userId);
        
        if (error) throw error;
        return true;
    }
    
    static async fork(snippetId, userId) {
        const { data: original } = await supabase
            .from('snippets')
            .select('*')
            .eq('id', snippetId)
            .single();
        
        if (!original) throw new Error('Snippet not found');
        
        const { data, error } = await supabase
            .from('snippets')
            .insert({
                ...original,
                id: undefined,
                author_id: userId,
                forked_from_id: snippetId,
                fork_count: 0,
                star_count: 0,
                view_count: 0,
                created_at: undefined,
                updated_at: undefined
            })
            .select()
            .single();
        
        if (error) throw error;
        
        // Increment fork count on original
        await supabase.rpc('increment_counter', {
            table_name: 'snippets',
            row_id: snippetId,
            column_name: 'fork_count'
        }).catch(() => null);
        
        return data;
    }
}

class Organization extends Model {
    static tableName = 'organizations';
    
    static async findBySlug(slug) {
        const { data, error } = await supabase
            .from('organizations')
            .select('*, members:organization_members(*, user:users(*))')
            .eq('slug', slug)
            .single();
        
        if (error) throw error;
        return data;
    }
    
    static async addMember(orgId, userId, role = 'member') {
        const { data, error } = await supabase
            .from('organization_members')
            .insert({
                organization_id: orgId,
                user_id: userId,
                role: role
            })
            .select()
            .single();
        
        if (error) throw error;
        
        // Update member count
        await supabase.rpc('increment_counter', {
            table_name: 'organizations',
            row_id: orgId,
            column_name: 'member_count'
        }).catch(() => null);
        
        return data;
    }
    
    static async removeMember(orgId, userId) {
        const { error } = await supabase
            .from('organization_members')
            .delete()
            .eq('organization_id', orgId)
            .eq('user_id', userId);
        
        if (error) throw error;
        
        // Update member count
        await supabase.rpc('decrement_counter', {
            table_name: 'organizations',
            row_id: orgId,
            column_name: 'member_count'
        }).catch(() => null);
        
        return true;
    }
}

class LearningPath extends Model {
    static tableName = 'learning_paths';
    
    static async getAll(category) {
        let query = supabase
            .from('learning_paths')
            .select('*');
        
        if (category) {
            query = query.eq('category', category);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    }
    
    static async enroll(userId, pathId) {
        const { data, error } = await supabase
            .from('user_learning_progress')
            .insert({
                user_id: userId,
                path_id: pathId,
                progress_percent: 0
            })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
    
    static async updateProgress(userId, pathId, progress) {
        const { data, error } = await supabase
            .from('user_learning_progress')
            .update({
                progress_percent: progress,
                last_accessed_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .eq('path_id', pathId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
}

class AuditLog extends Model {
    static tableName = 'audit_logs';
    
    static async log(actionType, entityType, entityId, actorId, oldValues, newValues) {
        const { data, error } = await supabase
            .from('audit_logs')
            .insert({
                actor_id: actorId,
                action_type: actionType,
                entity_type: entityType,
                entity_id: entityId,
                old_values: oldValues,
                new_values: newValues
            })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
    
    static async getByEntity(entityType, entityId) {
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .eq('entity_type', entityType)
            .eq('entity_id', entityId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    }
    
    static async getByActor(actorId, limit = 100) {
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .eq('actor_id', actorId)
            .order('created_at', { ascending: false })
            .limit(limit);
        
        if (error) throw error;
        return data;
    }
}

// Get supabase client for model operations
const { supabase } = require('../middleware/auth');

module.exports = {
    User,
    Snippet,
    Organization,
    LearningPath,
    AuditLog
};
