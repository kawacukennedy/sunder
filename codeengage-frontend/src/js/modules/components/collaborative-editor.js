// Collaborative Editor - CodeMirror Wrapper
export class CollaborativeEditor {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            mode: 'javascript',
            theme: 'dracula',
            lineNumbers: true,
            lineWrapping: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            indentUnit: 4,
            tabSize: 4,
            autofocus: true,
            readOnly: false,
            cursorBlinkRate: 530,
            cursorScrollMargin: 5,
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
        this.isLocked = false;
        this.isPreviewActive = false;
        this.participants = [];
        this.lastMessageId = 0;

        this.init();
    }

    async init() {
        await this.loadCodeMirror();
        this.createEditor();
        this.initMinimap();

        if (this.options.collaborate) {
            this.setupCollaboration();
            this.setupChat();
        }

        this.setupEventHandlers();

        if (this.options.onReady) {
            this.options.onReady(this);
        }
    }

    setupEventHandlers() {
        if (!this.editor) return;
        this.editor.on('change', () => {
            if (this.isPreviewActive && this.options.mode === 'markdown') {
                this.updatePreview();
            }
        });
    }

    async loadCodeMirror() {
        return new Promise((resolve) => {
            if (typeof CodeMirror !== 'undefined') {
                this.loadCodeMirrorAddons().then(resolve);
            } else {
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
            'addon/search/jump-to-line.min.js',
            'mode/markdown/markdown.min.js'
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

        if (this.options.value) {
            this.editor.setValue(this.options.value);
        }

        if (this.options.theme) {
            this.editor.setOption('theme', this.options.theme);
        }

        this.editor.setSize('100%', '100%');
        setTimeout(() => {
            this.editor.refresh();
        }, 10);
    }

    setupCollaboration() {
        if (!window.app.authManager.isAuthenticated()) return;

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
            const response = await window.app.apiClient.post('/collaboration/sessions', { snippet_id: snippetId });
            if (response.success) {
                this.sessionToken = response.data.token;
                this.isCollaborating = true;
                this.pollUpdates();
                this.sendCursorPosition();
            }
        } catch (error) {
            console.error('Failed to start collaboration:', error);
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
            if (error.status !== 408) console.error('Polling error:', error);
        } finally {
            this.isPolling = false;
            if (this.isCollaborating) {
                setTimeout(() => this.pollUpdates(), 100);
            }
        }
    }

    async pollMessages() {
        if (!this.isCollaborating) return;
        try {
            const res = await window.app.apiClient.get(`/collaboration/sessions/${this.sessionToken}/messages`);
            if (res.success && res.data) {
                this.renderMessages(res.data);
            }
        } catch (error) {
            console.error('Failed to poll messages:', error);
        } finally {
            if (this.isCollaborating) {
                setTimeout(() => this.pollMessages(), 3000);
            }
        }
    }

    handleCollaborationData(data) {
        if (data.cursors) {
            Object.entries(data.cursors).forEach(([userId, position]) => {
                if (parseInt(userId) !== this.userId) {
                    this.updateRemoteCursor(parseInt(userId), position);
                }
            });
        }

        if (data.metadata && data.metadata.last_change && parseInt(data.metadata.last_change_by) !== this.userId) {
            const change = JSON.parse(data.metadata.last_change);
            this.applyRemoteChange(change);
        }

        if (data.participants) {
            this.updateParticipants(data.participants);
        }

        if (data.metadata) {
            if (data.metadata.locked_by) {
                this.updateLockUI(true, data.metadata.locked_by === this.userId ? 'You' : data.metadata.locked_by_name || 'Another User');
            } else {
                this.updateLockUI(false);
            }
        }

        if (data.metadata && data.metadata.last_change_by) {
            this.showLastChangeIndicator(data.metadata.last_change_by);
        }
    }

    showLastChangeIndicator(userId) {
        if (userId === this.userId) return;

        const participant = this.participants.find(p => p.id === userId);
        if (!participant) return;

        const indicator = document.getElementById('last-change-indicator');
        if (indicator) {
            indicator.textContent = `Last change by ${participant.display_name}`;
            indicator.classList.remove('hidden');
            clearTimeout(this.lastChangeTimeout);
            this.lastChangeTimeout = setTimeout(() => {
                indicator.classList.add('hidden');
            }, 5000);
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
        if (userId === this.userId) return;
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

    updateParticipants(participants) {
        const participantList = document.getElementById('participant-list');
        const participantCount = document.getElementById('participant-count');

        if (participantCount) {
            participantCount.textContent = `${participants.length} online`;
        }

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

    renderMessages(messages) {
        const chatContainer = document.getElementById('chat-messages');
        if (!chatContainer) return;

        const html = messages.map(msg => {
            const isMe = msg.user_id === this.userId;
            const color = this.getUserColor(msg.user_id);
            return `
                <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'}">
                    <div class="flex items-center space-x-2 mb-1">
                        <span class="text-[10px] font-bold" style="color: ${color}">${msg.display_name}</span>
                        <span class="text-[10px] text-gray-500">${new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div class="px-3 py-2 rounded-lg ${isMe ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-200'} max-w-[90%] break-words">
                        ${this.formatChatMessage(msg.message)}
                    </div>
                </div>
            `;
        }).join('');

        const shouldScroll = chatContainer.scrollTop + chatContainer.clientHeight === chatContainer.scrollHeight;
        chatContainer.innerHTML = html;
        if (shouldScroll) chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    formatChatMessage(text) {
        // Handle mentions: @username
        return text.replace(/@(\w+)/g, '<span class="text-blue-400 font-bold font-mono">@$1</span>');
    }

    setupChat() {
        const chatInput = document.getElementById('chat-input');
        if (!chatInput) return;

        chatInput.addEventListener('keydown', async (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const message = chatInput.value.trim();
                if (message) {
                    await this.sendChatMessage(message);
                    chatInput.value = '';
                }
            }
        });

        // Mention system
        chatInput.addEventListener('input', (e) => {
            const value = e.target.value;
            const cursorPosition = e.target.selectionStart;
            const lastAt = value.lastIndexOf('@', cursorPosition - 1);

            if (lastAt !== -1 && !value.substring(lastAt, cursorPosition).includes(' ')) {
                const query = value.substring(lastAt + 1, cursorPosition).toLowerCase();
                this.showMentionSuggestions(query);
            } else {
                this.hideMentionSuggestions();
            }
        });

        this.pollMessages();
    }

    async sendChatMessage(message) {
        try {
            await window.app.apiClient.post(`/collaboration/sessions/${this.sessionToken}/messages`, {
                message: message
            });
            this.pollMessages();
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    }

    showMentionSuggestions(query) {
        const container = document.getElementById('mention-suggestions');
        if (!container) return;

        const filtered = this.participants.filter(p =>
            p.display_name.toLowerCase().includes(query) ||
            p.username.toLowerCase().includes(query)
        );

        if (filtered.length > 0) {
            container.innerHTML = filtered.map(p => `
                <div class="px-4 py-2 hover:bg-blue-600 cursor-pointer flex items-center space-x-2" onclick="window.editor.insertMention('${p.display_name}')">
                    <div class="w-2 h-2 rounded-full" style="background-color: ${this.getUserColor(p.id)}"></div>
                    <span>${p.display_name}</span>
                </div>
            `).join('');
            container.classList.remove('hidden');
        } else {
            this.hideMentionSuggestions();
        }
    }

    hideMentionSuggestions() {
        const container = document.getElementById('mention-suggestions');
        if (container) container.classList.add('hidden');
    }

    insertMention(name) {
        const chatInput = document.getElementById('chat-input');
        if (!chatInput) return;

        const value = chatInput.value;
        const cursorPosition = chatInput.selectionStart;
        const lastAt = value.lastIndexOf('@', cursorPosition - 1);

        if (lastAt !== -1) {
            const newValue = value.substring(0, lastAt + 1) + name + ' ' + value.substring(cursorPosition);
            chatInput.value = newValue;
            chatInput.focus();
            this.hideMentionSuggestions();
        }
    }

    setAnnotations(results) {
        // Clear previous widgets
        if (this.widgets) {
            this.widgets.forEach(w => w.clear());
        }
        this.widgets = [];

        if (!results || !Array.isArray(results)) return;

        results.forEach(res => {
            if (res.line) {
                const marker = document.createElement('div');
                marker.className = `analysis-marker ${res.severity === 'error' ? 'text-red-500' : 'text-yellow-500'} cursor-help bg-gray-800/50 border border-gray-700 rounded px-2 py-1 text-xs mt-1`;
                marker.innerHTML = `
                    <div class="flex items-center space-x-2">
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                        </svg>
                        <span>${res.message}</span>
                    </div>
                `;

                const widget = this.editor.addLineWidget(res.line - 1, marker, {
                    coverGutter: false,
                    noHScroll: true
                });
                this.widgets.push(widget);
            }
        });
    }

    getUserColor(userId) {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#FFB6C1', '#87CEEB', '#F0E68C'];
        let hash = 0;
        const str = userId.toString();
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    }

    // Power User Features
    async toggleFocusMode() {
        document.body.classList.toggle('focus-mode');
        this.editor.refresh();
        window.app.showInfo(document.body.classList.contains('focus-mode') ? 'Focus Mode ON' : 'Focus Mode OFF');
    }

    async toggleMarkdownPreview() {
        if (!this.container.parentElement.classList.contains('editor-layout')) {
            // Wrap in layout if not already
            const layout = document.createElement('div');
            layout.className = 'editor-layout';
            this.container.parentNode.insertBefore(layout, this.container);
            layout.appendChild(this.container);

            const preview = document.createElement('div');
            preview.id = 'preview-container';
            layout.appendChild(preview);
        }

        const layout = this.container.parentElement;
        this.isPreviewActive = !this.isPreviewActive;
        layout.classList.toggle('split-preview', this.isPreviewActive);

        if (this.isPreviewActive) {
            this.setOption('mode', 'markdown');
            this.updatePreview();
        }

        this.editor.refresh();
    }

    updatePreview() {
        const preview = document.getElementById('preview-container');
        if (!preview) return;

        const content = this.getValue();
        // Simple markdown parsing if 'marked' isn't available
        if (window.marked) {
            preview.innerHTML = window.marked.parse(content);
        } else {
            // Fallback: very basic regex or just text
            preview.innerHTML = content
                .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
                .replace(/\*(.*)\*/gim, '<em>$1</em>')
                .replace(/\n/g, '<br>');
        }
    }

    setOption(option, value) {
        if (this.editor) {
            this.editor.setOption(option, value);
        }
    }

    async acquireLock() {
        if (!this.isCollaborating) return;
        try {
            const res = await window.app.apiClient.post(`/collaboration/sessions/${this.sessionToken}/lock`);
            if (res.success) {
                window.app.showSuccess('Snippet locked for editing');
                this.isLocked = true;
                this.updateLockUI(true, 'You');
            } else {
                window.app.showError(res.message);
            }
        } catch (error) {
            window.app.showError('Failed to acquire lock');
        }
    }

    async releaseLock() {
        if (!this.isCollaborating) return;
        try {
            await window.app.apiClient.post(`/collaboration/sessions/${this.sessionToken}/unlock`);
            this.isLocked = false;
            this.updateLockUI(false);
        } catch (error) {
            console.error('Failed to release lock');
        }
    }

    updateLockUI(locked, user = null) {
        let lockIndicator = document.getElementById('lock-indicator');
        if (locked) {
            if (!lockIndicator) {
                lockIndicator = document.createElement('div');
                lockIndicator.id = 'lock-indicator';
                lockIndicator.className = 'lock-badge ml-4';
                const header = document.querySelector('.snippet-header-actions');
                if (header) header.prepend(lockIndicator);
            }
            lockIndicator.innerHTML = `LOCKED BY ${user}`;
            if (user !== 'You') {
                this.editor.setOption('readOnly', true);
            }
        } else {
            if (lockIndicator) lockIndicator.remove();
            this.editor.setOption('readOnly', this.options.readOnly || false);
        }
    }

    initMinimap() {
        if (!this.editor) return;
        const wrapper = this.editor.getWrapperElement();
        const minimap = document.createElement('div');
        minimap.className = 'cm-minimap';
        wrapper.appendChild(minimap);
        this.editor.on('change', () => {
            minimap.innerHTML = `<pre style="font-size: 2px; color: rgba(255,255,255,0.2)">${this.editor.getValue()}</pre>`;
        });
    }

    // Standard methods
    getValue() { return this.editor ? this.editor.getValue() : ''; }
    setValue(v) { if (this.editor) this.editor.setValue(v); }
    refresh() { if (this.editor) this.editor.refresh(); }
    focus() { if (this.editor) this.editor.focus(); }
    save() { if (this.options.onSave) this.options.onSave(this.getValue()); }
    runCode() { if (this.options.onRun) this.options.onRun(this.getValue()); }
    toggleComment() { if (this.editor) this.editor.execCommand('toggleComment'); }

    destroy() {
        if (this.isLocked) this.releaseLock();
        if (this.editor) {
            const wrapper = this.editor.getWrapperElement();
            if (wrapper && wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
        }
        this.clearAllCursors();
    }
}

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
        this.element.style.cssText = `position: absolute; width: 2px; height: 18px; background-color: ${this.color}; border-left: 2px solid ${this.color}; z-index: 1000; pointer-events: none;`;
        this.label = document.createElement('div');
        this.label.className = 'remote-cursor-label';
        this.label.style.cssText = `position: absolute; top: -20px; left: 2px; background-color: ${this.color}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px; font-family: monospace; white-space: nowrap; z-index: 1001; pointer-events: none;`;
        this.element.appendChild(this.label);
        this.editor.getWrapperElement().appendChild(this.element);
        this.updatePosition(this.position);
    }

    updatePosition(position) {
        if (!this.editor || !this.element) return;
        this.position = position;
        const coords = this.editor.charCoords({ line: position.line, ch: position.ch }, 'local');
        this.element.style.left = coords.left + 'px';
        this.element.style.top = coords.top + 'px';
        if (this.label) {
            this.label.style.transform = `translateX(${coords.left}px) translateY(${coords.top - 20}px)`;
        }
    }

    remove() {
        if (this.element && this.element.parentNode) this.element.parentNode.removeChild(this.element);
    }
}

export default CollaborativeEditor;