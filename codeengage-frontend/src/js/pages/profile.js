/**
 * Profile Page Module
 * 
 * Handles user profile display, settings, and achievement management.
 */

import Navigation from '../modules/components/navigation.js';

export class Profile {
    constructor(app) {
        this.app = app;
        this.nav = new Navigation('/profile');
        this.data = {
            user: null,
            snippets: [],
            achievements: [],
            stats: null
        };
    }

    /**
     * Initialize the profile page
     */
    async init() {
        await this.loadProfileData();
        this.render();
        this.setupEventListeners();
    }

    /**
     * Load profile data from API
     */
    async loadProfileData() {
        try {
            const [userResponse, snippetsResponse, achievementsResponse, statsResponse] = await Promise.all([
                this.app.apiClient.get('/users/me'),
                this.app.apiClient.get('/users/me/snippets'),
                this.app.apiClient.get('/users/me/achievements'),
                this.app.apiClient.get('/users/me/stats')
            ]);

            this.data.user = userResponse.data;

            // Handle snippets response (robust check for array vs object)
            console.log('Profile Snippets Response:', snippetsResponse);
            if (Array.isArray(snippetsResponse.data)) {
                this.data.snippets = snippetsResponse.data;
            } else {
                this.data.snippets = snippetsResponse.data?.snippets || [];
            }

            this.data.achievements = achievementsResponse.data?.achievements || [];
            this.data.stats = statsResponse.data;
        } catch (error) {
            console.error('Failed to load profile data:', error);
            this.app.showError('Failed to load profile');
        }
    }

