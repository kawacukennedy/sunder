/**
 * Main Application
 * 
 * Entry point for the CodeEngage frontend application.
 * Orchestrates all modules and initializes the app.
 */

import { Router } from './modules/router.js?v=9';
import { Auth } from './modules/auth.js?v=9';
import { ApiClient } from './modules/api/client.js?v=9';
import { OfflineManager } from './modules/services/offline-manager.js?v=9';
import { AsyncErrorBoundary } from './modules/utils/async-error-boundary.js?v=9';
import { Dashboard } from './pages/dashboard.js?v=9';
import { Snippets } from './pages/snippets.js?v=9';
import { Profile } from './pages/profile.js?v=9';
import { Settings } from './pages/settings.js?v=9';
import { Admin } from './pages/admin.js?v=9';
import { Organizations } from './pages/organizations.js?v=9';
import { Leaderboard } from './pages/leaderboard.js?v=9';
import { SnippetViewer } from './pages/snippet-viewer.js?v=9';
import SnippetEditor from './pages/snippet-editor.js?v=9';
import { Login } from './pages/login.js?v=9';
import { Register } from './pages/register.js?v=9';
import NotificationSystem from './modules/components/notification-system.js?v=9';
import CommandPalette from './modules/components/command-palette.js?v=9';
import CodeVisualizer from './modules/components/code-visualizer.js?v=9';
import ShortcutManager from './modules/components/shortcut-manager.js?v=9';

class App {
    constructor() {
        // Expose app instance globally immediately
        window.app = this;

        this.apiClient = new ApiClient();
        this.router = new Router(this);
        this.auth = new Auth(this);
        this.notifications = new NotificationSystem();
        this.commandPalette = new CommandPalette();
        this.shortcutManager = new ShortcutManager(this);
        this.visualizer = null; // Will be initialized when needed
        this.currentPage = null;

        // Initialize error boundary for async operations
        this.asyncErrorBoundary = new AsyncErrorBoundary({
            onError: (error, context) => this.handleAsyncError(error, context),
            maxRetries: 3,
            timeout: 30000
        });

        // Initialize modules
        this.init();
    }

