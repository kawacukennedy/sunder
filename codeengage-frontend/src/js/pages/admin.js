/**
 * Admin Page Module
 * 
 * Handles admin dashboard with user management, system stats, and moderation.
 */

export class Admin {
    constructor(app) {
        this.app = app;
        this.data = {
            stats: null,
            users: [],
            snippets: [],
            reports: [],
            auditLogs: []
        };
        this.currentSection = 'overview';
    }

    /**
     * Initialize the admin page
     */
    async init() {
        // Check admin access
        if (!this.checkAdminAccess()) {
            this.app.showError('Access denied. Admin privileges required.');
            window.location.href = '/dashboard';
            return;
        }

        await this.loadAdminData();
        this.render();
        this.setupEventListeners();
    }

    /**
     * Check if current user has admin access
     */
    checkAdminAccess() {
        const user = this.app.currentUser;
        return user && (user.role === 'admin' || user.role === 'super_admin');
    }

    /**
     * Load admin dashboard data
     */
    async loadAdminData() {
        try {
            const [statsRes, usersRes, reportsRes, logsRes] = await Promise.all([
                this.app.apiClient.get('/admin/stats'),
                this.app.apiClient.get('/admin/users?limit=20'),
                this.app.apiClient.get('/admin/reports?status=pending'),
                this.app.apiClient.get('/admin/audit-logs?limit=50')
            ]);

            this.data.stats = statsRes.data;
            this.data.users = usersRes.data?.users || [];
            this.data.reports = reportsRes.data?.reports || [];
            this.data.auditLogs = logsRes.data?.logs || [];
        } catch (error) {
            console.error('Failed to load admin data:', error);
            this.app.showError('Failed to load admin data');
        }
    }

    /**
     * Render the admin page
     */
    render() {
        const container = document.getElementById('app');
        if (!container) return;

        container.innerHTML = `
            <div class="admin-container">
                <aside class="admin-sidebar">
                    <h2><i class="icon-shield"></i> Admin Panel</h2>
                    <nav class="admin-nav">
                        <button class="nav-btn active" data-section="overview">
                            <i class="icon-dashboard"></i> Overview
                        </button>
                        <button class="nav-btn" data-section="users">
                            <i class="icon-users"></i> Users
                        </button>
                        <button class="nav-btn" data-section="snippets">
                            <i class="icon-code"></i> Snippets
                        </button>
                        <button class="nav-btn" data-section="reports">
                            <i class="icon-flag"></i> Reports
                            ${this.data.reports.length ? `<span class="badge">${this.data.reports.length}</span>` : ''}
                        </button>
                        <button class="nav-btn" data-section="audit">
                            <i class="icon-log"></i> Audit Log
                        </button>
                        <button class="nav-btn" data-section="settings">
                            <i class="icon-settings"></i> Settings
                        </button>
                    </nav>
                </aside>
                
                <main class="admin-main">
                    <div id="admin-content">
                        ${this.renderSection(this.currentSection)}
                    </div>
                </main>
            </div>
        `;
    }

    /**
     * Render specific section content
     */
    renderSection(section) {
        switch (section) {
            case 'overview': return this.renderOverview();
            case 'users': return this.renderUsersSection();
            case 'snippets': return this.renderSnippetsSection();
            case 'reports': return this.renderReportsSection();
            case 'audit': return this.renderAuditSection();
            case 'settings': return this.renderSettingsSection();
            default: return this.renderOverview();
        }
    }

