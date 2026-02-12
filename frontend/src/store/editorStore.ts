import { create } from 'zustand';

/**
 * State and actions for the primary code editor and execution environment.
 */
interface EditorState {
    /** The snippet currently being edited. */
    currentSnippet: {
        id: string | null;
        title: string;
        code: string;
        language: string;
        tags: string[];
    };
    /** Indicates if there are unsaved changes. */
    isDirty: boolean;
    /** Visibility state of the editor's side and bottom panes. */
    panes: {
        left: boolean;
        right: boolean;
        bottom: boolean;
    };
    /** Output from the last code execution (Piston API). */
    executionResult: string | null;
    /** Indicates if code execution is in progress. */
    isRunning: boolean;
    /** Updates the code content of the current snippet. */
    updateCode: (code: string) => void;
    /** Updates the title of the current snippet. */
    updateTitle: (title: string) => void;
    /** Updates the language of the current snippet. */
    updateLanguage: (language: string) => void;
    /** Toggles a specific pane (left, right, bottom). */
    togglePane: (pane: 'left' | 'right' | 'bottom') => void;
    setExecutionResult: (result: string | null) => void;
    setIsRunning: (isRunning: boolean) => void;
    /** Loads a snippet into the editor and clears the dirty flag. */
    setSnippet: (snippet: any) => void;
    /** Resets the editor to a clean, untitled state. */
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
        isDirty: false,
        panes: {
            left: true,
            right: true,
            bottom: false,
        },
    }),
}));
