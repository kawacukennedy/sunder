// Collaborative Editor - CodeMirror Wrapper
export class CollaborativeEditor {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            mode: 'javascript',
            theme: 'dracula', // Use valid dark theme
            lineNumbers: true,
            lineWrapping: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            indentUnit: 4,
            tabSize: 4,
            autofocus: true,
            readOnly: false,
            ...options
        };

        this.editor = null;
        this.websocket = null;
        this.sessionId = null;
        this.userId = null;
        this.userName = null;
        this.userColor = null;
        this.cursors = new Map();
        this.changesQueue = [];
        this.isCollaborating = false;

        this.init();
    }

    async init() {
        // Load CodeMirror (Addons only as core is in index.html)
        await this.loadCodeMirror();

        // Initialize editor
        this.createEditor();

        // Setup collaboration if enabled
        if (this.options.collaborate) {
            this.setupCollaboration();
        }

        // Setup event handlers
        this.setupEventHandlers();

        // Notify ready state
        if (this.options.onReady) {
            this.options.onReady(this);
        }
    }

    setupEventHandlers() {
        if (!this.editor) return;

        this.editor.on('change', () => {
            // Propagate change to internal session state if needed
        });
    }

    async loadCodeMirror() {
        return new Promise((resolve) => {
            if (typeof CodeMirror !== 'undefined') {
                // Load additional modes and addons
                this.loadCodeMirrorAddons().then(resolve);
            } else {
                // Fallback if not loaded in head for some reason (race condition check)
                const checkInterval = setInterval(() => {
                    if (typeof CodeMirror !== 'undefined') {
                        clearInterval(checkInterval);
                        this.loadCodeMirrorAddons().then(resolve);
                    }
                }, 50);
            }
        });
    }
    async loadCodeMirrorAddons() {
        const addons = [
            'mode/javascript/javascript.min.js',
            'mode/python/python.min.js',
            'mode/php/php.min.js',
            'mode/xml/xml.min.js',
            'mode/css/css.min.js',
            'mode/sql/sql.min.js',
            'addon/mode/overlay.min.js',
            'addon/selection/active-line.min.js',
            'addon/edit/matchbrackets.min.js',
            'addon/edit/closebrackets.min.js',
            'addon/comment/comment.min.js',
            'addon/search/search.min.js',
            'addon/search/searchcursor.min.js',
            'addon/search/jump-to-line.min.js'
        ];

        const promises = addons.map(addon => {
            return new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = `https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.5/${addon}`;
                script.onload = resolve;
                document.head.appendChild(script);
            });
        });

        await Promise.all(promises);
    }

    createEditor() {
        // Create CodeMirror instance
        this.editor = CodeMirror(this.container, {
            ...this.options,
            extraKeys: {
                'Ctrl-S': () => this.save(),
                'Cmd-S': () => this.save(),
                'Ctrl-Enter': () => this.runCode(),
                'Cmd-Enter': () => this.runCode(),
                'Ctrl-/': () => this.toggleComment(),
                'Cmd-/': () => this.toggleComment(),
                'Ctrl-F': 'findPersistent',
                'Cmd-F': 'findPersistent',
                'Ctrl-G': 'findNext',
                'Cmd-G': 'findNext',
                'Ctrl-Shift-G': 'findPrev',
                'Cmd-Shift-G': 'findPrev'
            }
        });

        // Load initial content
        if (this.options.value) {
            this.editor.setValue(this.options.value);
        }

        // Apply theme (redundant if option set, but safe)
        if (this.options.theme) {
            this.editor.setOption('theme', this.options.theme);
        }

        // Setup Vim/Emacs if requested
        if (this.options.vim) {
            this.loadVimMode();
        }

        if (this.options.emacs) {
            this.loadEmacsMode();
        }

        // Force refresh and size to ensure layout and cursor visibility
        this.editor.setSize('100%', '100%');
        setTimeout(() => {
            this.editor.refresh();
        }, 10);
    }

    async loadVimMode() {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.5/keymap/vim.min.js';
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }

    async loadEmacsMode() {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.5/keymap/emacs.min.js';
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }

    setupCollaboration() {
        if (!window.app.authManager.isAuthenticated()) {
            return;
        }

        const user = window.app.authManager.user;
        this.userId = user.id;
        this.userName = user.display_name || user.username;
        this.userColor = this.getUserColor(user.id);

        this.lastPollTimestamp = Math.floor(Date.now() / 1000);
        this.isPolling = false;

        const snippetId = this.options.snippetId;
        if (snippetId) {
            this.startCollaboration(snippetId);
        }
    }

    async startCollaboration(snippetId) {
        try {
            // Join session first
            const session = await window.app.apiClient.post(`/collaboration/sessions/${snippetId}/join`);
            this.sessionId = session.id;
            this.sessionToken = session.session_token;
            this.isCollaborating = true;

            console.log('Joined collaboration session');
            window.app.showSuccess('Joined collaboration session');

            // Start polling
            this.pollUpdates();

            // Send initial cursor
            this.sendCursorPosition();

        } catch (error) {
            console.error('Failed to join collaboration:', error);
            window.app.showError('Failed to join collaboration session');
        }
    }

    async pollUpdates() {
        if (!this.isCollaborating || this.isPolling) return;

        this.isPolling = true;
        try {
            const data = await window.app.apiClient.get(
                `/collaboration/sessions/${this.sessionToken}/updates?since=${this.lastPollTimestamp}`
            );

            if (data && data.last_activity) {
                this.lastPollTimestamp = data.last_activity;
                this.handleCollaborationData(data);
            }
        } catch (error) {
            if (error.status !== 408) { // Ignore timeouts
                console.error('Polling error:', error);
            }
        } finally {
            this.isPolling = false;
            if (this.isCollaborating) {
                // Schedule next poll immediately (long polling)
                setTimeout(() => this.pollUpdates(), 100);
            }
        }
    }

    handleCollaborationData(data) {
        // Update other cursors
        if (data.cursors) {
            Object.entries(data.cursors).forEach(([userId, position]) => {
                if (parseInt(userId) !== this.userId) {
                    this.updateRemoteCursor(parseInt(userId), position);
                }
            });
        }

        // Handle code changes
        if (data.metadata && data.metadata.last_change && parseInt(data.metadata.last_change_by) !== this.userId) {
            const change = JSON.parse(data.metadata.last_change);
            this.applyRemoteChange(change);
        }

        // Update participants
        if (data.participants) {
            this.updateParticipants(data.participants);
        }
    }

    async broadcastChange(change) {
        if (!this.isCollaborating) return;

        try {
            await window.app.apiClient.post(`/collaboration/sessions/${this.sessionToken}/updates`, {
                change: JSON.stringify(change),
                cursor: this.editor.getCursor()
            });
        } catch (error) {
            console.error('Failed to push change:', error);
        }
    }

    async sendCursorPosition() {
        if (!this.isCollaborating) return;

        try {
            const cursor = this.editor.getCursor();
            await window.app.apiClient.post(`/collaboration/sessions/${this.sessionToken}/updates`, {
                cursor: cursor
            });
        } catch (error) {
            console.error('Failed to push cursor:', error);
        }
    }

    updateRemoteCursor(userId, position) {
        if (userId === this.userId) {
            return;
        }

        const existingCursor = this.cursors.get(userId);
        if (existingCursor) {
            existingCursor.updatePosition(position);
        } else {
            const cursor = new RemoteCursor(this.editor, userId, position, this.getUserColor(userId));
            this.cursors.set(userId, cursor);
        }
    }

    clearAllCursors() {
        this.cursors.forEach(cursor => cursor.remove());
        this.cursors.clear();
    }

    handleUserJoin(user) {
        if (user.id !== this.userId) {
            window.app.showInfo(`${user.display_name} joined the session`);
        }
    }

    handleUserLeave(userId) {
        const cursor = this.cursors.get(userId);
        if (cursor) {
            cursor.remove();
            this.cursors.delete(userId);
        }

        if (userId !== this.userId) {
            window.app.showInfo('A user left the session');
        }
    }

    updateParticipants(participants) {
        // Update participant list in UI
        const participantList = document.getElementById('participant-list');
        if (participantList) {
            participantList.innerHTML = participants.map(p => `
                <div class="flex items-center space-x-2 p-2">
                    <div class="w-2 h-2 rounded-full" style="background-color: ${this.getUserColor(p.id)}"></div>
                    <span class="text-sm">${p.display_name}</span>
                    ${p.id === this.userId ? '<span class="text-xs text-gray-400">(You)</span>' : ''}
                </div>
            `).join('');
        }
    }

    getUserColor(userId) {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DDA0DD', '#98D8C8', '#FFB6C1', '#87CEEB', '#F0E68C'
        ];

        let hash = 0;
        for (let i = 0; i < userId.toString().length; i++) {
            hash = userId.charCodeAt(i) + ((hash << 5) - hash);
        }

        return colors[Math.abs(hash) % colors.length];
    }

    // Editor methods
    getValue() {
        return this.editor ? this.editor.getValue() : '';
    }

    setValue(value) {
        if (this.editor) {
            this.editor.setValue(value);
        }
    }

    setMode(mode) {
        if (this.editor) {
            this.editor.setOption('mode', mode);
        }
    }

    setOption(option, value) {
        if (this.editor) {
            this.editor.setOption(option, value);
        }
    }

    getOption(option) {
        return this.editor ? this.editor.getOption(option) : null;
    }

    setTheme(theme) {
        if (this.editor) {
            this.editor.setOption('theme', theme);
        }
    }

    focus() {
        if (this.editor) {
            this.editor.focus();
        }
    }

    refresh() {
        if (this.editor) {
            this.editor.refresh();
        }
    }

    save() {
        if (this.options.onSave) {
            this.options.onSave(this.getValue());
        }
    }

    runCode() {
        if (this.options.onRun) {
            this.options.onRun(this.getValue());
        }
    }

    toggleComment() {
        if (this.editor) {
            this.editor.execCommand('toggleComment');
        }
    }

    formatCode() {
        if (this.editor) {
            // Basic formatting - in production, use a proper formatter
            const code = this.editor.getValue();
            const formatted = this.formatCodeBasic(code, this.editor.getOption('mode'));
            this.editor.setValue(formatted);
        }
    }

    formatCodeBasic(code, mode) {
        // Very basic formatting - replace with proper formatter in production
        switch (mode) {
            case 'javascript':
                return code.replace(/;/g, ';\n');
            case 'python':
                return code.replace(/:/g, ':\n');
            default:
                return code;
        }
    }

    insertText(text) {
        if (this.editor) {
            const cursor = this.editor.getCursor();
            this.editor.replaceRange(text, cursor);
            this.editor.focus();
        }
    }

    selectLine(line) {
        if (this.editor) {
            const from = { line: line, ch: 0 };
            const to = { line: line, ch: this.editor.getLine(line).length };
            this.editor.setSelection(from, to);
        }
    }

    gotoLine(line) {
        if (this.editor) {
            this.editor.setCursor(line, 0);
            this.editor.centerOnLine(line);
        }
    }

    findAndReplace(searchText, replaceText, options = {}) {
        if (this.editor) {
            const cursor = this.editor.getSearchCursor(searchText, options);
            if (cursor.findNext()) {
                this.editor.replaceRange(replaceText, cursor.from(), cursor.to());
            }
        }
    }

    destroy() {
        if (this.websocket) {
            this.websocket.close();
        }

        if (this.editor) {
            // Check if toTextArea exists (only for fromTextArea instances)
            if (typeof this.editor.toTextArea === 'function') {
                this.editor.toTextArea();
            } else {
                // Otherwise manually remove the wrapper
                const wrapper = this.editor.getWrapperElement();
                if (wrapper && wrapper.parentNode) {
                    wrapper.parentNode.removeChild(wrapper);
                }
            }
        }

        this.clearAllCursors();
    }
}

