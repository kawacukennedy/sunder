import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { fetchApi } from '@/lib/utils';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface UsageStats {
    tokensUsed: number;
    costToday: number;
}

interface AIState {
    isProcessing: boolean;
    history: Message[];
    suggestions: any[];
    personality: 'helpful' | 'educational' | 'critical' | 'concise';
    selectedLanguage: string;
    usageStats: UsageStats;
    addMessage: (role: 'user' | 'assistant', content: string) => void;
    setProcessing: (isProcessing: boolean) => void;
    setSuggestions: (suggestions: any[]) => void;
    setPersonality: (personality: 'helpful' | 'educational' | 'critical' | 'concise') => void;
    setLanguage: (selectedLanguage: string) => void;
    updateUsageStats: (tokens: number) => void;
    translate: (code: string, sourceLang: string, targetLang: string) => Promise<any>;
    generateCode: (prompt: string, language: string, framework: string) => Promise<any>;
    explainCode: (code: string, detailLevel: string) => Promise<any>;
    pairWithAI: (task: string, code?: string, options?: any) => Promise<any>;
}

export const useAIStore = create<AIState>()(
    persist(
        immer((set) => ({
            isProcessing: false,
            history: [],
            suggestions: [],
            personality: 'helpful',
            selectedLanguage: 'typescript',
            usageStats: { tokensUsed: 0, costToday: 0 },
            addMessage: (role: 'user' | 'assistant', content: string) => set((state) => {
                state.history.push({ role, content });
            }),
            setProcessing: (isProcessing: boolean) => set({ isProcessing }),
            setSuggestions: (suggestions: any[]) => set({ suggestions }),
            setPersonality: (personality: 'helpful' | 'educational' | 'critical' | 'concise') => set({ personality }),
            setLanguage: (selectedLanguage: string) => set({ selectedLanguage }),
            updateUsageStats: (tokens: number) => set((state) => {
                state.usageStats.tokensUsed += tokens;
                state.usageStats.costToday += (tokens * 0.000001);
            }),
            translate: async (code: string, sourceLang: string, targetLang: string) => {
                set({ isProcessing: true });
                try {
                    const data = await fetchApi('/ai/translate', {
                        method: 'POST',
                        body: JSON.stringify({ code, source_language: sourceLang, target_language: targetLang }),
                    });
                    set({ isProcessing: false });
                    return data;
                } catch (error) {
                    set({ isProcessing: false });
                    throw error;
                }
            },
            generateCode: async (prompt: string, language: string, framework: string) => {
                set({ isProcessing: true });
                try {
                    const data = await fetchApi('/ai/generate', {
                        method: 'POST',
                        body: JSON.stringify({ prompt, language, framework }),
                    });
                    set({ isProcessing: false });
                    return data;
                } catch (error) {
                    set({ isProcessing: false });
                    throw error;
                }
            },
            explainCode: async (code: string, detailLevel: string) => {
                set({ isProcessing: true });
                try {
                    const data = await fetchApi('/ai/explain', {
                        method: 'POST',
                        body: JSON.stringify({ code, detail_level: detailLevel }),
                    });
                    set({ isProcessing: false });
                    return data;
                } catch (error) {
                    set({ isProcessing: false });
                    throw error;
                }
            },
            pairWithAI: async (task: string, code?: string, options?: any) => {
                set({ isProcessing: true });
                try {
                    const state = useAIStore.getState();
                    const data = await fetchApi('/ai/pair', {
                        method: 'POST',
                        body: JSON.stringify({
                            task,
                            code: code || '',
                            language: state.selectedLanguage,
                            conversation_history: state.history,
                            personality: state.personality,
                            options: {
                                suggest_improvements: true,
                                explain_changes: true,
                                ...options
                            }
                        }),
                    });
                    set({ isProcessing: false });
                    if (data.tokens_used) {
                        state.updateUsageStats(data.tokens_used);
                    }
                    return data;
                } catch (error) {
                    set({ isProcessing: false });
                    throw error;
                }
            }
        })),
        {
            name: 'sunder-ai',
            partialize: (state) => ({ personality: state.personality, selectedLanguage: state.selectedLanguage, usageStats: state.usageStats }),
        }
    )
);
