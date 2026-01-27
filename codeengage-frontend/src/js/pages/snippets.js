/**
 * Snippets Page Module
 * 
 * Displays and manages the list of snippets with search, filtering, and pagination.
 */

export class Snippets {
    constructor(app) {
        this.app = app;
        this.data = {
            snippets: [],
            total: 0,
            page: 1,
            perPage: 20,
            filters: {
                language: '',
                visibility: '',
                search: '',
                sort: 'created_at',
                order: 'desc'
            }
        };
    }

    /**
     * Initialize the snippets page
     */
    async init() {
        await this.loadSnippets();
        this.render();
        this.setupEventListeners();
    }

    /**
     * Load snippets from API
     */
    async loadSnippets() {
        try {
            const params = new URLSearchParams({
                page: this.data.page,
                per_page: this.data.perPage,
                ...this.data.filters
            });

            // Remove empty params
            for (const [key, value] of [...params]) {
                if (!value) params.delete(key);
            }

            const response = await this.app.apiClient.get(`/snippets?${params}`);
            this.data.snippets = response.data?.snippets || [];
            this.data.total = response.data?.total || 0;
        } catch (error) {
            console.error('Failed to load snippets:', error);
            this.app.showError('Failed to load snippets');
        }
    }

    /**
     * Render the snippets page
     */
    render() {
        const container = document.getElementById('app');
        if (!container) return;

        container.innerHTML = `
            <div class="snippets-page">
                <header class="page-header">
                    <h1>Explore Snippets</h1>
                    <a href="/new" class="btn btn-primary">+ New Snippet</a>
                </header>
                
                <div class="snippets-toolbar">
                    <div class="search-box">
                        <input type="search" 
                               id="search-input" 
                               placeholder="Search snippets..." 
                               value="${this.escapeHtml(this.data.filters.search)}" />
                        <button class="search-btn" id="search-btn">🔍</button>
                    </div>
                    
                    <div class="filters">
                        <select id="language-filter" class="filter-select">
                            <option value="">All Languages</option>
                            ${this.renderLanguageOptions()}
                        </select>
                        
                        <select id="visibility-filter" class="filter-select">
                            <option value="">All Visibility</option>
                            <option value="public" ${this.data.filters.visibility === 'public' ? 'selected' : ''}>Public</option>
                            <option value="private" ${this.data.filters.visibility === 'private' ? 'selected' : ''}>Private</option>
                        </select>
                        
                        <select id="sort-filter" class="filter-select">
                            <option value="created_at" ${this.data.filters.sort === 'created_at' ? 'selected' : ''}>Newest</option>
                            <option value="updated_at" ${this.data.filters.sort === 'updated_at' ? 'selected' : ''}>Recently Updated</option>
                            <option value="star_count" ${this.data.filters.sort === 'star_count' ? 'selected' : ''}>Most Stars</option>
                            <option value="view_count" ${this.data.filters.sort === 'view_count' ? 'selected' : ''}>Most Views</option>
                        </select>
                    </div>
                </div>
                
                <div class="snippets-content">
                    ${this.data.snippets.length ? this.renderSnippetList() : this.renderEmptyState()}
                </div>
                
                ${this.data.total > this.data.perPage ? this.renderPagination() : ''}
            </div>
        `;
    }

    /**
     * Render language filter options
     */
    renderLanguageOptions() {
        const languages = [
            'javascript', 'python', 'php', 'java', 'typescript',
            'go', 'rust', 'ruby', 'c', 'cpp', 'csharp', 'swift',
            'kotlin', 'sql', 'html', 'css', 'bash', 'json', 'yaml'
        ];

        return languages.map(lang =>
            `<option value="${lang}" ${this.data.filters.language === lang ? 'selected' : ''}>
                ${lang.charAt(0).toUpperCase() + lang.slice(1)}
            </option>`
        ).join('');
    }

