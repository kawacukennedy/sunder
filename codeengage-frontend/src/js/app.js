/**
 * Main Application
 * 
 * Entry point for the CodeEngage frontend application.
 * Orchestrates all modules and initializes the app.
 */

import { Router } from './modules/router.js';
import { Auth } from './modules/auth.js';
import { ApiClient } from './modules/api/client.js';
import { Dashboard } from './pages/dashboard.js';
import { Snippets } from './pages/snippets.js';
import { Profile } from './pages/profile.js';
import { Admin } from './pages/admin.js';
import { Editor } from './modules/editor.js';

class App {
    constructor() {
        this.apiClient = new ApiClient();
        this.router = new Router(this);
        this.auth = new Auth(this);
        this.currentPage = null;

        // Initialize modules
        this.init();
    }

    /**
     * Initialize application
     */
    async init() {
        try {
            await this.auth.init();
            this.setupRoutes();
            this.router.handleRouteChange();
            this.setupGlobalListeners();
        } catch (error) {
            console.error('App initialization failed:', error);
            this.showError('Failed to start application');
        }
    }

    /**
     * Setup application routes
     */
    setupRoutes() {
        // Public routes
        this.router.add('/', () => this.router.navigate('/dashboard'));

        // Protected routes
        this.router.add('/dashboard', async () => {
            this.currentPage = new Dashboard(this);
            await this.currentPage.init();
        }, { protected: true });

        this.router.add('/snippets', async () => {
            this.currentPage = new Snippets(this);
            await this.currentPage.init();
        }, { protected: true });

        this.router.add('/profile', async () => {
            this.currentPage = new Profile(this);
            await this.currentPage.init();
        }, { protected: true });

        this.router.add('/admin', async () => {
            if (this.auth.user?.role !== 'admin') {
                return this.router.navigate('/dashboard');
            }
            this.currentPage = new Admin(this);
            await this.currentPage.init();
        }, { protected: true });

        this.router.add('/new', async () => {
            // Load editor page directly or via a page module
            const container = document.getElementById('app');
            container.innerHTML = '<h1>New Snippet</h1><div id="editor"></div>';
            const editor = new Editor('editor');
            editor.init();
        }, { protected: true });

        // Auth routes
        this.router.add('/login', async () => {
            if (this.auth.isAuthenticated()) return this.router.navigate('/dashboard');
            this.renderLogin();
        }, { guest: true });
    }

    /**
     * Render login page
     */
    renderLogin() {
        const container = document.getElementById('app');
        container.innerHTML = `
            <div class="auth-page">
                <form id="login-form">
                    <h1>Login</h1>
                    <input type="email" name="email" placeholder="Email" required>
                    <input type="password" name="password" placeholder="Password" required>
                    <button type="submit">Login</button>
                    <p>Don't have an account? <a href="/register">Register</a></p>
                </form>
            </div>
        `;

        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = e.target.email.value;
            const password = e.target.password.value;
            const result = await this.auth.login(email, password);

            if (result.success) {
                this.router.navigate('/dashboard');
            } else {
                this.showError(result.message);
            }
        });
    }

    /**
     * Show global error notification
     * @param {string} message - Error message
     */
    showError(message) {
        const notification = document.createElement('div');
        notification.className = 'notification error';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    /**
     * Setup global event listeners
     */
    setupGlobalListeners() {
        // Handle logout
        document.addEventListener('click', async (e) => {
            if (e.target.matches('#logout-btn')) {
                e.preventDefault();
                await this.auth.logout();
            }
        });
    }
}

// Start application
window.app = new App();