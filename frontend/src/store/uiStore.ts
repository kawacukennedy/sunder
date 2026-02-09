import { create } from 'zustand';

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
    toggleTheme: () => void;
    toggleSidebar: () => void;
    addNotification: (notification: any) => void;
    openModal: (name: string, props?: any) => void;
    closeModal: () => void;
    addToast: (toast: any) => void;
    removeToast: (id: string | number) => void;
    toggleCommandPalette: () => void;
    setLoading: (isLoading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
    theme: 'dark',
    sidebarCollapsed: false,
    notifications: [],
    modals: { active: null, props: {} },
    toasts: [],
    commandPaletteOpen: false,
    loadingOverlay: false,
    toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
    toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    addNotification: (notification) => set((state) => ({
        notifications: [...state.notifications, notification]
    })),
    openModal: (name, props = {}) => set({ modals: { active: name, props } }),
    closeModal: () => set({ modals: { active: null, props: {} } }),
    addToast: (toast) => set((state) => ({ toasts: [...state.toasts, { ...toast, id: Date.now() }] })),
    removeToast: (id) => set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) })),
    toggleCommandPalette: () => set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
    setLoading: (isLoading) => set({ loadingOverlay: isLoading }),
}));
