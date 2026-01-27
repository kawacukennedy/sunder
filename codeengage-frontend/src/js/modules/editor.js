/**
 * Code Editor Module
 * 
 * Wrapper around code editor (e.g., Monaco/CodeMirror).
 * Currently implements a lightweight editor with syntax highlighting support.
 */

export class CodeEditor {
    constructor(elementId, options = {}) {
        this.elementId = elementId;
        this.options = {
            language: 'javascript',
            theme: 'vs-dark',
            readOnly: false,
            ...options
        };
        this.editor = null;
        this.content = '';
    }

    /**
     * Initialize the editor
     */
    async init() {
        const container = document.getElementById(this.elementId);
        if (!container) return;

        // Create editor structure
        container.innerHTML = `
            <div class="code-editor-container">
                <div class="editor-gutter"></div>
                <div class="editor-content" contenteditable="${!this.options.readOnly}" spellcheck="false"></div>
            </div>
        `;

        this.editor = container.querySelector('.editor-content');
        this.gutter = container.querySelector('.editor-gutter');

        this.setupEventListeners();
        this.updateLineNumbers();

        if (this.options.value) {
            this.setValue(this.options.value);
        }
    }

    /**
     * Set editor content
     * @param {string} value - Code content
     */
    setValue(value) {
        this.content = value;
        if (this.editor) {
            // Simple syntax highlighting (placeholder)
            this.editor.innerText = value;
            this.highlight();
            this.updateLineNumbers();
        }
    }

    /**
     * Get editor content
     * @returns {string} Code content
     */
    getValue() {
        return this.editor ? this.editor.innerText : this.content;
    }

    /**
     * Set language
     * @param {string} language - Language identifier
     */
    setLanguage(language) {
        this.options.language = language;
        this.highlight();
    }

    /**
     * Syntax highlighting
     */
    highlight() {
        if (!this.editor) return;

        // This is where we'd integrate PrismJS or similar
        // For now, we keep it simple to avoid external deps complexity in this mock
        const code = this.editor.innerText;
        // logic to highlight keywords based on this.options.language
    }

    /**
     * Update line numbers
     */
    updateLineNumbers() {
        if (!this.editor || !this.gutter) return;

        const lines = this.editor.innerText.split('\n').length;
        this.gutter.innerHTML = Array(lines).fill(0).map((_, i) =>
            `<div class="line-number">${i + 1}</div>`
        ).join('');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        if (!this.editor) return;

        this.editor.addEventListener('input', () => {
            this.content = this.editor.innerText;
            this.updateLineNumbers();
            this.highlight();

            if (this.options.onChange) {
                this.options.onChange(this.content);
            }
        });

        this.editor.addEventListener('keydown', (e) => {
            // Handle Tab key
            if (e.key === 'Tab') {
                e.preventDefault();
                document.execCommand('insertText', false, '    ');
            }
        });

        // Sync scroll
        this.editor.addEventListener('scroll', () => {
            this.gutter.scrollTop = this.editor.scrollTop;
        });
    }

    /**
     * Destroy editor instance
     */
    destroy() {
        const container = document.getElementById(this.elementId);
        if (container) {
            container.innerHTML = '';
        }
        this.editor = null;
    }
}

export default CodeEditor;