    /**
     * Initialize application
     */
    async init() {
        try {
            // Setup global error handling FIRST
            this.setupGlobalErrorHandling();

            // Initialize Offline Manager
            this.offlineManager = new OfflineManager();

            // Register Service Worker for offline support
            this.registerServiceWorker();

            // Handle online/offline events
            window.addEventListener('online', () => this.handleOnline());
            window.addEventListener('offline', () => this.handleOffline());

            // Setup global auth interceptor (Network resilience)
            this.apiClient.addResponseInterceptor(async (response) => {
                if (response.status === 401 || response.status === 403) {
                    // Only redirect if we are not already on login/register pages
                    const path = window.location.pathname;
                    if (path !== '/login' && path !== '/register') {
                        console.warn('Session expired or invalid, redirecting to login');
                        await this.auth.logout(false); // Client-side cleanup only
                    }
                }
                return response;
            });

            this.initTheme();

            await this.auth.init();
            this.setupGlobalShortcuts();
            this.setupGlobalListeners();
            this.setupRoutes();
            this.router.handleRouteChange();
        } catch (error) {
            console.error('App initialization failed:', error);
            this.showError('Application failed to initialize properly');
        }
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    })
                    .catch(err => {
                        console.log('ServiceWorker registration failed: ', err);
                    });
            });
        }
    }

    handleOnline() {
        this.showSuccess('You are back online');
        document.body.classList.remove('is-offline');
    }

    handleOffline() {
        this.showError('You are currently offline. Some features may be unavailable.');
        document.body.classList.add('is-offline');
    }

    /**
     * Initialize/Update theme based on settings
     */
    initTheme() {
        if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }

    /**
     * Setup application routes
     */
    setupRoutes() {
        // Public routes
        this.router.add('/', () => this.renderLanding());

        // Protected routes
        this.router.add('/dashboard', async () => {
            this.currentPage = new Dashboard(this);
            await this.currentPage.init();
        }, { protected: true });

        this.router.add('/snippets', async () => {
            this.currentPage = new Snippets(this);
            await this.currentPage.init();
        }, { protected: true });

        this.router.add('/snippet/:id', async (params) => {
            this.currentPage = new SnippetViewer(this, params.id);
            await this.currentPage.init();
        }, { protected: true });

        this.router.add('/profile', async () => {
            this.currentPage = new Profile(this);
            await this.currentPage.init();
        }, { protected: true });

        this.router.add('/settings', async () => {
            this.currentPage = new Settings(this);
            await this.currentPage.init();
        }, { protected: true });

        // Organization Routes
        this.router.add('/organizations', async () => {
            this.currentPage = new Organizations(this, 'list');
            await this.currentPage.init();
        }, { protected: true });

        this.router.add('/organizations/new', async () => {
            this.currentPage = new Organizations(this, 'create');
            await this.currentPage.init();
        }, { protected: true });

        this.router.add('/organizations/:id', async (params) => {
            this.currentPage = new Organizations(this, 'details', params);
            await this.currentPage.init();
        }, { protected: true });

        this.router.add('/leaderboard', async () => {
            this.currentPage = new Leaderboard(this);
            await this.currentPage.init();
        }, { protected: true });

        this.router.add('/admin', async () => {
            if (this.auth.user?.role !== 'admin') {
                return this.router.navigate('/dashboard');
            }
            this.currentPage = new Admin(this);
            await this.currentPage.init();
        }, { protected: true });

        // Starred route - redirect to dashboard which shows starred snippets
        this.router.add('/starred', async () => {
            this.router.navigate('/dashboard');
        }, { protected: true });

        this.router.add('/join/:token', async (params) => {
            try {
                const response = await this.apiClient.post('/collaboration/join_invite', { token: params.token });
                if (response.success) {
                    // Navigate to editor for the snippet with join token
                    const session = response.data;
                    this.router.navigate(`/editor/${session.snippet_id}?join_token=${params.token}`);
                }
            } catch (error) {
                this.showError('Invalid or expired invite link');
                this.router.navigate('/dashboard');
            }
        }, { protected: true });

        this.router.add('/new', async () => {
            this.currentPage = new SnippetEditor(this);
            await this.currentPage.init();
            this.currentPage.render();
        }, { protected: true });

        this.router.add('/editor/:id', async (params) => {
            this.currentPage = new SnippetEditor(this, params.id);
            await this.currentPage.init();
            this.currentPage.render();
        }, { protected: true });

        // Auth routes
        this.router.add('/login', async () => {
            if (this.auth.isAuthenticated()) return this.router.navigate('/dashboard', true);
            this.currentPage = new Login(this);
            await this.currentPage.init();
        }, { guest: true });

        this.router.add('/register', async () => {
            if (this.auth.isAuthenticated()) return this.router.navigate('/dashboard', true);
            this.currentPage = new Register(this);
            await this.currentPage.init();
        }, { guest: true });

        console.log('App initialization: Version v9 (Global sync)');
    }

    /**
     * Render the landing page
     */
    renderLanding() {
        if (this.auth.isAuthenticated()) {
            return this.router.navigate('/dashboard', true);
        }

        const container = document.getElementById('app');
        if (!container) return;

        container.innerHTML = `
            <div class="min-h-screen bg-deep-space flex flex-col relative overflow-hidden">
                <!-- Ambient Background -->
                <div class="absolute inset-0 pointer-events-none overflow-hidden">
                    <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-neon-blue/10 rounded-full blur-[150px] animate-pulse-slow"></div>
                    <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-neon-purple/10 rounded-full blur-[150px] animate-pulse-slow" style="animation-delay: 1.5s"></div>
                </div>

                <!-- Navbar -->
                <nav class="relative z-50 flex items-center justify-between px-6 py-6 sm:px-12 max-w-7xl mx-auto w-full">
                    <div class="flex items-center gap-2 group cursor-pointer" onclick="window.app.router.navigate('/')">
                        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple p-0.5 shadow-neon">
                            <div class="w-full h-full bg-gray-900 rounded-[9px] flex items-center justify-center">
                                <i class="ph-bold ph-code text-xl text-white"></i>
                            </div>
                        </div>
                        <span class="text-xl font-bold tracking-tight text-white group-hover:text-neon-blue transition-colors">CodeEngage</span>
                    </div>
                    <div class="flex items-center gap-4">
                        <a href="/login" class="text-sm font-semibold text-gray-300 hover:text-white transition-colors">Sign In</a>
                        <a href="/register" class="btn-primary rounded-xl px-5 py-2.5 text-sm font-bold shadow-neon hover:scale-105 transition-all">Get Started</a>
                    </div>
                </nav>

                <!-- Hero Section -->
                <main class="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 max-w-5xl mx-auto py-20">
                    <div class="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md mb-8 animate-fade-in hover:border-neon-blue/30 transition-colors cursor-default group/badge">
                        <span class="w-2 h-2 rounded-full bg-neon-blue animate-pulse shadow-[0_0_8px_rgba(0,240,255,0.5)]"></span>
                        <span class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover/badge:text-gray-300 transition-colors">Collaborative Coding Reimagined</span>
                    </div>
                    
                    <h1 class="text-5xl sm:text-7xl font-black text-white mb-8 tracking-tight leading-tight">
                        Build together. <br>
                        <span class="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-neon-purple to-neon-blue bg-[length:200%_auto] animate-gradient">Ship faster.</span>
                    </h1>
                    
                    <p class="text-lg sm:text-xl text-gray-400 max-w-2xl mb-12 leading-relaxed">
                        A next-generation platform for developers to share, collaborate, and evolve their code snippets in real-time.
                    </p>

                    <div class="flex flex-col sm:flex-row gap-4 items-center mb-20">
                        <a href="/register" class="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold rounded-2xl shadow-neon transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group">
                            Start Building Now
                            <i class="ph-bold ph-arrow-right group-hover:translate-x-1 transition-transform"></i>
                        </a>
                        <a href="/snippets" class="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                            Explore Snippets
                        </a>
                    </div>

                    <!-- Visual -->
                    <div class="w-full max-w-4xl glass-strong p-4 rounded-[2rem] border border-white/10 shadow-2xl relative group mb-12">
                        <div class="absolute -inset-0.5 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 blur opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                        <div class="relative bg-gray-900/90 rounded-[1.75rem] overflow-hidden">
                             <div class="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
                                <div class="flex gap-2">
                                    <div class="w-3 h-3 rounded-full bg-red-400/50"></div>
                                    <div class="w-3 h-3 rounded-full bg-yellow-400/50"></div>
                                    <div class="w-3 h-3 rounded-full bg-green-400/50"></div>
                                </div>
                                <div class="text-[10px] font-mono text-gray-500">collaborative_session.js</div>
                                <div class="w-4"></div>
                             </div>
                             <div class="p-8 text-left font-mono text-sm sm:text-base text-gray-300 overflow-x-auto whitespace-pre">
<span class="text-neon-purple">import</span> { CodeEngage } <span class="text-neon-purple">from</span> <span class="text-green-400">"@core/engine"</span>;

<span class="text-gray-500">// Initialize real-time workspace</span>
<span class="text-neon-purple">const</span> session = <span class="text-neon-purple">await</span> CodeEngage.<span class="text-yellow-400">initialize</span>({
    id: <span class="text-green-400">"future-of-code"</span>,
    realtime: <span class="text-neon-blue">true</span>,
    persistence: <span class="text-neon-blue">true</span>
});

session.<span class="text-yellow-400">on</span>(<span class="text-green-400">"collaboration"</span>, (event) => {
    <span class="text-neon-blue">console</span>.<span class="text-yellow-400">log</span>(<span class="text-green-400">"Building extraordinary things..."</span>);
});
                             </div>
                        </div>
                    </div>
                </main>

                <!-- Footer -->
                <footer class="relative z-10 py-12 border-t border-white/5 bg-gray-950/20">
                    <div class="max-w-7xl mx-auto px-6 text-center">
                        <p class="text-gray-500 text-sm">© 2026 CodeEngage. Built for the modern developer.</p>
                    </div>
                </footer>
            </div>
        `;
    }



    /**
     * Show global error notification
     * @param {string} message - Error message
     */
    showError(message) {
        return this.notifications.error(message);
    }

    showSuccess(message) {
        return this.notifications.success(message);
    }

    showInfo(message) {
        return this.notifications.info(message);
    }

    setupGlobalShortcuts() {
        this.shortcutManager.register('command-palette', {
            keys: ['Meta+k', 'Control+k'],
            description: 'Open Command Palette',
            action: () => this.commandPalette.show()
        });

        this.shortcutManager.register('toggle-comment', {
            keys: ['Meta+/', 'Control+/'],
            description: 'Toggle Comment',
            action: () => {
                if (this.currentPage && this.currentPage.editor) {
                    this.currentPage.editor.toggleComment();
                }
            }
        });

        this.shortcutManager.register('save-snippet', {
            keys: ['Meta+s', 'Control+s'],
            description: 'Save Snippet',
            action: (e) => {
                if (this.currentPage && typeof this.currentPage.save === 'function') {
                    // Prevent browser save dialog
                    e.preventDefault();
                    this.currentPage.save();
                }
            }
        });
    }

    /**
     * Setup global error handling
     */
    setupGlobalErrorHandling() {
        // Handle uncaught JavaScript errors
        window.addEventListener('error', (event) => {
            this.handleGlobalError(event.error, {
                type: 'javascript_error',
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                message: event.message
            });
            event.preventDefault();
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleGlobalError(event.reason, {
                type: 'promise_rejection',
                promise: event.promise
            });
            event.preventDefault();
        });

        // Handle resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.handleGlobalError(new Error(`Resource failed to load: ${event.target.src || event.target.href}`), {
                    type: 'resource_error',
                    element: event.target.tagName,
                    source: event.target.src || event.target.href
                });
                event.preventDefault();
            }
        }, true);
    }

    /**
     * Handle global errors consistently
     */
    async handleGlobalError(error, context = {}) {
        // 1. Print to Console (User Request)
        console.group('%c🚨 Application Error', 'background: red; color: white; padding: 2px 5px; border-radius: 2px; font-weight: bold;');
        console.error('Message:', error.message || error);
        console.error('Stack:', error.stack);
        console.error('Context:', context);
        console.groupEnd();

        // Report error to backend
        try {
            await this.reportError(error, context);
        } catch (reportError) {
            console.warn('Failed to report error:', reportError);
        }

        // Show user-friendly error message
        const userMessage = this.getUserFriendlyErrorMessage(error, context);
        this.showError(userMessage);

        // For critical errors, consider recovery options
        if (this.isCriticalError(error, context)) {
            this.handleCriticalError(error, context);
        }
    }

    /**
     * Report error to backend for tracking
     */
    async reportError(error, context = {}) {
        const errorData = {
            message: error.message || 'Unknown error',
            stack: error.stack,
            context: {
                ...context,
                userAgent: navigator.userAgent,
                url: window.location.href,
                timestamp: new Date().toISOString(),
                userId: this.auth.user?.id,
                sessionId: this.getSessionId()
            }
        };

        try {
            await fetch('/api/errors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(errorData)
            });
        } catch (networkError) {
            // Silently fail if network is down
            console.warn('Could not report error to backend:', networkError.message);
        }
    }

    /**
     * Get user-friendly error message
     */
    getUserFriendlyErrorMessage(error, context) {
        // Network errors
        if (error.name === 'NetworkError' || error.message.includes('fetch')) {
            return 'Network connection issue. Please check your internet connection.';
        }

        // Permission errors
        if (error.name === 'NotAllowedError') {
            return 'Permission denied. Please check your browser permissions.';
        }

        // JavaScript errors
        if (context.type === 'javascript_error') {
            return 'An unexpected error occurred. The page may not work correctly.';
        }

        // Promise rejections
        if (context.type === 'promise_rejection') {
            return 'An operation failed to complete. Please try again.';
        }

        // Resource loading errors
        if (context.type === 'resource_error') {
            return 'Some resources failed to load. Please refresh the page.';
        }

        // Default
        return 'Something went wrong. Please try refreshing the page.';
    }

    /**
     * Check if error is critical and needs special handling
     */
    isCriticalError(error, context) {
        // Consider errors that prevent app functionality as critical
        return error.name === 'ChunkLoadError' ||
            error.message.includes('Loading chunk') ||
            context.type === 'javascript_error' && context.lineno === 1;
    }

    /**
     * Handle critical errors with recovery options
     */
    handleCriticalError(error, context) {
        if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
            // Show option to reload page for chunk loading errors
            setTimeout(() => {
                if (confirm('The application has been updated. Would you like to reload the page?')) {
                    window.location.reload();
                }
            }, 1000);
        }
    }

    /**
     * Get session ID for error tracking
     */
    getSessionId() {
        let sessionId = sessionStorage.getItem('sessionId');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('sessionId', sessionId);
        }
    }

    /**
     * Handle async errors from AsyncErrorBoundary
     * @param {Error} error - The async error
     * @param {object} context - Error context
     */
    handleAsyncError(error, context) {
        // Log additional context for async errors
        const enhancedContext = {
            ...context,
            currentPage: this.currentPage?.constructor?.name || 'unknown',
            route: window.location.pathname,
            timestamp: new Date().toISOString()
        };

        // Use existing error handling infrastructure
        this.handleGlobalError(error, enhancedContext);
    }

    /**
     * Wrap async operations with error boundary
     * @param {Function} fn - Async function to wrap
     * @param {object} context - Additional context
     * @returns {Function} Wrapped function
     */
    wrapAsync(fn, context = {}) {
        return this.asyncErrorBoundary.wrap(fn, {
            ...context,
            sessionId: this.getSessionId(),
            userId: this.auth.user?.id
        });
    }

    /**
     * Get comprehensive error statistics
     * @returns {object} Error statistics
     */
    getErrorStatistics() {
        const asyncStats = this.asyncErrorBoundary.getErrorStats();
        const apiLogs = this.apiClient.getRequestLogs();
        const frontendErrors = JSON.parse(localStorage.getItem('frontend_errors') || '[]');

        return {
            async: asyncStats,
            api: {
                totalRequests: apiLogs.length,
                errorRate: apiLogs.filter(log => !log.success).length / apiLogs.length,
                averageResponseTime: apiLogs.reduce((sum, log) => sum + log.duration, 0) / apiLogs.length,
                recentErrors: apiLogs.filter(log => !log.success).slice(-10)
            },
            frontend: {
                totalErrors: frontendErrors.length,
                byType: this.groupErrorsByType(frontendErrors),
                recentErrors: frontendErrors.slice(-10)
            },
            generatedAt: new Date().toISOString()
        };
    }

    /**
     * Group errors by type for statistics
     * @param {Array} errors - List of errors
     * @returns {object} Errors grouped by type
     */
    groupErrorsByType(errors) {
        return errors.reduce((groups, error) => {
            const type = error.context?.type || 'unknown';
            if (!groups[type]) {
                groups[type] = 0;
            }
            groups[type]++;
            return groups;
        }, {});
    }

    /**
     * Setup global event listeners
     */
    setupGlobalListeners() {
        // Handle logout
        document.addEventListener('click', async (e) => {
            const logoutBtn = e.target.closest('#logout-btn');
            if (logoutBtn) {
                e.preventDefault();
                await this.auth.logout();
            }
        });
    }
}

// Start application
window.app = new App();