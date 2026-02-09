import { create } from 'zustand';

interface EditorState {
    currentSnippet: {
        id: string | null;
        title: string;
        code: string;
        language: string;
        tags: string[];
    };
    isDirty: boolean;
    panes: {
        left: boolean;
        right: boolean;
        bottom: boolean;
    };
    updateCode: (code: string) => void;
    updateTitle: (title: string) => void;
    updateLanguage: (language: string) => void;
    togglePane: (pane: 'left' | 'right' | 'bottom') => void;
    setSnippet: (snippet: any) => void;
    resetEditor: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
    currentSnippet: {
        id: null,
        title: 'Untitled Snippet',
        code: '',
        language: 'javascript',
        tags: [],
    },
    isDirty: false,
    panes: {
        left: true,
        right: true,
        bottom: false,
    },
    updateCode: (code) => set((state) => ({
        currentSnippet: { ...state.currentSnippet, code },
        isDirty: true
    })),
    updateTitle: (title) => set((state) => ({
        currentSnippet: { ...state.currentSnippet, title },
        isDirty: true
    })),
    updateLanguage: (language) => set((state) => ({
        currentSnippet: { ...state.currentSnippet, language },
        isDirty: true
    })),
    togglePane: (pane) => set((state) => ({
        panes: { ...state.panes, [pane]: !state.panes[pane] }
    })),
    setSnippet: (snippet) => set({ currentSnippet: snippet, isDirty: false }),
    resetEditor: () => set({
        currentSnippet: {
            id: null,
            title: 'Untitled Snippet',
            code: '',
            language: 'javascript',
            tags: [],
        },
        isDirty: false
    }),
}));