    /**
     * Render overview dashboard
     */
    renderOverview() {
        const stats = this.data.stats || {};

        return `
            <h1>Dashboard Overview</h1>
            
            <div class="stats-cards">
                <div class="stat-card">
                    <i class="icon-users"></i>
                    <div class="stat-info">
                        <span class="stat-value">${stats.total_users || 0}</span>
                        <span class="stat-label">Total Users</span>
                    </div>
                    <span class="stat-change positive">+${stats.new_users_today || 0} today</span>
                </div>
                
                <div class="stat-card">
                    <i class="icon-code"></i>
                    <div class="stat-info">
                        <span class="stat-value">${stats.total_snippets || 0}</span>
                        <span class="stat-label">Total Snippets</span>
                    </div>
                    <span class="stat-change positive">+${stats.new_snippets_today || 0} today</span>
                </div>
                
                <div class="stat-card">
                    <i class="icon-views"></i>
                    <div class="stat-info">
                        <span class="stat-value">${this.formatNumber(stats.total_views || 0)}</span>
                        <span class="stat-label">Total Views</span>
                    </div>
                </div>
                
                <div class="stat-card">
                    <i class="icon-activity"></i>
                    <div class="stat-info">
                        <span class="stat-value">${stats.active_users_24h || 0}</span>
                        <span class="stat-label">Active Users (24h)</span>
                    </div>
                </div>
            </div>
            
            <div class="admin-grid">
                <div class="admin-card">
                    <h3>Recent Activity</h3>
                    ${this.renderRecentActivity()}
                </div>
                
                <div class="admin-card">
                    <h3>Pending Reports</h3>
                    ${this.renderPendingReports()}
                </div>
            </div>
            
            <div class="admin-card">
                <h3>System Health</h3>
                ${this.renderSystemHealth(stats.system || {})}
            </div>
        `;
    }

    /**
     * Render recent activity
     */
    renderRecentActivity() {
        const logs = this.data.auditLogs.slice(0, 10);

        if (!logs.length) {
            return '<p class="empty-state">No recent activity</p>';
        }

        return `
            <ul class="activity-list">
                ${logs.map(log => `
                    <li class="activity-item">
                        <span class="activity-action ${log.action_type}">${this.escapeHtml(log.action_type)}</span>
                        <span class="activity-details">${this.escapeHtml(log.description)}</span>
                        <span class="activity-time">${this.formatTimeAgo(log.created_at)}</span>
                    </li>
                `).join('')}
            </ul>
        `;
    }

    /**
     * Render pending reports
     */
    renderPendingReports() {
        if (!this.data.reports.length) {
            return '<p class="empty-state">No pending reports</p>';
        }

        return `
            <ul class="reports-list">
                ${this.data.reports.slice(0, 5).map(report => `
                    <li class="report-item">
                        <span class="report-type">${this.escapeHtml(report.type)}</span>
                        <span class="report-reason">${this.escapeHtml(report.reason)}</span>
                        <button class="btn btn-sm" data-action="review-report" data-id="${report.id}">Review</button>
                    </li>
                `).join('')}
            </ul>
            ${this.data.reports.length > 5 ? `<a href="#" class="view-all" data-section="reports">View all reports</a>` : ''}
        `;
    }

    /**
     * Render system health
     */
    renderSystemHealth(system) {
        return `
            <div class="health-grid">
                <div class="health-item ${system.database_status === 'healthy' ? 'good' : 'bad'}">
                    <span class="health-label">Database</span>
                    <span class="health-status">${system.database_status || 'Unknown'}</span>
                </div>
                <div class="health-item ${system.cache_status === 'healthy' ? 'good' : 'bad'}">
                    <span class="health-label">Cache</span>
                    <span class="health-status">${system.cache_status || 'Unknown'}</span>
                </div>
                <div class="health-item">
                    <span class="health-label">Disk Usage</span>
                    <span class="health-status">${system.disk_usage || 'N/A'}</span>
                </div>
                <div class="health-item">
                    <span class="health-label">Memory</span>
                    <span class="health-status">${system.memory_usage || 'N/A'}</span>
                </div>
            </div>
        `;
    }

