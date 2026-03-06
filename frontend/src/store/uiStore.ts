import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface UIState {
    theme: 'light' | 'dark';
    sidebarCollapsed: boolean;
    notifications: any[];
    modals: {
        active: string | null;
        props: any;
    };
    toasts: any[];
    commandPaletteOpen: boolean;
    loadingOverlay: boolean;
    mobileMenuOpen: boolean;
    toggleTheme: () => void;
    toggleSidebar: () => void;
    toggleMobileMenu: () => void;
    addNotification: (notification: any) => void;
    removeNotification: (id: string | number) => void;
    openModal: (name: string, props?: any) => void;
    closeModal: () => void;
    addToast: (toast: any) => void;
    removeToast: (id: string | number) => void;
    toggleCommandPalette: () => void;
    setLoading: (isLoading: boolean) => void;
}

export const useUIStore = create<UIState>()(
    persist(
        immer((set) => ({
            theme: 'dark',
            sidebarCollapsed: false,
            notifications: [],
            modals: { active: null, props: {} },
            toasts: [],
            commandPaletteOpen: false,
            loadingOverlay: false,
            mobileMenuOpen: false,
            toggleTheme: () => set((state) => {
                state.theme = state.theme === 'light' ? 'dark' : 'light';
            }),
            toggleSidebar: () => set((state) => {
                state.sidebarCollapsed = !state.sidebarCollapsed;
            }),
            toggleMobileMenu: () => set((state) => {
                state.mobileMenuOpen = !state.mobileMenuOpen;
            }),
            addNotification: (notification: any) => set((state) => {
                state.notifications.push({ ...notification, id: Date.now() });
            }),
            removeNotification: (id: string | number) => set((state) => {
                state.notifications = state.notifications.filter((n: any) => n.id !== id);
            }),
            openModal: (name: string, props: any = {}) => set({ modals: { active: name, props } }),
            closeModal: () => set({ modals: { active: null, props: {} } }),
            addToast: (toast: any) => set((state) => {
                state.toasts.push({ ...toast, id: Date.now() });
            }),
            removeToast: (id: string | number) => set((state) => {
                state.toasts = state.toasts.filter((t: any) => t.id !== id);
            }),
            toggleCommandPalette: () => set((state) => {
                state.commandPaletteOpen = !state.commandPaletteOpen;
            }),
            setLoading: (isLoading) => set({ loadingOverlay: isLoading }),
        })),
        {
            name: 'sunder-ui',
            partialize: (state) => ({ theme: state.theme, sidebarCollapsed: state.sidebarCollapsed }),
        }
    )
);