// Remote Cursor class for collaborative editing
class RemoteCursor {
    constructor(editor, userId, position, color) {
        this.editor = editor;
        this.userId = userId;
        this.color = color;
        this.position = position;
        this.element = null;

        this.create();
    }

    create() {
        this.element = document.createElement('div');
        this.element.className = 'remote-cursor';
        this.element.style.cssText = `
            position: absolute;
            width: 2px;
            height: 18px;
            background-color: ${this.color};
            border-left: 2px solid ${this.color};
            z-index: 1000;
            pointer-events: none;
        `;

        this.label = document.createElement('div');
        this.label.className = 'remote-cursor-label';
        this.label.style.cssText = `
            position: absolute;
            top: -20px;
            left: 2px;
            background-color: ${this.color};
            color: white;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 11px;
            font-family: monospace;
            white-space: nowrap;
            z-index: 1001;
            pointer-events: none;
        `;

        this.element.appendChild(this.label);
        this.editor.getWrapperElement().appendChild(this.element);

        this.updatePosition(this.position);
    }

    updatePosition(position) {
        if (!this.editor || !this.element) {
            return;
        }

        this.position = position;

        const coords = this.editor.charCoords(
            { line: position.line, ch: position.ch },
            'local'
        );

        this.element.style.left = coords.left + 'px';
        this.element.style.top = coords.top + 'px';

        // Update label position
        if (this.label) {
            this.label.style.transform = `translateX(${coords.left}px) translateY(${coords.top - 20}px)`;
        }
    }

    remove() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

// Export for use in other modules
export default CollaborativeEditor;