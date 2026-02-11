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
    executionResult: string | null;
    isRunning: boolean;
    updateCode: (code: string) => void;
    updateTitle: (title: string) => void;
    updateLanguage: (language: string) => void;
    togglePane: (pane: 'left' | 'right' | 'bottom') => void;
    setExecutionResult: (result: string | null) => void;
    setIsRunning: (isRunning: boolean) => void;
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
    executionResult: null,
    isRunning: false,
    updateCode: (code: string) => set((state) => ({
        currentSnippet: { ...state.currentSnippet, code },
        isDirty: true
    })),
    updateTitle: (title: string) => set((state) => ({
        currentSnippet: { ...state.currentSnippet, title },
        isDirty: true
    })),
    updateLanguage: (language: string) => set((state) => ({
        currentSnippet: { ...state.currentSnippet, language },
        isDirty: true
    })),
    togglePane: (pane: 'left' | 'right' | 'bottom') => set((state) => ({
        panes: { ...state.panes, [pane]: !state.panes[pane] }
    })),
    setExecutionResult: (executionResult) => set({ executionResult }),
    setIsRunning: (isRunning) => set({ isRunning }),
    setSnippet: (snippet: any) => set({ currentSnippet: snippet, isDirty: false }),
    resetEditor: () => set({
        currentSnippet: {
            id: null,
            title: 'Untitled Snippet',
            code: '',
            language: 'javascript',
            tags: [],
        },
        executionResult: null,
        isRunning: false,
        isDirty: false
    }),
}));