    /**
     * Render users management section
     */
    renderUsersSection() {
        return `
            <h1>User Management</h1>
            
            <div class="admin-toolbar">
                <input type="search" id="user-search" placeholder="Search users..." />
                <select id="user-filter">
                    <option value="">All Users</option>
                    <option value="admin">Admins</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                </select>
            </div>
            
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Joined</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.data.users.map(user => `
                        <tr data-user-id="${user.id}">
                            <td>
                                <div class="user-cell">
                                    <img src="${this.escapeHtml(user.avatar_url || '')}" alt="" class="avatar-sm" />
                                    <span>${this.escapeHtml(user.username)}</span>
                                </div>
                            </td>
                            <td>${this.escapeHtml(user.email)}</td>
                            <td><span class="role-badge ${user.role}">${user.role}</span></td>
                            <td>${this.formatDate(user.created_at)}</td>
                            <td>
                                <span class="status-badge ${user.deleted_at ? 'suspended' : 'active'}">
                                    ${user.deleted_at ? 'Suspended' : 'Active'}
                                </span>
                            </td>
                            <td>
                                <div class="action-btns">
                                    <button class="btn btn-sm" data-action="view-user" data-id="${user.id}">View</button>
                                    <button class="btn btn-sm btn-warning" data-action="edit-user" data-id="${user.id}">Edit</button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    /**
     * Render snippets management section
     */
    renderSnippetsSection() {
        return `
            <h1>Snippet Management</h1>
            
            <div class="admin-toolbar">
                <input type="search" id="snippet-search" placeholder="Search snippets..." />
                <select id="snippet-filter">
                    <option value="">All Snippets</option>
                    <option value="reported">Reported</option>
                    <option value="flagged">Flagged</option>
                </select>
            </div>
            
            <div class="snippets-list" id="admin-snippets-list">
                <p class="empty-state">Use the search to find snippets</p>
            </div>
        `;
    }

    /**
     * Render reports section
     */
    renderReportsSection() {
        return `
            <h1>Content Reports</h1>
            
            <div class="reports-tabs">
                <button class="tab-btn active" data-filter="pending">Pending</button>
                <button class="tab-btn" data-filter="resolved">Resolved</button>
                <button class="tab-btn" data-filter="dismissed">Dismissed</button>
            </div>
            
            <div class="reports-list" id="reports-container">
                ${this.data.reports.length ? this.data.reports.map(report => `
                    <div class="report-card" data-report-id="${report.id}">
                        <div class="report-header">
                            <span class="report-type ${report.type}">${this.escapeHtml(report.type)}</span>
                            <span class="report-date">${this.formatDate(report.created_at)}</span>
                        </div>
                        <div class="report-content">
                            <p><strong>Reported Item:</strong> ${this.escapeHtml(report.target_type)} #${report.target_id}</p>
                            <p><strong>Reason:</strong> ${this.escapeHtml(report.reason)}</p>
                            <p><strong>Details:</strong> ${this.escapeHtml(report.details || 'No additional details')}</p>
                        </div>
                        <div class="report-actions">
                            <button class="btn btn-danger" data-action="action-report" data-id="${report.id}" data-type="delete">Delete Content</button>
                            <button class="btn btn-warning" data-action="action-report" data-id="${report.id}" data-type="warn">Warn User</button>
                            <button class="btn btn-secondary" data-action="action-report" data-id="${report.id}" data-type="dismiss">Dismiss</button>
                        </div>
                    </div>
                `).join('') : '<p class="empty-state">No pending reports</p>'}
            </div>
        `;
    }

    /**
     * Render audit log section
     */
    renderAuditSection() {
        return `
            <h1>Audit Log</h1>
            
            <div class="admin-toolbar">
                <input type="date" id="audit-date-from" />
                <input type="date" id="audit-date-to" />
                <select id="audit-action-filter">
                    <option value="">All Actions</option>
                    <option value="create">Create</option>
                    <option value="update">Update</option>
                    <option value="delete">Delete</option>
                    <option value="login">Login</option>
                </select>
                <button class="btn" id="export-audit">Export</button>
            </div>
            
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>User</th>
                        <th>Action</th>
                        <th>Description</th>
                        <th>IP Address</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.data.auditLogs.map(log => `
                        <tr>
                            <td>${this.formatDateTime(log.created_at)}</td>
                            <td>${this.escapeHtml(log.user?.username || 'System')}</td>
                            <td><span class="action-badge ${log.action_type}">${log.action_type}</span></td>
                            <td>${this.escapeHtml(log.description)}</td>
                            <td>${this.escapeHtml(log.ip_address || 'N/A')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    /**
     * Render settings section
     */
    renderSettingsSection() {
        return `
            <h1>System Settings</h1>
            
            <form id="admin-settings-form" class="settings-form">
                <section class="settings-section">
                    <h3>General</h3>
                    
                    <div class="form-group">
                        <label for="site_name">Site Name</label>
                        <input type="text" id="site_name" name="site_name" value="CodeEngage" />
                    </div>
                    
                    <div class="form-group checkbox-group">
                        <label>
                            <input type="checkbox" name="maintenance_mode" />
                            Maintenance Mode
                        </label>
                    </div>
                    
                    <div class="form-group checkbox-group">
                        <label>
                            <input type="checkbox" name="registration_enabled" checked />
                            Allow New Registrations
                        </label>
                    </div>
                </section>
                
                <section class="settings-section">
                    <h3>Limits</h3>
                    
                    <div class="form-group">
                        <label for="max_snippet_size">Max Snippet Size (KB)</label>
                        <input type="number" id="max_snippet_size" name="max_snippet_size" value="1024" />
                    </div>
                    
                    <div class="form-group">
                        <label for="rate_limit">API Rate Limit (requests/hour)</label>
                        <input type="number" id="rate_limit" name="rate_limit" value="1000" />
                    </div>
                </section>
                
                <section class="settings-section">
                    <h3>Cache Management</h3>
                    <p class="text-gray-400 text-sm mb-4">Manage application cache to free up space or resolve sync issues.</p>
                    
                    <div class="flex space-x-4">
                        <button type="button" class="btn btn-warning" id="clear-cache-btn">
                            <i class="icon-refresh"></i> Clear System Cache
                        </button>
                    </div>
                </section>

                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Save Settings</button>
                </div>
            </form>
        `;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.admin-nav .nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.switchSection(section);
            });
        });

