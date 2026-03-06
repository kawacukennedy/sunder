import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface CollaborationState {
    activeSession: string | null;
    participants: any[];
    cursorPositions: Record<string, any>;
    connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
    chatMessages: any[];
    isRecording: boolean;
    recordingUrl: string | null;
    setSession: (token: string | null) => void;
    setParticipants: (participants: any[] | ((prev: any[]) => any[])) => void;
    updateCursor: (userId: string, position: any) => void;
    setConnectionStatus: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;
    addChatMessage: (message: any) => void;
    setRecording: (isRecording: boolean, url?: string | null) => void;
}

export const useCollaborationStore = create<CollaborationState>()(
    persist(
        immer((set) => ({
            activeSession: null,
            participants: [],
            cursorPositions: {},
            connectionStatus: 'disconnected',
            chatMessages: [],
            isRecording: false,
            recordingUrl: null,
            setSession: (token: string | null) => set({ activeSession: token }),
            setParticipants: (update: any[] | ((prev: any[]) => any[])) => set((state) => {
                state.participants = typeof update === 'function' ? update(state.participants) : update;
            }),
            updateCursor: (userId: string, position: any) => set((state) => {
                state.cursorPositions[userId] = position;
            }),
            setConnectionStatus: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => set({ connectionStatus: status }),
            addChatMessage: (message: any) => set((state) => {
                state.chatMessages.push({ ...message, timestamp: new Date() });
            }),
            setRecording: (isRecording: boolean, url: string | null = null) => set({ isRecording, recordingUrl: url }),
        })),
        {
            name: 'sunder-collaboration',
            partialize: (state) => ({ activeSession: state.activeSession }),
        }
    )
);