    async deleteSnippet(id, event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (!confirm('Are you sure you want to delete this snippet? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await this.app.apiClient.delete(`/snippets/${id}`);
            if (response.success) {
                this.app.showSuccess('Snippet deleted successfully');
                // Remove from local data and re-render
                this.data.snippets = this.data.snippets.filter(s => s.id !== id);
                this.render(); // Re-render to update list and empty state
            } else {
                this.app.showError(response.message || 'Failed to delete snippet');
            }
        } catch (error) {
            console.error('Delete error:', error);
            this.app.showError('Failed to delete snippet');
        }
    }

    /**
     * Render the profile page
     */
    render() {
        const container = document.getElementById('app');
        if (!container) return;

        container.innerHTML = `
            ${this.nav.render()}
            <div class="profile-container">
                <div class="profile-header">
                    <div class="container mx-auto flex justify-between items-center mb-6 pt-4">
                        <a href="/dashboard" class="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            Back to Dashboard
                        </a>
                    </div>
                    ${this.renderProfileHeader()}
                </div>
                
                <div class="profile-content">
                    <div class="profile-sidebar">
                        ${this.renderProfileSidebar()}
                    </div>
                    
                    <div class="profile-main">
                        <div class="profile-tabs">
                            <button class="tab-btn active" data-tab="snippets">My Snippets</button>
                            <button class="tab-btn" data-tab="achievements">Achievements</button>
                            <button class="tab-btn" data-tab="settings">Settings</button>
                        </div>
                        
                        <div class="tab-content" id="snippets-tab">
                            ${this.renderSnippetsTab()}
                        </div>
                        
                        <div class="tab-content hidden" id="achievements-tab">
                            ${this.renderAchievementsTab()}
                        </div>
                        
                        <div class="tab-content hidden" id="settings-tab">
                            ${this.renderSettingsTab()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render profile header with user info
     */
    /**
     * Render profile header with user info
     */
    renderProfileHeader() {
        const user = this.data.user || {};
        const avatarUrl = user.avatar_url || this.generateDefaultAvatar(user.username);

        return `
            <div class="flex flex-col md:flex-row items-center md:items-start gap-8 animate-fade-in">
                <div class="relative group">
                    <div class="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-neon-blue to-neon-purple">
                        <img src="${this.escapeHtml(avatarUrl)}" 
                             alt="${this.escapeHtml(user.display_name || user.username)}" 
                             class="w-full h-full rounded-full object-cover border-4 border-gray-900 bg-gray-800" />
                    </div>
                </div>
                
                <div class="flex-1 text-center md:text-left space-y-3">
                    <div>
                        <h1 class="text-4xl md:text-5xl font-black text-white tracking-tight mb-1">
                            ${this.escapeHtml(user.display_name || user.username)}
                        </h1>
                        <p class="text-xl font-medium text-neon-blue font-mono">
                            @${this.escapeHtml(user.username)}
                        </p>
                    </div>
                    
                    ${user.bio ? `
                        <p class="text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto md:mx-0 font-light border-l-2 border-gray-700 pl-4">
                            ${this.escapeHtml(user.bio)}
                        </p>
                    ` : ''}
                    
                    <div class="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm font-medium text-gray-400 pt-2">
                        <span class="flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700/50">
                            <i class="ph ph-calendar-blank text-neon-purple text-lg"></i> 
                            Joined ${this.formatDate(user.created_at)}
                        </span>
                        <span class="flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700/50">
                            <i class="ph ph-trophy text-yellow-400 text-lg"></i> 
                            ${user.achievement_points || 0} points
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render profile sidebar with stats
     */
    renderProfileSidebar() {
        const stats = this.data.stats || {};

        return `
            <div class="space-y-6">
                <!-- Stats Card -->
                <div class="glass-panel p-6 rounded-2xl border border-gray-700/50 relative overflow-hidden group">
                    <div class="absolute inset-0 bg-gradient-to-br from-neon-blue/5 to-neon-purple/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <h3 class="text-lg font-bold text-white mb-5 flex items-center gap-2">
                        <i class="ph ph-chart-bar text-neon-blue"></i>
                        Statistics
                    </h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="p-3 rounded-xl bg-gray-800/50 border border-gray-700/30 text-center">
                            <span class="block text-2xl font-black text-white mb-1 font-mono">${stats.snippet_count || 0}</span>
                            <span class="text-xs font-medium text-gray-400 uppercase tracking-wider">Snippets</span>
                        </div>
                        <div class="p-3 rounded-xl bg-gray-800/50 border border-gray-700/30 text-center">
                            <span class="block text-2xl font-black text-white mb-1 font-mono">${stats.total_stars || 0}</span>
                            <span class="text-xs font-medium text-gray-400 uppercase tracking-wider">Stars</span>
                        </div>
                        <div class="p-3 rounded-xl bg-gray-800/50 border border-gray-700/30 text-center">
                            <span class="block text-2xl font-black text-white mb-1 font-mono">${stats.total_forks || 0}</span>
                            <span class="text-xs font-medium text-gray-400 uppercase tracking-wider">Forks</span>
                        </div>
                        <div class="p-3 rounded-xl bg-gray-800/50 border border-gray-700/30 text-center">
                            <span class="block text-2xl font-black text-white mb-1 font-mono">${stats.total_views || 0}</span>
                            <span class="text-xs font-medium text-gray-400 uppercase tracking-wider">Views</span>
                        </div>
                    </div>
                </div>
                
                <!-- Languages Card -->
                <div class="glass-panel p-6 rounded-2xl border border-gray-700/50">
                    <h3 class="text-lg font-bold text-white mb-5 flex items-center gap-2">
                        <i class="ph ph-code text-neon-purple"></i>
                        Top Languages
                    </h3>
                    ${this.renderTopLanguages(stats.languages || [])}
                </div>
            </div>
        `;
    }

    /**
     * Render top programming languages
     */
    renderTopLanguages(languages) {
        if (!languages.length) {
            return '<p class="empty-state">No snippets yet</p>';
        }

        return `
            <ul class="language-list">
                ${languages.slice(0, 5).map(lang => `
                    <li>
                        <span class="language-name">${this.escapeHtml(lang.name)}</span>
                        <span class="language-count">${lang.count}</span>
                    </li>
                `).join('')}
            </ul>
        `;
    }

    /**
     * Render snippets tab content
     */
    /**
     * Render snippets tab content
     */
    renderSnippetsTab() {
        if (!this.data.snippets.length) {
            return `
                <div class="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                    <div class="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center mb-6">
                        <i class="ph ph-code text-neon-blue text-3xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-white mb-2">No snippets yet</h3>
                    <p class="text-gray-400 max-w-md mx-auto mb-8">Start creating code snippets to share with the community and track your progress.</p>
                    <a href="/new" class="px-6 py-3 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold shadow-neon hover:opacity-90 transition-all flex items-center gap-2">
                        <i class="ph ph-plus"></i> Create Snippet
                    </a>
                </div>
            `;
        }

        return `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slideUp">
                ${this.data.snippets.map(snippet => this.renderSnippetCard(snippet)).join('')}
            </div>
        `;
    }

    /**
     * Render individual snippet card
     */
    renderSnippetCard(snippet) {
        return `
            <div class="glass-panel group hover:border-gray-600 transition-all duration-300 cursor-pointer relative overflow-hidden" data-id="${snippet.id}">
                <div class="absolute inset-0 bg-gradient-to-br from-neon-blue/5 to-neon-purple/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div class="p-6 relative z-10">
                    <div class="flex justify-between items-start mb-4">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-${this.getLanguageColor(snippet.language)} border border-gray-700">
                            ${this.escapeHtml(snippet.language)}
                        </span>
                        <span class="inline-flex items-center gap-1 text-xs font-medium ${snippet.visibility === 'public' ? 'text-green-400' : 'text-gray-400'}">
                            <i class="ph ph-${snippet.visibility === 'public' ? 'globe' : 'lock'}"></i>
                            ${snippet.visibility}
                        </span>
                    </div>
                    
                    <h4 class="text-lg font-bold text-white mb-2 group-hover:text-neon-blue transition-colors line-clamp-1">
                        <a href="/snippet/${snippet.id}" class="focus:outline-none">
                            <span class="absolute inset-0"></span>
                            ${this.escapeHtml(snippet.title)}
                        </a>
                    </h4>
                    
                    <p class="text-gray-400 text-sm mb-6 line-clamp-2 h-10">
                        ${this.escapeHtml(snippet.description || 'No description provided.')}
                    </p>
                    
                    <div class="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-700/50">
                        <div class="flex items-center gap-4">
                            <span class="flex items-center gap-1.5 hover:text-yellow-400 transition-colors">
                                <i class="ph ph-star-fill text-yellow-500"></i> ${snippet.star_count || 0}
                            </span>
                            <button class="text-gray-500 hover:text-red-400 transition-colors z-20 relative p-1" 
                                    onclick="window.app.router.currentPage.deleteSnippet(${snippet.id}, event)"
                                    title="Delete Snippet">
                                <i class="ph ph-trash"></i>
                            </button>
                        </div>
                        <span class="text-xs">
                            ${this.formatDate(snippet.updated_at)}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    getLanguageColor(lang) {
        const colors = {
            javascript: 'yellow-400',
            typescript: 'blue-400',
            python: 'green-400',
            html: 'orange-400',
            css: 'blue-300',
            sql: 'purple-400'
        };
        return colors[lang.toLowerCase()] || 'gray-400';
    }

    /**
     * Render achievements tab content
     */
    renderAchievementsTab() {
        if (!this.data.achievements || !this.data.achievements.length) {
            return `
                <div class="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                    <div class="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center mb-6">
                        <i class="ph ph-trophy text-yellow-500 text-3xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-white mb-2">No achievements found</h3>
                    <p class="text-gray-400">Something went wrong loading achievements.</p>
                </div>
            `;
        }

        return `
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-slideUp">
                ${this.data.achievements.map(achievement => {
            const isUnlocked = achievement.unlocked;
            return `
                    <div class="glass-panel p-6 text-center group hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden ${isUnlocked ? 'border-yellow-500/30' : 'opacity-60 grayscale'}">
                        ${isUnlocked ? '<div class="absolute inset-0 bg-yellow-500/5 blur-xl"></div>' : ''}
                        
                        <div class="relative z-10">
                            <div class="w-16 h-16 mx-auto rounded-full bg-gray-900 border-2 ${isUnlocked ? 'border-yellow-500 shadow-lg shadow-yellow-500/20' : 'border-gray-700'} flex items-center justify-center mb-4 text-3xl relative">
                                ${achievement.icon || '🏅'}
                                ${!isUnlocked ? '<div class="absolute -bottom-1 -right-1 bg-gray-800 border border-gray-600 rounded-full p-1"><i class="ph ph-lock-key text-xs text-gray-400"></i></div>' : ''}
                            </div>
                            
                            <h4 class="font-bold text-white mb-2">${this.escapeHtml(achievement.name)}</h4>
                            <p class="text-xs text-gray-400 mb-3 h-8 line-clamp-2">${this.escapeHtml(achievement.description)}</p>
                            
                            <div class="inline-flex items-center px-2 py-1 rounded ${isUnlocked ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' : 'bg-gray-800 border-gray-700 text-gray-500'} border text-xs font-mono font-bold">
                                ${isUnlocked ? 'EARNED' : `+${achievement.points} XP`}
                            </div>
                            
                            ${isUnlocked && achievement.earned_at ? `
                            <div class="mt-3 text-[10px] text-gray-500 uppercase tracking-wider">
                                ${new Date(achievement.earned_at).toLocaleDateString()}
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    `;
        }).join('')}
            </div>
        `;
    }

    getBadgeIcon(iconName) {
        // Map common icon names to emojis or Phosphor icons
        const icons = {
            trophy: '🏆',
            star: '⭐',
            code: '💻',
            fire: '🔥',
            bug: '🐛',
            rocket: '🚀'
        };
        return icons[iconName] || '🏅';
    }

    /**
     * Render settings tab content
     */
    renderSettingsTab() {
        return `
            <div class="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                <div class="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center mb-6">
                    <i class="ph ph-gear text-gray-400 text-3xl"></i>
                </div>
                <h3 class="text-xl font-bold text-white mb-2">Manage Settings</h3>
                <p class="text-gray-400 max-w-md mx-auto mb-8">
                    Profile and account settings have moved to a dedicated page for better access.
                </p>
                <a href="/settings" class="px-6 py-3 rounded-xl bg-gray-800 text-white font-medium hover:bg-gray-700 transition-colors flex items-center gap-2">
                     Go to Settings <i class="ph ph-arrow-right"></i>
                </a>
            </div>
        `;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Settings form submission
        const settingsForm = document.getElementById('profile-settings-form');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => this.handleSettingsSubmit(e));
        }

        // Snippet card clicks
        document.querySelectorAll('.snippet-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.matches('a')) {
                    const snippetId = card.dataset.id;
                    window.location.href = `/snippet/${snippetId}`;
                }
            });
        });
    }

    /**
     * Switch between tabs
     */
    switchTab(tabName) {
        // Update button states
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update content visibility
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });

        const activeTab = document.getElementById(`${tabName}-tab`);
        if (activeTab) {
            activeTab.classList.remove('hidden');
        }
    }

    /**
     * Handle settings form submission
     */
    async handleSettingsSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);

        const data = {
            display_name: formData.get('display_name'),
            bio: formData.get('bio'),
            avatar_url: formData.get('avatar_url'),
            preferences: {
                theme: formData.get('theme'),
                editor_mode: formData.get('editor_mode'),
                email_notifications: formData.get('email_notifications') === 'on'
            }
        };

        try {
            await this.app.apiClient.put('/users/me', data);
            this.app.showSuccess('Profile updated successfully');

            // Apply theme change immediately
            if (data.preferences.theme !== this.data.user?.preferences?.theme) {
                this.app.initTheme();
            }

            // Reload profile data
            await this.loadProfileData();
        } catch (error) {
            console.error('Failed to update profile:', error);
            this.app.showError('Failed to update profile');
        }
    }

    /**
     * Generate default avatar URL
     */
    generateDefaultAvatar(username) {
        const hash = this.hashCode(username || 'user');
        return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username || 'U')}`;
    }

    /**
     * Simple hash function for avatar generation
     */
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

    /**
     * Format date string
     */
    formatDate(dateString) {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

export default Profile;