        // Delegate action buttons
        document.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (action) {
                this.handleAction(action, e.target.dataset);
            }
        });
    }

    /**
     * Switch admin section
     */
    switchSection(section) {
        this.currentSection = section;

        // Update nav buttons
        document.querySelectorAll('.admin-nav .nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.section === section);
        });

        // Render new section
        const content = document.getElementById('admin-content');
        if (content) {
            content.innerHTML = this.renderSection(section);

            if (section === 'settings') {
                const clearCacheBtn = document.getElementById('clear-cache-btn');
                if (clearCacheBtn) {
                    clearCacheBtn.addEventListener('click', async () => {
                        if (confirm('Are you sure you want to clear the system cache? This may temporarily impact performance.')) {
                            try {
                                await this.app.apiClient.post('/admin/maintenance/clear-cache');
                                this.app.showSuccess('System cache cleared successfully');
                            } catch (e) {
                                this.app.showError('Failed to clear cache');
                            }
                        }
                    });
                }

                // Form handler
                const form = document.getElementById('admin-settings-form');
                if (form) {
                    form.addEventListener('submit', (e) => {
                        e.preventDefault();
                        this.saveSettings(new FormData(form));
                    });
                }
            }
        }
    }

    /**
     * Handle action buttons
     */
    async handleAction(action, data) {
        switch (action) {
            case 'view-user':
                window.location.href = `/admin/user/${data.id}`;
                break;
            case 'edit-user':
                this.openUserEditModal(data.id);
                break;
            case 'review-report':
                this.openReportModal(data.id);
                break;
            case 'action-report':
                await this.processReport(data.id, data.type);
                break;
            default:
                console.log('Unknown action:', action);
        }
    }

    /**
     * Process a report action
     */
    async processReport(reportId, actionType) {
        try {
            await this.app.apiClient.post(`/admin/report-action/${reportId}`, { action: actionType });
            this.app.showSuccess(`Report ${actionType} successfully`);
            await this.loadAdminData();
            this.switchSection('reports');
        } catch (error) {
            console.error('Failed to process report:', error);
            this.app.showError('Failed to process report');
        }
    }

    /**
     * Format large numbers
     */
    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    /**
     * Format date
     */
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    }

    /**
     * Format date time
     */
    formatDateTime(dateString) {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    }

    /**
     * Format time ago
     */
    formatTimeAgo(dateString) {
        if (!dateString) return 'N/A';
        const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
        if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
        return Math.floor(seconds / 86400) + 'd ago';
    }

    /**
     * Escape HTML
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Placeholder methods for modals
     */
    async openUserEditModal(userId) {
        try {
            const response = await this.app.apiClient.get(`/admin/users/${userId}`);
            const user = response.data;

            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
            modal.innerHTML = `
                <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700 shadow-2xl">
                    <h3 class="text-xl font-bold text-white mb-4">Edit User: ${this.escapeHtml(user.username)}</h3>
                    <form id="edit-user-form" class="space-y-4">
                        <div>
                            <label class="block text-gray-400 text-sm mb-1">Role</label>
                            <select name="role" class="w-full bg-gray-700 text-white rounded p-2 border border-gray-600">
                                <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
                                <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-gray-400 text-sm mb-1">Status</label>
                            <select name="status" class="w-full bg-gray-700 text-white rounded p-2 border border-gray-600">
                                <option value="active" ${!user.deleted_at ? 'selected' : ''}>Active</option>
                                <option value="suspended" ${user.deleted_at ? 'selected' : ''}>Suspended</option>
                            </select>
                        </div>
                        <div class="flex justify-end space-x-3 mt-6">
                            <button type="button" class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500" onclick="this.closest('.fixed').remove()">Cancel</button>
                            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500">Save Changes</button>
                        </div>
                    </form>
                </div>
            `;

            document.body.appendChild(modal);

            modal.querySelector('form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const updates = Object.fromEntries(formData.entries());

                try {
                    await this.app.apiClient.put(`/admin/users/${userId}`, updates);
                    this.app.showSuccess('User updated');
                    modal.remove();
                    this.loadAdminData(); // Refresh list
                    this.render(); // Re-render
                } catch (err) {
                    this.app.showError('Failed to update user');
                }
            });

        } catch (error) {
            this.app.showError('Failed to load user details');
        }
    }

    openReportModal(reportId) {
        const report = this.data.reports.find(r => r.id == reportId);
        if (!report) return;

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 max-w-lg w-full border border-gray-700 shadow-2xl">
                <h3 class="text-xl font-bold text-white mb-4">Review Report #${report.id}</h3>
                <div class="space-y-3 mb-6">
                    <p class="text-gray-300"><span class="text-gray-500">Type:</span> ${this.escapeHtml(report.type)}</p>
                    <p class="text-gray-300"><span class="text-gray-500">Reason:</span> ${this.escapeHtml(report.reason)}</p>
                    <div class="bg-gray-900 p-3 rounded">
                        <p class="text-sm text-gray-400">${this.escapeHtml(report.details || 'No details')}</p>
                    </div>
                </div>
                
                <h4 class="font-medium text-white mb-2">Actions</h4>
                <div class="grid grid-cols-2 gap-3">
                    <button class="flex items-center justify-center px-3 py-2 bg-red-900 text-red-100 rounded hover:bg-red-800" onclick="window.adminPage.dismissModalAndAction(${report.id}, 'delete')">
                        🗑 Delete Content
                    </button>
                    <button class="flex items-center justify-center px-3 py-2 bg-yellow-900 text-yellow-100 rounded hover:bg-yellow-800" onclick="window.adminPage.dismissModalAndAction(${report.id}, 'warn')">
                        ⚠️ Warn User
                    </button>
                    <button class="flex items-center justify-center px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 col-span-2" onclick="window.adminPage.dismissModalAndAction(${report.id}, 'dismiss')">
                        Dismiss Report
                    </button>
                </div>
                 <button class="w-full mt-4 text-gray-500 hover:text-white" onclick="this.closest('.fixed').remove()">Close</button>
            </div>
        `;

        // Expose helper to window for inline onclicks (simple pattern)
        window.adminPage = this;
        this.dismissModalAndAction = async (id, action) => {
            modal.remove();
            await this.processReport(id, action);
        };

        document.body.appendChild(modal);
    }
}

export default Admin;
