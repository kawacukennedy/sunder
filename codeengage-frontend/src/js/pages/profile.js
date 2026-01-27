/**
 * Profile Page Module
 * 
 * Handles user profile display, settings, and achievement management.
 */

export class Profile {
    constructor(app) {
        this.app = app;
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
            this.data.snippets = snippetsResponse.data?.snippets || [];
            this.data.achievements = achievementsResponse.data?.achievements || [];
            this.data.stats = statsResponse.data;
        } catch (error) {
            console.error('Failed to load profile data:', error);
            this.app.showError('Failed to load profile');
        }
    }

    /**
     * Render the profile page
     */
    render() {
        const container = document.getElementById('app');
        if (!container) return;

        container.innerHTML = `
            <div class="profile-container">
                <div class="profile-header">
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
    renderProfileHeader() {
        const user = this.data.user || {};
        const avatarUrl = user.avatar_url || this.generateDefaultAvatar(user.username);

        return `
            <div class="profile-avatar">
                <img src="${this.escapeHtml(avatarUrl)}" alt="${this.escapeHtml(user.display_name || user.username)}" />
            </div>
            <div class="profile-info">
                <h1>${this.escapeHtml(user.display_name || user.username)}</h1>
                <p class="profile-username">@${this.escapeHtml(user.username)}</p>
                ${user.bio ? `<p class="profile-bio">${this.escapeHtml(user.bio)}</p>` : ''}
                <div class="profile-meta">
                    <span><i class="icon-calendar"></i> Joined ${this.formatDate(user.created_at)}</span>
                    <span><i class="icon-trophy"></i> ${user.achievement_points || 0} points</span>
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
            <div class="stats-card">
                <h3>Statistics</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-value">${stats.snippet_count || 0}</span>
                        <span class="stat-label">Snippets</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${stats.total_stars || 0}</span>
                        <span class="stat-label">Stars Received</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${stats.total_forks || 0}</span>
                        <span class="stat-label">Forks</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${stats.total_views || 0}</span>
                        <span class="stat-label">Views</span>
                    </div>
                </div>
            </div>
            
            <div class="languages-card">
                <h3>Top Languages</h3>
                ${this.renderTopLanguages(stats.languages || [])}
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
    renderSnippetsTab() {
        if (!this.data.snippets.length) {
            return `
                <div class="empty-state">
                    <i class="icon-code"></i>
                    <h3>No snippets yet</h3>
                    <p>Start creating code snippets to see them here.</p>
                    <a href="/new" class="btn btn-primary">Create Snippet</a>
                </div>
            `;
        }

        return `
            <div class="snippets-grid">
                ${this.data.snippets.map(snippet => this.renderSnippetCard(snippet)).join('')}
            </div>
        `;
    }

    /**
     * Render individual snippet card
     */
    renderSnippetCard(snippet) {
        return `
            <div class="snippet-card" data-id="${snippet.id}">
                <div class="snippet-header">
                    <h4><a href="/snippet/${snippet.id}">${this.escapeHtml(snippet.title)}</a></h4>
                    <span class="visibility-badge ${snippet.visibility}">${snippet.visibility}</span>
                </div>
                <p class="snippet-description">${this.escapeHtml(snippet.description || 'No description')}</p>
                <div class="snippet-meta">
                    <span class="language">${this.escapeHtml(snippet.language)}</span>
                    <span class="stars"><i class="icon-star"></i> ${snippet.star_count || 0}</span>
                    <span class="date">${this.formatDate(snippet.updated_at)}</span>
                </div>
            </div>
        `;
    }

    /**
     * Render achievements tab content
     */
    renderAchievementsTab() {
        if (!this.data.achievements.length) {
            return `
                <div class="empty-state">
                    <i class="icon-trophy"></i>
                    <h3>No achievements yet</h3>
                    <p>Keep using CodeEngage to earn achievements!</p>
                </div>
            `;
        }

        return `
            <div class="achievements-grid">
                ${this.data.achievements.map(achievement => `
                    <div class="achievement-card ${achievement.earned ? 'earned' : 'locked'}">
                        <div class="achievement-icon badge-${achievement.badge_type || 'bronze'}">
                            <i class="icon-${achievement.icon || 'trophy'}"></i>
                        </div>
                        <h4>${this.escapeHtml(achievement.badge_name)}</h4>
                        <p>${this.escapeHtml(achievement.description || '')}</p>
                        <span class="points">+${achievement.points_awarded} pts</span>
                        ${achievement.earned_at ? `<span class="earned-date">Earned ${this.formatDate(achievement.earned_at)}</span>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Render settings tab content
     */
    renderSettingsTab() {
        const user = this.data.user || {};
        const preferences = user.preferences || {};

        return `
            <form id="profile-settings-form" class="settings-form">
                <section class="settings-section">
                    <h3>Profile Information</h3>
                    
                    <div class="form-group">
                        <label for="display_name">Display Name</label>
                        <input type="text" id="display_name" name="display_name" 
                               value="${this.escapeHtml(user.display_name || '')}" 
                               placeholder="Your display name" />
                    </div>
                    
                    <div class="form-group">
                        <label for="bio">Bio</label>
                        <textarea id="bio" name="bio" rows="3" 
                                  placeholder="Tell us about yourself">${this.escapeHtml(user.bio || '')}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="avatar_url">Avatar URL</label>
                        <input type="url" id="avatar_url" name="avatar_url" 
                               value="${this.escapeHtml(user.avatar_url || '')}" 
                               placeholder="https://example.com/avatar.jpg" />
                    </div>
                </section>
                
                <section class="settings-section">
                    <h3>Preferences</h3>
                    
                    <div class="form-group">
                        <label for="theme">Theme</label>
                        <select id="theme" name="theme">
                            <option value="dark" ${preferences.theme === 'dark' ? 'selected' : ''}>Dark</option>
                            <option value="light" ${preferences.theme === 'light' ? 'selected' : ''}>Light</option>
                            <option value="system" ${preferences.theme === 'system' ? 'selected' : ''}>System</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="editor_mode">Editor Mode</label>
                        <select id="editor_mode" name="editor_mode">
                            <option value="default" ${preferences.editor_mode === 'default' ? 'selected' : ''}>Default</option>
                            <option value="vim" ${preferences.editor_mode === 'vim' ? 'selected' : ''}>Vim</option>
                            <option value="emacs" ${preferences.editor_mode === 'emacs' ? 'selected' : ''}>Emacs</option>
                        </select>
                    </div>
                    
                    <div class="form-group checkbox-group">
                        <label>
                            <input type="checkbox" name="email_notifications" 
                                   ${preferences.email_notifications ? 'checked' : ''} />
                            Email notifications
                        </label>
                    </div>
                </section>
                
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
            </form>
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
