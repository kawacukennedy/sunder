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
    /** Indicates if an auth-related request is in progress. */
    isLoading: boolean;
    /** Holds error messages from auth operations. */
    error: string | null;
    /** Updates the current user object. */
    setUser: (user: any) => void;
    /** Updates the access token. */
    setToken: (token: string | null) => void;
    /** Performs login request and updates store state. */
    login: (credentials: Record<string, any>) => Promise<void>;
    /** Performs registration request and updates store state. */
    register: (userData: Record<string, any>) => Promise<void>;
    /** Clears user and token, effectively logging the user out of the client. */
    logout: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isLoading: false,
            error: null,
            setUser: (user) => set({ user }),
            setToken: (token) => set({ token }),
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
                    set({ user: data.user, token: data.access_token, isLoading: false });
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
                    set({ user: data.user, token: data.access_token, isLoading: false });
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                }
            },
            logout: () => set({ user: null, token: null }),
        }),
        {
            name: 'sunder-auth',
        }
    )
);
