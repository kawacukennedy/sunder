
import Navigation from '../modules/components/navigation.js';

export class Settings {
    constructor(app) {
        this.app = app;
        this.nav = new Navigation('/settings');
    }

    async init() {
        if (!this.app.auth.isAuthenticated()) {
            return this.app.router.navigate('/login');
        }
        this.render();
        this.setupEventListeners();
        this.loadSettings();
    }

    render() {
        const container = document.getElementById('app');
        const user = this.app.auth.user;

        container.innerHTML = `
            ${this.nav.render()}
            <div class="settings-page min-h-screen pb-12">
                <div class="container mx-auto px-4 pt-8">
                    <div class="max-w-4xl mx-auto">
                        <header class="mb-8">
                            <h1 class="text-3xl font-bold text-white mb-2">Settings</h1>
                            <p class="text-gray-400">Manage your account preferences and profile.</p>
                        </header>

                        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <!-- Sidebar -->
                            <div class="md:col-span-1">
                                <nav class="space-y-1">
                                    <button class="w-full text-left px-4 py-2 rounded-lg bg-primary/20 text-primary font-medium">Profile</button>
                                    <button class="w-full text-left px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Account</button>
                                    <button class="w-full text-left px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Appearance</button>
                                    <button class="w-full text-left px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Notifications</button>
                                </nav>
                            </div>

                            <!-- Content -->
                            <div class="md:col-span-3 space-y-8">
                                <!-- Profile Section -->
                                <section id="profile-section" class="glass-panel p-6 border border-gray-700/50 rounded-xl">
                                    <h2 class="text-xl font-semibold text-white mb-6">Public Profile</h2>
                                    
                                    <div class="flex items-start gap-6 mb-8">
                                        <div class="relative group">
                                            <div class="w-24 h-24 rounded-full bg-gray-700 overflow-hidden border-2 border-gray-600">
                                                <img src="${user.avatar_url || `https://ui-avatars.com/api/?name=${user.username}&background=random`}" 
                                                     alt="Profile" 
                                                     class="w-full h-full object-cover">
                                            </div>
                                            <button class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                                                <span class="text-xs text-white">Change</span>
                                            </button>
                                        </div>
                                        <div class="flex-1">
                                            <label class="block text-sm font-medium text-gray-300 mb-2">Username</label>
                                            <input type="text" value="${user.username}" disabled 
                                                   class="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-gray-500 cursor-not-allowed">
                                            <p class="text-xs text-gray-500 mt-1">Username cannot be changed.</p>
                                        </div>
                                    </div>

                                    <div class="grid grid-cols-1 gap-6">
                                        <div>
                                            <label for="display-name" class="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
                                            <input type="text" id="display-name" value="${user.display_name || ''}" 
                                                   class="w-full bg-gray-800 border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary">
                                        </div>

                                        <div>
                                            <label for="bio" class="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                                            <textarea id="bio" rows="3" 
                                                      class="w-full bg-gray-800 border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary"
                                                      placeholder="Tell us a little about yourself...">${user.bio || ''}</textarea>
                                        </div>

                                        <div>
                                            <label for="website" class="block text-sm font-medium text-gray-300 mb-2">Website</label>
                                            <input type="url" id="website" value="${user.website || ''}" placeholder="https://"
                                                   class="w-full bg-gray-800 border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary">
                                        </div>
                                    </div>

                                    <div class="mt-8 pt-6 border-t border-gray-700 flex justify-end">
                                        <button id="save-profile-btn" class="btn btn-primary">Save Changes</button>
                                    </div>
                                </section>

                                <!-- Appearance Section (Simplified) -->
                                <section id="appearance-section" class="glass-panel p-6 border border-gray-700/50 rounded-xl">
                                    <h2 class="text-xl font-semibold text-white mb-6">Appearance</h2>
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <h3 class="font-medium text-white">Theme Preference</h3>
                                            <p class="text-sm text-gray-400">Choose your interface theme</p>
                                        </div>
                                        <div class="flex bg-gray-900 rounded-lg p-1 border border-gray-700">
                                            <button class="px-4 py-1.5 rounded text-sm font-medium text-white bg-gray-700 shadow-sm">Dark</button>
                                            <button class="px-4 py-1.5 rounded text-sm font-medium text-gray-400 hover:text-white">Light</button>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const saveBtn = document.getElementById('save-profile-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveProfile());
        }
    }

    loadSettings() {
        // Here we could load settings if they were separate from the user object
    }

    async saveProfile() {
        const btn = document.getElementById('save-profile-btn');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<span class="animate-spin inline-block mr-2">⟳</span> Saving...`;

        const data = {
            display_name: document.getElementById('display-name').value,
            bio: document.getElementById('bio').value,
            website: document.getElementById('website').value
        };

        try {
            // Assume we have an endpoint for this, or simulate it
            await this.app.apiClient.put('/users/me', data);

            // Update local user data
            this.app.auth.user = { ...this.app.auth.user, ...data };
            this.app.showSuccess('Profile updated successfully');
        } catch (error) {
            console.error('Failed to update profile:', error);
            this.app.showError('Failed to update profile');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
}
