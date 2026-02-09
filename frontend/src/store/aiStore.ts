import { create } from 'zustand';

interface AIState {
    isProcessing: boolean;
    history: any[];
    suggestions: any[];
    personality: 'helpful' | 'critical' | 'concise' | 'educational';
    usageStats: {
        tokensUsed: number;
        costToday: number;
    };
    addMessage: (role: string, content: string) => void;
    setProcessing: (isProcessing: boolean) => void;
    setSuggestions: (suggestions: any[]) => void;
    setPersonality: (personality: 'helpful' | 'critical' | 'concise' | 'educational') => void;
    updateUsageStats: (tokens: number) => void;
    translate: (code: string, sourceLang: string, targetLang: string) => Promise<any>;
    generateCode: (prompt: string, language: string, framework: string) => Promise<any>;
    explainCode: (code: string, detailLevel: string) => Promise<any>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export const useAIStore = create<AIState>((set) => ({
    isProcessing: false,
    history: [],
    suggestions: [],
    personality: 'helpful',
    usageStats: { tokensUsed: 0, costToday: 0 },
    addMessage: (role: string, content: string) => set((state) => ({
        history: [...state.history, { role, content }]
    })),
    setProcessing: (isProcessing: boolean) => set({ isProcessing }),
    setSuggestions: (suggestions: any[]) => set({ suggestions }),
    setPersonality: (personality: 'helpful' | 'critical' | 'concise' | 'educational') => set({ personality }),
    updateUsageStats: (tokens: number) => set((state) => ({
        usageStats: {
            tokensUsed: state.usageStats.tokensUsed + tokens,
            costToday: state.usageStats.costToday + (tokens * 0.000001) // Simplified cost
        }
    })),
    translate: async (code: string, sourceLang: string, targetLang: string) => {
        set({ isProcessing: true });
        try {
            const response = await fetch(`${API_URL}/ai/translate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('sunder-auth-token')}`
                },
                body: JSON.stringify({ code, source_language: sourceLang, target_language: targetLang }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Translation failed');
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
            const response = await fetch(`${API_URL}/ai/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('sunder-auth-token')}`
                },
                body: JSON.stringify({ prompt, language, framework }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Generation failed');
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
            const response = await fetch(`${API_URL}/ai/explain`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('sunder-auth-token')}`
                },
                body: JSON.stringify({ code, detail_level: detailLevel }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Explanation failed');
            set({ isProcessing: false });
            return data;
        } catch (error) {
            set({ isProcessing: false });
            throw error;
        }
    }
}));
