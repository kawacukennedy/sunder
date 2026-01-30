export class ShortcutManager {
    constructor(app) {
        this.app = app;
        this.shortcuts = new Map();
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => this.handleKeydown(e));

        // Register default shortcuts
        this.register('command-palette', {
            keys: ['Meta+k', 'Control+k'],
            description: 'Open Command Palette',
            action: () => this.app.commandPalette.show()
        });

        this.register('help', {
            keys: ['?'],
            description: 'Show Keyboard Shortcuts',
            action: (e) => {
                // Only if not typing in input
                if (!['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
                    this.showHelp();
                }
            }
        });
    }

    register(name, config) {
        this.shortcuts.set(name, config);
    }

    handleKeydown(e) {
        const key = e.key.toLowerCase();
        const meta = e.metaKey;
        const ctrl = e.ctrlKey;
        const shift = e.shiftKey;
        const alt = e.altKey;

        for (const [name, config] of this.shortcuts) {
            for (const combination of config.keys) {
                if (this.matches(e, combination)) {
                    e.preventDefault();
                    config.action(e);
                    return;
                }
            }
        }
    }

    matches(e, combination) {
        const parts = combination.toLowerCase().split('+');
        const key = parts.pop();

        const hasMeta = parts.includes('meta') || parts.includes('cmd');
        const hasCtrl = parts.includes('control') || parts.includes('ctrl');
        const hasShift = parts.includes('shift');
        const hasAlt = parts.includes('alt');

        return e.key.toLowerCase() === key &&
            e.metaKey === hasMeta &&
            e.ctrlKey === hasCtrl &&
            e.shiftKey === hasShift &&
            e.altKey === hasAlt;
    }

    showHelp() {
        // Create help modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm animate-fade-in';
        modal.innerHTML = `
            <div class="bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-lg overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
                    <h3 class="text-lg font-bold text-white flex items-center gap-2">
                        <i class="ph ph-keyboard text-neon-blue"></i> Keyboard Shortcuts
                    </h3>
                    <button class="text-gray-400 hover:text-white" onclick="this.closest('.fixed').remove()">
                        <i class="ph ph-x"></i>
                    </button>
                </div>
                <div class="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    ${Array.from(this.shortcuts.values()).map(s => `
                        <div class="flex justify-between items-center group">
                            <span class="text-gray-300 group-hover:text-white transition-colors">${s.description}</span>
                            <div class="flex gap-2">
                                ${s.keys[0].split('+').map(k => `
                                    <kbd class="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs font-mono text-gray-400 group-hover:text-white transition-colors capitalize">${k}</kbd>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="px-6 py-4 bg-gray-900/50 border-t border-gray-800 text-center text-xs text-gray-500">
                    Press <kbd class="px-1 bg-gray-800 rounded">Esc</kbd> to close
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close on click outside or Esc
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        const closeOnEsc = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', closeOnEsc);
            }
        };
        document.addEventListener('keydown', closeOnEsc);
    }
}

export default ShortcutManager;
