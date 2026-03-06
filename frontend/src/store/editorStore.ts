import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

/**
 * State and actions for the primary code editor and execution environment.
 */
interface EditorState {
    // ... (rest of interface remains same)
}

export const useEditorStore = create<EditorState>()(
    persist(
        immer((set) => ({
            currentSnippet: {
                id: null,
                title: 'Untitled Snippet',
                code: '',
                language: 'javascript',
                tags: [],
                description: '',
                visibility: 'public'
            },
            isDirty: false,
            lastSaved: null,
            autoSaveInterval: 2000,
            aiSuggestions: [],
            errors: [],
            warnings: [],
            panes: {
                left: true,
                right: true,
                bottom: false,
            },
            executionResult: null,
            isRunning: false,
            updateCode: (code: string) => set((state) => {
                state.currentSnippet.code = code;
                state.isDirty = true;
            }),
            updateTitle: (title: string) => set((state) => {
                state.currentSnippet.title = title;
                state.isDirty = true;
            }),
            updateLanguage: (language: string) => set((state) => {
                state.currentSnippet.language = language;
                state.isDirty = true;
            }),
            updateTags: (tags: string[]) => set((state) => {
                state.currentSnippet.tags = tags;
                state.isDirty = true;
            }),
            updateVisibility: (visibility: any) => set((state) => {
                state.currentSnippet.visibility = visibility;
                state.isDirty = true;
            }),
            updateDescription: (description: string) => set((state) => {
                state.currentSnippet.description = description;
                state.isDirty = true;
            }),
            markDirty: () => set((state) => { state.isDirty = true; }),
            markSaved: () => set((state) => { state.isDirty = false; state.lastSaved = new Date().toISOString(); }),
            togglePane: (pane: 'left' | 'right' | 'bottom') => set((state) => {
                state.panes[pane] = !state.panes[pane];
            }),
            setExecutionResult: (executionResult) => set({ executionResult }),
            setIsRunning: (isRunning) => set({ isRunning }),
            addAiSuggestion: (suggestion: string) => set((state) => {
                state.aiSuggestions.push(suggestion);
            }),
            clearAiSuggestions: () => set({ aiSuggestions: [] }),
            setSnippet: (snippet: any) => set({ currentSnippet: snippet, isDirty: false, lastSaved: snippet.updated_at || null }),
            resetEditor: () => set({
                currentSnippet: {
                    id: null,
                    title: 'Untitled Snippet',
                    code: '',
                    language: 'javascript',
                    tags: [],
                    description: '',
                    visibility: 'public'
                },
                executionResult: null,
                isRunning: false,
                isDirty: false,
                lastSaved: null,
                aiSuggestions: [],
                errors: [],
                warnings: [],
                panes: {
                    left: true,
                    right: true,
                    bottom: false,
                },
            }),
        })),
        {
            name: 'sunder-editor',
        }
    )
);
