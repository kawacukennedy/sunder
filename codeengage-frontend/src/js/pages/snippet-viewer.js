// Snippet Viewer Page
class SnippetViewer {
    constructor() {
        this.snippetId = null;
        this.snippet = null;
        this.currentVersion = null;
        this.isLoading = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSnippetFromUrl();
    }

    setupEventListeners() {
        // Copy code button
        const copyBtn = document.getElementById('copyCodeBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyCode());
        }

        // Download button
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadSnippet());
        }

        // Share button
        const shareBtn = document.getElementById('shareBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.shareSnippet());
        }

        // Fork button
        const forkBtn = document.getElementById('forkBtn');
        if (forkBtn) {
            forkBtn.addEventListener('click', () => this.forkSnippet());
        }

        // Star button
        const starBtn = document.getElementById('starBtn');
        if (starBtn) {
            starBtn.addEventListener('click', () => this.toggleStar());
        }

        // Run in sandbox button
        const runBtn = document.getElementById('runBtn');
        if (runBtn) {
            runBtn.addEventListener('click', () => this.runInSandbox());
        }

        // Embed button
        const embedBtn = document.getElementById('embedBtn');
        if (embedBtn) {
            embedBtn.addEventListener('click', () => this.generateEmbed());
        }

        // Version selector
        const versionSelect = document.getElementById('versionSelect');
        if (versionSelect) {
            versionSelect.addEventListener('change', (e) => this.loadVersion(e.target.value));
        }

        // Tab navigation
        const tabButtons = document.querySelectorAll('[data-tab]');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Font size controls
        const fontSizeDecrease = document.getElementById('fontSizeDecrease');
        const fontSizeIncrease = document.getElementById('fontSizeIncrease');
        if (fontSizeDecrease) {
            fontSizeDecrease.addEventListener('click', () => this.adjustFontSize(-1));
        }
        if (fontSizeIncrease) {
            fontSizeIncrease.addEventListener('click', () => this.adjustFontSize(1));
        }

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    async loadSnippetFromUrl() {
        const pathParts = window.location.pathname.split('/');
        const snippetId = pathParts[pathParts.length - 1];
        
        if (snippetId && snippetId !== 'snippet-viewer.html') {
            await this.loadSnippet(snippetId);
        }
    }

    async loadSnippet(snippetId) {
        this.setLoading(true);
        this.snippetId = snippetId;

        try {
            const response = await fetch(`/api/snippets/${snippetId}`);
            if (!response.ok) {
                throw new Error('Snippet not found');
            }

            const data = await response.json();
            this.snippet = data.snippet;
            this.currentVersion = data.versions?.[0] || null;

            this.renderSnippet();
            this.updateUI();
            
        } catch (error) {
            console.error('Failed to load snippet:', error);
            this.showError('Failed to load snippet');
        } finally {
            this.setLoading(false);
        }
    }

    async loadVersion(versionId) {
        if (!this.snippet) return;

        this.setLoading(true);
        try {
            const response = await fetch(`/api/snippets/${this.snippetId}/versions/${versionId}`);
            if (!response.ok) {
                throw new Error('Version not found');
            }

            const version = await response.json();
            this.currentVersion = version;
            this.renderCode();
            
        } catch (error) {
            console.error('Failed to load version:', error);
            this.showError('Failed to load version');
        } finally {
            this.setLoading(false);
        }
    }

    renderSnippet() {
        if (!this.snippet) return;

        // Update page title
        document.title = `${this.snippet.title} - CodeEngage`;

        // Update header info
        const titleElement = document.getElementById('snippetTitle');
        if (titleElement) {
            titleElement.textContent = this.snippet.title;
        }

        // Update visibility badge
        const visibilityBadge = document.getElementById('visibilityBadge');
        if (visibilityBadge) {
            visibilityBadge.textContent = this.snippet.visibility;
            visibilityBadge.className = `px-3 py-1 text-sm font-medium rounded ${this.getVisibilityClass(this.snippet.visibility)}`;
        }

        // Update author info
        this.renderAuthor();

        // Update code info
        this.renderCodeInfo();

        // Render code
        this.renderCode();

        // Update tabs
        this.renderTabs();

        // Update version selector
        this.renderVersionSelector();
    }

    renderAuthor() {
        const authorElement = document.getElementById('snippetAuthor');
        if (!authorElement || !this.snippet.author) return;

        const author = this.snippet.author;
        authorElement.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium">${this.getInitials(author.display_name || author.username)}</span>
                </div>
                <div class="flex-1">
                    <h4 class="text-sm font-medium text-white">${author.display_name || author.username}</h4>
                    <p class="text-xs text-gray-400">${this.formatDate(this.snippet.created_at)}</p>
                </div>
                <button class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                    Follow
                </button>
            </div>
        `;
    }

    renderCodeInfo() {
        const codeInfoElement = document.getElementById('codeInfo');
        if (!codeInfoElement) return;

        codeInfoElement.innerHTML = `
            <div class="flex items-center space-x-6 text-sm text-gray-400">
                <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                    </svg>
                    ${this.snippet.language}
                </span>
                <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                    </svg>
                    ${this.getLineCount()} lines
                </span>
                <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    ${this.formatDate(this.snippet.created_at)}
                </span>
            </div>
        `;
    }

    renderCode() {
        const codeElement = document.getElementById('snippetCode');
        if (!codeElement) return;

        const code = this.currentVersion?.code || this.snippet.code || '';
        const language = this.snippet.language;

        // Apply syntax highlighting
        const highlightedCode = this.highlightSyntax(code, language);
        
        codeElement.innerHTML = `
            <pre class="p-6 text-sm text-gray-300 font-mono leading-relaxed"><code>${highlightedCode}</code></pre>
        `;
    }

    renderTabs() {
        const infoTab = document.getElementById('infoTab');
        const versionsTab = document.getElementById('versionsTab');
        const commentsTab = document.getElementById('commentsTab');

        // Info tab content
        if (infoTab) {
            infoTab.innerHTML = `
                <div class="space-y-6">
                    <div>
                        <h4 class="text-sm font-medium text-gray-400 mb-2">Description</h4>
                        <p class="text-sm text-gray-300">${this.snippet.description || 'No description provided'}</p>
                    </div>
                    
                    <div>
                        <h4 class="text-sm font-medium text-gray-400 mb-2">Tags</h4>
                        <div class="flex flex-wrap gap-2">
                            ${this.renderTags()}
                        </div>
                    </div>
                    
                    <div>
                        <h4 class="text-sm font-medium text-gray-400 mb-2">Statistics</h4>
                        <div class="space-y-2">
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-400">Views</span>
                                <span class="text-gray-300">${this.snippet.view_count || 0}</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-400">Stars</span>
                                <span class="text-gray-300">${this.snippet.star_count || 0}</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-400">Forks</span>
                                <span class="text-gray-300">${this.snippet.fork_count || 0}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h4 class="text-sm font-medium text-gray-400 mb-2">Code Analysis</h4>
                        <div class="space-y-2">
                            ${this.renderAnalysis()}
                        </div>
                    </div>
                </div>
            `;
        }

        // Versions tab content
        if (versionsTab && this.snippet.versions) {
            versionsTab.innerHTML = `
                <div class="space-y-2">
                    ${this.snippet.versions.map(version => `
                        <div class="p-3 bg-gray-700 rounded hover:bg-gray-600 cursor-pointer" onclick="snippetViewer.loadVersion(${version.id})">
                            <div class="flex justify-between items-start">
                                <div>
                                    <p class="text-sm font-medium text-white">Version ${version.version_number}</p>
                                    <p class="text-xs text-gray-400">${this.formatDate(version.created_at)}</p>
                                    ${version.change_summary ? `<p class="text-xs text-gray-300 mt-1">${version.change_summary}</p>` : ''}
                                </div>
                                <div class="flex items-center space-x-2">
                                    <span class="text-xs text-gray-400">${version.editor?.display_name || 'Unknown'}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Comments tab (placeholder)
        if (commentsTab) {
            commentsTab.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-gray-400">Comments feature coming soon</p>
                </div>
            `;
        }
    }

    renderVersionSelector() {
        const versionSelect = document.getElementById('versionSelect');
        if (!versionSelect || !this.snippet.versions) return;

        versionSelect.innerHTML = this.snippet.versions.map(version => `
            <option value="${version.id}" ${version.id === this.currentVersion?.id ? 'selected' : ''}>
                Version ${version.version_number} - ${this.formatDate(version.created_at)}
            </option>
        `).join('');
    }

    renderTags() {
        if (!this.snippet.tags || this.snippet.tags.length === 0) {
            return '<span class="text-gray-500 text-sm">No tags</span>';
        }

        return this.snippet.tags.map(tag => `
            <span class="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">${tag.name}</span>
        `).join('');
    }

    renderAnalysis() {
        const analysis = this.currentVersion?.analysis_results;
        if (!analysis) {
            return `
                <div class="flex justify-between text-sm">
                    <span class="text-gray-400">Analysis</span>
                    <span class="text-gray-500">Not available</span>
                </div>
            `;
        }

        return `
            <div class="flex justify-between text-sm">
                <span class="text-gray-400">Complexity</span>
                <span class="${this.getComplexityClass(analysis.complexity_score)}">${this.getComplexityLabel(analysis.complexity_score)}</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-gray-400">Security</span>
                <span class="${analysis.security_issues?.length > 0 ? 'text-red-400' : 'text-green-400'}">${analysis.security_issues?.length > 0 ? 'Issues found' : 'Safe'}</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-gray-400">Performance</span>
                <span class="text-yellow-400">Good</span>
            </div>
        `;
    }

    async copyCode() {
        const code = this.currentVersion?.code || this.snippet.code || '';
        
        try {
            await navigator.clipboard.writeText(code);
            this.showNotification('Code copied to clipboard!', 'success');
        } catch (error) {
            console.error('Failed to copy code:', error);
            this.showNotification('Failed to copy code', 'error');
        }
    }

    async downloadSnippet() {
        const code = this.currentVersion?.code || this.snippet.code || '';
        const filename = `${this.snippet.title.replace(/[^a-zA-Z0-9]/g, '_')}.${this.getFileExtension()}`;
        
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Snippet downloaded!', 'success');
    }

    async shareSnippet() {
        const url = window.location.href;
        
        try {
            await navigator.clipboard.writeText(url);
            this.showNotification('Share link copied to clipboard!', 'success');
        } catch (error) {
            console.error('Failed to copy share link:', error);
            this.showNotification('Failed to copy share link', 'error');
        }
    }

    async forkSnippet() {
        if (!this.snippetId) return;

        try {
            const response = await fetch(`/api/snippets/${this.snippetId}/fork`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: `${this.snippet.title} (fork)`
                })
            });

            if (!response.ok) {
                throw new Error('Failed to fork snippet');
            }

            const forkedSnippet = await response.json();
            window.location.href = `/snippet-editor.html?id=${forkedSnippet.id}`;
            
        } catch (error) {
            console.error('Failed to fork snippet:', error);
            this.showNotification('Failed to fork snippet', 'error');
        }
    }

    async toggleStar() {
        if (!this.snippetId) return;

        try {
            const response = await fetch(`/api/snippets/${this.snippetId}/star`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error('Failed to star snippet');
            }

            const starBtn = document.getElementById('starBtn');
            if (starBtn) {
                starBtn.classList.toggle('text-yellow-400');
                starBtn.classList.toggle('text-gray-400');
            }

            this.showNotification('Snippet starred!', 'success');
            
        } catch (error) {
            console.error('Failed to star snippet:', error);
            this.showNotification('Failed to star snippet', 'error');
        }
    }

    runInSandbox() {
        const code = this.currentVersion?.code || this.snippet.code || '';
        const language = this.snippet.language;

        // Open sandbox in new window
        const sandboxUrl = `/demo-sandbox.html?language=${language}&code=${encodeURIComponent(code)}`;
        window.open(sandboxUrl, '_blank');
    }

    generateEmbed() {
        const embedCode = `<iframe src="${window.location.href}/embed" width="600" height="400" frameborder="0"></iframe>`;
        
        // Show modal with embed code
        this.showEmbedModal(embedCode);
    }

    switchTab(tabName) {
        // Update tab buttons
        const tabButtons = document.querySelectorAll('[data-tab]');
        tabButtons.forEach(button => {
            if (button.dataset.tab === tabName) {
                button.classList.add('text-white', 'border-b-2', 'border-blue-500');
                button.classList.remove('text-gray-400');
            } else {
                button.classList.remove('text-white', 'border-b-2', 'border-blue-500');
                button.classList.add('text-gray-400');
            }
        });

        // Update tab content
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.classList.add('hidden');
        });

        const activeTab = document.getElementById(`${tabName}Tab`);
        if (activeTab) {
            activeTab.classList.remove('hidden');
        }
    }

    adjustFontSize(delta) {
        const codeElement = document.querySelector('#snippetCode pre');
        if (!codeElement) return;

        const currentSize = parseInt(window.getComputedStyle(codeElement).fontSize);
        const newSize = Math.max(12, Math.min(24, currentSize + delta));
        codeElement.style.fontSize = `${newSize}px`;
    }

    toggleTheme() {
        document.body.classList.toggle('light-theme');
        const isLight = document.body.classList.contains('light-theme');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    }

    // Utility methods
    highlightSyntax(code, language) {
        // This is a simplified syntax highlighter
        // In production, you'd use a library like Prism.js or highlight.js
        return code
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"([^"]*)"/g, '<span class="token string">"$1"</span>')
            .replace(/'([^']*)'/g, '<span class="token string">\'$1\'</span>')
            .replace(/\/\/(.*)$/gm, '<span class="token comment">//$1</span>')
            .replace(/\/\*([\s\S]*?)\*\//g, '<span class="token comment">/*$1*/</span>')
            .replace(/\b(function|const|let|var|if|else|for|while|return|class|extends|import|export|from|default)\b/g, '<span class="token keyword">$1</span>')
            .replace(/\b(true|false|null|undefined)\b/g, '<span class="token boolean">$1</span>')
            .replace(/\b(\d+)\b/g, '<span class="token number">$1</span>');
    }

    getVisibilityClass(visibility) {
        const classes = {
            'public': 'bg-green-500 text-white',
            'private': 'bg-blue-500 text-white',
            'organization': 'bg-purple-500 text-white'
        };
        return classes[visibility] || 'bg-gray-500 text-white';
    }

    getComplexityClass(score) {
        if (score <= 3) return 'text-green-400';
        if (score <= 7) return 'text-yellow-400';
        return 'text-red-400';
    }

    getComplexityLabel(score) {
        if (score <= 3) return 'Low';
        if (score <= 7) return 'Medium';
        return 'High';
    }

    getFileExtension() {
        const extensions = {
            'javascript': 'js',
            'typescript': 'ts',
            'python': 'py',
            'php': 'php',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c',
            'html': 'html',
            'css': 'css',
            'sql': 'sql',
            'json': 'json',
            'xml': 'xml'
        };
        return extensions[this.snippet.language] || 'txt';
    }

    getLineCount() {
        const code = this.currentVersion?.code || this.snippet.code || '';
        return code.split('\n').length;
    }

    getInitials(name) {
        return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;
        
        return date.toLocaleDateString();
    }

    setLoading(loading) {
        this.isLoading = loading;
        const loadingElement = document.getElementById('loadingIndicator');
        if (loadingElement) {
            loadingElement.classList.toggle('hidden', !loading);
        }
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-4 py-3 rounded-lg text-white z-50 animate-fade-in ${
            type === 'success' ? 'bg-green-600' :
            type === 'error' ? 'bg-red-600' :
            'bg-blue-600'
        }`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('animate-fade-out');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    showEmbedModal(embedCode) {
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
                <h3 class="text-lg font-medium text-white mb-4">Embed Snippet</h3>
                <textarea class="w-full bg-gray-700 text-gray-200 px-3 py-2 rounded border border-gray-600" rows="4" readonly>${embedCode}</textarea>
                <div class="flex justify-end space-x-3 mt-4">
                    <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">Cancel</button>
                    <button onclick="navigator.clipboard.writeText('${embedCode.replace(/'/g, "\\'")}'); this.closest('.fixed').remove()" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Copy Code</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
}

// Initialize the snippet viewer
const snippetViewer = new SnippetViewer();