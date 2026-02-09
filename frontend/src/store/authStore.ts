import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    user: any | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
    setUser: (user: any) => void;
    setToken: (token: string | null) => void;
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
            login: async (credentials) => {
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
            register: async (userData) => {
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
