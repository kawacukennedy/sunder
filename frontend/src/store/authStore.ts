import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * State and actions for user authentication and session management.
 */
interface AuthState {
    /** The currently authenticated user object. */
    user: any | null;
    /** JWT access token for API requests. */
    token: string | null;
    /** JWT refresh token for session recovery. */
    refreshToken: string | null;
    /** URL to redirect to after successful login. */
    loginRedirect: string | null;
    /** Indicates if an auth-related request is in progress. */
    isLoading: boolean;
    /** Holds error messages from auth operations. */
    error: string | null;
    /** Updates the current user object. */
    setUser: (user: any) => void;
    /** Updates the current user object with partial data. */
    updateUser: (updates: any) => void;
    /** Updates the access token. */
    setToken: (token: string | null) => void;
    /** Sets the login redirect URL. */
    setLoginRedirect: (url: string | null) => void;
    /** Clears any existing error messages. */
    clearError: () => void;
    /** Performs login request and updates store state. */
    login: (credentials: Record<string, any>) => Promise<void>;
    /** Performs registration request and updates store state. */
    register: (userData: Record<string, any>) => Promise<void>;
    /** Refreshes the access token using the refresh token. */
    refreshAccessToken: () => Promise<void>;
    /** Clears user and token, effectively logging the user out of the client. */
    logout: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            refreshToken: null,
            loginRedirect: null,
            isLoading: false,
            error: null,
            setUser: (user) => set({ user }),
            updateUser: (updates) => set((state) => ({
                user: state.user ? { ...state.user, ...updates } : updates
            })),
            setToken: (token) => set({ token }),
            setLoginRedirect: (loginRedirect) => set({ loginRedirect }),
            clearError: () => set({ error: null }),
            login: async (credentials: Record<string, any>) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await fetch(`${API_URL}/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(credentials),
                    });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.message || 'Login failed');
                    set({
                        user: data.user,
                        token: data.access_token,
                        refreshToken: data.refresh_token,
                        isLoading: false
                    });
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                }
            },
            register: async (userData: Record<string, any>) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await fetch(`${API_URL}/auth/register`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(userData),
                    });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.message || 'Registration failed');
                    set({
                        user: data.user,
                        token: data.access_token,
                        refreshToken: data.refresh_token,
                        isLoading: false
                    });
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                }
            },
            refreshAccessToken: async () => {
                const { refreshToken } = get();
                if (!refreshToken) return;
                try {
                    const response = await fetch(`${API_URL}/auth/verify`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refresh_token: refreshToken }),
                    });
                    const data = await response.json();
                    if (response.ok) {
                        set({ token: data.access_token });
                    } else {
                        get().logout();
                    }
                } catch {
                    get().logout();
                }
            },
            logout: () => set({ user: null, token: null, refreshToken: null, loginRedirect: null }),
        }),
        {
            name: 'sunder-auth',
        }
    )
);
