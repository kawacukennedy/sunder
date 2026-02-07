// Notification System
export class NotificationSystem {
    constructor() {
        this.container = document.getElementById('toast-container') || this.createContainer();
        this.notifications = new Map();
        this.defaultDuration = 5000;
        this.maxNotifications = 5;
    }

    createContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed top-6 right-6 z-[100] flex flex-col items-end gap-3 pointer-events-none';
        document.body.appendChild(container);
        return container;
    }

    show(message, type = 'info', options = {}) {
        const id = this.generateId();
        const duration = options.duration || this.defaultDuration;
        const persistent = options.persistent || false;

        if (this.notifications.size >= this.maxNotifications) {
            const oldestId = this.notifications.keys().next().value;
            this.remove(oldestId);
        }

        const notification = this.createNotification(id, message, type, options);
        this.container.appendChild(notification);

        this.notifications.set(id, {
            element: notification,
            timer: null,
            startTime: Date.now(),
            duration: duration,
            persistent
        });

        requestAnimationFrame(() => {
            notification.classList.add('notification-enter');
        });

        if (!persistent) {
            this.startTimer(id, duration);
        }

        return id;
    }

    createNotification(id, message, type, options = {}) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} glass-strong border border-white/10 rounded-2xl shadow-2xl p-4 min-w-[320px] max-w-md transition-all duration-500 transform pointer-events-auto relative overflow-hidden group`;
        notification.dataset.id = id;

        const icons = {
            success: '<i class="ph-bold ph-check-circle text-neon-blue"></i>',
            error: '<i class="ph-bold ph-warning-octagon text-red-400"></i>',
            warning: '<i class="ph-bold ph-warning text-yellow-400"></i>',
            info: '<i class="ph-bold ph-info text-neon-blue"></i>',
            achievement: '<i class="ph-bold ph-trophy text-yellow-400"></i>'
        };

        notification.innerHTML = `
            <div class="flex items-start gap-4">
                <div class="flex-shrink-0 text-2xl mt-0.5 animate-pulse-slow">
                    ${icons[type]}
                </div>
                <div class="flex-1 min-w-0 pr-6">
                    <p class="text-white text-sm leading-relaxed font-medium">${this.escapeHtml(message)}</p>
                    ${options.action ? this.createActionHTML(options.action) : ''}
                </div>
                <button class="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors p-1" onclick="window.app.notifications.remove('${id}')">
                    <i class="ph ph-x text-lg"></i>
                </button>
            </div>
            ${!options.persistent ? `
                <div class="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-neon-blue to-neon-purple opacity-50 transition-all duration-100 ease-linear notification-progress-bar" style="width: 100%"></div>
            ` : ''}
        `;

        if (!options.persistent) {
            notification.addEventListener('mouseenter', () => this.pauseTimer(id));
            notification.addEventListener('mouseleave', () => this.resumeTimer(id));
        }

        return notification;
    }

    startTimer(id, duration) {
        const notification = this.notifications.get(id);
        if (!notification) return;

        const startTime = Date.now();
        const progressBar = notification.element.querySelector('.notification-progress-bar');

        const updateProgress = () => {
            const currentEntry = this.notifications.get(id);
            if (!currentEntry || currentEntry.paused) return;

            const elapsed = Date.now() - currentEntry.startTime;
            const remaining = currentEntry.duration - elapsed;
            const progress = (remaining / currentEntry.duration) * 100;

            if (progressBar) {
                progressBar.style.width = `${Math.max(0, progress)}%`;
            }

            if (remaining <= 0) {
                this.remove(id);
            } else {
                currentEntry.animationFrame = requestAnimationFrame(updateProgress);
            }
        };

        notification.startTime = startTime;
        notification.animationFrame = requestAnimationFrame(updateProgress);
    }

    pauseTimer(id) {
        const notification = this.notifications.get(id);
        if (notification && !notification.persistent) {
            notification.paused = true;
            notification.remaining = notification.duration - (Date.now() - notification.startTime);
            cancelAnimationFrame(notification.animationFrame);
        }
    }

    resumeTimer(id) {
        const notification = this.notifications.get(id);
        if (notification && !notification.persistent && notification.paused) {
            notification.paused = false;
            notification.startTime = Date.now() - (notification.duration - notification.remaining);
            const progressBar = notification.element.querySelector('.notification-progress-bar');

            const updateProgress = () => {
                const currentEntry = this.notifications.get(id);
                if (!currentEntry || currentEntry.paused) return;

                const elapsed = Date.now() - currentEntry.startTime;
                const remaining = currentEntry.duration - elapsed;
                const progress = (remaining / currentEntry.duration) * 100;

                if (progressBar) {
                    progressBar.style.width = `${Math.max(0, progress)}%`;
                }

                if (remaining <= 0) {
                    this.remove(id);
                } else {
                    currentEntry.animationFrame = requestAnimationFrame(updateProgress);
                }
            };
            notification.animationFrame = requestAnimationFrame(updateProgress);
        }
    }

    remove(id) {
        const notification = this.notifications.get(id);
        if (!notification) return;

        if (notification.animationFrame) {
            cancelAnimationFrame(notification.animationFrame);
        }

        notification.element.classList.add('notification-exit');
        setTimeout(() => {
            if (notification.element.parentNode) {
                notification.element.parentNode.removeChild(notification.element);
            }
            this.notifications.delete(id);
        }, 500);
    }

    success(message, options = {}) {
        return this.show(message, 'success', options);
    }

    error(message, options = {}) {
        return this.show(message, 'error', options);
    }

    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    }

    info(message, options = {}) {
        return this.show(message, 'info', options);
    }

    achievement(message, options = {}) {
        return this.show(message, 'achievement', { ...options, duration: 8000 });
    }

    generateId() {
        return `nt-${Math.random().toString(36).substr(2, 9)}`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    createActionHTML(action) {
        const id = `action-${Math.random().toString(36).substr(2, 5)}`;
        setTimeout(() => {
            const btn = document.getElementById(id);
            if (btn) btn.onclick = action.callback;
        }, 0);
        return `
            <div class="mt-3">
                <button id="${id}" class="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors">
                    ${action.text}
                </button>
            </div>
        `;
    }
}

const notificationStyles = `
.notification {
    opacity: 0;
    transform: translateX(30px) scale(0.95);
    filter: blur(8px);
}

.notification-enter {
    opacity: 1;
    transform: translateX(0) scale(1);
    filter: blur(0);
}

.notification-exit {
    opacity: 0;
    transform: translateX(30px) scale(0.95);
    filter: blur(8px);
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

export default NotificationSystem;