    /**
     * Render snippet list
     */
    renderSnippetList() {
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
            <article class="snippet-card" data-id="${snippet.id}">
                <header class="snippet-card-header">
                    <h3 class="snippet-title">
                        <a href="/snippet/${snippet.id}">${this.escapeHtml(snippet.title)}</a>
                    </h3>
                    <span class="visibility-badge ${snippet.visibility}">
                        ${snippet.visibility === 'public' ? '🌐' : '🔒'} ${snippet.visibility}
                    </span>
                </header>
                
                <p class="snippet-description">
                    ${this.escapeHtml(this.truncate(snippet.description || 'No description', 100))}
                </p>
                
                <div class="snippet-preview">
                    <pre><code class="language-${snippet.language}">${this.escapeHtml(this.truncate(snippet.code || '', 150))}</code></pre>
                </div>
                
                <footer class="snippet-card-footer">
                    <div class="snippet-meta">
                        <span class="language-tag">${this.escapeHtml(snippet.language)}</span>
                        <span class="author">by ${this.escapeHtml(snippet.author?.username || 'Unknown')}</span>
                    </div>
                    <div class="snippet-stats">
                        <span class="stat">⭐ ${snippet.star_count || 0}</span>
                        <span class="stat">👁 ${snippet.view_count || 0}</span>
                        <span class="stat">🕐 ${this.formatTimeAgo(snippet.created_at)}</span>
                    </div>
                </footer>
            </article>
        `;
    }

    /**
     * Render empty state
     */
    renderEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <h3>No snippets found</h3>
                <p>Try adjusting your filters or create a new snippet.</p>
                <a href="/new" class="btn btn-primary">Create Snippet</a>
            </div>
        `;
    }

    /**
     * Render pagination
     */
    renderPagination() {
        const totalPages = Math.ceil(this.data.total / this.data.perPage);
        const currentPage = this.data.page;

        let pages = [];
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== '...') {
                pages.push('...');
            }
        }

        return `
            <nav class="pagination">
                <button class="page-btn prev" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">
                    ← Previous
                </button>
                
                <div class="page-numbers">
                    ${pages.map(page =>
            page === '...'
                ? '<span class="page-ellipsis">...</span>'
                : `<button class="page-btn ${page === currentPage ? 'active' : ''}" data-page="${page}">${page}</button>`
        ).join('')}
                </div>
                
                <button class="page-btn next" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">
                    Next →
                </button>
            </nav>
        `;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Search
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');

        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch(searchInput.value);
                }
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.handleSearch(searchInput?.value || '');
            });
        }

        // Filters
        ['language-filter', 'visibility-filter', 'sort-filter'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.handleFilterChange());
            }
        });

        // Pagination
        document.querySelectorAll('.pagination .page-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = parseInt(e.target.dataset.page);
                if (!isNaN(page) && page !== this.data.page) {
                    this.handlePageChange(page);
                }
            });
        });

        // Snippet card clicks
        document.querySelectorAll('.snippet-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.matches('a')) {
                    window.location.href = `/snippet/${card.dataset.id}`;
                }
            });
        });
    }

    /**
     * Handle search
     */
    async handleSearch(query) {
        this.data.filters.search = query;
        this.data.page = 1;
        await this.loadSnippets();
        this.render();
        this.setupEventListeners();
    }

    /**
     * Handle filter change
     */
    async handleFilterChange() {
        this.data.filters.language = document.getElementById('language-filter')?.value || '';
        this.data.filters.visibility = document.getElementById('visibility-filter')?.value || '';
        this.data.filters.sort = document.getElementById('sort-filter')?.value || 'created_at';
        this.data.page = 1;

        await this.loadSnippets();
        this.render();
        this.setupEventListeners();
    }

    /**
     * Handle page change
     */
    async handlePageChange(page) {
        this.data.page = page;
        await this.loadSnippets();
        this.render();
        this.setupEventListeners();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Truncate text
     */
    truncate(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    /**
     * Format time ago
     */
    formatTimeAgo(dateString) {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        const seconds = Math.floor((new Date() - date) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
        if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
        if (seconds < 604800) return Math.floor(seconds / 86400) + 'd ago';
        return date.toLocaleDateString();
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
}

export default Snippets;